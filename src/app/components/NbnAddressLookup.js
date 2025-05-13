"use client";
import React, { useState, useEffect, useRef } from "react";

// Debounce hook (default now 2000ms)
function useDebounce(value, delay = 2000) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NbnAddressLookup({
  onTechChange,
  onAddressChange,
  onPackageSelect, // ← new callback prop
}) {
  const GEO_API_KEY = "5e98dc856d0942e9993f939d68e0c9d7";
  const RAPIDAPI_KEY = "91e426bd3cmshef10284de2b4fd9p1f4f0djsn16a0f604d1bb";

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query); // 2s debounce
  const [suggestions, setSuggestions] = useState([]);
  const [nbnResult, setNbnResult] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingNbn, setLoadingNbn] = useState(false);
  const lastSelected = useRef(null);

  // “Typing” flag
  const isTyping = query.length >= 2 && query !== debouncedQuery;

  // Autocomplete effect
  useEffect(() => {
    onTechChange(null);
    onAddressChange?.(null);

    if (debouncedQuery === lastSelected.current) {
      lastSelected.current = null;
      return;
    }
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const url =
      `https://api.geoapify.com/v1/geocode/autocomplete` +
      `?text=${encodeURIComponent(debouncedQuery)}` +
      `&lang=en&limit=5&filter=countrycode:au` +
      `&apiKey=${GEO_API_KEY}`;

    setLoadingSuggest(true);
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setSuggestions(data.features || []))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoadingSuggest(false));

    return () => controller.abort();
  }, [debouncedQuery, onTechChange, onAddressChange]);

  // NBN lookup
  const handleSelect = async (feature) => {
    const addr = feature.properties.formatted;
    lastSelected.current = addr;
    setQuery(addr);
    setSuggestions([]);
    setLoadingNbn(true);

    try {
      const nbnUrl =
        `https://nbnco-address-check.p.rapidapi.com/nbn_address` +
        `?address=${encodeURIComponent(addr)}`;
      const res = await fetch(nbnUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "nbnco-address-check.p.rapidapi.com",
        },
      });
      const json = await res.json();
      setNbnResult(json);
      onTechChange(json?.addressDetail?.techType || null);

      // 🚀 Pass the formattedAddress from the NBN result up to the parent:
      onAddressChange?.(json.addressDetail.formattedAddress);
    } catch (err) {
      console.error(err);
      setNbnResult(null);
      onTechChange(null);
      onAddressChange?.(null);
    } finally {
      setLoadingNbn(false);
    }
  };

  // Manual search button
  const handleSearchClick = () => {
    const feature = suggestions.find(
      (f) => f.properties.formatted === query
    );
    if (feature) handleSelect(feature);
  };

  return (
    <div className="space-y-4 ms-80 me-80">
      {/* Search box */}
      <div className="relative bg-gray-100 rounded-2xl shadow-md p-1.5 transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-lg">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-[#1DA6DF]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 
                 6 0 1110.89 3.476l4.817 4.817a1 
                 1 0 01-1.414 1.414l-4.816-4.816A6 
                 6 0 012 8z"
            />
          </svg>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            className="w-full pl-8 py-3 text-base text-gray-700 bg-transparent rounded-lg focus:outline-none"
            placeholder="Type your address..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setNbnResult(null);
              onTechChange(null);
            }}
          />

          {/* Spinner */}
          {(isTyping || loadingSuggest || loadingNbn) && (
            <div className="flex items-center justify-center m-2">
              <div className="w-5 h-5 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-md">
            {suggestions.map((f) => (
              <div
                key={f.properties.place_id}
                className="p-2 hover:bg-base-200 cursor-pointer flex items-center gap-2"
                onClick={() => handleSelect(f)}
              >
                <span>{f.properties.formatted}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loadingNbn && (
        <div className="space-y-4 animate-pulse w-full">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            <div className="h-40 bg-gray-200 rounded-lg w-[50%]"></div>
            <div className="h-40 bg-gray-200 rounded-lg w-[50%]"></div>
          </div>
        </div>
      )}

      {/* Results */}
      {nbnResult && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <svg
              className="w-8 h-8 text-[#1DA6DF]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 22s-7-4.5-7-10a7 7 
             0 1114 0c0 5.5-7 10-7 10z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">
              {nbnResult.addressDetail.formattedAddress}
            </h2>
          </div>

          <div className="bg-gray-100 rounded-2xl p-5">
            {/* Instruction */}
            <p className="text-base text-gray-600 mb-2 font-bold">
              Select your package
            </p>

            {/* Status cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connect Now */}
              <div
                role="button"
                onClick={() => onPackageSelect?.("connect")}
                className="flex flex-col border-[#1DA6DF] bg-gray-50 border rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105"
              >
                <h3 className="text-lg font-medium text-[#1DA6DF] mb-1">
                  Connect Now
                </h3>
                <p className="text-gray-700">
                  {nbnResult.servingArea.serviceStatus === "available"
                    ? "Great news! You qualify for high-speed broadband on the nbn network."
                    : `Status: ${nbnResult.servingArea.serviceStatus}`}
                </p>
              </div>

              {/* Fibre Upgrade */}
              <div
                role="button"
                onClick={() => onPackageSelect?.("fibre")}
                className="flex flex-col bg-[#1DA6DF] border border-gray-100 rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105"
              >
                <h3 className="text-lg font-medium text-white mb-1">
                  Fibre Upgrade
                </h3>
                <p className="text-white">
                  {nbnResult.addressDetail.zeroBuildCost
                    ? `Free installation available (Tech: ${nbnResult.addressDetail.techType}).`
                    : "No free upgrade available at this address."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

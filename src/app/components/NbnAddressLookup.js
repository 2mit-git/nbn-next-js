"use client";
import React, { useState, useEffect } from "react";

// Debounce hook
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Props:
 *   onTechChange: (techType: string|null) => void
 */
export default function NbnAddressLookup({ onTechChange , onAddressChange }) {
  const GEO_API_KEY   = "5e98dc856d0942e9993f939d68e0c9d7";
  const RAPIDAPI_KEY = "91e426bd3cmshef10284de2b4fd9p1f4f0djsn16a0f604d1bb";

  const [query, setQuery]             = useState("");
  const debouncedQuery                = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState([]);
  const [nbnResult, setNbnResult]     = useState(null);
  const [loading, setLoading]         = useState(false);

  // 1) Geoapify autocomplete
  useEffect(() => {
    // reset parent techType when user is typing
    onTechChange(null);
    onAddressChange?.(null);

    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const url =
      `https://api.geoapify.com/v1/geocode/autocomplete` +
      `?text=${encodeURIComponent(debouncedQuery)}` +
      `&lang=en&limit=5&filter=countrycode:au` +
      `&apiKey=${GEO_API_KEY}`;

    fetch(url)
      .then(r => r.json())
      .then(data => setSuggestions(data.features || []))
      .catch(console.error);
  }, [debouncedQuery, onTechChange]);

  // 2) When a suggestion is clicked, fire the NBN lookup
  const handleSelect = async (feature) => {
    const addr = feature.properties.formatted;
    setQuery(addr);
    setSuggestions([]);
    setLoading(true);

      // lift address up
   onAddressChange?.(addr);

    try {
      const nbnUrl =
        `https://nbnco-address-check.p.rapidapi.com/nbn_address` +
        `?address=${encodeURIComponent(addr)}`;
      const res = await fetch(nbnUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key":  RAPIDAPI_KEY,
          "x-rapidapi-host": "nbnco-address-check.p.rapidapi.com",
        },
      });
      const json = await res.json();
      setNbnResult(json);
      onTechChange(json?.addressDetail?.techType || null);

      // notify parent of the techType (or null if missing)
      onTechChange(json?.addressDetail?.techType || null);
    } catch (err) {
      console.error(err);
      setNbnResult(null);
           onTechChange(null);
    onAddressChange?.(null);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* autocomplete input */}
      <div className="relative">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Type your address..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setNbnResult(null);
            // clear techType when user edits
            onTechChange(null);
          }}
        />
        {suggestions.length > 0 && (
          <div className="absolute z-20 w-full bg-white border rounded shadow-md mt-1">
            {suggestions.map(f => (
              <div
                key={f.properties.place_id}
                className="p-2 hover:bg-base-200 cursor-pointer flex items-center gap-2"
                onClick={() => handleSelect(f)}
              >
                <span>📍</span>
                <span>{f.properties.formatted}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NBN result */}
      {loading && <p>Looking up NBN availability…</p>}
      {nbnResult && (
        <div className="border rounded-lg p-4 bg-base-100">
          <h2 className="text-lg font-bold mb-2 text-green-600">
            {nbnResult.addressDetail.formattedAddress}
          </h2>
          <div className="mb-4">
            <h3 className="font-semibold text-green-500">Connect now</h3>
            <p>
              {nbnResult.servingArea.serviceStatus === "available"
                ? "Great news! Your address qualifies for high-speed broadband on the nbn network."
                : `Status: ${nbnResult.servingArea.serviceStatus}`}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-green-500">
              Fibre Upgrade with FREE installation
            </h3>
            <p>
              {nbnResult.addressDetail.zeroBuildCost
                ? `Eligible for a fibre upgrade (Tech: ${nbnResult.addressDetail.techType}).`
                : "No free upgrade available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

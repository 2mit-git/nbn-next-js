"use client";
import React, { useEffect, useRef, useState } from "react";

/* Debounce */
function useDebounce(value, delay = 600) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NbnAddressSearching({
  onTechChange,      // ← NEW: report (techType, canUpgrade) to parent
  onAddressChange,   // ← OPTIONAL: send back the formatted address
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [nbnResult, setNbnResult] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingNbn, setLoadingNbn] = useState(false);
  const [error, setError] = useState("");

  const debounced = useDebounce(query, 600);
  const lastSelected = useRef("");

  const isTyping = query.length >= 2 && debounced !== query;

  /* Fetch address suggestions after debounce */
  useEffect(() => {
    setError("");

    if (debounced.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (debounced === lastSelected.current) return;

    const controller = new AbortController();
    setLoadingSuggest(true);

    fetch(`/api/geocode?text=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Geocode failed"))))
      .then((data) => setSuggestions(data?.features ?? []))
      .catch((e) => {
        if (e.name !== "AbortError") setError("Couldn’t fetch suggestions.");
      })
      .finally(() => setLoadingSuggest(false));

    return () => controller.abort();
  }, [debounced]);

  /* When a suggestion is selected, fetch NBN result */
  const handleSelect = async (feature) => {
    const addr = feature?.properties?.formatted || "";
    if (!addr) return;

    lastSelected.current = addr;
    setQuery(addr);
    setSuggestions([]);
    setNbnResult(null);
    setError("");
    setLoadingNbn(true);

    try {
      const res = await fetch(`/api/nbn?address=${encodeURIComponent(addr)}`);
      if (!res.ok) throw new Error("NBN lookup failed");
      const json = await res.json();
      setNbnResult(json);

      // Notify parent about the chosen/normalized address (optional)
      onAddressChange?.(json?.addressDetail?.formattedAddress || addr);
    } catch {
      setError("Couldn’t retrieve NBN info for this address.");
      setNbnResult(null);
      // Clear in parent on failure
      onTechChange?.(null, false);
      onAddressChange?.(null);
    } finally {
      setLoadingNbn(false);
    }
  };

  /* Derive view state */
  const techType = nbnResult?.addressDetail?.techType?.toUpperCase?.() || "";
  const canUpgrade =
    (nbnResult?.addressDetail?.techChangeStatus || "")
      .trim()
      .toLowerCase() === "eligible to order";

  /* >>> NEW: tell parent whenever tech/eligibility changes <<< */
  useEffect(() => {
    if (typeof onTechChange === "function") {
      onTechChange(techType || null, canUpgrade);
    }
  }, [techType, canUpgrade, onTechChange]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4">
      {/* Search box */}
      <div className="relative w-full rounded-lg border border-[#1EA6DF] bg-gray-100 p-1.5 shadow-md transition hover:scale-[1.01]">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-[#1EA6DF]" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            />
          </svg>
        </div>
        <input
          type="text"
          className="w-full rounded-lg bg-transparent py-2 pl-10 text-gray-700 focus:outline-none"
          placeholder="Type your address..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setNbnResult(null);
            // Clear parent state while user edits
            onTechChange?.(null, false);
            onAddressChange?.(null);
          }}
        />
        {(isTyping || loadingSuggest || loadingNbn) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-4 border-t-[#1EA6DF]" />
          </div>
        )}

        {suggestions.length > 0 && !nbnResult && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-white shadow-md">
            {suggestions.map((f) => (
              <button
                key={f.properties.place_id}
                onClick={() => handleSelect(f)}
                className="w-full cursor-pointer px-4 py-2 text-left hover:bg-[#1EA6DF] hover:text-white"
              >
                {f.properties.formatted}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Errors */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loadingNbn && (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 rounded bg-gray-200" />
          <div className="flex gap-4">
            <div className="h-40 flex-1 rounded-lg bg-gray-200" />
            <div className="h-40 flex-1 rounded-lg bg-gray-200" />
          </div>
        </div>
      )}

      {/* Result copy only (no packages) */}
      {nbnResult && (
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-2xl font-bold text-gray-800">
            {canUpgrade ? "Connect now" : "Great news!"}
          </h3>

          <p className="mb-4 text-base leading-relaxed text-gray-700">
            {canUpgrade
              ? "Great news! Your address qualifies for high-speed broadband on the nbn network across a range of great plans."
              : `High-speed broadband is available at your address. Your nbn connection is ${techType ||
                "—"} and it's available across a range of great plans.`}
          </p>

          {canUpgrade && (
            <div>
              <h4 className="mb-3 text-2xl font-bold text-gray-800">
                Fibre Upgrade with FREE installation
              </h4>
              <p className="mb-6 text-base leading-relaxed text-gray-700">
                Your address is eligible for a Fibre Upgrade with FREE installation, with speeds of up
                to 1000&nbsp;Mbps.
              </p>
            </div>
          )}

          <button className="flex items-center space-x-2 rounded-lg bg-[#1EA6DF] px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-[#086085] hover:shadow-lg">
            <span>Get started</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {canUpgrade && (
            <p className="border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
              $0 Fibre Upgrade available for standard installations only. Offer valid with eligible
              high-speed plans. A compatible high-speed modem is required — additional charges may
              apply. Installation may take approximately 2 to 6 weeks.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

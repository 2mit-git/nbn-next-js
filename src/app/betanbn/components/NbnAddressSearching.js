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
  onTechChange,      // report (techType, canUpgrade) to parent
  onAddressChange,   // OPTIONAL: send back the formatted address
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [nbnResult, setNbnResult] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingNbn, setLoadingNbn] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false); // dropdown open state

  const debounced = useDebounce(query, 600);
  const lastSelected = useRef("");
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const isTyping = query.length >= 2 && debounced !== query;
  const showList = opened && suggestions.length > 0 && !nbnResult;

  /* Close on click outside */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpened(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* Fetch address suggestions after debounce */
  useEffect(() => {
    setError("");

    if (debounced.trim().length < 2) {
      setSuggestions([]);
      setOpened(false);
      return;
    }
    if (debounced === lastSelected.current) {
      setSuggestions([]);
      setOpened(false);
      return;
    }

    const controller = new AbortController();
    setLoadingSuggest(true);

    fetch(`/api/geocode?text=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Geocode failed"))))
      .then((data) => {
        const features = data?.features ?? [];
        setSuggestions(features);
        setOpened(true);
      })
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
    setOpened(false);
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

  /* Tell parent whenever tech/eligibility changes */
  useEffect(() => {
    if (typeof onTechChange === "function") {
      onTechChange(techType || null, canUpgrade);
    }
  }, [techType, canUpgrade, onTechChange]);

  /* Keyboard shortcuts: Enter selects first suggestion, Esc closes */
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpened(false);
      return;
    }
    if (e.key === "Enter" && suggestions.length > 0 && opened) {
      e.preventDefault();
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4">
      {/* Search box */}
      <div ref={boxRef} className="relative w-full">
        <div className="relative w-full rounded-xl border border-[#1EA6DF] bg-white/90 p-1.5 shadow-sm ring-1 ring-transparent transition focus-within:ring-[#1EA6DF]/30">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-[#1EA6DF]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full rounded-lg bg-transparent py-2.5 pl-10 pr-10 text-[15px] text-gray-800 placeholder-gray-400 outline-none"
            placeholder="Start typing your address…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setNbnResult(null);
              // Clear parent state while user edits
              onTechChange?.(null, false);
              onAddressChange?.(null);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setOpened(true);
            }}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={opened}
            aria-controls="suggestions-listbox"
          />

          {(isTyping || loadingSuggest || loadingNbn) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-gray-300 border-t-[#1EA6DF]" />
            </div>
          )}

          {/* Suggestions */}
          <div
            className={`absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border bg-white shadow-xl ${
              showList ? "block" : "hidden"
            }`}
            role="listbox"
            id="suggestions-listbox"
          >
            <div className="sticky top-0 border-b bg-white/95 px-4 py-2 text-xs font-semibold text-gray-500 backdrop-blur">
              Suggestions
            </div>

            <div className="max-h-72 overflow-auto">
              {suggestions.map((f) => (
                <button
                  key={f.properties.place_id}
                  onClick={() => handleSelect(f)}
                  className="flex w-full cursor-pointer items-start gap-2 px-4 py-2 text-left text-sm text-gray-800 transition hover:bg-[#1EA6DF] hover:text-white focus:bg-[#1EA6DF] focus:text-white"
                  role="option"
                  aria-selected={false}
                >
                  <span className="mt-[2px] inline-block h-1.5 w-1.5 rounded-full bg-[#1EA6DF] group-hover:bg-white" />
                  <span className="line-clamp-2">{f.properties.formatted}</span>
                </button>
              ))}

              {suggestions.length === 0 && !loadingSuggest && (
                <div className="px-4 py-3 text-sm text-gray-500">No matches. Keep typing…</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loadingNbn && (
        <div className="animate-pulse space-y-4">
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
          <h3 className="mb-1 text-2xl font-bold text-gray-900">
            {canUpgrade ? "Connect now" : "Great news!"}
          </h3>

          <p className="mb-4 text-base leading-relaxed text-gray-700">
            {canUpgrade
              ? "Great news! Your address qualifies for high-speed broadband on the nbn network across a range of great plans."
              : `High-speed broadband is available at your address. Your nbn connection is ${techType || "—"} and it's available across a range of great plans.`}
          </p>

          {canUpgrade && (
            <div>
              <h4 className="mb-2 text-lg font-bold text-gray-900">
                Fibre Upgrade with FREE installation
              </h4>
              <p className="mb-6 text-base leading-relaxed text-gray-700">
                Your address is eligible for a Fibre Upgrade with FREE installation, with speeds of up to 1000&nbsp;Mbps.
              </p>
            </div>
          )}

          <button
            className="flex items-center gap-2 rounded-lg bg-[#1EA6DF] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0f7fb3] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1EA6DF]/50"
            type="button"
          >
            <span>Get started</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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

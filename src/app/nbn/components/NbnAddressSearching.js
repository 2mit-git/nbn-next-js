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
  initialValue = "",
  onTechChange,
  onAddressChange,
  onSeePlans,
}) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [nbnResult, setNbnResult] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingNbn, setLoadingNbn] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);

  const debounced = useDebounce(query, 600);
  const lastSelected = useRef(initialValue || ""); // seed with initial value
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const isTyping = query.length >= 2 && debounced !== query;
  const showList = opened && suggestions.length > 0 && !nbnResult;

  /* NEW: keep input in sync if parent updates initialValue (e.g. from URL) */
  useEffect(() => {
    if (!initialValue) return;
    setQuery(initialValue);
    lastSelected.current = initialValue; // prevents dropdown fetch for same value
  }, [initialValue]);

  /* Close dropdown on click outside */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpened(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* Fetch suggestions */
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
        if (e.name !== "AbortError") setError("Unable to fetch suggestions.");
      })
      .finally(() => setLoadingSuggest(false));

    return () => controller.abort();
  }, [debounced]);

  /* Select a suggestion */
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
      onAddressChange?.(json?.addressDetail?.formattedAddress || addr);
    } catch {
      setError("We couldn’t load NBN details for this address.");
      setNbnResult(null);
      onTechChange?.(null, false);
      onAddressChange?.(null);
    } finally {
      setLoadingNbn(false);
    }
  };

  /* State derivations */
  const techType = nbnResult?.addressDetail?.techType?.toUpperCase?.() || "";
  const canUpgrade =
    (nbnResult?.addressDetail?.techChangeStatus || "")
      .trim()
      .toLowerCase() === "eligible to order";

  /* Inform parent — ONLY when we actually have an NBN result */
  useEffect(() => {
    if (!nbnResult) return; // prevents clearing seeded URL state on mount
    onTechChange?.(techType || null, canUpgrade);
  }, [nbnResult, techType, canUpgrade, onTechChange]);

  /* Keyboard shortcuts */
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
    <div className="mx-auto w-full ">
      {/* Hero row */}
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        {/* Headline */}
        <div className="text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Find out what{" "}
            <span className="text-[#1EA6DF]">nbn plans</span> are at your address
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Type your full address (including unit number if applicable) to see
            available options.
          </p>
        </div>

        {/* Search bar */}
        <div ref={boxRef} className="relative w-full">
          <div className="rounded-full bg-[#1EA6DF] p-2 shadow-lg">
            <div className="relative w-full rounded-full bg-white px-4 py-1 ring-1 ring-[#1EA6DF] focus-within:ring-2 focus-within:ring-[#1EA6DF]/40">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="h-5 w-5 text-[#1EA6DF]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
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
                className="w-full rounded-full bg-transparent py-3 pl-12 pr-12 text-base text-gray-900 placeholder-gray-400 outline-none sm:text-[15px]"
                placeholder="Enter your address…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setNbnResult(null);
                  onTechChange?.(null, false);
                  onAddressChange?.(null);
                }}
                onKeyDown={onKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setOpened(true);
                }}
              />

              {(isTyping || loadingSuggest || loadingNbn) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-gray-200 border-t-[#1EA6DF]" />
                </div>
              )}
            </div>
          </div>

          {/* Suggestions dropdown */}
          <div
            className={`absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ${
              showList ? "block" : "hidden"
            }`}
          >
            <div className="sticky top-0 border-b bg-white/95 px-4 py-2 text-xs font-semibold text-gray-500 backdrop-blur">
              Suggestions
            </div>

            <div className="max-h-[60vh] overflow-auto">
              {suggestions.map((f) => (
                <button
                  key={f.properties.place_id}
                  onClick={() => handleSelect(f)}
                  className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm text-gray-800 transition hover:bg-[#1EA6DF] hover:text-white focus:bg-[#1EA6DF] focus:text-white"
                >
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#1EA6DF]" />
                  <span className="line-clamp-2">{f.properties.formatted}</span>
                </button>
              ))}

              {suggestions.length === 0 && !loadingSuggest && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No results found. Keep typing…
                </div>
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
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="h-40 flex-1 rounded-lg bg-gray-200" />
            <div className="h-40 flex-1 rounded-lg bg-gray-200" />
          </div>
        </div>
      )}

      {/* Result */}
      {nbnResult && (
        <div className="space-y-5 mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:space-y-6 sm:p-6">
          <h3 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl">
            {canUpgrade ? "Upgrade ready" : "Service available"}
          </h3>

          <p className="mb-3 text-[15px] leading-relaxed text-gray-700 sm:mb-4 sm:text-base">
            {canUpgrade
              ? "Awesome news! Your location can be upgraded to ultra-fast fibre broadband with no install cost."
              : `nbn is already connected at your address. Your current technology type is ${
                  techType || "—"
                }, and you can choose from a variety of plans.`}
          </p>

          {canUpgrade && (
            <div>
              <h4 className="mb-1 text-lg font-bold text-gray-900 sm:mb-2">
                Free fibre installation
              </h4>
              <p className="mb-4 text-[15px] leading-relaxed text-gray-700 sm:mb-6 sm:text-base">
                Eligible addresses like yours can be switched to fibre with no
                upfront fee, unlocking speeds up to 1000&nbsp;Mbps.
              </p>
            </div>
          )}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1EA6DF] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0f7fb3] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1EA6DF]/50 sm:w-auto"
            type="button"
            onClick={() => onSeePlans?.()}
          >
            <span>See available plans</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {canUpgrade && (
            <p className="border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500 sm:pt-4">
              Free fibre upgrade applies to standard installations only and is
              available with selected high-speed plans. Setup may take 2–6
              weeks. A compatible modem may be required.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

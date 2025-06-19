"use client";
import React, { useState, useEffect, useRef } from "react";

// Debounce hook (default delay 1000ms)
function useDebounce(value, delay = 1000) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const inflightSuggestQueries = new Set();

export default function NbnAddressLookup({
  onTechChange,
  onAddressChange,
  onPackageSelect,
  onCanUpgradeChange,
  onConnectionTypeChange,
  query,
  setQuery,
  nbnResult,
  setNbnResult,
  selectedAddr,
  setSelectedAddr,
  suggestions,
  setSuggestions,
  submitButton,
}) {
  // Clear cache ONLY on full page reload
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("nbn_pendingPackage");
      localStorage.removeItem("nbn_connectionType");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const [pendingPackage, setPendingPackage] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nbn_pendingPackage") || null;
  });
  const [selectedConnectionType, setSelectedConnectionType] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nbn_connectionType") || null;
  });

  useEffect(() => {
    if (pendingPackage) {
      localStorage.setItem("nbn_pendingPackage", pendingPackage);
    } else {
      localStorage.removeItem("nbn_pendingPackage");
    }
  }, [pendingPackage]);

  useEffect(() => {
    if (selectedConnectionType) {
      localStorage.setItem("nbn_connectionType", selectedConnectionType);
    } else {
      localStorage.removeItem("nbn_connectionType");
    }
  }, [selectedConnectionType]);

  useEffect(() => {
    if (
      typeof onConnectionTypeChange === "function" &&
      selectedConnectionType
    ) {
      onConnectionTypeChange(selectedConnectionType);
    }
  }, [selectedConnectionType, onConnectionTypeChange]);

  const [internalQuery, internalSetQuery] = useState("");
  const [internalSuggestions, internalSetSuggestions] = useState([]);
  const [internalNbnResult, internalSetNbnResult] = useState(null);
  const [internalSelectedAddr, internalSetSelectedAddr] = useState("");
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingNbn, setLoadingNbn] = useState(false);
  const lastSelected = useRef(null);

  const controlledQuery = typeof query === "string" ? query : internalQuery;
  const controlledSetQuery = setQuery || internalSetQuery;
  const controlledSuggestions = Array.isArray(suggestions)
    ? suggestions
    : internalSuggestions;
  const controlledSetSuggestions = setSuggestions || internalSetSuggestions;
  const controlledNbnResult =
    nbnResult !== undefined ? nbnResult : internalNbnResult;
  const controlledSetNbnResult = setNbnResult || internalSetNbnResult;
  const controlledSelectedAddr = selectedAddr || internalSelectedAddr;
  const controlledSetSelectedAddr = setSelectedAddr || internalSetSelectedAddr;

  const debouncedQuery = useDebounce(controlledQuery);
  const isTyping =
    controlledQuery.length >= 2 && controlledQuery !== debouncedQuery;

  useEffect(() => {
    if (
      controlledNbnResult &&
      (controlledQuery ===
        controlledNbnResult.addressDetail?.formattedAddress ||
        controlledQuery === controlledSelectedAddr)
    ) {
      return;
    }

    if (debouncedQuery === lastSelected.current) {
      lastSelected.current = null;
      return;
    }

    if (debouncedQuery.length < 2) {
      controlledSetSuggestions([]);
      return;
    }

    if (inflightSuggestQueries.has(debouncedQuery)) return;
    inflightSuggestQueries.add(debouncedQuery);

    const controller = new AbortController();
    setLoadingSuggest(true);

    fetch(`/api/geocode?text=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        controlledSetSuggestions(data.features || []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => {
        setLoadingSuggest(false);
        inflightSuggestQueries.delete(debouncedQuery);
      });

    return () => {
      controller.abort();
      inflightSuggestQueries.delete(debouncedQuery);
    };
  }, [
    debouncedQuery,
    controlledQuery,
    controlledNbnResult,
    controlledSelectedAddr,
    controlledSetSuggestions,
  ]);

  const handleSelect = async (feature) => {
    const addr = feature.properties.formatted;
    lastSelected.current = addr;
    controlledSetQuery(addr);
    controlledSetSelectedAddr(addr);
    controlledSetSuggestions([]);
    setLoadingNbn(true);

    try {
      const res = await fetch(`/api/nbn?address=${encodeURIComponent(addr)}`);
      const json = await res.json();
      controlledSetNbnResult(json);

      const currentTech = json.addressDetail?.techType || null;
      onTechChange(currentTech);
      onAddressChange?.(json.addressDetail.formattedAddress || addr);
    } catch (err) {
      console.error(err);
      controlledSetNbnResult(null);
      onTechChange(null);
      onAddressChange?.(null);
    } finally {
      setLoadingNbn(false);
    }
  };

  const handleSearchClick = () => {
    const feature = controlledSuggestions.find(
      (f) => f.properties.formatted === controlledQuery
    );
    if (feature) handleSelect(feature);
  };

  const rawStatus =
    controlledNbnResult?.addressDetail?.techChangeStatus || "";
  const canUpgrade = rawStatus.trim().toLowerCase() === "eligible to order";

  useEffect(() => {
    if (typeof onCanUpgradeChange === "function") {
      onCanUpgradeChange(canUpgrade);
    }
  }, [canUpgrade, onCanUpgradeChange]);

  return  <div className="space-y-4 max-w-4xl mx-auto px-4">
      {/* Search box */}
      <div className="relative bg-gray-100 rounded-2xl shadow-md p-1.5 hover:scale-105 border border-[#1DA6DF] transition">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-[#1DA6DF]"
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
          type="text"
          className="w-full pl-10 py-2 text-gray-700 bg-transparent rounded-lg focus:outline-none"
          placeholder="Type your address..."
          value={controlledQuery}
          onChange={(e) => {
            controlledSetQuery(e.target.value);
            controlledSetNbnResult(null);
            onTechChange(null);
          }}
        />
        {(isTyping || loadingSuggest || loadingNbn) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-4 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}
        {controlledSuggestions.length > 0 && !controlledNbnResult && (
          <div className="absolute z-20 w-full mt-2 bg-white border rounded-2xl shadow-md">
            {controlledSuggestions.map((f) => (
              <div
                key={f.properties.place_id}
                className="px-4 py-2 hover:bg-[#1DA6DF] hover:text-white flex items-center cursor-pointer"
                onClick={() => handleSelect(f)}
              >
                {f.properties.formatted}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loadingNbn && (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            <div className="h-40 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-40 bg-gray-200 rounded-lg flex-1"></div>
          </div>
        </div>
      )}

      {/* Results panel */}
      {controlledNbnResult && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
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
                d="M12 22s-7-4.5-7-10a7 7 0 1114 0c0 5.5-7 10-7 10z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">
              {controlledNbnResult.addressDetail.formattedAddress ||
                controlledSelectedAddr}
            </h2>
          </div>

          {/* Upgrade box */}
          <div className="bg-gray-100 rounded-2xl p-5">
            {canUpgrade ? (
              <p className="text-center text-2xl text-[#1DA6DF] font-bold mb-6">
                You’re eligible for an nbn® Fibre Upgrade with $0 installation
              </p>
            ) : (
              <p className="text-center text-2xl text-[#1DA6DF] font-bold mb-6">
                {controlledNbnResult.addressDetail.techType.toUpperCase()} is
                available at your address
              </p>
            )}

            <div
              className={`grid gap-6 ${
                canUpgrade ? "md:grid-cols-2" : "md:grid-cols-1"
              }`}
            >
              <div
                role="button"
                onClick={() => {
                  const pkg = canUpgrade ? "skip" : "connect";
                  setPendingPackage(pkg);
                }}
                className={`flex flex-col items-center border rounded-lg p-4 cursor-pointer transform hover:scale-105 transition ${
                  pendingPackage === (canUpgrade ? "skip" : "connect")
                    ? "border-4 border-[#1DA6DF] bg-white"
                    : "border border-[#1DA6DF] bg-gray-50"
                }`}
              >
                {canUpgrade ? "Skip Upgrade" : "Connect Now"}
              </div>

              {canUpgrade && (
                <div
                  role="button"
                  onClick={() => {
                    onTechChange("FTTP_Upgrade");
                    setPendingPackage("fibre");
                  }}
                  className={`flex flex-col items-center rounded-lg p-4 cursor-pointer transform hover:scale-105 transition ${
                    pendingPackage === "fibre"
                      ? "border-4 border-[#1DA6DF] bg-white text-[#1DA6DF]"
                      : "border border-transparent bg-[#1DA6DF] bg-opacity-80 text-white"
                  }`}
                >
                  Upgrade Now
                </div>
              )}
            </div>

            {canUpgrade && (
              <p className="text-sm text-gray-600 mt-4">
                $0 Fibre Upgrade available for standard installations only.
                Offer valid with eligible high-speed plans. A compatible
                high-speed modem is required — additional charges may apply.
                According to nbn®, installation may take approximately 2 to 6
                weeks to complete.
              </p>
            )}
          </div>

          {/* Business vs Residential */}
          {pendingPackage && (
            <div className="mt-6">
              <div className="text-lg font-semibold mb-2">
                You are looking for connection in
              </div>
              <div className="flex gap-4 flex-col md:flex-row">
                {["business", "residential"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedConnectionType(type)}
                    className={`flex-1 flex flex-col items-center border rounded-lg p-4 cursor-pointer transform hover:scale-105 transition font-medium text-lg ${
                      selectedConnectionType === type
                        ? "bg-[#1DA6DF] text-white border-[#1DA6DF]"
                        : "bg-gray-50 text-[#1DA6DF] border-[#1DA6DF]"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  disabled={!selectedConnectionType}
                  onClick={() => {
                    if (pendingPackage && selectedConnectionType) {
                      onPackageSelect(pendingPackage, selectedConnectionType);
                    }
                  }}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    selectedConnectionType
                      ? "bg-[#1DA6DF] text-white hover:bg-[#178ac0]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optional submit button */}
      {submitButton && (
        <div className="mt-6 flex justify-center">{submitButton}</div>
      )}
    </div>
}

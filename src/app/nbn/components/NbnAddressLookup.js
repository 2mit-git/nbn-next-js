"use client";
import React, { useState, useEffect, useRef } from "react";

// Debounce hook
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
  setSelectedTab, // ✅ NEW PROP
}) {
  // Clear cache on full reload
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

  const rawStatus = controlledNbnResult?.addressDetail?.techChangeStatus || "";
  const canUpgrade = rawStatus.trim().toLowerCase() === "eligible to order";

  useEffect(() => {
    if (typeof onCanUpgradeChange === "function") {
      onCanUpgradeChange(canUpgrade);
    }
  }, [canUpgrade, onCanUpgradeChange]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-4">
      <div className="flex w-full gap-5">
        {/* Search Box */}
        <div className="relative bg-gray-100 rounded-lg shadow-md p-1.5 hover:scale-105 border border-[#1DA6DF] transition w-full">
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

        {/* Business/Residential */}
        <div className="flex gap-4 flex-col md:flex-row">
          {["business", "residential"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedConnectionType(type)}
              className={`flex-1 flex flex-col items-center border rounded-lg p-3 cursor-pointer transform hover:scale-105 transition font-medium text-lg ${
                selectedConnectionType === type
                  ? "bg-[#1DA6DF] text-white border-[#1DA6DF]"
                  : "bg-gray-50 text-[#1DA6DF] border-[#1DA6DF]"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Loading Skeleton */}
      {loadingNbn && (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            <div className="h-40 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-40 bg-gray-200 rounded-lg flex-1"></div>
          </div>
        </div>
      )}

      {/* NBN Result */}
      {controlledNbnResult && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
          {/* <div className="flex items-center space-x-3">
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
          </div> */}

          {/* Connect Now Section */}
         
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {canUpgrade ? "Connect now" : "Great news!"}
            </h3>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {canUpgrade
                ? "Great news! Your address qualifies for high-speed broadband on the nbn network across a range of great plans."
                : `High-speed broadband is available at your address. Your nbn connection is ${controlledNbnResult.addressDetail.techType.toUpperCase()} and it's available across a range of great plans.`}
            </p>
          

          {/* Fibre Upgrade Section */}
          {canUpgrade && (
            <div>
               <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Fibre Upgrade with FREE installation
              </h3>
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                Your address is eligible for a Fibre Upgrade with FREE
                installation with speeds of up to 1000Mbps.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <button className="bg-[#1DA6DF] hover:bg-[#086085] cursor-pointer  text-white px-8 py-3 rounded-lg font-semibold text-base transition-all duration-200 flex items-center space-x-2 hover:shadow-lg">
                <span>Get started</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
          {canUpgrade && (
            <p className="text-xs text-gray-500 leading-relaxed pt-4 border-t border-gray-100">
              $0 Fibre Upgrade available for standard installations only. Offer
              valid with eligible high-speed plans. A compatible high-speed
              modem is required — additional charges may apply. Installation may
              take approximately 2 to 6 weeks.
            </p>
          )}
        </div>
      )}

      {/* Optional submit button */}
      {submitButton && (
        <div className="mt-6 flex justify-center">{submitButton}</div>
      )}
    </div>
  );
}

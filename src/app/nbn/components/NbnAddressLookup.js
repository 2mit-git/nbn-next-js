// File: src/components/NbnAddressLookup.js
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
  onConnectionTypeChange, // New prop
  query,
  setQuery,
  nbnResult,
  setNbnResult,
  selectedAddr,
  setSelectedAddr,
  suggestions,
  setSuggestions,
  submitButton, // New prop for submit button
}) {
  // New state for pending package selection
  const [pendingPackage, setPendingPackage] = useState(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState(null);

  // State to control which tab is selected in TabProductGrid
  const [selectedTab, setSelectedTab] = useState("regular");

  // Notify parent of connection type change
  useEffect(() => {
    if (typeof onConnectionTypeChange === "function" && selectedConnectionType) {
      onConnectionTypeChange(selectedConnectionType);
    }
  }, [selectedConnectionType, onConnectionTypeChange]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  // PBX install step state
  // (PBX install step removed)

  // Use controlled props if provided, otherwise fallback to internal state
  const [internalQuery, internalSetQuery] = useState("");
  const [internalSuggestions, internalSetSuggestions] = useState([]);
  const [internalNbnResult, internalSetNbnResult] = useState(null);
  const [internalSelectedAddr, internalSetSelectedAddr] = useState("");
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingNbn, setLoadingNbn] = useState(false);
  const lastSelected = useRef(null);

  const controlledQuery = typeof query === "string" ? query : internalQuery;
  const controlledSetQuery = setQuery || internalSetQuery;
  const controlledSuggestions = suggestions || internalSuggestions;
  const controlledSetSuggestions = setSuggestions || internalSetSuggestions;
  const controlledNbnResult = nbnResult !== undefined ? nbnResult : internalNbnResult;
  const controlledSetNbnResult = setNbnResult || internalSetNbnResult;
  const controlledSelectedAddr = selectedAddr || internalSelectedAddr;
  const controlledSetSelectedAddr = setSelectedAddr || internalSetSelectedAddr;

  const debouncedQuery = useDebounce(controlledQuery);
  const isTyping = controlledQuery.length >= 2 && controlledQuery !== debouncedQuery;

  // Autocomplete effect
  useEffect(() => {
    // Stop searching if an address has been selected and the input matches the selected address/result
    if (
      controlledNbnResult &&
      (controlledQuery === controlledNbnResult.addressDetail?.formattedAddress ||
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
    const url = `/api/geocode?text=${encodeURIComponent(debouncedQuery)}`;

    setLoadingSuggest(true);
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => controlledSetSuggestions(data.features || []))
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
    controlledSetSuggestions,
    controlledNbnResult,
    controlledQuery,
    controlledSelectedAddr,
  ]);

  // NBN lookup
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
    const feature = controlledSuggestions.find((f) => f.properties.formatted === controlledQuery);
    if (feature) handleSelect(feature);
  };

  const rawStatus = controlledNbnResult?.addressDetail?.techChangeStatus || "";
  const canUpgrade = rawStatus.trim().toLowerCase() === "eligible to order";

  // Notify parent of canUpgrade status when nbnResult changes
  useEffect(() => {
    if (typeof onCanUpgradeChange === "function") {
      onCanUpgradeChange(canUpgrade);
    }
    // Only run when nbnResult changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUpgrade]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-4">
      {/* Question and Connection Type Buttons */}
      {/* Will be conditionally rendered after package selection */}
      {/* Search box */}
      <div className="relative bg-gray-100 rounded-2xl shadow-md p-1.5 transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-lg border border-[#1DA6DF]">
        {/* Icon */}
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
        <div className="flex items-center">
          <input
            type="text"
            className="w-full pl-10 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-transparent rounded-lg focus:outline-none"
            placeholder="Type your address..."
            value={controlledQuery}
            onChange={(e) => {
              controlledSetQuery(e.target.value);
              controlledSetNbnResult(null);
              onTechChange(null);
            }}
          />
          {(isTyping || loadingSuggest || loadingNbn) && (
            <div className="flex items-center justify-center mx-2">
              <div className="w-5 h-5 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {controlledSuggestions.length > 0 && !controlledNbnResult && (
          <div className="absolute z-20 w-full mt-2 left-0 bg-white border rounded-2xl shadow-md">
            {controlledSuggestions.map((f) => (
              <div
                key={f.properties.place_id}
                className="px-4 py-2 hover:bg-[#1DA6DF] hover:text-white rounded-lg cursor-pointer flex items-center"
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-40 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-40 bg-gray-200 rounded-lg flex-1"></div>
          </div>
        </div>
      )}

      {/* Results */}
      {controlledNbnResult && (
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
                d="M12 22s-7-4.5-7-10a7 7 0 1114 0c0 5.5-7 10-7 10z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">
              {controlledNbnResult.addressDetail.formattedAddress || controlledSelectedAddr}
            </h2>
          </div>

          <div className="bg-gray-100 rounded-2xl p-5">
            {canUpgrade ? (
              <p className="text-center text-2xl  text-[#1DA6DF] mb-6 font-bold">
                You’re eligible for an nbn® Fibre Upgrade with $0 installation
              </p>
            ) : (
              <p className="text-center text-2xl  text-[#1DA6DF] mb-6 font-bold">
                {controlledNbnResult.addressDetail.techType.toUpperCase()} is available at your address
              </p>
            )}
            <div className={`grid grid-cols-1 ${canUpgrade ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6`}>
              {/* Connect Now / Skip Upgrade */}
              <div
                role="button"
                onClick={() => {
                  setSelectedPackage("connect");
                  setPendingPackage("connect");
                  setSelectedTab("regular");
                }}
                className={`flex items-center justify-center flex-col border rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105 font-medium text-lg
                  ${pendingPackage === "connect"
                    ? "border-4 border-[#1DA6DF] bg-white"
                    : "border border-[#1DA6DF] bg-gray-50"}
                `}
              >
                {pendingPackage === "connect" && (
                  <span className="mb-1">
                    <svg className="w-5 h-5 inline text-[#1DA6DF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {canUpgrade ? (
                  <h3
                    className="text-2xl font-medium text-center text-[#1DA6DF] mb-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackage("skip");
                      setPendingPackage("skip");
                      setSelectedTab("regular");
                    }}
                  >
                    Skip Upgrade
                  </h3>
                ) : (
                  <h3 className="text-2xl font-medium text-center text-[#1DA6DF] mb-1">
                    Connect Now
                  </h3>
                )}
              </div>

              {/* Fibre Upgrade */}
              {canUpgrade && (
                <div
                  role="button"
                  onClick={() => {
                    onTechChange("FTTP_Upgrade");
                    setSelectedPackage("fibre");
                    setPendingPackage("fibre");
                    setSelectedTab("upgrade");
                  }}
                  className={`flex items-center justify-center flex-col rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105 font-medium text-lg
                    ${pendingPackage === "fibre"
                      ? "border-4 border-[#1DA6DF] bg-white text-[#1DA6DF]"
                      : "border border-transparent bg-[#1DA6DF] bg-opacity-80 text-white"}
                  `}
                >
                  {pendingPackage === "fibre" && (
                    <span className="mb-1">
                      <svg className="w-5 h-5 inline text-[#1DA6DF]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <h3 className="text-2xl font-medium text-center mb-1">
                    Upgrade Now
                  </h3>
                </div>
              )}
            </div>
            {canUpgrade && (<p className="text-sm text-gray-600 mt-4">
              $0 Fibre Upgrade available for standard installations only. Offer valid with eligible high-speed plans. A compatible high-speed modem is required — additional charges may apply. According to nbn®, installation may take approximately 2 to 6 weeks to complete.
            </p>)}
          </div>

          {/* business/Residential selection after package action */}
          {pendingPackage && (
            <div className="mb-4 mt-6">
              <div className="text-lg font-semibold mb-2">You are looking for connection in</div>
              <div className="flex gap-4 flex-col md:flex-row">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center flex-col border rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105 font-medium text-lg
                    ${selectedConnectionType === "business"
                      ? "bg-[#1DA6DF] text-white border-[#1DA6DF]"
                      : "bg-gray-50 text-[#1DA6DF] border-[#1DA6DF]"}
                  `}
                  onClick={() => setSelectedConnectionType("business")}
                >
                  {selectedConnectionType === "business" && (
                    <span className="mb-1">
                      <svg className="w-5 h-5 inline text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  Business
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center flex-col border rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-105 font-medium text-lg
                    ${selectedConnectionType === "residential"
                      ? "bg-[#1DA6DF] text-white border-[#1DA6DF]"
                      : "bg-gray-50 text-[#1DA6DF] border-[#1DA6DF]"}
                  `}
                  onClick={() => setSelectedConnectionType("residential")}
                >
                  {selectedConnectionType === "residential" && (
                    <span className="mb-1">
                      <svg className="w-5 h-5 inline text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  Residential
                </button>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    selectedConnectionType
                      ? "bg-[#1DA6DF] text-white hover:bg-[#178ac0] cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!selectedConnectionType}
                  onClick={() => {
                    if (selectedConnectionType === "business" || selectedConnectionType === "residential") {
                      onPackageSelect && onPackageSelect(pendingPackage, selectedConnectionType);
                      setPendingPackage(null);
                      setSelectedConnectionType(null);
                    }
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          {/* PBX install step for Business */}
          {/* (PBX install step removed) */}
        </div>
      )}
      {/* Render submit button if provided */}
      {submitButton && (
        <div className="mt-6 flex justify-center">
          {submitButton}
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import ProductGrid from "./ProductGrid";

export default function TabProductGrid({
  selectedTech,
  originalTech,
  onSelectPlan,
  onLoadingChange,
  back,
  productGridLoading,
  selectedTab,      // external tab (controlled)
  setSelectedTab,   // external tab setter
}) {
  // Determine initial tab
  const initialTab = selectedTech === "FTTP_Upgrade" ? "upgrade" : "regular";
  const [internalTab, setInternalTab] = useState(initialTab);

  // Decide which tab is currently active (external or internal)
  const activeTab = selectedTab ?? internalTab;
  const handleSetTab = setSelectedTab ?? setInternalTab;

  // Update internal tab when selectedTech changes (only if not controlled)
  useEffect(() => {
    if (!selectedTab) {
      if (selectedTech === "FTTP_Upgrade") {
        setInternalTab("upgrade");
      } else if (selectedTech) {
        setInternalTab("regular");
      }
    }
  }, [selectedTech, selectedTab]);

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex mb-6 justify-center gap-2">
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${
            activeTab === "regular"
              ? "border-[#1DA6DF] bg-blue-50 text-[#1DA6DF]"
              : "border-transparent bg-white text-gray-500"
          }`}
          onClick={() => handleSetTab("regular")}
          disabled={activeTab === "regular"}
        >
          Regular Packages
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${
            activeTab === "upgrade"
              ? "border-[#1DA6DF] bg-blue-50 text-[#1DA6DF]"
              : "border-transparent bg-white text-gray-500"
          }`}
          onClick={() => handleSetTab("upgrade")}
          disabled={activeTab === "upgrade"}
        >
          Upgrade Packages
        </button>
      </div>

      {/* Product Grid */}
      <ProductGrid
        tech={activeTab === "upgrade" ? "FTTP_Upgrade" : originalTech}
        onSelectPlan={onSelectPlan}
        onLoadingChange={onLoadingChange}
      />

      {/* Back Button */}
      {!productGridLoading && (
        <button className="btn btn-neutral mt-6" onClick={back}>
          ← Back
        </button>
      )}
    </div>
  );
}

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
  selectedTab, // new prop
  setSelectedTab, // new prop
}) {
  // Determine initial tab: if selectedTech is FTTP_Upgrade, start on upgrade tab, else regular
  const initialTab =
    selectedTech === "FTTP_Upgrade" ? "upgrade" : "regular";
  const [internalTab, setInternalTab] = useState(initialTab);

  // Use controlled tab if provided, otherwise fallback to internal state
  const activeTab = selectedTab || internalTab;
  const handleSetTab = setSelectedTab || setInternalTab;

  // If selectedTech changes (user comes from address step), update tab (only for uncontrolled)
  useEffect(() => {
    if (!selectedTab) {
      if (selectedTech === "FTTP_Upgrade") setInternalTab("upgrade");
      else if (selectedTech && selectedTech !== "FTTP_Upgrade") setInternalTab("regular");
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
      {/* ProductGrid */}
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

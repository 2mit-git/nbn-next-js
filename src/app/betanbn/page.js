// File: src/app/nbnup/page.js
"use client";
import React, { useMemo, useState } from "react";
import NbnAddressSearching from "./components/NbnAddressSearching";
import NbnProducts from "./components/NbnProducts";
import Addons from "./components/Addons";
import AddonsPbx from "./components/AddonsPbx";
import OrderSummary from "./components/OrderSummary";
import ContractForm from "./components/ContractForm";

export default function Page() {
  // Tech from the searched address: "FTTC" | "FTTP" | "HFC" | "FTTN" | null
  const [addressTech, setAddressTech] = useState(null);
  // Upgrade eligibility from the lookup
  const [upgradeEligible, setUpgradeEligible] = useState(false);

  // Plan selected in the products list
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Extras (modem / extender / phone)
  const [extras, setExtras] = useState({
    includeModem: null,        // null = not chosen yet
    selectedModems: [],        // e.g. ["modem", "extender"]
    includePhone: null,        // null = not chosen yet
    selectedPhone: "pack",     // "pack" | "payg"
  });

  // PBX lives separately in its component
  const [pbxState, setPbxState] = useState({ includePBX: null, pbx: null });

  // Called by NbnAddressSearching when result changes
  const handleTechChange = (techType, canUpgrade) => {
    setAddressTech(techType || null);
    setUpgradeEligible(!!canUpgrade);
  };

  // Merge extras into the shape OrderSummary expects
  const mergedExtras = useMemo(() => {
    return {
      modems: extras.includeModem ? extras.selectedModems : [],
      phone: extras.includePhone ? extras.selectedPhone : null,
      pbx: pbxState.includePBX ? pbxState.pbx : null,
    };
  }, [
    extras.includeModem,
    extras.selectedModems,
    extras.includePhone,
    extras.selectedPhone,
    pbxState.includePBX,
    pbxState.pbx,
  ]);

  return (
    <div className="m-20 space-y-8">
      <div className="relative z-[60]">
        <NbnAddressSearching onTechChange={handleTechChange} />
      </div>

      <NbnProducts
        originalTech={addressTech}
        selectedTech={upgradeEligible ? "FTTP_Upgrade" : null}
        onPlanChange={setSelectedPlan}
        onSelectPlan={setSelectedPlan}
        onSelect={setSelectedPlan}
        selectedPlan={selectedPlan}
      />

      <Addons value={extras} onChange={setExtras} />
      <AddonsPbx value={pbxState} onChange={setPbxState} />

      <OrderSummary
        selectedPlan={selectedPlan}
        extras={mergedExtras}
        title="Order Summary"
      />

      <ContractForm />
    </div>
  );
}
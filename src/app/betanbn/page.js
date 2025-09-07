"use client";
import React, { useMemo, useRef, useState } from "react";
import NbnAddressSearching from "./components/NbnAddressSearching";
import NbnProducts from "./components/NbnProducts";
import Addons from "./components/Addons";
import AddonsPbx from "./components/AddonsPbx";
import ContractForm from "./components/ContractForm";

export default function Page() {
  // Selected service address from the address search
  const [serviceAddress, setServiceAddress] = useState("");

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

  // Merge extras into the shape ContractForm expects
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

  // Ref for the plans section (for smooth scroll)
  const plansRef = useRef(null);

  const scrollToPlans = () => {
    // If you have a sticky header, add a scroll-mt class on the ref wrapper (e.g., "scroll-mt-24")
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lg:m-20 m-2 space-y-8">
      <div className="relative z-[60]">
        <NbnAddressSearching
          onTechChange={handleTechChange}
          onAddressChange={setServiceAddress}   // <-- capture formatted address
          onSeePlans={scrollToPlans}            // <-- NEW: smooth scroll trigger
        />
      </div>

      {/* Plans section wrapped with the ref for scrolling */}
      <div ref={plansRef} className="scroll-mt-24">
        <NbnProducts
          originalTech={addressTech}
          selectedTech={upgradeEligible ? "FTTP_Upgrade" : null}
          onPlanChange={setSelectedPlan}
          onSelectPlan={setSelectedPlan}
          onSelect={setSelectedPlan}
          selectedPlan={selectedPlan}
        />
      </div>

      <Addons value={extras} onChange={setExtras} />
      <AddonsPbx value={pbxState} onChange={setPbxState} />

      <ContractForm
        serviceAddress={serviceAddress}  // used by pre-check
        selectedPlan={selectedPlan}      // used by pre-check + payload
        extras={mergedExtras}
      />
    </div>
  );
}

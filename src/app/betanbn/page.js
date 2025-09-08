// app/betanbn/page.js
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import NbnAddressSearching from "./components/NbnAddressSearching";
import NbnProducts from "./components/NbnProducts";
import Addons from "./components/Addons";
import AddonsPbx from "./components/AddonsPbx";
import ContractForm from "./components/ContractForm";
import OrderSummary from "./components/OrderSummary";

export default function Page() {
  const [serviceAddress, setServiceAddress] = useState("");
  const [addressTech, setAddressTech] = useState(null);      // "FTTC" | "FTTP" | "HFC" | "FTTN" | null
  const [upgradeEligible, setUpgradeEligible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // keep a snapshot of params so we can pass them through on first render
  const [paramSeed, setParamSeed] = useState({
    address: "",
    tech: null,
    upgrade: false,
  });

  // Extras
  const [extras, setExtras] = useState({
    includeModem: null,
    selectedModems: [],
    includePhone: null,
    selectedPhone: "pack",
  });
  const [pbxState, setPbxState] = useState({ includePBX: null, pbx: null });

  // From child
  const handleTechChange = (techType, canUpgrade) => {
    setAddressTech(techType || null);
    setUpgradeEligible(!!canUpgrade);
  };

  const mergedExtras = useMemo(() => ({
    modems: extras.includeModem ? extras.selectedModems : [],
    phone: extras.includePhone ? extras.selectedPhone : null,
    pbx: pbxState.includePBX ? pbxState.pbx : null,
  }), [
    extras.includeModem,
    extras.selectedModems,
    extras.includePhone,
    extras.selectedPhone,
    pbxState.includePBX,
    pbxState.pbx,
  ]);

  const plansRef = useRef(null);
  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* --------- Seed from the current URL on first mount (robust) --------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);

    const addr = sp.get("address") || "";
    const tech = (sp.get("tech") || "").toUpperCase() || null;     // normalize to upper
    const upgradeRaw = sp.get("upgrade");
    const upgrade =
      upgradeRaw === "1" || upgradeRaw === "true" || upgradeRaw === "yes";

    // seed UI state
    if (addr) setServiceAddress(addr);
    if (tech) setAddressTech(tech);
    setUpgradeEligible(!!upgrade);

    // keep a copy for initial render props
    setParamSeed({ address: addr, tech, upgrade });

    // scroll to plans if we arrived with an address
    if (addr) {
      const t = setTimeout(() => {
        plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="lg:m-20 m-2 space-y-8">
      <div className="relative z-[60]">
        <NbnAddressSearching
          /* show the incoming address in the box so users see what was used */
          initialValue={serviceAddress}          
          onTechChange={handleTechChange}
          onAddressChange={setServiceAddress}
          onSeePlans={scrollToPlans}
        />
      </div>
      

      {/* Plans section wrapped with the ref for scrolling */}
      <div ref={plansRef} className="scroll-mt-24">
        <NbnProducts
          /* pass tech + upgrade derived from URL/state so filtering is immediate */
          originalTech={addressTech ?? paramSeed.tech}
          selectedTech={(upgradeEligible ?? paramSeed.upgrade) ? "FTTP_Upgrade" : null}
          onPlanChange={setSelectedPlan}
          onSelectPlan={setSelectedPlan}
          onSelect={setSelectedPlan}
          selectedPlan={selectedPlan}
          key={`${addressTech ?? paramSeed.tech}-${upgradeEligible ?? paramSeed.upgrade}`} // force re-eval when params change
        />
      </div>

      <Addons value={extras} onChange={setExtras} />
      <AddonsPbx value={pbxState} onChange={setPbxState} />

      <OrderSummary selectedPlan={selectedPlan} extras={mergedExtras} title="Order Summary" />

      <ContractForm
        serviceAddress={serviceAddress}
        selectedPlan={selectedPlan}
        extras={mergedExtras}
      />
    </div>
  );
}

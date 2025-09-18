// app/betanbn/page.js
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import NbnAddressSearching from "./components/NbnAddressSearching";
import NbnProducts from "./components/NbnProducts";
import Addons from "./components/Addons";
import AddonsPbx from "./components/AddonsPbx";
import ContractForm from "./components/ContractForm";
import OrderSummary from "./components/OrderSummary";
import { initEmbedBridge } from "@/utils/embedBridge";


export default function Page() {
  // ✅ Initialize parent <-> iframe messaging once
  useEffect(() => {
    const cleanup = initEmbedBridge();
    return () => cleanup?.();
  }, []);

  const [serviceAddress, setServiceAddress] = useState("");
  const [addressTech, setAddressTech] = useState(null); // "FTTC" | "FTTP" | "HFC" | "FTTN" | null
  const [upgradeEligible, setUpgradeEligible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // used to re-mount children and clear their internal input states
  const [resetVersion, setResetVersion] = useState(0);

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

  const mergedExtras = useMemo(
    () => ({
      // legacy/per-item list still supported
      modems: extras.includeModem ? extras.selectedModems : [],

      // NEW: pass bundle + term chosen in Addons
      modemBundle:
        extras.includeModem && Number.isInteger(extras.modemBundle)
          ? extras.modemBundle
          : undefined,
      modemTerm:
        extras.includeModem && (extras.modemTerm === "outright" || extras.modemTerm === "12" || extras.modemTerm === "24")
          ? extras.modemTerm
          : undefined,

      // unchanged
      phone: extras.includePhone ? extras.selectedPhone : null,
      pbx: pbxState.includePBX ? pbxState.pbx : null,
    }),
    [
      extras.includeModem,
      extras.selectedModems,
      extras.modemBundle,
      extras.modemTerm,
      extras.includePhone,
      extras.selectedPhone,
      pbxState.includePBX,
      pbxState.pbx,
    ]
  );

  const plansRef = useRef(null);
  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* --------- Seed from the current URL on first mount (robust) --------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);

    const addr = sp.get("address") || "";
    const tech = (sp.get("tech") || "").toUpperCase() || null; // normalize to upper
    const upgradeRaw = sp.get("upgrade");
    const upgrade = upgradeRaw === "1" || upgradeRaw === "true" || upgradeRaw === "yes";

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

  /** Reset everything after successful submit */
  const handleSubmitSuccess = () => {
    // clear all parent selections/state
    setServiceAddress("");
    setAddressTech(null);
    setUpgradeEligible(false);
    setSelectedPlan(null);
    setExtras({
      includeModem: null,
      selectedModems: [],
      includePhone: null,
      selectedPhone: "pack",
    });
    setPbxState({ includePBX: null, pbx: null });
    setParamSeed({ address: "", tech: null, upgrade: false });

    // remove URL query if present
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // bump a version to force-remount children that hold internal input state
    setResetVersion((v) => v + 1);
  };

  return (
    <div className="lg:m-20 m-2 space-y-8">
      <div className="relative z-[0]">
        <NbnAddressSearching
          key={`addr-${resetVersion}`}         
          initialValue={serviceAddress}
          onTechChange={handleTechChange}
          onAddressChange={setServiceAddress}
          onSeePlans={scrollToPlans}
        />
      </div>

      {/* Plans section wrapped with the ref for scrolling */}
      <div ref={plansRef} className="scroll-mt-24">
        <NbnProducts
          key={`plans-${addressTech ?? paramSeed.tech}-${upgradeEligible ?? paramSeed.upgrade}-${resetVersion}`}
          originalTech={addressTech ?? paramSeed.tech}
          selectedTech={(upgradeEligible ?? paramSeed.upgrade) ? "FTTP_Upgrade" : null}
          onPlanChange={setSelectedPlan}
          onSelectPlan={setSelectedPlan}
          onSelect={setSelectedPlan}
          selectedPlan={selectedPlan}
        />
      </div>

      <Addons key={`addons-${resetVersion}`} value={extras} onChange={setExtras} />
      <AddonsPbx key={`pbx-${resetVersion}`} value={pbxState} onChange={setPbxState} />

      <OrderSummary selectedPlan={selectedPlan} extras={mergedExtras} title="Order Summary" />

      <ContractForm
        key={`form-${resetVersion}`}
        serviceAddress={serviceAddress}
        selectedPlan={selectedPlan}
        extras={mergedExtras}
        onSubmitSuccess={handleSubmitSuccess}   
      />
    </div>
  );
}

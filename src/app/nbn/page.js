// File: src/app/page.js
"use client";

import { useState, useEffect } from "react";
import NbnAddressLookup from "@/app/nbn/components/NbnAddressLookup";
import ProductGrid from "@/app/nbn/components/ProductGrid";
import ExtrasSelector from "@/app/nbn/components/ExtrasSelector";
import ContractForm from "@/app/nbn/components/ContractForm";

import TabProductGrid from "@/app/nbn/components/TabProductGrid";

export default function Home() {
  // Clear all extras and PBX cache on full reload
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("extras");
      localStorage.removeItem("pbx_include");
      localStorage.removeItem("pbx_config");
    }
  }, []);

  const [step, setStep] = useState(0);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [serviceAddress, setServiceAddress] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [extras, setExtras] = useState({ modems: [], phone: null });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Persist extras to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("extras", JSON.stringify(extras));
    }
  }, [extras]);
  const [productGridLoading, setProductGridLoading] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  

  // Track the original tech for regular packages
  const [originalTech, setOriginalTech] = useState(null);

  // New: State for address search persistence
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressNbnResult, setAddressNbnResult] = useState(null);
  const [addressSelectedAddr, setAddressSelectedAddr] = useState("");
  // Track canUpgrade status
  const [canUpgrade, setCanUpgrade] = useState(false);

  // Add these new states
  const [userChoice, setUserChoice] = useState({
    upgradeChoice: null,  // 'skip', 'upgrade', 'connect'
    customerType: null    // 'business', 'residential'
  });

  const [userChoices, setUserChoices] = useState({
    customerType: null,    // 'residential' or 'business'
    connectionChoice: null // 'skip-upgrade', 'upgrade-now', or 'connect-now'
  });

  // Load saved choices on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedChoices = localStorage.getItem('userChoices');
      const saved = localStorage.getItem('userChoices');
      if (savedChoices) {
        setUserChoice(JSON.parse(savedChoices));
      }
      if (saved) {
        setUserChoices(JSON.parse(saved));
      }
    }
  }, []);

  // Save choices whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('userChoices', JSON.stringify(userChoice));
      localStorage.setItem('userChoices', JSON.stringify(userChoices));
    }
  }, [userChoice, userChoices]);

  // Handler to update choices
  const handleUserChoice = (type, value) => {
    setUserChoice(prev => ({
      ...prev,
      [type]: value
    }));
    setUserChoices(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => {
    setSelectedPackage(null);
    setStep((s) => Math.max(s - 1, 0));
  };
  const steps = ["Check NBN", "Choose plan", "Select extras", "Your details"];

  useEffect(() => {
    if (selectedPackage) next();
  }, [selectedPackage]);



  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">
          {/* Steps Bar */}
          <section>
            <div className="relative h-12 max-w-4xl mx-auto">
              <div className="absolute inset-x-1/8 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-[#1DA6DF] rounded-full transition-all duration-500"
                  style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative grid grid-cols-4 text-center">
                {steps.map((label, i) => {
                  const active = i <= step;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300
                          ${
                            active
                              ? "bg-[#1DA6DF] text-white shadow-lg"
                              : "bg-white border-2 border-gray-300 text-gray-400"
                          }`}
                      >
                        {i + 1}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium transition-colors duration-300
                          ${active ? "text-[#1DA6DF]" : "text-gray-500"}`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Selection Summary Bar */}
          {step > 0 && step < 3 && (
            <section className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-4 items-center bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 shadow-sm min-h-[44px]">
                {serviceAddress && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">
                      Address:
                    </span>
                    <span className="text-blue-800">{serviceAddress}</span>
                  </div>
                )}
                {selectedPlan?.speed && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">
                      Plan Speed:
                    </span>
                    <span className="text-blue-800">{selectedPlan.speed}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Step Content */}
          <section>
            {step === 0 && (
              <div>
                <h3 className="font-bold w-full text-center text-xl sm:text-2xl md:text-3xl mt-10 mb-10 px-4">
                  See which nbn plans are available for
                  <span className="text-[#1DA6DF] ms-1">your address.</span>
                </h3>
               
                <NbnAddressLookup
                  onTechChange={(tech) => {
                    setSelectedTech(tech);
                    // Set originalTech if not FTTP_Upgrade and not already set
                    if (tech && tech !== "FTTP_Upgrade" && !originalTech) {
                      setOriginalTech(tech);
                    }
                  }}
                  onAddressChange={setServiceAddress}
                  onPackageSelect={setSelectedPackage}
                  onCanUpgradeChange={setCanUpgrade}
                  query={addressQuery}
                  setQuery={setAddressQuery}
                  nbnResult={addressNbnResult}
                  setNbnResult={setAddressNbnResult}
                  selectedAddr={addressSelectedAddr}
                  setSelectedAddr={setAddressSelectedAddr}
                  suggestions={addressSuggestions}
                  setSuggestions={setAddressSuggestions}
                  onConnectionTypeChange={setConnectionType}
                  userChoice={userChoice}
                  onChoiceChange={handleUserChoice}
                  userChoices={userChoices}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-bold w-full text-center text-xl sm:text-2xl md:text-3xl mt-10 mb-10 px-4">
                  Select your unlimited data{" "}
                  <span className="text-[#1DA6DF] ms-2">nbn plan.</span>
                </h3>
                {canUpgrade ? (
                  <TabProductGrid
                    selectedTech={selectedTech}
                    originalTech={originalTech}
                    onSelectPlan={(plan) => {
                      setSelectedPlan(plan);
                      next();
                    }}
                    onLoadingChange={setProductGridLoading}
                    back={back}
                    productGridLoading={productGridLoading}
                  />
                ) : (
                  <>
                    <ProductGrid
                      tech={originalTech}
                      onSelectPlan={(plan) => {
                        setSelectedPlan(plan);
                        next();
                      }}
                      onLoadingChange={setProductGridLoading}
                    />
                    {!productGridLoading && (
                      <button className="btn btn-neutral mt-6" onClick={back}>
                        ← Back
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-bold w-full text-center text-xl sm:text-2xl md:text-3xl mt-10 mb-10 px-4">
                  Enhance your plan with{" "}
                  <span className="text-[#1DA6DF] ms-2">some extras.</span>
                </h3>
                {/* Add this above in your component: const [extras, setExtras] = useState({}); */}
                <ExtrasSelector value={extras} onChange={setExtras} connectionType={connectionType} />
                <div className="flex justify-between">
                  <button className="btn btn-neutral" onClick={back}>
                    ← Back
                  </button>
                  <button className="btn btn-info text-white" onClick={next}>
                    Next: Your details
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <ContractForm
                  serviceAddress={serviceAddress}
                  selectedPlan={selectedPlan}
                  extras={extras}
                  connectionType={connectionType}
                  onSuccess={() => {
                    setSelectedPlan(null);
                    setExtras({ modems: [], phone: null });
                  }}
                  onRestart={() => {
                    // Clear all cache/localStorage data
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("extras");
                      localStorage.removeItem("pbx_include");
                      localStorage.removeItem("pbx_config");
                      localStorage.removeItem("userChoices");
                    }
                    setStep(0);
                    setSelectedTech(null);
                    setSelectedPackage(null);
                    setServiceAddress("");
                    setSelectedPlan(null);
                    setExtras({ modems: [], phone: null });
                    setFormSubmitted(false);
                  }}
                  onSubmitSuccess={() => setFormSubmitted(true)}
                />
                {!formSubmitted && (
                  <button className="btn btn-neutral" onClick={back}>
                    ← Back
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

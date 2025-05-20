// File: src/app/page.js
"use client";

import { useState, useEffect } from "react";
import NbnAddressLookup from "./components/NbnAddressLookup";
import ProductGrid from "./components/ProductGrid";
import ExtrasSelector from "./components/ExtrasSelector";
import ContractForm from "./components/ContractForm";

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [serviceAddress, setServiceAddress] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [extras, setExtras] = useState({ modems: [], phone: null });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));
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
              <div
                className="absolute inset-x-1/8 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 rounded-full"
              >
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
                          ${active
                            ? "bg-[#1DA6DF] text-white shadow-lg"
                            : "bg-white border-2 border-gray-300 text-gray-400"}`}
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
                    <span className="font-semibold text-blue-900">Address:</span>
                    <span className="text-blue-800">{serviceAddress}</span>
                  </div>
                )}
                {selectedPlan?.speed && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-900">Plan Speed:</span>
                    <span className="text-blue-800">{selectedPlan.speed}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Step Content */}
          <section>
            {step === 0 && (
              <NbnAddressLookup
                onTechChange={setSelectedTech}
                onAddressChange={setServiceAddress}
                onPackageSelect={setSelectedPackage}
              />
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Our NBN Plans</h1>
                <ProductGrid
                  tech={selectedTech}
                  onSelectPlan={(plan) => {
                    setSelectedPlan(plan);
                    next();
                  }}
                />
                <button className="btn btn-neutral" onClick={back}>
                  ← Back
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <ExtrasSelector onChange={setExtras} />
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
                  onSuccess={() => {
                    setSelectedPlan(null);
                    setExtras({ modems: [], phone: null });
                  }}
                  onRestart={() => {
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
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
    console.log("serviceAddress in parent now:", serviceAddress);
  }, [serviceAddress]);

  useEffect(() => {
    if (selectedPackage) next();
  }, [selectedPackage]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* header section */}
      <header className="bg-base-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto w-full px-4 py-3 flex items-center justify-between">
          {/* Mobile menu button */}
          <button className="lg:hidden btn btn-ghost p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          {/* Logo */}
          <img
            className="h-12"
            src="https://2mit.com.au/wp-content/uploads/2025/03/CMYK-Logo_Rectangle-Border.png"
            alt="Logo"
          />
          {/* Desktop nav */}
          <nav className="hidden lg:flex space-x-6 font-semibold text-sm">
            <a href="#" className="hover:text-[#1DA6DF]">Home</a>
            <details className="group relative">
              <summary className="cursor-pointer list-none">IT Services</summary>
              <ul className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg hidden group-open:block">
                <li><a className="block px-4 py-2 hover:bg-gray-100">Managed IT Support</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">IT Consulting</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">Cloud Migration</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">Microsoft 365 Management</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">Hardware Procurement</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">Disaster Recovery</a></li>
              </ul>
            </details>
            <details className="group relative">
              <summary className="cursor-pointer list-none">Telcom Services</summary>
              <ul className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg hidden group-open:block">
                <li><a className="block px-4 py-2 hover:bg-gray-100">FTTP</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">HFC</a></li>
              </ul>
            </details>
            <details className="group relative">
              <summary className="cursor-pointer list-none">Web Services</summary>
              <ul className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg hidden group-open:block">
                <li><a className="block px-4 py-2 hover:bg-gray-100">Web Design</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">E-Commerce</a></li>
              </ul>
            </details>
            <details className="group relative">
              <summary className="cursor-pointer list-none">Integrated Solutions</summary>
              <ul className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg hidden group-open:block">
                <li><a className="block px-4 py-2 hover:bg-gray-100">Custom APIs</a></li>
                <li><a className="block px-4 py-2 hover:bg-gray-100">Automation</a></li>
              </ul>
            </details>
            <a href="#contact" className="hover:text-[#1DA6DF]">Contact Us</a>
          </nav>
        </div>
      </header>

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
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
  const [selectedPackage, setSelectedPackage] = useState(null); // Renamed + tracks package click
  const [serviceAddress, setServiceAddress] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [extras, setExtras] = useState({ modems: [], phone: null });

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const steps = ["Check NBN", "Choose plan", "Select extras", "Your details"];
  useEffect(() => {
    console.log("serviceAddress in parent now:", serviceAddress);
  }, [serviceAddress]);

  // ▶️ NEW: auto-advance to step 1 when a package is selected
  useEffect(() => {
    if (selectedPackage) {
      next();
    }
  }, [selectedPackage]);

  return (
    <div className="min-h-screen">
      {/* header section */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />{" "}
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a>Item 1</a>
              </li>
              <li>
                <a>Parent</a>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </li>
              <li>
                <a>Item 3</a>
              </li>
            </ul>
          </div>
          <img
            className="h-15 mb-3 mt-3 ms-10"
            src="https://2mit.com.au/wp-content/uploads/2025/03/CMYK-Logo_Rectangle-Border.png"
            alt=""
          />
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 font-semibold  text-[15px] gap-4 ms-25">
            <li>
              <a>Home</a>
            </li>
            <li>
              <details>
                <summary>IT Services</summary>
                <ul className="p-2">
                  <li>
                    <a>Managed IT Support </a>
                  </li>
                  <li>
                    <a>IT Consulting</a>
                  </li>
                  <li>
                    <a>Cloud Migration</a>
                  </li>
                  <li>
                    <a>Microsoft 365 Management</a>
                  </li>
                  <li>
                    <a>Hardware Procurement and Installation</a>
                  </li>
                  <li>
                    <a>Cloud Backup and Disaster Recovery</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Telcom Services</summary>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Web Services</summary>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Integrated Solutions</summary>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <a>Contact Us</a>
            </li>
          </ul>
        </div>
        <div className="navbar-end"></div>
      </div>

      {/* Steps Bar */}
     {/* Steps Bar */}
<div className="max-w-4xl mx-auto mt-12">
  <div className="relative h-12">
    {/* Progress Track */}
    <div
      className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 rounded-full"
      style={{ left: "12.5%", right: "12.5%" }}
    >
      <div
        className="h-full bg-[#1DA6DF] rounded-full transition-all duration-500"
        style={{
          // still 0→100% fill between those endpoints
          width: `${(step / (steps.length - 1)) * 100}%`,
        }}
      />
    </div>

    {/* Step Icons & Labels */}
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
              className={`mt-2 text-sm font-medium transition-colors duration-300 ${
                active ? "text-[#1DA6DF]" : "text-gray-500"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
</div>


      <div className="p-8 space-y-8">
        {/* Step 0: Address & Package */}
        {step === 0 && (
          <>
            <NbnAddressLookup
              onTechChange={setSelectedTech}
              onAddressChange={setServiceAddress}
              onPackageSelect={setSelectedPackage} // child → sets selectedPackage
            />
            {/* ▶️ REMOVED manual “Next” button; step now advances automatically */}
          </>
        )}

        {/* Step 1: Plan */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold">Our NBN Plans</h1>
            <ProductGrid
              tech={selectedTech}
              onSelectPlan={(plan) => {
                setSelectedPlan(plan);
                next(); // advances to Step 2
              }}
            />
            <div className="flex justify-neutral">
              <button className="btn btn-info" onClick={back}>
                ← Back
              </button>
              {/* Next is triggered by onSelectPlan */}
            </div>
          </>
        )}

        {/* Step 2: Extras */}
        {step === 2 && (
          <>
            <ExtrasSelector onChange={setExtras} />
            <div className="flex justify-between">
              <button className="btn btn-neutral" onClick={back}>
                ← Back
              </button>
              <button className="btn btn-info text-white" onClick={next}>
                Next: Your details
              </button>
            </div>
          </>
        )}

        {/* Step 3: Contract form */}
        {step === 3 && (
          <>
            <ContractForm serviceAddress={serviceAddress} />
            <div className="mt-4">
              <button className="btn btn-info" onClick={back}>
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

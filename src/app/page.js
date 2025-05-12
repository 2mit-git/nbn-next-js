// File: src/app/page.js
"use client";

import { useState } from "react";
import NbnAddressLookup from "./components/NbnAddressLookup";
import ProductGrid      from "./components/ProductGrid";
import ExtrasSelector   from "./components/ExtrasSelector";
import ContractForm     from "./components/ContractForm";

export default function Home() {
  const [step, setStep]                   = useState(0);
  const [selectedTech, setSelectedTech]   = useState(null);
  const [serviceAddress, setServiceAddress] = useState("");
  const [selectedPlan, setSelectedPlan]   = useState(null);
  const [extras, setExtras]               = useState({ modems: [], phone: null });

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen">
      {/* header & nav omitted for brevity */}
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
      <ul className="steps w-full mt10">
        {["Check NBN", "Choose plan", "Select extras", "Your details"].map((label, i) => (
          <li key={i} className={`step ${i <= step ? "step-primary" : ""}`}>
            {label}
          </li>
        ))}
      </ul>

      <div className="p-8 space-y-8">
        {/* Step 0: Address */}
        {step === 0 && (
          <>
            <NbnAddressLookup
              onTechChange={setSelectedTech}
              onAddressChange={setServiceAddress}
            />
            <button
              className="btn btn-primary"
              disabled={!selectedTech}
              onClick={next}
            >
              Next: Choose plan
            </button>
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
                next();
              }}
            />
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={back}>
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
              <button className="btn btn-secondary" onClick={back}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={next}>
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
              <button className="btn btn-secondary" onClick={back}>
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

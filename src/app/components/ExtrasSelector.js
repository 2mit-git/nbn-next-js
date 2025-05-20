// File: src/components/ExtrasSelector.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function ExtrasSelector({ onChange }) {
  // --- modem state (multi-select) ---
  const modemOptions = [
    {
      id: "modem",
      title: "Gigabit WiFi-6 MESH 1800Mbps Modem",
      subtitle: "(valued at $200)",
      price: "$170 / Upfront",
      note: "(Free shipping)",
      details: [
        "nbn™ approved",
        "Preconfigured for data & voice",
        "Use with your existing telephone",
      ],
      img: "https://2mit.com.au/wp-content/uploads/2025/05/broadband-zte-modem.png",
    },
    {
      id: "extender",
      title: "Gigabit WiFi-6 MESH 1800Mbps Extender",
      subtitle: "(valued at $150)",
      price: "$120 / Upfront",
      note: "(Free shipping)",
      details: [
        "EasyMesh standard to provide whole home Wi-Fi coverage",
        "Sleek styling that blends perfectly with your home",
      ],
      img: "https://2mit.com.au/wp-content/uploads/2025/05/broadband-zte-extender.png",
    },
  ];
  const [includeModem, setIncludeModem] = useState(true);
  const [selectedModems, setSelectedModems] = useState([]);

  // clear selections when modems turned off
  useEffect(() => {
    if (!includeModem) setSelectedModems([]);
  }, [includeModem]);

  // --- phone state (exclusive) ---
  const phoneOptions = [
    {
      id: "payg",
      title: "Pay-as-you-go call rates",
      details: [
        ["Untimed local calls:", "10c/call"],
        ["National calls:", "10c/call"],
        ["Calls to Australian mobiles:", "20c/min"],
        ["Untimed 13/1300 calls:", "25c/call"],
        ["Untimed 1223:", "$1.00/call"],
        ["Untimed 1225:", "$1.65/call"],
        ["Exetel to Exetel:", "FREE"],
      ],
      footerLink: { text: "International calls", href: "#" },
    },
    {
      id: "pack",
      title: "$10/mth Unlimited call pack",
      details: [
        "Unlimited local & national calls",
        "Unlimited 1300/13 calls",
        "Unlimited calls to Australian mobiles (in Australia)",
        "Unlimited international calls to: UK, New Zealand, USA, Germany, Hong Kong, Japan, France, Canada, China, Singapore, India and Croatia.",
      ],
      promo:
        "TAKE $5/MTH OFF your broadband bill every month when you order this eligible SLASH MY BILL bundle service.",
      logo: "https://your-slash-logo.png",
    },
  ];
  const [includePhone, setIncludePhone] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState(phoneOptions[0].id);

  // Whenever anything changes we notify parent
  useEffect(() => {
    onChange({
      modems: includeModem ? selectedModems : [],
      phone: includePhone ? selectedPhone : null,
    });
  }, [selectedModems, includeModem, selectedPhone, includePhone, onChange]);

  // handlers
  const toggleModem = (id) => {
    setSelectedModems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const pickPhone = (id) => {
    setSelectedPhone(id);
  };

  return (
    <div className="space-y-12">
      
      {/* --- Modem include toggle --- */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">
          Would you like to include a modem?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={includeModem ? "btn bg-[#1DA6DF] text-white" : "btn btn-outline"}
            onClick={() => setIncludeModem(true)}
          >
            Yes
          </button>
          <button
            className={!includeModem ? "btn bg-[#1DA6DF] text-white" : "btn btn-outline"}
            onClick={() => setIncludeModem(false)}
          >
            No
          </button>
        </div>
      </div>

      {/* --- Modem selection (multi) --- */}




      {includeModem && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modemOptions.map((m) => {
              const isSel = selectedModems.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`card card-side bg-base-100 shadow-sm cursor-pointer border-2 ${
                    isSel ? "border-[#1DA6DF]" : "border-base-200"
                  }`}
                  onClick={() => toggleModem(m.id)}
                >
                  <figure className="p-4">
                    <Image
                      src={m.img}
                      alt={m.title}
                      width={120}
                      height={120}
                      className="h-50 object-cover"
                    />
                  </figure>
                  <div className="card-body">
                    <div className="flex justify-between items-center">
                      <h3 className="card-title">{m.title}</h3>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-info text-white"
                        checked={isSel}
                        readOnly
                      />
                    </div>
                    <p className="text-sm text-gray-600">{m.subtitle}</p>
                    <p className="mt-2 font-semibold">{m.price}</p>
                    <p className="text-xs text-gray-500">{m.note}</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      {m.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#1DA6DF]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Phone service selection (exclusive) --- */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Do you want a phone service?</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={includePhone ? "btn bg-[#1DA6DF] text-white" : "btn btn-outline"}
            onClick={() => {
              setIncludePhone(true);
              setSelectedPhone(phoneOptions[0].id);
            }}
          >
            Yes
          </button>
          <button
            className={!includePhone ? "btn bg-[#1DA6DF] text-white" : "btn btn-outline"}
            onClick={() => setIncludePhone(false)}
          >
            No
          </button>
        </div>

        {includePhone && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {phoneOptions.map((opt) => {
              const isSel = selectedPhone === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`card bg-base-100 shadow-sm cursor-pointer border-2 ${
                    isSel ? "border-[#1DA6DF]" : "border-base-200"
                  }`}
                  onClick={() => pickPhone(opt.id)}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{opt.title}</h3>
                      <input
                        type="radio"
                        name="phone"
                        className="radio radio-info"
                        checked={isSel}
                        readOnly
                      />
                    </div>
                    <div className="mt-3 text-sm text-gray-700">
                      {Array.isArray(opt.details[0]) ? (
                        <ul className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
                          {opt.details.map(([lbl, rate], i) => (
                            <React.Fragment key={i}>
                              <li>{lbl}</li>
                              <li className="text-right">{rate}</li>
                            </React.Fragment>
                          ))}
                          
                        </ul>
                      ) : (
                        <>
                          <ul className="space-y-2">
                            {opt.details.map((d, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-[#1DA6DF] mt-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                          
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// File: src/components/ExtrasSelector.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// --- PBX Wizard Section ---
function PBXWizardSection({ onPBXChange, value }) {
  // PBX config cache key
  const PBX_CACHE_KEY = "pbx_config";

  // Handset list (static)
  const handsets = [
    {
      name: "Yealink T31G",
      cost: 129,
      features: ["2‑line IP phone", "132×64 LCD", "Dual Gig Ports", "PoE"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/b600de47-6888-441a-af46-274215e21a47.png",
    },
    {
      name: "Yealink T43U",
      cost: 259,
      features: ["3.7″ LCD", "Dual USB", "PoE", "Wall‑mountable"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/202204111053513320ed653424d3f9ec4ad1877ef0588.png",
    },
    {
      name: "Yealink T54W",
      cost: 399,
      features: ["4.3″ colour screen", "HD Voice", "Dual Gig Ports"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/20220412014042818e5253f80492aae3227fc1468a05a.png",
    },
    {
      name: "Yealink WH62 Mono",
      cost: 205,
      features: ["UC DECT", "Wireless", "Range 180 m", "Acoustic Shield"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png",
    },
    {
      name: "Yealink WH62 Dual",
      cost: 235,
      features: ["UC DECT", "Wireless", "Range 180 m", "Acoustic Shield"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png",
    },
    {
      name: "Yealink BH72",
      cost: 355,
      features: ["Bluetooth stereo headset", "40 h battery", "Charging stand"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png",
    },
  ];

  // Restore PBX config from localStorage if present
  const getPBXCache = () => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(PBX_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return {};
  };
  const pbxCache = getPBXCache();

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState(
    value?.selectedPlan ?? pbxCache.selectedPlan ?? null
  );

  // User/addon info
  const [numUsers, setNumUsers] = useState(
    value?.numUsers ?? pbxCache.numUsers ?? 1
  );
  const [callRecording, setCallRecording] = useState(
    value?.callRecording ?? pbxCache.callRecording ?? false
  );
  const [callRecordingQty, setCallRecordingQty] = useState(
    value?.callRecordingQty ?? pbxCache.callRecordingQty ?? 1
  );
  const [ivrCount, setIVRCount] = useState(
    value?.ivrCount ?? pbxCache.ivrCount ?? 0
  );
  const [queueCount, setQueueCount] = useState(
    value?.queueCount ?? pbxCache.queueCount ?? 0
  );

  // Handset selection
  const [handsetSelections, setHandsetSelections] = useState(
    value?.handsets ??
      pbxCache.handsetSelections ??
      handsets.reduce((acc, h) => ({ ...acc, [h.name]: 0 }), {})
  );


  // Pricing logic
  const planPrices = {
    "Hosted UNLIMITED": 33.0,
    "Hosted PAYG": 5.5,
  };
  const costs = {
    callRecording: 2.95,
    ivr: 2.95,
    queue: 4.95,
  };
  const userPrice = planPrices[selectedPlan] || 0;
  const userSubtotal = userPrice * numUsers;
  const callRecSubtotal = callRecording ? callRecordingQty * costs.callRecording : 0;
  const ivrSubtotal = ivrCount * costs.ivr;
  const queueSubtotal = queueCount * costs.queue;
  const handsetSubtotal = handsets.reduce(
    (sum, h) => sum + (handsetSelections[h.name] || 0) * h.cost,
    0
  );
  const monthlyTotal = userSubtotal + callRecSubtotal + ivrSubtotal + queueSubtotal;
  const upfrontTotal = monthlyTotal + handsetSubtotal;

  // Handset limit logic for T31G, T43U, T54W
  const handsetLimitModels = ["Yealink T31G", "Yealink T43U", "Yealink T54W"];
  const maxHandsets = numUsers + queueCount;
  const currentHandsetSum = handsetLimitModels.reduce(
    (sum, model) => sum + (handsetSelections[model] || 0),
    0
  );
  const [handsetLimitError, setHandsetLimitError] = useState("");

  // Handlers
  const handleHandsetQty = (name, delta) => {
    setHandsetSelections((prev) => {
      const isLimited = handsetLimitModels.includes(name);
      let nextQty = Math.max(0, (prev[name] || 0) + delta);

      // Enforce limit for the three models
      if (isLimited) {
        const otherSum = handsetLimitModels
          .filter((m) => m !== name)
          .reduce((sum, m) => sum + (prev[m] || 0), 0);
        if (otherSum + nextQty > maxHandsets) {
          setHandsetLimitError(
            `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
          );
          return prev;
        } else {
          setHandsetLimitError("");
        }
      }
      return { ...prev, [name]: nextQty };
    });
  };

  // Always send PBX data to parent on any change
  React.useEffect(() => {
    // Cache PBX config to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        PBX_CACHE_KEY,
        JSON.stringify({
          selectedPlan,
          numUsers,
          callRecording,
          callRecordingQty,
          ivrCount,
          queueCount,
          handsetSelections,
        })
      );
    }
    if (typeof onPBXChange === "function") {
      onPBXChange({
        selectedPlan,
        numUsers,
        callRecording,
        callRecordingQty: callRecording ? callRecordingQty : 0,
        ivrCount,
        queueCount,
        handsets: { ...handsetSelections },
        monthlyTotal,
        upfrontTotal,
      });
    }
    // eslint-disable-next-line
  }, [
    selectedPlan,
    numUsers,
    callRecording,
    callRecordingQty,
    ivrCount,
    queueCount,
    handsetSelections,
    monthlyTotal,
    upfrontTotal,
  ]);

  // Render all PBX fields at once, with improved design
  return (
    <div className="mt-8  mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-10">
      {/* Plan Selection */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-[#1da6df]">PBX Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hosted UNLIMITED */}
          <div
            className={`rounded-xl p-6 cursor-pointer border-2 transition-all duration-150 bg-white hover:shadow-lg ${
              selectedPlan === "Hosted UNLIMITED"
                ? "border-[#1da6df] ring-2 ring-[#1da6df]"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPlan("Hosted UNLIMITED")}
          >
            <h4 className="text-lg font-bold mb-2 text-[#1da6df]">Hosted UNLIMITED</h4>
            <p className="text-gray-600 mb-2">
              Best for businesses with high call volume, e.g. call centres.
            </p>
            <ul className="mb-4 text-sm text-gray-700 list-disc ml-5">
              <li>Predictable monthly telecom costs.</li>
              <li>
                Calls to all local/national & mobile numbers{" "}
                <span className="italic">(subject to fair‑use policy)</span>.
              </li>
            </ul>
            <div className="text-2xl font-bold text-[#1da6df]">
              $33.00 <span className="text-base font-normal text-gray-600">/user/mo</span>
            </div>
          </div>
          {/* Hosted PAYG */}
          <div
            className={`rounded-xl p-6 cursor-pointer border-2 transition-all duration-150 bg-white hover:shadow-lg ${
              selectedPlan === "Hosted PAYG"
                ? "border-[#1da6df] ring-2 ring-[#1da6df]"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPlan("Hosted PAYG")}
          >
            <h4 className="text-lg font-bold mb-2 text-[#1da6df]">Hosted PAYG</h4>
            <p className="text-gray-600 mb-2">
              Cost-saving for businesses with low outbound traffic.
            </p>
            <ul className="mb-4 text-sm text-gray-700 list-disc ml-5">
              <li>No contracts or setup fees with 2mit.</li>
              <li>Inbound calls to local/national DIDs are free.</li>
            </ul>
            <div className="text-2xl font-bold text-[#1da6df]">
              $5.50 <span className="text-base font-normal text-gray-600">/user/mo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      {/* User/Addons */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-[#1da6df]">PBX Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div>
            <label className="font-semibold mb-1 block text-gray-700">Number of Users</label>
            <input
              type="number"
              min={1}
              className="fancy-input border-2 border-gray-200 rounded-lg p-2 w-full focus:border-[#1da6df] focus:ring-2 focus:ring-[#1da6df] transition"
              value={numUsers}
              onChange={e => setNumUsers(Math.max(1, Number(e.target.value)))}
            />
            <small className="text-gray-400">Enter at least 1 user.</small>
          </div>
          <div>
            <div className="flex mt-5 items-center gap-4">
              <label className="font-semibold mb-1 block text-gray-700">Call recordings?</label>
            <button
              className={`px-4 py-2 rounded-lg border-2 font-semibold transition ${
                callRecording
                  ? "bg-[#1da6df] text-white border-[#1da6df]"
                  : "bg-white text-[#1da6df] border-[#1da6df] hover:bg-[#e6f7fd]"
              }`}
              onClick={() => setCallRecording(v => !v)}
              type="button"
            >
              {callRecording ? "YES" : "NO"}
            </button>
            </div>
            {callRecording && (
              <div className="mt-2">
                <label className="block mb-1 text-gray-700">Call recording Qty</label>
                <input
                  type="number"
                  min={1}
                  className="fancy-input border-2 border-gray-200 rounded-lg p-2 w-24 focus:border-[#1da6df] focus:ring-2 focus:ring-[#1da6df] transition"
                  value={callRecordingQty}
                  onChange={e => setCallRecordingQty(Math.max(1, Number(e.target.value)))}
                />
                <small className="text-gray-400">Number of users to have call recording</small>
              </div>
            )}
          </div>
          </div>
          <div>
            <label className="font-semibold mb-1 block text-gray-700">IVR</label>
            <input
              type="number"
              min={0}
              className="fancy-input border-2 border-gray-200 rounded-lg p-2 w-full focus:border-[#1da6df] focus:ring-2 focus:ring-[#1da6df] transition"
              value={ivrCount}
              onChange={e => setIVRCount(Math.max(0, Number(e.target.value)))}
            />
            <label className="font-semibold mb-1 block mt-4 text-gray-700">Queues</label>
            <input
              type="number"
              min={0}
              className="fancy-input border-2 border-gray-200 rounded-lg p-2 w-full focus:border-[#1da6df] focus:ring-2 focus:ring-[#1da6df] transition"
              value={queueCount}
              onChange={e => setQueueCount(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      {/* Handset Selection */}
      <div>
        <h3 className="mb-4 font-bold text-xl text-[#1da6df]">PBX Handsets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {handsets.map(h => {
            const isSelected = handsetSelections[h.name] > 0;
            return (
              <div
                key={h.name}
                className={`relative group product-card handset-card border-2 rounded-2xl p-4 shadow-sm flex flex-col transition-all duration-150 bg-white hover:shadow-lg cursor-pointer ${
                  isSelected
                    ? "border-[#1da6df] ring-2 ring-[#1da6df] bg-[#f0faff]"
                    : "border-gray-200"
                }`}
                onClick={e => {
                  // Only toggle selection if the click is not on a button or input
                  if (
                    e.target.tagName === "BUTTON" ||
                    e.target.tagName === "INPUT"
                  )
                    return;
                  // Enforce limit for the three models
                  if (
                    handsetLimitModels.includes(h.name) &&
                    !isSelected &&
                    currentHandsetSum >= maxHandsets
                  ) {
                    setHandsetLimitError(
                      `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
                    );
                    return;
                  }
                  setHandsetLimitError("");
                  setHandsetSelections(prev => ({
                    ...prev,
                    [h.name]: isSelected ? 0 : 1,
                  }));
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                {/* Checkmark overlay when selected */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 bg-[#1da6df] rounded-full p-1 shadow">
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#1da6df" />
                      <path
                        d="M6 10.5L9 13.5L14 8.5"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex justify-center mb-2">
                  <img
                    src={h.img}
                    alt={h.name}
                    className="w-32 h-32 object-contain rounded-xl bg-white"
                    style={{ maxHeight: 140, maxWidth: 140 }}
                  />
                </div>
                <div className="font-bold text-lg mb-1 text-[#1da6df]">{h.name}</div>
                <ul className="text-sm text-gray-600 mb-2">
                  {h.features.map(f => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-[#1da6df] font-bold text-lg">${h.cost}</div>
                  {isSelected ? (
                    <div className="flex items-center gap-2">
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-300 text-lg font-bold text-[#1da6df] hover:bg-[#e6f7fd] transition"
                        onClick={e => {
                          e.stopPropagation();
                          handleHandsetQty(h.name, -1);
                        }}
                        disabled={handsetSelections[h.name] === 0}
                        type="button"
                      >-</button>
                      <input
                        type="number"
                        className="w-12 text-center border rounded-lg"
                        min={0}
                        max={
                          handsetLimitModels.includes(h.name)
                            ? (handsetSelections[h.name] || 0) + (maxHandsets - currentHandsetSum)
                            : undefined
                        }
                        value={handsetSelections[h.name]}
                        onChange={e => {
                          let val = Math.max(0, Number(e.target.value));
                          if (handsetLimitModels.includes(h.name)) {
                            const otherSum = handsetLimitModels
                              .filter((m) => m !== h.name)
                              .reduce((sum, m) => sum + (handsetSelections[m] || 0), 0);
                            if (val + otherSum > maxHandsets) {
                              val = Math.max(0, maxHandsets - otherSum);
                              setHandsetLimitError(
                                `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
                              );
                            } else {
                              setHandsetLimitError("");
                            }
                          }
                          setHandsetSelections(prev => ({ ...prev, [h.name]: val }));
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                      <button
                        className="px-2 py-1 rounded-full bg-gray-100 border border-gray-300 text-lg font-bold text-[#1da6df] hover:bg-[#e6f7fd] transition"
                        onClick={e => {
                          e.stopPropagation();
                          if (
                            handsetLimitModels.includes(h.name) &&
                            currentHandsetSum >= maxHandsets
                          ) {
                            setHandsetLimitError(
                              `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
                            );
                            return;
                          }
                          handleHandsetQty(h.name, 1);
                        }}
                        type="button"
                      >+</button>
                    </div>
                  ) : (
                    <button
                      className="py-3 px-8 text-base font-bold min-w-[120px] rounded-xl border-2 border-[#1da6df] text-[#1da6df] font-semibold bg-white hover:bg-[#e6f7fd] transition"
                      onClick={e => {
                        e.stopPropagation();
                        // Enforce limit for the three models
                        if (
                          handsetLimitModels.includes(h.name) &&
                          currentHandsetSum >= maxHandsets
                        ) {
                          setHandsetLimitError(
                            `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
                          );
                          return;
                        }
                        setHandsetLimitError("");
                        setHandsetSelections(prev => ({
                          ...prev,
                          [h.name]: 1,
                        }));
                      }}
                      type="button"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {handsetLimitError && (
          <div
            className="fixed bottom-4 right-4 z-50"
            style={{ minWidth: 320, maxWidth: 400 }}
          >
            <div role="alert" className="alert alert-warning shadow-lg flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold">{handsetLimitError}</span>
            </div>
          </div>
        )}
        
      </div>

      {/* Save Button */}
      
    </div>
  );
}

export default function ExtrasSelector({
  onChange,
  connectionType,
  value = {},
}) {
  // Clear PBX cache on window refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pbx_config");
    }
  }, []);
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
  // null = not selected, true = yes, false = no
  const [localIncludeModem, setLocalIncludeModem] = useState(
    value.includeModem !== undefined ? value.includeModem : null
  );
  const [localSelectedModems, setLocalSelectedModems] = useState(
    value.selectedModems !== undefined ? value.selectedModems : []
  );

  // Sync localIncludeModem and localSelectedModems with value prop
  useEffect(() => {
    if (value.includeModem !== undefined && value.includeModem !== localIncludeModem) {
      setLocalIncludeModem(value.includeModem);
    }
  }, [value.includeModem]);
  useEffect(() => {
    if (
      value.selectedModems !== undefined &&
      JSON.stringify(value.selectedModems) !== JSON.stringify(localSelectedModems)
    ) {
      setLocalSelectedModems(value.selectedModems);
    }
  }, [value.selectedModems]);

  // Derive includeModem/selectedModems from modems if not explicitly provided
  // Only treat as "No" if explicitly set, otherwise default to null (unselected)
  const includeModem =
    value.includeModem !== undefined
      ? value.includeModem
      : value.modems !== undefined
      ? value.modems.length > 0
        ? true
        : value.modems.length === 0 && value._modemUserSet === false
        ? false
        : null
      : localIncludeModem;
  const selectedModems =
    value.selectedModems !== undefined
      ? value.selectedModems
      : value.modems !== undefined
      ? value.modems
      : localSelectedModems;

  // clear selections when modems turned off (only for local state)
  useEffect(() => {
    if (value.includeModem === undefined && localIncludeModem === false) setLocalSelectedModems([]);
  }, [localIncludeModem, value.includeModem]);

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
  // null = not selected, true = yes, false = no
  const [localIncludePhone, setLocalIncludePhone] = useState(
    value.includePhone !== undefined ? value.includePhone : null
  );
  const [localSelectedPhone, setLocalSelectedPhone] = useState(
    value.selectedPhone !== undefined ? value.selectedPhone : phoneOptions[0].id
  );

  // Sync localIncludePhone and localSelectedPhone with value prop
  useEffect(() => {
    if (value.includePhone !== undefined && value.includePhone !== localIncludePhone) {
      setLocalIncludePhone(value.includePhone);
    }
  }, [value.includePhone]);
  useEffect(() => {
    if (
      value.selectedPhone !== undefined &&
      value.selectedPhone !== localSelectedPhone
    ) {
      setLocalSelectedPhone(value.selectedPhone);
    }
  }, [value.selectedPhone]);

  // --- PBX state ---
  const [localIncludePBX, setLocalIncludePBX] = useState(() => {
    if (value.includePBX !== undefined) return value.includePBX;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("pbx_include");
      if (cached === "true") return true;
      if (cached === "false") return false;
    }
    return null;
  });

  // Sync localIncludePBX with value.includePBX when prop changes
  useEffect(() => {
    if (value.includePBX !== undefined && value.includePBX !== localIncludePBX) {
      setLocalIncludePBX(value.includePBX);
    }
  }, [value.includePBX]);
  const [pbxData, setPBXData] = useState(null);
  const [pbxPackage, setPBXPackage] = useState("");
  const [pbxExtensions, setPBXExtensions] = useState(1);

  // Derive includePhone/selectedPhone from phone if not explicitly provided
  // Only treat as "No" if explicitly set, otherwise default to null (unselected)
  const includePhone =
    value.includePhone !== undefined
      ? value.includePhone
      : value.phone !== undefined
      ? value.phone !== null
        ? true
        : value._phoneUserSet === false
        ? false
        : null
      : localIncludePhone;
  const selectedPhone =
    value.selectedPhone !== undefined
      ? value.selectedPhone
      : value.phone !== undefined
      ? value.phone
      : localSelectedPhone;

  // Whenever anything changes we notify parent (only for local state)
  useEffect(() => {
    if (typeof onChange === "function") {
      // Only include PBX fields if connectionType is "business"
      const base = {
        ...value,
        includeModem,
        selectedModems,
        includePhone,
        selectedPhone,
        modems: includeModem === true ? selectedModems : [],
        phone: includePhone === true ? selectedPhone : null,
      };
      if (connectionType === "business") {
        base.includePBX = localIncludePBX;
        // pbx field is set via PBXWizardSection below
      } else {
        // Remove PBX fields if present
        delete base.includePBX;
        delete base.pbx;
      }
      onChange(base);
    }
  }, [includeModem, selectedModems, includePhone, selectedPhone, localIncludePBX, connectionType]);
console.log(connectionType)
  // handlers
  const toggleModem = (id) => {
    if (value.selectedModems !== undefined && typeof onChange === "function") {
      let prev = selectedModems;
      let next;
      if (prev.includes(id)) {
        // Deselecting
        next = prev.filter((x) => x !== id);
        // If modem is being deselected, also remove extender
        if (id === "modem") {
          next = next.filter((x) => x !== "extender");
        }
      } else {
        // Selecting
        next = [...prev, id];
      }
      onChange({
        ...value,
        selectedModems: next,
        includeModem,
      });
    } else {
      setLocalSelectedModems((prev) => {
        let next;
        if (prev.includes(id)) {
          next = prev.filter((x) => x !== id);
          if (id === "modem") {
            next = next.filter((x) => x !== "extender");
          }
        } else {
          next = [...prev, id];
        }
        return next;
      });
    }
  };
  const pickPhone = (id) => {
    if (value.selectedPhone !== undefined && typeof onChange === "function") {
      onChange({
        ...value,
        selectedPhone: id,
        includePhone,
      });
    } else {
      setLocalSelectedPhone(id);
    }
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
            className={`py-3 px-8 text-base font-bold min-w-[120px] rounded-xl shadow-lg transition-all duration-150 border-2 ${
              includeModem === true
                ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
            }`}
            onClick={() => {
              if (value.includeModem !== undefined && typeof onChange === "function") {
                onChange({ ...value, includeModem: true });
              } else {
                setLocalIncludeModem(true);
              }
            }}
            style={{ minWidth: 120 }}
            aria-pressed={includeModem === true}
          >
            Yes
          </button>
          <button
            className={`py-3 px-8 text-base font-bold min-w-[120px] rounded-xl shadow-lg transition-all duration-150 border-2 ${
              includeModem === false
                ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
            }`}
            onClick={() => {
              if (value.includeModem !== undefined && typeof onChange === "function") {
                onChange({ ...value, includeModem: false });
              } else {
                setLocalIncludeModem(false);
              }
            }}
            style={{ minWidth: 120 }}
            aria-pressed={includeModem === false}
          >
            No
          </button>
        </div>
        {includeModem === null && (
          <div className="text-red-600 text-sm mt-2">
            Please select Yes or No to continue.
          </div>
        )}
      </div>

      {/* --- Modem selection (multi) --- */}
      {includeModem === true && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modemOptions.map((m) => {
              const isSel = selectedModems.includes(m.id);
              // Only allow extender if modem is selected
              const isModemSelected = selectedModems.includes("modem");
              const isExtender = m.id === "extender";
              const extenderDisabled = isExtender && !isModemSelected;
              return (
                <div
                  key={m.id}
                  className={`card card-side bg-base-100 shadow-sm border-2 transition-all duration-150 ${
                    isSel ? "border-[#1DA6DF]" : "border-base-200"
                  } ${extenderDisabled ? "opacity-50 pointer-events-none select-none grayscale" : "cursor-pointer"}`}
                  onClick={() => {
                    if (extenderDisabled) return;
                    toggleModem(m.id);
                  }}
                  aria-disabled={extenderDisabled}
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
          {selectedModems.length === 0 && (
            <div className="text-red-600 text-sm mt-2">
              Please select at least one modem or extender to continue.
            </div>
          )}
          {/* Show info if extender is disabled */}
          {includeModem === true && !selectedModems.includes("modem") && (
            <div className="text-gray-500 text-xs mt-1">
              Select the modem first to enable the extender option.
            </div>
          )}
        </div>
      )}
      {/* --- Phone service selection (exclusive) --- */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Do you want a phone service?</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`py-3 px-8 text-base font-bold min-w-[120px] rounded-xl shadow-lg transition-all duration-150 border-2 ${
              includePhone === true
                ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
            }`}
            onClick={() => {
              if (value.includePhone !== undefined && typeof onChange === "function") {
                onChange({ ...value, includePhone: true, selectedPhone: phoneOptions[0].id });
              } else {
                setLocalIncludePhone(true);
                setLocalSelectedPhone(phoneOptions[0].id);
              }
            }}
            style={{ minWidth: 120 }}
            aria-pressed={includePhone === true}
          >
            Yes
          </button>
          <button
            className={`py-3 px-8 text-base font-bold min-w-[120px] rounded-xl shadow-lg transition-all duration-150 border-2 ${
              includePhone === false
                ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
            }`}
            onClick={() => {
              if (value.includePhone !== undefined && typeof onChange === "function") {
                onChange({ ...value, includePhone: false });
              } else {
                setLocalIncludePhone(false);
              }
            }}
            style={{ minWidth: 120 }}
            aria-pressed={includePhone === false}
          >
            No
          </button>
        </div>
        {includePhone === null && (
          <div className="text-red-600 text-sm mt-2">
            Please select Yes or No to continue.
          </div>
        )}

        {includePhone === true && (
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
      {/* --- PBX --- */}
      {connectionType === "business" && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Do you want a PBX?</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                className={`py-3 px-8 text-base font-bold min-w-[120px] rounded-xl shadow-lg transition-all duration-150 border-2 ${
                  localIncludePBX === true
                    ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                    : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
                }`}
                onClick={() => {
                  setLocalIncludePBX(true);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("pbx_include", "true");
                  }
                  if (typeof onChange === "function" && connectionType === "business") {
                    onChange({
                      ...value,
                      includePBX: true,
                    });
                  }
                }}
                aria-pressed={localIncludePBX === true}
              >
                Yes
              </button>
              <button
                className={`py-3 px-8 text-base font-bold min-w-[120px] rounded-xl shadow-lg transition-all duration-150 border-2 ${
                  localIncludePBX === false
                    ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                    : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
                }`}
                onClick={() => {
                  setLocalIncludePBX(false);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("pbx_include", "false");
                  }
                  if (typeof onChange === "function" && connectionType === "business") {
                    onChange({
                      ...value,
                      includePBX: false,
                    });
                  }
                }}
                aria-pressed={localIncludePBX === false}
              >
                No
              </button>
            </div>
            {localIncludePBX === null && (
              <div className="text-red-600 text-sm mt-2">
                Please select Yes or No to continue.
              </div>
            )}
            {localIncludePBX === true && (
              <PBXWizardSection
                value={value.pbx}
                onPBXChange={data => {
                  setPBXData(data);
                  if (typeof onChange === "function" && connectionType === "business") {
                    onChange({
                      ...value,
                      includePBX: true,
                      pbx: data,
                    });
                  }
                }}
              />
            )}
          </div>
      )}
    </div>
  );
}

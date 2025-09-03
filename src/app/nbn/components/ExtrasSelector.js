// File: src/components/ExtrasSelector.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

/* =========================
   PBX Wizard Section
   ========================= */
function PBXWizardSection({ onPBXChange, value }) {
  const PBX_CACHE_KEY = "pbx_config";

  const handsets = [
    {
      name: "Yealink T31G",
      cost: 129,
      features: ["2-line IP phone", "132×64 LCD", "Dual Gig Ports", "PoE"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/b600de47-6888-441a-af46-274215e21a47.png",
    },
    {
      name: "Yealink T43U",
      cost: 259,
      features: ["3.7″ LCD", "Dual USB", "PoE", "Wall-mountable"],
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
      features: ["Bluetooth stereo headset", "40 h battery", "Charging stand"],
      img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png",
    },
  ];

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

  const [selectedPlan, setSelectedPlan] = useState(
    value?.selectedPlan ?? pbxCache.selectedPlan ?? null
  );

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

  const [handsetSelections, setHandsetSelections] = useState(
    value?.handsets ??
      pbxCache.handsetSelections ??
      handsets.reduce((acc, h) => ({ ...acc, [h.name]: 0 }), {})
  );

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
  const callRecSubtotal = callRecording
    ? callRecordingQty * costs.callRecording
    : 0;
  const ivrSubtotal = ivrCount * costs.ivr;
  const queueSubtotal = queueCount * costs.queue;
  const handsetSubtotal = handsets.reduce(
    (sum, h) => sum + (handsetSelections[h.name] || 0) * h.cost,
    0
  );
  const monthlyTotal =
    userSubtotal + callRecSubtotal + ivrSubtotal + queueSubtotal;
  const upfrontTotal = monthlyTotal + handsetSubtotal;

  const handsetLimitModels = ["Yealink T31G", "Yealink T43U", "Yealink T54W"];
  const maxHandsets = numUsers + queueCount;
  const currentHandsetSum = handsetLimitModels.reduce(
    (sum, model) => sum + (handsetSelections[model] || 0),
    0
  );
  const [handsetLimitError, setHandsetLimitError] = useState("");

  const handleHandsetQty = (name, delta) => {
    setHandsetSelections((prev) => {
      const isLimited = handsetLimitModels.includes(name);
      let nextQty = Math.max(0, (prev[name] || 0) + delta);

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

  useEffect(() => {
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

  return (
    <div className="mt-8 mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-10">
      {/* Plan Selection */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-[#1DA6DF]">PBX Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hosted UNLIMITED */}
          <div
            className={`rounded-xl p-6 cursor-pointer border-2 transition-all duration-150 bg-white hover:shadow-lg ${
              selectedPlan === "Hosted UNLIMITED"
                ? "border-[#1DA6DF] ring-2 ring-[#1DA6DF]"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPlan("Hosted UNLIMITED")}
          >
            <h4 className="text-lg font-bold mb-2 text-[#1DA6DF]">
              Hosted UNLIMITED
            </h4>
            <p className="text-gray-600 mb-2">
              Best for businesses with high call volume, e.g. call centres.
            </p>
            <ul className="mb-4 text-sm text-gray-700 list-disc ml-5">
              <li>Predictable monthly telecom costs.</li>
              <li>
                Calls to all local/national & mobile numbers{" "}
                <span className="italic">(subject to fair-use policy)</span>.
              </li>
            </ul>
            <div className="text-2xl font-bold text-[#1DA6DF]">
              $33.00{" "}
              <span className="text-base font-normal text-gray-600">
                /user/mo
              </span>
            </div>
          </div>
          {/* Hosted PAYG */}
          <div
            className={`rounded-xl p-6 cursor-pointer border-2 transition-all duration-150 bg-white hover:shadow-lg ${
              selectedPlan === "Hosted PAYG"
                ? "border-[#1DA6DF] ring-2 ring-[#1DA6DF]"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedPlan("Hosted PAYG")}
          >
            <h4 className="text-lg font-bold mb-2 text-[#1DA6DF]">
              Hosted PAYG
            </h4>
            <p className="text-gray-600 mb-2">
              Cost-saving for businesses with low outbound traffic.
            </p>
            <ul className="mb-4 text-sm text-gray-700 list-disc ml-5">
              <li>No contracts or setup fees with 2mit.</li>
              <li>Inbound calls to local/national DIDs are free.</li>
            </ul>
            <div className="text-2xl font-bold text-[#1DA6DF]">
              $5.50{" "}
              <span className="text-base font-normal text-gray-600">
                /user/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-4" />

      {/* Options */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-[#1DA6DF]">PBX Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div>
              <div className="flex items-center mb-1">
                <label htmlFor="users" className="font-semibold text-gray-700 mr-1">
                  Number of Users
                </label>
                <div className="tooltip tooltip-right" data-tip="Enter the total number of users for your PBX system.">
                  <button type="button" className="btn btn-circle btn-xs bg-[#1DA6DF] text-white hover:bg-[#178FCC]">
                    i
                  </button>
                </div>
              </div>

              <input
                id="users"
                type="number"
                min={1}
                className="border-2 border-gray-200 rounded-lg p-2 w-full focus:border-[#1DA6DF] focus:ring-2 focus:ring-[#1DA6DF] transition"
                value={numUsers}
                onChange={(e) =>
                  setNumUsers(Math.max(1, Number(e.target.value)))
                }
              />
              <small className="text-gray-400">Enter at least 1 user.</small>
            </div>
            <div>
              <div className="flex mt-5 items-center gap-4">
                <label className="font-semibold mb-1 block text-gray-700">
                  Call recordings?
                </label>
                <button
                  className={`px-4 py-2 rounded-lg border-2 font-semibold transition ${
                    callRecording
                      ? "bg-[#1DA6DF] text-white border-[#1DA6DF]"
                      : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
                  }`}
                  onClick={() => setCallRecording((v) => !v)}
                  type="button"
                >
                  {callRecording ? "No" : "Yes"}
                </button>
              </div>
              {callRecording && (
                <div className="mt-2">
                  <label className="block mb-1 text-gray-700">
                    Call recording Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="border-2 border-gray-200 rounded-lg p-2 w-24 focus:border-[#1DA6DF] focus:ring-2 focus:ring-[#1DA6DF] transition"
                    value={callRecordingQty}
                    onChange={(e) =>
                      setCallRecordingQty(Math.max(1, Number(e.target.value)))
                    }
                  />
                  <small className="text-gray-400">
                    Number of users to have call recording
                  </small>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="font-semibold mb-1 block text-gray-700">
              IVR
            </label>
            <input
              type="number"
              min={0}
              className="border-2 border-gray-200 rounded-lg p-2 w-full focus:border-[#1DA6DF] focus:ring-2 focus:ring-[#1DA6DF] transition"
              value={ivrCount}
              onChange={(e) => setIVRCount(Math.max(0, Number(e.target.value)))}
            />
            <label className="font-semibold mb-1 block mt-4 text-gray-700">
              Queues
            </label>
            <input
              type="number"
              min={0}
              className="border-2 border-gray-200 rounded-lg p-2 w-full focus:border-[#1DA6DF] focus:ring-2 focus:ring-[#1DA6DF] transition"
              value={queueCount}
              onChange={(e) =>
                setQueueCount(Math.max(0, Number(e.target.value)))
              }
            />
          </div>
        </div>
      </div>

      {/* Handsets */}
      <div className="border-t border-gray-100 my-4" />
      <div>
        <h3 className="mb-4 font-bold text-xl text-[#1DA6DF]">PBX Handsets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {handsets.map((h) => {
            const isSelected = handsetSelections[h.name] > 0;
            return (
              <div
                key={h.name}
                className={`relative group border-2 rounded-2xl p-4 shadow-sm flex flex-col transition-all duration-150 bg-white hover:shadow-lg cursor-pointer ${
                  isSelected
                    ? "border-[#1DA6DF] ring-2 ring-[#1DA6DF] bg-[#f0faff]"
                    : "border-gray-200"
                }`}
                onClick={(e) => {
                  if (
                    e.target.tagName === "BUTTON" ||
                    e.target.tagName === "INPUT"
                  )
                    return;
                  if (
                    ["Yealink T31G", "Yealink T43U", "Yealink T54W"].includes(
                      h.name
                    ) &&
                    !isSelected &&
                    currentHandsetSum >= maxHandsets
                  ) {
                    setHandsetLimitError(
                      `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
                    );
                    return;
                  }
                  setHandsetLimitError("");
                  setHandsetSelections((prev) => ({
                    ...prev,
                    [h.name]: isSelected ? 0 : 1,
                  }));
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 bg-[#1DA6DF] rounded-full p-1 shadow">
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#1DA6DF" />
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.img}
                    alt={h.name}
                    className="w-32 h-32 object-contain rounded-xl bg-white"
                    style={{ maxHeight: 140, maxWidth: 140 }}
                  />
                </div>
                <div className="font-bold text-lg mb-1 text-[#1DA6DF]">
                  {h.name}
                </div>
                <ul className="text-sm text-gray-600 mb-2">
                  {h.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-[#1DA6DF] font-bold text-lg">
                    ${h.cost}
                  </div>
                  {isSelected ? (
                    <div className="flex items-center gap-2">
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-300 text-lg font-bold text-[#1DA6DF] hover:bg-[#e6f7fd] transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHandsetQty(h.name, -1);
                        }}
                        disabled={handsetSelections[h.name] === 0}
                        type="button"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="w-12 text-center border rounded-lg"
                        min={0}
                        max={
                          ["Yealink T31G", "Yealink T43U", "Yealink T54W"].includes(
                            h.name
                          )
                            ? (handsetSelections[h.name] || 0) +
                              (maxHandsets - currentHandsetSum)
                            : undefined
                        }
                        value={handsetSelections[h.name]}
                        onChange={(e) => {
                          let val = Math.max(0, Number(e.target.value));
                          if (
                            ["Yealink T31G", "Yealink T43U", "Yealink T54W"].includes(
                              h.name
                            )
                          ) {
                            const otherSum = ["Yealink T31G", "Yealink T43U", "Yealink T54W"]
                              .filter((m) => m !== h.name)
                              .reduce(
                                (sum, m) => sum + (handsetSelections[m] || 0),
                                0
                              );
                            if (val + otherSum > maxHandsets) {
                              val = Math.max(0, maxHandsets - otherSum);
                              setHandsetLimitError(
                                `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
                              );
                            } else {
                              setHandsetLimitError("");
                            }
                          }
                          setHandsetSelections((prev) => ({
                            ...prev,
                            [h.name]: val,
                          }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className="px-2 py-1 rounded-full bg-gray-100 border border-gray-300 text-lg font-bold text-[#1DA6DF] hover:bg-[#e6f7fd] transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            ["Yealink T31G", "Yealink T43U", "Yealink T54W"].includes(
                              h.name
                            ) &&
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
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="py-3 px-8 text-base font-bold min-w-[120px] rounded-xl border-2 border-[#1DA6DF] text-[#1DA6DF] bg-white hover:bg-[#e6f7fd] transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          ["Yealink T31G", "Yealink T43U", "Yealink T54W"].includes(
                            h.name
                          ) &&
                          currentHandsetSum >= maxHandsets
                        ) {
                          setHandsetLimitError(
                            `Total of T31G, T43U, T54W cannot exceed ${maxHandsets} (Users + Queues)`
                          );
                          return;
                        }
                        setHandsetLimitError("");
                        setHandsetSelections((prev) => ({
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
          <div className="fixed bottom-4 right-4 z-50" style={{ minWidth: 320, maxWidth: 400 }}>
            <div role="alert" className="alert alert-warning shadow-lg flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-semibold">{handsetLimitError}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   Extras Selector
   ========================= */
export default function ExtrasSelector({
  onChange,
  connectionType,
  value = {},
}) {
  // Clear PBX cache on hard refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pbx_config");
    }
  }, []);

  /* ----- Extras data ----- */
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

  const [localIncludeModem, setLocalIncludeModem] = useState(
    value.includeModem !== undefined ? value.includeModem : null
  );
  const [localSelectedModems, setLocalSelectedModems] = useState(
    value.selectedModems !== undefined ? value.selectedModems : []
  );

  useEffect(() => {
    if (
      value.includeModem !== undefined &&
      value.includeModem !== localIncludeModem
    ) {
      setLocalIncludeModem(value.includeModem);
    }
  }, [value.includeModem, localIncludeModem]);

  useEffect(() => {
    if (
      value.selectedModems !== undefined &&
      JSON.stringify(value.selectedModems) !==
        JSON.stringify(localSelectedModems)
    ) {
      setLocalSelectedModems(value.selectedModems);
    }
  }, [value.selectedModems, localSelectedModems]);

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

  useEffect(() => {
    if (value.includeModem === undefined && localIncludeModem === false)
      setLocalSelectedModems([]);
  }, [localIncludeModem, value.includeModem]);

  /* ----- Phone data ----- */
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
    },
    {
      id: "pack",
      title: "$10/mth Unlimited call pack",
      details: [
        "Unlimited local & national calls",
        "Unlimited 1300/13 calls",
        "Unlimited calls to Australian mobiles (in Australia)",
        "Unlimited international calls to: UK, NZ, USA, Germany, Hong Kong, Japan, France, Canada, China, Singapore, India & Croatia.",
      ],
    },
  ];

  const [localIncludePhone, setLocalIncludePhone] = useState(
    value.includePhone !== undefined ? value.includePhone : null
  );
  const [localSelectedPhone, setLocalSelectedPhone] = useState(
    value.selectedPhone !== undefined ? value.selectedPhone : "pack"
  );

  useEffect(() => {
    if (
      value.includePhone !== undefined &&
      value.includePhone !== localIncludePhone
    ) {
      setLocalIncludePhone(value.includePhone);
    }
  }, [value.includePhone, localIncludePhone]);

  useEffect(() => {
    if (
      value.selectedPhone !== undefined &&
      value.selectedPhone !== localSelectedPhone
    ) {
      setLocalSelectedPhone(value.selectedPhone);
    }
  }, [value.selectedPhone, localSelectedPhone]);

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

  /* ----- PBX include ----- */
  const [localIncludePBX, setLocalIncludePBX] = useState(() => {
    if (value.includePBX !== undefined) return value.includePBX;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("pbx_include");
      if (cached === "true") return true;
      if (cached === "false") return false;
    }
    return null;
  });

  useEffect(() => {
    if (
      value.includePBX !== undefined &&
      value.includePBX !== localIncludePBX
    ) {
      setLocalIncludePBX(value.includePBX);
    }
  }, [value.includePBX, localIncludePBX]);

  const [pbxData, setPBXData] = useState(null);

  /* ----- Upstream onChange ----- */
  useEffect(() => {
    if (typeof onChange === "function") {
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
      } else {
        delete base.includePBX;
        delete base.pbx;
      }
      onChange(base);
    }
  }, [
    includeModem,
    selectedModems,
    includePhone,
    selectedPhone,
    localIncludePBX,
    connectionType,
    onChange,
    value,
  ]);

  /* ----- Helpers ----- */
  const toggleModem = (id) => {
    if (value.selectedModems !== undefined && typeof onChange === "function") {
      let prev = selectedModems;
      let next;
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
        if (id === "modem") next = next.filter((x) => x !== "extender");
      } else {
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
          if (id === "modem") next = next.filter((x) => x !== "extender");
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

  /* ----- UI atoms for the “empty” tiles and selected cards ----- */
  const EmptyTile = ({ label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-[180px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-[#1DA6DF] hover:bg-[#f0faff] transition"
    >
      <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-xl">+</div>
      <div className="text-sm text-gray-600">{label}</div>
    </button>
  );

  const SelectedCard = ({
    title,
    img,
    subtitle,
    price,
    note,
    details,
    onRemove,
    secondary,
  }) => (
    <div className="border-2 rounded-xl p-4 shadow-sm bg-white">
      <div className="flex gap-4">
        <div className="shrink-0">
          <Image
            src={img}
            alt={title}
            width={110}
            height={110}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          <div className="text-sm mt-2 text-gray-700">
            <ul className="list-disc ml-4 space-y-1">
              {details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="mt-2">
            <div>
              <div className="font-semibold">{price}</div>
              {note && <div className="text-xs text-gray-500">{note}</div>}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md text-white bg-[#1DA6DF] font-semibold"
                disabled
                aria-disabled
              >
                Selected
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="px-4 py-2   rounded-md border border-gray-300"
              >
                Remove
              </button>
              {secondary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ----- Render ----- */
  const isModemSelected = selectedModems.includes("modem");
  const isExtenderSelected = selectedModems.includes("extender");

  return (
    <div className="space-y-12">
      {/* Heading like mockup */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold">
          Enhance your plan with some{" "}
          <span className="text-[#1DA6DF]">extras</span>
        </h2>
      </div>

      {/* Three tiles row (Modem, Extender, Phone) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modem */}
        {isModemSelected ? (
          <SelectedCard
            title={modemOptions[0].title}
            subtitle={modemOptions[0].subtitle}
            img={modemOptions[0].img}
            price={modemOptions[0].price}
            note={modemOptions[0].note}
            details={modemOptions[0].details}
            onRemove={() => toggleModem("modem")}
          />
        ) : (
          <EmptyTile
            label="Add a modem"
            onClick={() => {
              setLocalIncludeModem(true);
              toggleModem("modem");
            }}
          />
        )}

        {/* Extender (disabled until modem) */}
        {isExtenderSelected ? (
          <SelectedCard
            title={modemOptions[1].title}
            subtitle={modemOptions[1].subtitle}
            img={modemOptions[1].img}
            price={modemOptions[1].price}
            note={modemOptions[1].note}
            details={modemOptions[1].details}
            onRemove={() => toggleModem("extender")}
          />
        ) : (
          <div className={!isModemSelected ? "opacity-50 grayscale pointer-events-none" : ""}>
            <EmptyTile
              label="Add a extender"
              onClick={() => {
                if (!isModemSelected) return;
                setLocalIncludeModem(true);
                toggleModem("extender");
              }}
            />
            {!isModemSelected && (
              <div className="text-xs text-gray-500 mt-1">
                Select the modem first to enable the extender option.
              </div>
            )}
          </div>
        )}

        {/* Phone service (single card view like mock) */}
        {includePhone === true ? (
          <SelectedCard
            title={
              selectedPhone === "pack"
                ? phoneOptions[1].title
                : phoneOptions[0].title
            }
            img={
              selectedPhone === "pack"
                ? "https://dummyimage.com/120x120/ffffff/000000&text=Call+Pack"
                : "https://dummyimage.com/120x120/ffffff/000000&text=PAYG"
            }
            price={selectedPhone === "pack" ? "$10 / month" : "PAYG Rates"}
            note=""
            details={
              selectedPhone === "pack" ? phoneOptions[1].details : []
            }
            onRemove={() => {
              if (value.includePhone !== undefined && typeof onChange === "function") {
                onChange({ ...value, includePhone: false });
              } else {
                setLocalIncludePhone(false);
              }
            }}
            secondary={
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => pickPhone("pack")}
                  className={`px-3 py-2 rounded-md text-sm border ${
                    selectedPhone === "pack"
                      ? "bg-[#1DA6DF] text-white border-[#1DA6DF]"
                      : "border-gray-300"
                  }`}
                >
                  Unlimited pack
                </button>
                <button
                  type="button"
                  onClick={() => pickPhone("payg")}
                  className={`px-3 py-2 rounded-md text-sm border ${
                    selectedPhone === "payg"
                      ? "bg-[#1DA6DF] text-white border-[#1DA6DF]"
                      : "border-gray-300"
                  }`}
                >
                  PAYG
                </button>
              </div>
            }
          />
        ) : (
          <EmptyTile
            label="phone service"
            onClick={() => {
              if (
                value.includePhone !== undefined &&
                typeof onChange === "function"
              ) {
                onChange({
                  ...value,
                  includePhone: true,
                  selectedPhone: "pack",
                });
              } else {
                setLocalIncludePhone(true);
                setLocalSelectedPhone("pack");
              }
            }}
          />
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* PBX Section */}
      {connectionType === "business" && (
        <div className="mt-4">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-extrabold">
              Do you want a <span className="text-[#1DA6DF]">PBX?</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2 max-w-md mx-auto">
            <button
              className={`py-3 px-8 text-base font-bold rounded-xl shadow-lg transition-all duration-150 border-2 ${
                localIncludePBX === true
                  ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                  : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
              }`}
              onClick={() => {
                setLocalIncludePBX(true);
                if (typeof window !== "undefined") {
                  localStorage.setItem("pbx_include", "true");
                }
                if (
                  typeof onChange === "function" &&
                  connectionType === "business"
                ) {
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
              className={`py-3 px-8 text-base font-bold rounded-xl shadow-lg transition-all duration-150 border-2 ${
                localIncludePBX === false
                  ? "bg-[#1DA6DF] text-white border-[#1DA6DF] scale-105"
                  : "bg-white text-[#1DA6DF] border-[#1DA6DF] hover:bg-[#e6f7fd]"
              }`}
              onClick={() => {
                setLocalIncludePBX(false);
                if (typeof window !== "undefined") {
                  localStorage.setItem("pbx_include", "false");
                }
                if (
                  typeof onChange === "function" &&
                  connectionType === "business"
                ) {
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
            <div className="text-center text-red-600 text-sm mt-2">
              Please select Yes or No to continue.
            </div>
          )}

          {localIncludePBX === true && (
            <PBXWizardSection
              value={value.pbx}
              onPBXChange={(data) => {
                setPBXData(data);
                if (
                  typeof onChange === "function" &&
                  connectionType === "business"
                ) {
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

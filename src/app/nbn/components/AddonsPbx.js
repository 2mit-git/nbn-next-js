// File: src/app/components/AddonsPbx.jsx
"use client";
import { notifyParentModal } from "@/utils/embedBridge";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------------- shared constants/helpers ---------------- */
const PLAN_PRICES = { "Hosted UNLIMITED": 33.0, "Hosted PAYG": 5.5 };
const LIMITED_MODELS = ["Yealink T31G", "Yealink T43U", "Yealink T54W"];
const COSTS = { callRecording: 2.95, ivr: 2.95, queue: 4.95 };
const PBX_CACHE_KEY = "pbx_config";
const BRAND = "#1EA6DF";

/* Handsets (outside to avoid re-creation) */
const HANDSETS = [
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
const HANDSET_COST_BY_NAME = HANDSETS.reduce(
  (m, h) => ((m[h.name] = h.cost), m),
  {}
);

const getCache = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PBX_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};
const clampNum = (v, min = 0) => Math.max(min, Number(v) || 0);

/* ---------------- PBX wizard ---------------- */
function PBXWizardSection({ value, onPBXChange }) {
  const cache = getCache();

  const [selectedPlan, setSelectedPlan] = useState(
    value?.selectedPlan ?? cache.selectedPlan ?? null
  );
  const [numUsers, setNumUsers] = useState(
    value?.numUsers ?? cache.numUsers ?? 1
  );
  const [callRecording, setCallRecording] = useState(
    value?.callRecording ?? cache.callRecording ?? false
  );
  const [callRecordingQty, setCallRecordingQty] = useState(
    value?.callRecordingQty ?? cache.callRecordingQty ?? 1
  );
  const [ivrCount, setIVRCount] = useState(
    value?.ivrCount ?? cache.ivrCount ?? 0
  );
  const [queueCount, setQueueCount] = useState(
    value?.queueCount ?? cache.queueCount ?? 0
  );

  const [handsetSelections, setHandsetSelections] = useState(
    value?.handsets ??
      cache.handsetSelections ??
      HANDSETS.reduce((acc, h) => ((acc[h.name] = 0), acc), {})
  );

  const [limitWarn, setLimitWarn] = useState("");

  const monthlyTotal = useMemo(() => {
    const userSubtotal = (PLAN_PRICES[selectedPlan] || 0) * numUsers;
    return (
      userSubtotal +
      (callRecording ? callRecordingQty * COSTS.callRecording : 0) +
      ivrCount * COSTS.ivr +
      queueCount * COSTS.queue
    );
  }, [
    selectedPlan,
    numUsers,
    callRecording,
    callRecordingQty,
    ivrCount,
    queueCount,
  ]);

  const handsetSubtotal = useMemo(() => {
    let sum = 0;
    for (const [name, qty] of Object.entries(handsetSelections)) {
      if (!qty) continue;
      sum += (HANDSET_COST_BY_NAME[name] || 0) * qty;
    }
    return sum;
  }, [handsetSelections]);

  const upfrontTotal = useMemo(
    () => monthlyTotal + handsetSubtotal,
    [monthlyTotal, handsetSubtotal]
  );

  /* limits */
  const maxHandsets = numUsers + queueCount;
  const currentLimitedSum = useMemo(
    () => LIMITED_MODELS.reduce((s, m) => s + (handsetSelections[m] || 0), 0),
    [handsetSelections]
  );
  const remainingLimited = Math.max(0, maxHandsets - currentLimitedSum);

  useEffect(() => {
    if (remainingLimited > 0 && limitWarn) setLimitWarn("");
  }, [remainingLimited, limitWarn]);

  const handleQty = (name, delta) => {
    setHandsetSelections((prev) => {
      const isLimited = LIMITED_MODELS.includes(name);
      let nextQty = clampNum((prev[name] || 0) + delta);
      if (isLimited) {
        const other = LIMITED_MODELS.filter((m) => m !== name).reduce(
          (s, m) => s + (prev[m] || 0),
          0
        );
        if (other + nextQty > maxHandsets) {
          setLimitWarn(
            `Limit reached: Total of limited models (T31G/T43U/T54W) cannot exceed Users + Queues (${maxHandsets}).`
          );
          return prev;
        }
      }
      return { ...prev, [name]: nextQty };
    });
  };

  /* persist + emit upstream */
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
    onPBXChange?.({
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
    onPBXChange,
  ]);

  return (
    <div className="space-y-10">
      {/* Plan */}
      <section className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
        <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand,#1EA6DF)]/10 text-[color:var(--brand,#1EA6DF)] mr-2">
              ☎
            </span>
            PBX Plan
          </h3>
          <div
            className="hidden sm:flex items-center gap-3 text-sm"
            aria-hidden="true"
          >
            
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {Object.keys(PLAN_PRICES).map((plan) => (
            <button
              type="button"
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              aria-pressed={selectedPlan === plan}
              className={`group text-left rounded-2xl border-2 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus:ring-4 ${
                selectedPlan === plan
                  ? "border-[color:var(--brand,#1EA6DF)] ring-[color:var(--brand,#1EA6DF)]/30"
                  : "border-gray-200 focus:ring-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="mb-1 text-base sm:text-lg font-extrabold text-gray-900">
                  {plan}
                </h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                    plan === "Hosted UNLIMITED"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                  }`}
                >
                  {plan === "Hosted UNLIMITED" ? "High volume" : "Low outbound"}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                {plan === "Hosted UNLIMITED"
                  ? "Best for high call volume (e.g. call centres)."
                  : "Cost-saving for businesses with low outbound traffic."}
              </p>

              <div className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900">
                ${PLAN_PRICES[plan].toFixed(2)}{" "}
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  /user/mo
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Options */}
      <section className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
        <h3 className="mb-4 sm:mb-5 text-lg sm:text-xl font-bold text-gray-900">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand,#1EA6DF)]/10 text-[color:var(--brand,#1EA6DF)] mr-2">
            ⚙
          </span>
          PBX Options
        </h3>

        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <NumberField
            label="Number of Users"
            value={numUsers}
            min={1}
            onChange={(v) => setNumUsers(clampNum(v, 1))}
            help="Enter at least 1 user."
          />
          <NumberField
            label="IVR"
            value={ivrCount}
            min={0}
            onChange={(v) => setIVRCount(clampNum(v))}
          />
          <NumberField
            label="Queues"
            value={queueCount}
            min={0}
            onChange={(v) => setQueueCount(clampNum(v))}
          />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label className="mb-1 block font-semibold text-gray-900">
                Call recordings?
              </label>
              <p className="text-sm text-gray-600">
                Enable to store calls per user/channel.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCallRecording((v) => !v)}
                className={`rounded-lg border-2 px-4 py-2 font-semibold transition focus:outline-none focus:ring-4 ${
                  callRecording
                    ? "border-[color:var(--brand,#1EA6DF)] bg-[color:var(--brand,#1EA6DF)] text-white focus:ring-[color:var(--brand,#1EA6DF)]/30"
                    : "border-[color:var(--brand,#1EA6DF)] text-[color:var(--brand,#1EA6DF)] hover:bg-sky-50 focus:ring-sky-200"
                }`}
                aria-pressed={callRecording}
                aria-label="Toggle call recording"
              >
                {callRecording ? "Disable" : "Enable"}
              </button>

              {callRecording && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">
                    Recording Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={callRecordingQty}
                    onChange={(e) =>
                      setCallRecordingQty(clampNum(e.target.value, 1))
                    }
                    className="w-24 rounded-lg border-2 border-gray-200 p-2 focus:border-[color:var(--brand,#1EA6DF)] focus:ring-2 focus:ring-[color:var(--brand,#1EA6DF)]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Handsets */}
      <section className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand,#1EA6DF)]/10 text-[color:var(--brand,#1EA6DF)] mr-2">
              📞
            </span>
            PBX Handsets
          </h3>

        <div className="flex items-center gap-2">
          {remainingLimited === 0 ? (
            <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
              ⚠️ Limited models cap reached (Users + Queues = {maxHandsets})
            </span>
          ) : (
            <span className="text-xs text-gray-600">
              Limited models remaining:{" "}
              <span className="font-semibold text-[color:var(--brand,#1EA6DF)]">
                {remainingLimited}
              </span>
            </span>
          )}
        </div>
        </div>

        {limitWarn && (
          <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
            {limitWarn}
          </div>
        )}

        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {HANDSETS.map((h) => {
            const qty = handsetSelections[h.name] || 0;
            const isLimited = LIMITED_MODELS.includes(h.name);
            const disabledInc = isLimited && remainingLimited === 0;

            return (
              <div
                key={h.name}
                className={`flex flex-col justify-between rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${
                  qty > 0
                    ? "border-[color:var(--brand,#1EA6DF)] ring-2 ring-[color:var(--brand,#1EA6DF)]/30"
                    : "border-gray-200"
                }`}
                style={{ minHeight: 260 }}
              >
                {/* Top: image + details */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.img}
                    alt={h.name}
                    className="h-20 w-40 sm:h-20 sm:w-32 rounded-xl bg-white object-contain mx-auto sm:mx-0"
                    loading="lazy"
                  />
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
                    <div className="mb-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="truncate text-base sm:text-lg font-extrabold text-gray-900">
                        {h.name}
                      </span>
                      {isLimited && (
                        <span className="whitespace-nowrap rounded-full bg-[color:var(--brand,#1EA6DF)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--brand,#1EA6DF)] ring-1 ring-[color:var(--brand,#1EA6DF)]/20">
                          Limited model
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {h.features.slice(0, 2).join(" • ")}
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">
                      ${h.cost}
                    </div>
                    {isLimited && (
                      <div className="mt-1 text-xs text-gray-500">
                        Remaining for limited models:{" "}
                        <span className="font-semibold text-[color:var(--brand,#1EA6DF)]">
                          {remainingLimited}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom: qty controls */}
                <div className="mt-3 flex items-center justify-center sm:justify-end gap-2">
                  <button
                    className="h-9 w-9 rounded-full border border-gray-300 bg-gray-50 text-lg font-bold text-[color:var(--brand,#1EA6DF)] hover:bg-gray-100 disabled:opacity-40"
                    onClick={() => handleQty(h.name, -1)}
                    disabled={qty === 0}
                    aria-label={`Decrease ${h.name} quantity`}
                  >
                    −
                  </button>

                  <input
                    className="w-14 sm:w-16 rounded-lg border border-gray-300 p-1 text-center focus:outline-none focus:ring-2 focus:ring-[color:var(--brand,#1EA6DF)]"
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) => {
                      const next = clampNum(e.target.value);
                      setHandsetSelections((prev) => {
                        if (!isLimited) return { ...prev, [h.name]: next };
                        const other = LIMITED_MODELS.filter(
                          (m) => m !== h.name
                        ).reduce((s, m) => s + (prev[m] || 0), 0);
                        const capped = Math.min(
                          next,
                          Math.max(0, maxHandsets - other)
                        );
                        if (capped < next) {
                          setLimitWarn(
                            `Limit reached: Total of limited models (T31G/T43U/T54W) cannot exceed Users + Queues (${maxHandsets}).`
                          );
                        }
                        return { ...prev, [h.name]: capped };
                      });
                    }}
                    aria-label={`${h.name} quantity`}
                  />

                  <button
                    className="h-9 w-9 rounded-full border border-gray-300 bg-gray-50 px-2 text-lg font-bold text-[color:var(--brand,#1EA6DF)] hover:bg-gray-100 disabled:opacity-40"
                    onClick={() => handleQty(h.name, 1)}
                    disabled={disabledInc}
                    aria-label={`Increase ${h.name} quantity`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Totals quick glance */}
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-sky-50 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">Estimated totals</div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">Monthly: </span>
              <span className="font-semibold text-gray-900">
                ${monthlyTotal.toFixed(2)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Upfront (incl. handsets): </span>
              <span className="font-semibold text-gray-900">
                ${upfrontTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- small UI bits ---------- */
function NumberField({ label, value, onChange, min = 0, help }) {
  return (
    <div>
      <label className="mb-1 block font-semibold text-gray-900">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border-2 border-gray-200 p-2.5 focus:border-[color:var(--brand,#1EA6DF)] focus:ring-4 focus:ring-[color:var(--brand,#1EA6DF)]/20 transition"
      />
      {help && <small className="text-gray-400">{help}</small>}
    </div>
  );
}

const EmptyTile = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:border-[color:var(--brand,#1EA6DF)] hover:bg-sky-50 hover:-translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand,#1EA6DF)]/20"
    aria-label={label}
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-xl">
      +
    </div>
    <div className="text-sm font-semibold text-gray-700">{label}</div>
  </button>
);

/* Modal */
const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center px-3 sm:px-0"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Dim/blur backdrop */}
      <div className="absolute inset-0 bg-white backdrop-blur-sm animate-[fade_120ms_ease-out]" />
      <div
        className="relative w-full max-w-5xl animate-[pop_140ms_ease-out_forwards] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-white to-sky-50 px-4 sm:px-5 py-3 sm:py-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[72vh] overflow-y-auto px-4 sm:px-6 py-5 sm:py-6">
          {children}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 border-t bg-white/95 backdrop-blur p-3 sm:p-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          {/* Slot kept empty here; outer component injects actions below modal via its own buttons */}
        </div>

        <style jsx>{`
          :root { --brand: ${BRAND}; }
          @keyframes pop {
            from { opacity: 0; transform: translateY(4px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

/* ---------- preview helpers ---------- */
function StatRow({ label, qty }) {
  if (!qty || qty <= 0) return null;
  return (
    <div className="grid grid-cols-[1fr_auto] items-center py-1">
      <div className="text-gray-700">{label}</div>
      <div className="font-semibold text-gray-900">x {qty}</div>
    </div>
  );
}

function PBXPreviewCard({ pbx, onEdit, onRemove }) {
  const handsetRows = useMemo(() => {
    if (!pbx) return [];
    return Object.entries(pbx.handsets || {})
      .filter(([, qty]) => qty > 0)
      .map(([label, qty]) => ({ label, qty }));
  }, [pbx]);

  if (!pbx?.selectedPlan) return null;

  const isUnlimited = pbx.selectedPlan === "Hosted UNLIMITED";
  const price = isUnlimited ? 33 : 5.5;
  const bullets = isUnlimited
    ? [
        "Predictable monthly telecom costs.",
        "Calls to all local/national & mobile numbers (fair use policy applies).",
      ]
    : [
        "Cost-saving for businesses with low outbound traffic.",
        "No contracts or setup fees with 2mit.",
        "Inbound calls to local/national DIDs are free.",
      ];

  const leftRows = [
    { label: "Number of Users", qty: pbx.numUsers },
    { label: "IVR", qty: pbx.ivrCount },
    { label: "Queues", qty: pbx.queueCount },
    ...(pbx.callRecording
      ? [{ label: "Call recording Qty", qty: pbx.callRecordingQty }]
      : []),
  ];

  const planLabelBig = pbx.selectedPlan.replace("Hosted ", "");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="shrink-0 text-center md:w-56 md:text-left">
          <div className="text-xs uppercase tracking-wide text-gray-600">
            Hosted
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {planLabelBig}
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">${price}</span>
            <span className="ml-1 text-xs text-gray-500">/user/month</span>
          </div>
        </div>

        <div className="flex-1">
          <ul className="list-disc pl-5 text-sm leading-6 text-gray-700">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
          {leftRows.map((r) => (
            <StatRow key={r.label} label={r.label} qty={r.qty} />
          ))}
          {leftRows.every((r) => !r.qty || r.qty <= 0) && (
            <div className="text-sm text-gray-500">—</div>
          )}
        </div>

        {handsetRows.length > 0 ? (
          <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
            {handsetRows.map((r) => (
              <StatRow key={r.label} label={r.label} qty={r.qty} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500 ring-1 ring-gray-100">
            No handsets selected
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-start">
        <button
          type="button"
          className="cursor-default w-full rounded-md bg-[color:var(--brand,#1EA6DF)] px-5 py-2 font-semibold text-white shadow-sm"
          disabled
          aria-disabled
        >
          Selected
        </button>
        <button
          type="button"
          className="w-full sm:w-auto rounded-md border border-gray-300 px-5 py-2 hover:bg-gray-50"
          onClick={onRemove}
        >
          Remove
        </button>
        <button
          type="button"
          className="w-full sm:w-auto rounded-md border border-gray-300 px-5 py-2 hover:bg-gray-50"
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

/* ============================ MAIN: AddonsPbx ============================ */
export default function AddonsPbx({ value = {}, onChange }) {
  const [localInclude, setLocalInclude] = useState(value.includePBX ?? null);
  const [localPBX, setLocalPBX] = useState(value.pbx ?? null);

  useEffect(() => {
    if (value.includePBX !== undefined) setLocalInclude(value.includePBX);
  }, [value.includePBX]);
  useEffect(() => {
    if (value.pbx !== undefined) setLocalPBX(value.pbx);
  }, [value.pbx]);

  const includePBX = value.includePBX ?? localInclude;
  const pbx = value.pbx ?? localPBX;

  const emit = (patch) => onChange?.({ ...value, ...patch });

  const [open, setOpen] = useState(false);
  const draftRef = useRef(pbx || null);
  const handlePBXChange = (data) => (draftRef.current = data);

  // ---- Parent notification for modal open/close ----
  useEffect(() => {
    notifyParentModal?.(open, { modal: "pbx", source: "AddonsPbx" });
    return () => {
      // if component unmounts with modal open, make sure the parent is told it's closed
      notifyParentModal?.(false, { modal: "pbx", source: "AddonsPbx", reason: "unmount" });
    };
  }, [open]);

  const closePBXModal = (reason) => {
    notifyParentModal?.(false, { modal: "pbx", source: "AddonsPbx", reason });
    setOpen(false);
  };

  const saveFromModal = () => {
    const data = draftRef.current;
    if (!data?.selectedPlan) return;
    if (onChange) emit({ includePBX: true, pbx: data });
    else {
      setLocalInclude(true);
      setLocalPBX(data);
    }
    closePBXModal("save");
  };

  const removePBX = () => {
    if (onChange) emit({ includePBX: false, pbx: null });
    else {
      setLocalInclude(false);
      setLocalPBX(null);
    }
    // not strictly a modal close, but useful for parent UIs that watch for pbx changes
    notifyParentModal?.(false, { modal: "pbx", source: "AddonsPbx", reason: "remove" });
  };

  return (
    <div className="space-y-6">
      {includePBX && pbx ? (
        <PBXPreviewCard
          pbx={pbx}
          onEdit={() => setOpen(true)}
          onRemove={removePBX}
        />
      ) : (
        <EmptyTile label="Add PBX plan" onClick={() => setOpen(true)} />
      )}

      <Modal
        open={open}
        onClose={() => closePBXModal("backdrop/close-button")}
        title="PBX plan"
      >
        <PBXWizardSection value={pbx} onPBXChange={handlePBXChange} />

        {/* Actions (kept exactly the same logic) */}
        <div className=" bottom-0 mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end border-t bg-white/95 backdrop-blur px-1 pt-4">
          <button
            className="rounded-md border px-4 py-2 w-full sm:w-auto hover:bg-gray-50"
            onClick={() => closePBXModal("cancel")}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-[color:var(--brand,#1EA6DF)] px-4 py-2 font-semibold text-white w-full sm:w-auto shadow-sm hover:opacity-95"
            onClick={saveFromModal}
          >
            {includePBX ? "Update PBX" : "Add PBX"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

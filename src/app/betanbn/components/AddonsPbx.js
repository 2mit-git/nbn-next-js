// File: src/app/components/AddonsPbx.jsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------------- shared constants/helpers ---------------- */
const PLAN_PRICES = { "Hosted UNLIMITED": 33.0, "Hosted PAYG": 5.5 };
const LIMITED_MODELS = ["Yealink T31G", "Yealink T43U", "Yealink T54W"];
const COSTS = { callRecording: 2.95, ivr: 2.95, queue: 4.95 };
const PBX_CACHE_KEY = "pbx_config";

const getCache = () => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PBX_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const clampNum = (v, min = 0) => Math.max(min, Number(v) || 0);

/* ---------------- PBX wizard (same logic; less repetition) ---------------- */
function PBXWizardSection({ value, onPBXChange }) {
  const handsets = [
    { name: "Yealink T31G", cost: 129, features: ["2-line IP phone", "132×64 LCD", "Dual Gig Ports", "PoE"], img: "https://2mit.com.au/wp-content/uploads/2025/04/b600de47-6888-441a-af46-274215e21a47.png" },
    { name: "Yealink T43U", cost: 259, features: ["3.7″ LCD", "Dual USB", "PoE", "Wall-mountable"], img: "https://2mit.com.au/wp-content/uploads/2025/04/202204111053513320ed653424d3f9ec4ad1877ef0588.png" },
    { name: "Yealink T54W", cost: 399, features: ["4.3″ colour screen", "HD Voice", "Dual Gig Ports"], img: "https://2mit.com.au/wp-content/uploads/2025/04/20220412014042818e5253f80492aae3227fc1468a05a.png" },
    { name: "Yealink WH62 Mono", cost: 205, features: ["UC DECT", "Wireless", "Range 180 m", "Acoustic Shield"], img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png" },
    { name: "Yealink WH62 Dual", cost: 235, features: ["UC DECT", "Wireless", "Range 180 m", "Acoustic Shield"], img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png" },
    { name: "Yealink BH72", cost: 355, features: ["Bluetooth stereo headset", "40 h battery", "Charging stand"], img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png" },
  ];

  const cache = getCache();

  const [selectedPlan, setSelectedPlan] = useState(value?.selectedPlan ?? cache.selectedPlan ?? null);
  const [numUsers, setNumUsers] = useState(value?.numUsers ?? cache.numUsers ?? 1);
  const [callRecording, setCallRecording] = useState(value?.callRecording ?? cache.callRecording ?? false);
  const [callRecordingQty, setCallRecordingQty] = useState(value?.callRecordingQty ?? cache.callRecordingQty ?? 1);
  const [ivrCount, setIVRCount] = useState(value?.ivrCount ?? cache.ivrCount ?? 0);
  const [queueCount, setQueueCount] = useState(value?.queueCount ?? cache.queueCount ?? 0);
  const [handsetSelections, setHandsetSelections] = useState(
    value?.handsets ?? cache.handsetSelections ?? handsets.reduce((acc, h) => ({ ...acc, [h.name]: 0 }), {})
  );

  /* derived totals (memo for clarity + stable deps) */
  const monthlyTotal = useMemo(() => {
    const userSubtotal = (PLAN_PRICES[selectedPlan] || 0) * numUsers;
    return (
      userSubtotal +
      (callRecording ? callRecordingQty * COSTS.callRecording : 0) +
      ivrCount * COSTS.ivr +
      queueCount * COSTS.queue
    );
  }, [selectedPlan, numUsers, callRecording, callRecordingQty, ivrCount, queueCount]);

  const upfrontTotal = useMemo(() => {
    const handsetSubtotal = Object.entries(handsetSelections).reduce((s, [, q]) => s + (q || 0) * (handsets.find(h => h.name === Object.keys(handsetSelections).find(k => handsetSelections[k] === q))?.cost || 0), 0);
    // ^ cost mapping is tiny; keeps logic identical
    return monthlyTotal + handsetSubtotal;
  }, [monthlyTotal, handsetSelections, handsets]);

  /* limit tracking (computed once per render) */
  const maxHandsets = numUsers + queueCount;
  const currentLimitedSum = useMemo(
    () => LIMITED_MODELS.reduce((s, m) => s + (handsetSelections[m] || 0), 0),
    [handsetSelections]
  );

  const handleQty = (name, delta) => {
    setHandsetSelections(prev => {
      const isLimited = LIMITED_MODELS.includes(name);
      let nextQty = clampNum((prev[name] || 0) + delta);
      if (isLimited) {
        const other = LIMITED_MODELS.filter(m => m !== name).reduce((s, m) => s + (prev[m] || 0), 0);
        if (other + nextQty > maxHandsets) return prev; // block, same logic
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
    <div className="space-y-8">
      {/* Plan */}
      <section>
        <h3 className="mb-4 text-xl font-bold text-[#1DA6DF]">PBX Plan</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.keys(PLAN_PRICES).map((plan) => (
            <button
              type="button"
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`text-left rounded-xl border-2 bg-white p-5 transition ${
                selectedPlan === plan ? "border-[#1DA6DF] ring-2 ring-[#1DA6DF]" : "border-gray-200 hover:shadow"
              }`}
            >
              <h4 className="mb-1 text-lg font-bold text-[#1DA6DF]">{plan}</h4>
              <p className="text-sm text-gray-600">
                {plan === "Hosted UNLIMITED" ? "Best for high call volume (e.g. call centres)." : "Cost-saving for businesses with low outbound traffic."}
              </p>
              <div className="mt-3 text-2xl font-bold text-[#1DA6DF]">
                ${PLAN_PRICES[plan].toFixed(2)} <span className="text-base font-normal text-gray-600">/user/mo</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Options */}
      <section>
        <h3 className="mb-4 text-xl font-bold text-[#1DA6DF]">PBX Options</h3>
        <div className="grid gap-5 md:grid-cols-3">
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

        <div className="mt-4">
          <label className="mb-1 block font-semibold text-gray-700">Call recordings?</label>
          <button
            type="button"
            onClick={() => setCallRecording((v) => !v)}
            className={`rounded-lg border-2 px-4 py-2 font-semibold transition ${
              callRecording ? "border-[#1DA6DF] bg-[#1DA6DF] text-white" : "border-[#1DA6DF] text-[#1DA6DF] hover:bg-[#e6f7fd]"
            }`}
          >
            {callRecording ? "Disable" : "Enable"}
          </button>

          {callRecording && (
            <div className="mt-2">
              <label className="mb-1 block text-gray-700">Call recording Qty</label>
              <input
                type="number"
                min={1}
                value={callRecordingQty}
                onChange={(e) => setCallRecordingQty(clampNum(e.target.value, 1))}
                className="w-24 rounded-lg border-2 border-gray-200 p-2 focus:border-[#1DA6DF] focus:ring-2 focus:ring-[#1DA6DF]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Handsets */}
      <section>
        <h3 className="mb-4 text-xl font-bold text-[#1DA6DF]">PBX Handsets</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {handsets.map((h) => {
            const qty = handsetSelections[h.name] || 0;
            const isLimited = LIMITED_MODELS.includes(h.name);
            const remainingForLimited = isLimited ? Math.max(0, maxHandsets - currentLimitedSum) : undefined;

            return (
              <div key={h.name} className={`rounded-2xl border-2 bg-white p-4 shadow-sm ${qty > 0 ? "border-[#1DA6DF] ring-2 ring-[#1DA6DF]" : "border-gray-200"}`}>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.img} alt={h.name} className="h-24 w-24 rounded-xl bg-white object-contain" />
                  <div>
                    <div className="mb-1 text-lg font-bold text-[#1DA6DF]">{h.name}</div>
                    <div className="text-sm text-gray-600">{h.features.slice(0, 2).join(" • ")}</div>
                    <div className="mt-1 font-semibold text-[#1DA6DF]">${h.cost}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    className="h-9 w-9 rounded-full border border-gray-300 bg-gray-100 text-lg font-bold text-[#1DA6DF]"
                    onClick={() => handleQty(h.name, -1)}
                    disabled={qty === 0}
                  >
                    -
                  </button>

                  <input
                    className="w-14 rounded-lg border p-1 text-center"
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) => {
                      const next = clampNum(e.target.value);
                      setHandsetSelections((prev) => {
                        if (!isLimited) return { ...prev, [h.name]: next };
                        const other = LIMITED_MODELS.filter((m) => m !== h.name).reduce((s, m) => s + (prev[m] || 0), 0);
                        const capped = Math.min(next, Math.max(0, maxHandsets - other));
                        return { ...prev, [h.name]: capped };
                      });
                    }}
                  />

                  <button
                    className="h-9 w-9 rounded-full border border-gray-300 bg-gray-100 px-2 text-lg font-bold text-[#1DA6DF]"
                    onClick={() => handleQty(h.name, 1)}
                    disabled={isLimited && remainingForLimited === 0}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ---------- small UI bits ---------- */
function NumberField({ label, value, onChange, min = 0, help }) {
  return (
    <div>
      <label className="mb-1 block font-semibold text-gray-700">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border-2 border-gray-200 p-2 focus:border-[#1DA6DF] focus:ring-2 focus:ring-[#1DA6DF]"
      />
      {help && <small className="text-gray-400">{help}</small>}
    </div>
  );
}

const EmptyTile = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 transition hover:border-[#1DA6DF] hover:bg-[#f0faff]"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 text-xl">+</div>
    <div className="text-sm text-gray-600">{label}</div>
  </button>
);

const Modal = ({ open, onClose, title, children }) =>
  !open ? null : (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2">
        <div className="max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-xl font-bold">{title}</h3>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
              ✕
            </button>
          </div>
          <div className="max-h-[78vh] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );

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
  if (!pbx?.selectedPlan) return null;

  const isUnlimited = pbx.selectedPlan === "Hosted UNLIMITED";
  const price = isUnlimited ? 33 : 5.5;
  const bullets = isUnlimited
    ? [
        "Predictable monthly telecom costs.",
        "Calls to all local/national & mobile numbers (subject to fair-use policy).",
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
    ...(pbx.callRecording ? [{ label: "Call recording Qty", qty: pbx.callRecordingQty }] : []),
  ];

  const handsetRows = useMemo(
    () =>
      Object.entries(pbx.handsets || {})
        .filter(([, qty]) => qty > 0)
        .map(([label, qty]) => ({ label, qty })),
    [pbx]
  );

  const planLabelBig = pbx.selectedPlan.replace("Hosted ", "");

  return (
    <div className="rounded-2xl border-2 border-[#1DA6DF]/60 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="md:w-56 shrink-0 text-center md:text-left">
          <div className="text-sm uppercase tracking-wide text-gray-600">Hosted</div>
          <div className="text-2xl font-extrabold text-[#1DA6DF]">{planLabelBig}</div>
          <div className="mt-3">
            <span className="text-2xl font-bold">${price}</span>
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          {leftRows.map((r) => (
            <StatRow key={r.label} label={r.label} qty={r.qty} />
          ))}
          {leftRows.every((r) => !r.qty || r.qty <= 0) && <div className="text-sm text-gray-500">—</div>}
        </div>

        {handsetRows.length > 0 ? (
          <div className="rounded-xl bg-gray-50 p-4">
            {handsetRows.map((r) => (
              <StatRow key={r.label} label={r.label} qty={r.qty} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">No handsets selected</div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-start">
        <button type="button" className="cursor-default rounded-md bg-[#1DA6DF] px-5 py-2 font-semibold text-white" disabled aria-disabled>
          Selected
        </button>
        <button type="button" className="rounded-md border border-gray-300 px-5 py-2" onClick={onRemove}>
          Remove
        </button>
        <button type="button" className="rounded-md border border-gray-300 px-5 py-2" onClick={onEdit}>
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

  const saveFromModal = () => {
    const data = draftRef.current;
    if (!data?.selectedPlan) return; // must pick a plan
    if (onChange) emit({ includePBX: true, pbx: data });
    else {
      setLocalInclude(true);
      setLocalPBX(data);
    }
    setOpen(false);
  };

  const removePBX = () => {
    if (onChange) emit({ includePBX: false, pbx: null });
    else {
      setLocalInclude(false);
      setLocalPBX(null);
    }
  };

  return (
    <div className="space-y-6">
      {includePBX && pbx ? (
        <PBXPreviewCard pbx={pbx} onEdit={() => setOpen(true)} onRemove={removePBX} />
      ) : (
        <EmptyTile label="Add PBX plan" onClick={() => setOpen(true)} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="PBX plan">
        <PBXWizardSection value={pbx} onPBXChange={handlePBXChange} />
        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-md border px-4 py-2" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button className="rounded-md bg-[#1DA6DF] px-4 py-2 font-semibold text-white" onClick={saveFromModal}>
            {includePBX ? "Update PBX" : "Add PBX"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// File: src/app/components/OrderSummary.jsx
"use client";
import React from "react";

/** ----- Legacy reference data (kept) ----- */
const modemOptions = [
  { id: "modem",    title: "Gigabit WiFi-6 MESH 1800Mbps Modem",     price: "$170 / Upfront" },
  { id: "extender", title: "Gigabit WiFi-6 MESH 1800Mbps Extender",  price: "$120 / Upfront" },
];

const phoneOptions = [
  { id: "payg", title: "Pay-as-you-go call rates",      price: 0 },
  { id: "pack", title: "$10/mth Unlimited call pack",   price: 10 },
];

/** ----- PBX handsets (unchanged) ----- */
const pbxHandsets = [
  { name: "Yealink T31G",      cost: 129 },
  { name: "Yealink T43U",      cost: 259 },
  { name: "Yealink T54W",      cost: 399 },
  { name: "Yealink WH62 Mono", cost: 205 },
  { name: "Yealink WH62 Dual", cost: 235 },
  { name: "Yealink BH72",      cost: 355 },
];

/** ----- NEW: match Addons.js pricing/labels exactly ----- */
const BUNDLE_PRICING = {
  0: { outright: 170, "12": 15, "24": 8 },
  1: { outright: 235, "12": 20, "24": 10 },
  2: { outright: 325, "12": 25, "24": 15 },
};
const BUNDLE_LABEL = {
  0: "1 Modem",
  1: "1 Modem + 1 Extender",
  2: "1 Modem + 2 Extenders",
};
const TERM_LABEL = { outright: "Upfront", "12": "12 months", "24": "24 months" };

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const takePriceNumber = (s) => {
  const m = typeof s === "string" ? s.match(/\$([\d.]+)/) : null;
  return m ? Number(m[1]) : 0;
};

export default function OrderSummary({
  selectedPlan = {},
  extras = {},
  title = "Order Summary",
  className = "",
}) {
  const lines = [];

  // ----- Plan -----
  const planLabel = selectedPlan?.title || selectedPlan?.name || "Plan";
  const planPrice =
    typeof selectedPlan?.discountPrice !== "undefined"
      ? Number(selectedPlan.discountPrice)
      : typeof selectedPlan?.price !== "undefined"
      ? Number(selectedPlan.price)
      : 0;

  if (planLabel && (selectedPlan?.discountPrice || selectedPlan?.price)) {
    lines.push({ label: planLabel, amount: planPrice });
  }

  // ----- Modem / Extender -----
  const hasBundle =
    typeof extras?.modemBundle === "number" &&
    extras.modemBundle in BUNDLE_PRICING &&
    extras?.modemTerm &&
    (extras.modemTerm === "outright" || extras.modemTerm === "12" || extras.modemTerm === "24");

  if (hasBundle) {
    const b = extras.modemBundle;
    const t = extras.modemTerm;
    const price = BUNDLE_PRICING[b][t];
    const label =
      t === "outright"
        ? `${BUNDLE_LABEL[b]} — ${fmt(price)} / ${TERM_LABEL[t]}`
        : `${BUNDLE_LABEL[b]} — ${fmt(price)}/mth (${TERM_LABEL[t]})`;

    lines.push({ label, amount: price });
  } else if (extras?.modems?.length) {
    extras.modems.forEach((id) => {
      const m = modemOptions.find((x) => x.id === id);
      if (!m) return;
      lines.push({ label: m.title, amount: takePriceNumber(m.price) });
    });
  }

  // ----- Phone service -----
  if (extras?.phone) {
    const phone = phoneOptions.find((p) => p.id === extras.phone);
    if (phone) lines.push({ label: phone.title, amount: phone.price });
  }

  // ----- PBX plan -----
  let pbxMonthly = 0;
  let pbxHandsetsTotal = 0;
  if (extras?.pbx?.selectedPlan && extras?.pbx?.numUsers > 0) {
    const perUser =
      extras.pbx.selectedPlan === "Hosted PAYG"
        ? 5.5
        : extras.pbx.selectedPlan === "Hosted UNLIMITED"
        ? 33.0
        : 0;
    pbxMonthly = perUser * extras.pbx.numUsers;
    lines.push({
      label: `${extras.pbx.selectedPlan} x${extras.pbx.numUsers}`,
      amount: pbxMonthly,
    });
  }

  // ----- PBX handsets -----
  if (extras?.pbx?.handsets) {
    Object.entries(extras.pbx.handsets)
      .filter(([, qty]) => qty > 0)
      .forEach(([model, qty]) => {
        const h = pbxHandsets.find((x) => x.name === model);
        if (!h) return;
        const sub = h.cost * qty;
        pbxHandsetsTotal += sub;
        lines.push({ label: `${model} x${qty}`, amount: sub });
      });
  }

  // ----- Total -----
  const total = lines.reduce((s, l) => s + (l.amount || 0), 0);

  const isMonthly = (label = "") =>
    /\/mth|\(12 months\)|\(24 months\)/i.test(label);

  return (
    <div
      className={`rounded-2xl border shadow-md bg-white ${className}`}
      style={{
        borderColor: "#e5e7eb",
      }}
    >
      <div className="rounded-2xl p-6 sm:p-7 bg-white">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-[#1EA6DF]">
            {title}
          </h2>
          
        </div>

        {/* Lines */}
        <div className="divide-y divide-gray-200">
          {lines.map((l, i) => (
            <div
              key={`${l.label}-${i}`}
              className="py-3 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1EA6DF]/70 mt-1" />
                  <span className="font-medium text-gray-800">
                    {l.label}
                  </span>
                  {isMonthly(l.label) && (
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      Monthly
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="tabular-nums font-semibold text-gray-900">
                  {fmt(l.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
            <span className="text-sm sm:text-base font-semibold text-gray-700">
              Total
            </span>
            <span className="tabular-nums text-lg sm:text-xl font-extrabold text-gray-900">
              {fmt(total)}
            </span>
          </div>

          {/* PBX note */}
          {extras?.pbx && (pbxMonthly > 0 || pbxHandsetsTotal > 0) && (
            <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed">
              *For PBX plan Monthly Price {fmt(pbxMonthly)} &amp; First Month
              Upfront Total {fmt(pbxMonthly + pbxHandsetsTotal)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// File: src/app/components/OrderSummary.jsx
"use client";
import React from "react";

/** ----- Helpers & reference data (same logic as ContractForm) ----- */
const modemOptions = [
  { id: "modem",   title: "Gigabit WiFi-6 MESH 1800Mbps Modem",   price: "$170 / Upfront" },
  { id: "extender",title: "Gigabit WiFi-6 MESH 1800Mbps Extender",price: "$120 / Upfront" },
];

const phoneOptions = [
  { id: "payg", title: "Pay-as-you-go call rates", price: 0 },
  { id: "pack", title: "$10/mth Unlimited call pack", price: 10 },
];

const pbxHandsets = [
  { name: "Yealink T31G",     cost: 129 },
  { name: "Yealink T43U",     cost: 259 },
  { name: "Yealink T54W",     cost: 399 },
  { name: "Yealink WH62 Mono",cost: 205 },
  { name: "Yealink WH62 Dual",cost: 235 },
  { name: "Yealink BH72",     cost: 355 },
];

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const takePriceNumber = (s) => {
  const m = typeof s === "string" ? s.match(/\$([\d.]+)/) : null;
  return m ? Number(m[1]) : 0;
};

/**
 * OrderSummary
 * Props:
 *  - selectedPlan: { subtitle?, name?, price?, discountPrice? }
 *  - extras: { modems?: string[], phone?: "payg" | "pack" | null, pbx?: { selectedPlan?, numUsers?, handsets? } }
 *  - title?: string
 *  - className?: string
 */
export default function OrderSummary({
  selectedPlan = {},
  extras = {},
  title = "Order Summary",
  className = "",
}) {
  // ----- lines to render (label + amount) -----
  const lines = [];

  // Plan
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

  // Modems (in the given order)
  if (extras?.modems?.length) {
    extras.modems.forEach((id) => {
      const m = modemOptions.find((x) => x.id === id);
      if (!m) return;
      lines.push({ label: m.title, amount: takePriceNumber(m.price) });
    });
  }

  // Phone service
  if (extras?.phone) {
    const phone = phoneOptions.find((p) => p.id === extras.phone);
    if (phone) lines.push({ label: phone.title, amount: phone.price });
  }

  // PBX plan
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

  // PBX handsets
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

  // Total
  const total = lines.reduce((s, l) => s + (l.amount || 0), 0);

  return (
    <div className={`bg-white rounded-2xl shadow p-6 space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold text-[#1DA6DF]">{title}</h2>

      {/* Lines */}
      <div className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <div key={`${l.label}-${i}`} className="flex items-baseline justify-between">
            <span className="font-medium text-gray-800">{l.label}</span>
            <span className="tabular-nums">{fmt(l.amount)}</span>
          </div>
        ))}

        <div className="mt-2 border-t pt-2 flex items-baseline justify-between text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums">{fmt(total)}</span>
        </div>

        {/* PBX monthly/upfront note (same wording as your ContractForm) */}
        {extras?.pbx && (pbxMonthly > 0 || pbxHandsetsTotal > 0) && (
          <div className="mt-2 text-sm text-gray-500">
            <p>
              *For PBX plan Monthly Price {fmt(pbxMonthly)} &amp; First Month
              Upfront Total {fmt(pbxMonthly + pbxHandsetsTotal)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

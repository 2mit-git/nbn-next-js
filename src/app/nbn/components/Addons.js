// File: src/app/nbn/components/Addons.js
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { notifyParentModal } from "@/utils/embedBridge";

const BRAND = "#1EA6DF";

/* --- Static content (unchanged) --- */
const MODEM_CARD = {
  id: "modem",
  title: "Gigabit WiFi-6 MESH 1800Mbps Modem",
  subtitle: "(valued at $200)",
  note: "(Free shipping)",
  details: [
    "nbn™ approved",
    "Preconfigured for data & voice",
    "Use with your existing telephone",
  ],
  img: "https://2mit.com.au/wp-content/uploads/2025/05/broadband-zte-modem.png",
};

const PHONE_OPTIONS = {
  payg: {
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
  pack: {
    id: "pack",
    title: "$10/mth Unlimited call pack",
    details: [
      "Unlimited local & national calls",
      "Unlimited 1300/13 calls",
      "Unlimited calls to Australian mobiles (in Australia)",
      "Unlimited international calls to: UK, NZ, USA, Germany, Hong Kong, Japan, France, Canada, China, Singapore, India & Croatia.",
    ],
  },
};

/* --- Pricing --- */
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

/* --- Layout constants --- */
const CARD_MIN_H = 290;

export default function Addons({ value = {}, onChange }) {
  // legacy fields kept aligned
  const [localIncludeModem, setLocalIncludeModem] = useState(
    value.includeModem ?? null
  );
  const [localSelectedModems, setLocalSelectedModems] = useState(
    value.selectedModems ?? []
  );

  const [bundle, setBundle] = useState(
    Number.isInteger(value.modemBundle) ? value.modemBundle : 0
  );
  const [term, setTerm] = useState(value.modemTerm ?? "outright");

  useEffect(() => {
    if (value.includeModem !== undefined) setLocalIncludeModem(value.includeModem);
  }, [value.includeModem]);
  useEffect(() => {
    if (value.selectedModems !== undefined)
      setLocalSelectedModems(value.selectedModems);
  }, [value.selectedModems]);
  useEffect(() => {
    if (Number.isInteger(value.modemBundle)) setBundle(value.modemBundle);
  }, [value.modemBundle]);
  useEffect(() => {
    if (value.modemTerm) setTerm(value.modemTerm);
  }, [value.modemTerm]);

  const includeModem = value.includeModem ?? localIncludeModem;
  const selectedModems = value.selectedModems ?? localSelectedModems;

  const applyBundleTerm = (nextBundle, nextTerm) => {
    if (onChange) {
      onChange({
        ...value,
        includeModem: true,
        selectedModems: ["modem"],
        modemBundle: nextBundle,
        modemTerm: nextTerm,
      });
    } else {
      setLocalIncludeModem(true);
      setLocalSelectedModems(["modem"]);
      setBundle(nextBundle);
      setTerm(nextTerm);
    }
  };

  const clearModem = () => {
    if (onChange) {
      onChange({
        ...value,
        includeModem: false,
        selectedModems: [],
        modemBundle: 0,
        modemTerm: "outright",
      });
    } else {
      setLocalIncludeModem(false);
      setLocalSelectedModems([]);
      setBundle(0);
      setTerm("outright");
    }
  };

  const isModemSelected =
    (includeModem ?? false) && selectedModems.includes("modem");

  // phone
  const [localIncludePhone, setLocalIncludePhone] = useState(
    value.includePhone ?? null
  );
  const [localSelectedPhone, setLocalSelectedPhone] = useState(
    value.selectedPhone ?? "pack"
  );
  useEffect(() => {
    if (value.includePhone !== undefined) setLocalIncludePhone(value.includePhone);
  }, [value.includePhone]);
  useEffect(() => {
    if (value.selectedPhone !== undefined) setLocalSelectedPhone(value.selectedPhone);
  }, [value.selectedPhone]);

  const includePhone = value.includePhone ?? localIncludePhone;
  const selectedPhone = value.selectedPhone ?? localSelectedPhone;

  /* ---------------------- Modal handling ---------------------- */
  // modal can be: null | { type: "modem" | "phone", mode: "add" | "edit" }
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  useEffect(() => {
    notifyParentModal(!!modal);
    return () => notifyParentModal(false);
  }, [modal]);

  useEffect(() => {
    if (!modal) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => {
      style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [modal]);

  /* -------------------------- UI shells -------------------------- */
  const CardShell = ({ children }) => (
    <div
      className="relative h-full rounded-2xl p-[1px] hover:shadow-lg transition"
      style={{
        minHeight: CARD_MIN_H,
        backgroundImage: "linear-gradient(180deg,#e5e7eb,#f5f6f7)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          padding: 1,
          background:
            "linear-gradient(180deg, rgba(30,166,223,.35), rgba(30,166,223,0) 70%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative flex h-full flex-col rounded-[18px] border border-gray-100 bg-white p-5 sm:p-6">
        {children}
      </div>
    </div>
  );

  const SegBtn = ({ active, children, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2`}
      style={{
        borderColor: active ? BRAND : "#d1d5db",
        background: active ? BRAND : "white",
        color: active ? "white" : "#111827",
        boxShadow: active ? "0 1px 0 0 rgba(0,0,0,.04)" : undefined,
      }}
    >
      {children}
    </button>
  );

  const Pill = ({ children }) => (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        background: "color-mix(in srgb, #1EA6DF 12%, white)",
        color: BRAND,
      }}
    >
      {children}
    </span>
  );

  const SelectedCard = ({ title, img, subtitle, note, details, onRemove, children }) => (
    <CardShell>
      <div className="flex flex-col gap-6 sm:flex-row">
        {img && (
          <div className="sm:pt-1">
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 sm:p-4" style={{ width: 140, height: 160 }}>
              <div className="relative h-full w-full">
                <Image unoptimized src={img} alt={title} fill sizes="160px" className="object-contain" loading="lazy" />
              </div>
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
              {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md border bg-red-400 text-white border-red-300 px-3 py-1.5 text-xs hover:bg-red-500"
                aria-label="Remove item"
              >
                X
              </button>
            )}
          </div>

          {!!details?.length && (
            <div className="mt-3 text-sm text-gray-700">
              <ul className="ml-4 list-disc space-y-1">
                {details.map((d, i) =>
                  Array.isArray(d) ? (
                    <li key={i}>
                      <span className="font-medium">{d[0]} </span>
                      {d[1]}
                    </li>
                  ) : (
                    <li key={i}>{d}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {note && <div className="mt-2 text-xs text-gray-500">{note}</div>}

          {children}
        </div>
      </div>
    </CardShell>
  );

  const Modal = ({ open, onClose, title, children }) =>
    !open ? null : (
      <div
        className="fixed inset-0 z-50 grid place-items-center px-3"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px]" />
        <div
          className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Choose What Works <span style={{ color: BRAND }}>Best for You</span>
          </h2>

          <div className="w-full rounded-2xl bg-white p-4 sm:p-6 shadow-2xl ring-1 ring-black/5 animate-[modalIn_140ms_ease-out_forwards]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {children}
          </div>
        </div>

        <style jsx>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.98); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );

  /* -------------------- Modem selector inside modal -------------------- */
  const priceFor = (b, t) => BUNDLE_PRICING[b][t];
  const priceLabel = (b, t) =>
    t === "outright" ? `$${priceFor(b, t)} / Upfront` : `$${priceFor(b, t)}/mth (${TERM_LABEL[t]})`;

  const ModemPicker = ({ initialBundle, initialTerm, mode, onCancel, onSave }) => {
    const [tempBundle, setTempBundle] = useState(initialBundle ?? 0);
    const [tempTerm, setTempTerm] = useState(initialTerm ?? "outright");

    return (
      <div className="flex flex-col gap-6 md:flex-row md:gap-10 md:items-start">
        {/* IMAGE */}
        <div className="flex justify-center md:justify-start md:flex-shrink-0">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 w-[220px] h-[260px] flex items-center justify-center">
            <Image unoptimized src={MODEM_CARD.img} alt={MODEM_CARD.title} width={100} height={140} className="object-contain" loading="lazy" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1 min-w-0">
          <h4 className="text-lg md:text-xl font-bold text-gray-900">{MODEM_CARD.title}</h4>
          {MODEM_CARD.subtitle && <p className="text-sm text-gray-500 mb-2">{MODEM_CARD.subtitle}</p>}

          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mb-4">
            {MODEM_CARD.details.map((d, i) => <li key={i}>{d}</li>)}
          </ul>

          {/* Quantity */}
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-gray-700">First, select quantity:</label>
            <div className="relative max-w-xs">
              <select
                value={tempBundle}
                onChange={(e) => setTempBundle(Number(e.target.value))}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm pr-8 shadow-sm hover:border-gray-400 focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brandSoft)]"
                style={{
                  ["--brand"]: BRAND,
                  ["--brandSoft"]: "color-mix(in srgb, var(--brand) 35%, transparent)",
                }}
              >
                <option value={0}>{BUNDLE_LABEL[0]}</option>
                <option value={1}>{BUNDLE_LABEL[1]}</option>
                <option value={2}>{BUNDLE_LABEL[2]}</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-700 mb-2">Select payment options:</div>
            <div className="flex flex-wrap gap-2">
              {["outright", "12", "24"].map((t) => (
                <SegBtn key={t} active={tempTerm === t} onClick={() => setTempTerm(t)}>
                  {t === "outright" ? "Outright" : `${t} mths`} • {t === "outright" ? `$${priceFor(tempBundle, t)}` : `$${priceFor(tempBundle, t)}/mth`}
                </SegBtn>
              ))}
            </div>
            <div className="mt-3"><Pill>{priceLabel(tempBundle, tempTerm)}</Pill></div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-gray-100 pt-4">
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="rounded-md px-5 py-2 text-sm font-semibold text-white shadow-sm w-full sm:w-auto"
              style={{ background: BRAND }}
              onClick={() => onSave(tempBundle, tempTerm)}
            >
              {mode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------- helpers ------------------------- */
  const summary = [
    isModemSelected ? `${BUNDLE_LABEL[bundle]} — ${priceLabel(bundle, term)}` : null,
    includePhone ? (selectedPhone === "pack" ? "Phone: Unlimited Pack" : "Phone: PAYG") : null,
  ].filter(Boolean);

  /* ============================== RENDER ============================== */
  return (
    <div className="space-y-9 px-3 sm:px-0">
      <header className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Enhance your plan with <span style={{ color: BRAND }}>extras</span>
        </h2>
        <p className="mt-1 text-sm sm:text-base text-gray-500">Choose a modem bundle and pick a phone option.</p>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        {/* Modem Bundle */}
        {isModemSelected ? (
          <SelectedCard
            title={MODEM_CARD.title}
            img={MODEM_CARD.img}
            subtitle={MODEM_CARD.subtitle}
            note={MODEM_CARD.note}
            details={MODEM_CARD.details}
            onRemove={clearModem}
          >
            {/* Show current bundle + term */}
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Selected:</span> {BUNDLE_LABEL[bundle]} • {priceLabel(bundle, term)}
              </div>
              <div>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
                  onClick={() => setModal({ type: "modem", mode: "edit" })}
                >
                  Change
                </button>
              </div>
            </div>
          </SelectedCard>
        ) : (
          <CardShell>
            <button
              type="button"
              onClick={() => setModal({ type: "modem", mode: "add" })}
              className="grid h-full w-full grid-rows-[1fr_auto] rounded-[14px] border-2 border-dashed p-5 text-center transition border-gray-300 hover:border-[color:var(--brand)] hover:bg-[color:var(--brandSoft)]"
              style={{
                ["--brand"]: BRAND,
                ["--brandSoft"]: "color-mix(in srgb, var(--brand) 8%, white)",
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl" style={{ borderColor: BRAND, color: BRAND }}>+</div>
                <div className="text-sm font-semibold">Add a modem bundle</div>
              </div>
              <div className="mt-3 w-full px-2 text-center text-xs text-gray-500">
                Choose modem only, or add extenders for bigger homes.
              </div>
            </button>
          </CardShell>
        )}

        {/* Phone (unchanged) */}
        {includePhone === true ? (
          <SelectedCard
            title={selectedPhone === "pack" ? PHONE_OPTIONS.pack.title : PHONE_OPTIONS.payg.title}
            details={selectedPhone === "pack" ? PHONE_OPTIONS.pack.details : PHONE_OPTIONS.payg.details}
            onRemove={() =>
              onChange ? onChange({ ...value, includePhone: false }) : setLocalIncludePhone(false)
            }
          >
            <div className="mt-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
                onClick={() => setModal({ type: "phone", mode: "edit" })}
              >
                Change
              </button>
            </div>
          </SelectedCard>
        ) : (
          <CardShell>
            <button
              type="button"
              onClick={() => setModal({ type: "phone", mode: "add" })}
              className="grid h-full w-full grid-rows-[1fr_auto] rounded-[14px] border-2 border-dashed p-5 text-center transition border-gray-300 hover:border-[color:var(--brand)] hover:bg-[color:var(--brandSoft)]"
              style={{
                ["--brand"]: BRAND,
                ["--brandSoft"]: "color-mix(in srgb, var(--brand) 8%, white)",
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl" style={{ borderColor: BRAND, color: BRAND }}>+</div>
                <div className="text-sm font-semibold">Phone service</div>
              </div>
            </button>
          </CardShell>
        )}

        <div className="hidden md:block" />
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {summary.length === 0 ? (
          <span className="text-xs text-gray-500">No extras selected yet.</span>
        ) : (
          summary.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-[color:var(--brand)]/30 bg-[color:var(--brand)]/5 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand)]"
              style={{ ["--brand"]: BRAND }}
            >
              <CheckIcon className="h-3.5 w-3.5" />
              {t}
            </span>
          ))
        )}
      </div>

      {/* Modal content */}
      <Modal
        open={!!modal}
        onClose={closeModal}
        title={modal?.type === "modem" ? "Select your modem bundle" : "Phone service"}
      >
        {modal?.type === "modem" && (
          <ModemPicker
            mode={modal.mode}
            initialBundle={isModemSelected ? bundle : 0}
            initialTerm={isModemSelected ? term : "outright"}
            onCancel={closeModal}
            onSave={(b, t) => {
              applyBundleTerm(b, t);
              closeModal();
            }}
          />
        )}

        {modal?.type === "phone" && (
          <PhoneChooser
            selected={selectedPhone}
            onCancel={closeModal}
            onConfirm={(choice) => {
              if (onChange)
                onChange({ ...value, includePhone: true, selectedPhone: choice });
              else {
                setLocalIncludePhone(true);
                setLocalSelectedPhone(choice);
              }
              closeModal();
            }}
            phoneOptions={PHONE_OPTIONS}
          />
        )}
      </Modal>
    </div>
  );
}

/* --------------------- sub-components --------------------- */
function PhoneChooser({ selected, onCancel, onConfirm, phoneOptions }) {
  const [choice, setChoice] = useState(selected || "pack");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RadioCard checked={choice === "pack"} onChange={() => setChoice("pack")} title={phoneOptions.pack.title} details={phoneOptions.pack.details} />
        <RadioCard checked={choice === "payg"} onChange={() => setChoice("payg")} title={phoneOptions.payg.title} details={phoneOptions.payg.details} />
      </div>
      <div className="mt-4 flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
        <button className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50" onClick={onCancel}>Cancel</button>
        <button className="rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-95" style={{ background: BRAND }} onClick={() => onConfirm(choice)}>
          {selected ? "Update" : "Add phone"}
        </button>
      </div>
    </div>
  );
}

function RadioCard({ checked, onChange, title, details }) {
  return (
    <label
      className={`block cursor-pointer rounded-2xl border-2 p-4 shadow-sm transition ${
        checked ? "border-[color:var(--brand)] ring-2 ring-[color:var(--brand)]" : "border-gray-200 hover:border-[color:var(--brand)]"
      } bg-white`}
      style={{ ["--brand"]: BRAND }}
    >
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
            checked ? "border-[color:var(--brand)] bg-[color:var(--brand)]" : "border-gray-300 bg-white"
          }`}
          style={{ ["--brand"]: BRAND }}
        >
          {checked && <CheckIcon className="h-3 w-3 text-white" />}
        </span>
        <div className="font-semibold text-gray-900">{title}</div>
      </div>
      <ul className="ml-4 list-disc space-y-1 text-sm text-gray-700">
        {details.map((d, i) =>
          Array.isArray(d) ? (
            <li key={i}><span className="font-medium">{d[0]} </span>{d[1]}</li>
          ) : (
            <li key={i}>{d}</li>
          )
        )}
      </ul>
    </label>
  );
}

function CheckIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8.5 12.086 6.207 9.793a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
    </svg>
  );
}

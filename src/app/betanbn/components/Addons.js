"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

/* ---------------------------------------------------------
   Static options (outside to avoid re-creation each render)
--------------------------------------------------------- */
const MODEM_OPTIONS = {
  modem: {
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
  extender: {
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

/* ---------- layout constants for consistent sizing ---------- */
const CARD_MIN_H = 290; // overall minimum height for every card
const IMG_BOX_H = 120;  // fixed image box height so cards don't jump

/**
 * Addons (Modem + Extender + Phone)
 * Props:
 *  - value?: { includeModem?, selectedModems?, includePhone?, selectedPhone? }
 *  - onChange?: (nextValue) => void
 */
export default function Addons({ value = {}, onChange }) {
  /* ---------- controlled / local state ---------- */
  const [localIncludeModem, setLocalIncludeModem] = useState(value.includeModem ?? null);
  const [localSelectedModems, setLocalSelectedModems] = useState(value.selectedModems ?? []);
  useEffect(() => {
    if (value.includeModem !== undefined) setLocalIncludeModem(value.includeModem);
  }, [value.includeModem]);
  useEffect(() => {
    if (value.selectedModems !== undefined) setLocalSelectedModems(value.selectedModems);
  }, [value.selectedModems]);

  const includeModem = value.includeModem ?? localIncludeModem;
  const selectedModems = value.selectedModems ?? localSelectedModems;

  // If includeModem toggled off externally, clear any selected modem/extender
  useEffect(() => {
    if (includeModem === false && selectedModems.length > 0) {
      if (onChange) onChange({ ...value, includeModem: false, selectedModems: [] });
      else setLocalSelectedModems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeModem]);

  const [localIncludePhone, setLocalIncludePhone] = useState(value.includePhone ?? null);
  const [localSelectedPhone, setLocalSelectedPhone] = useState(value.selectedPhone ?? "pack");
  useEffect(() => {
    if (value.includePhone !== undefined) setLocalIncludePhone(value.includePhone);
  }, [value.includePhone]);
  useEffect(() => {
    if (value.selectedPhone !== undefined) setLocalSelectedPhone(value.selectedPhone);
  }, [value.selectedPhone]);

  const includePhone = value.includePhone ?? localIncludePhone;
  const selectedPhone = value.selectedPhone ?? localSelectedPhone;

  /* ---------- helpers ---------- */
  const isModemSelected = selectedModems.includes("modem");
  const isExtenderSelected = selectedModems.includes("extender");

  const emit = (patch) => onChange && onChange({ ...value, ...patch });

  // Unique, logic-preserving setter for modem selections
  const setSelectedModems = (next) => {
    const unique = Array.from(new Set(next));
    const hasAny = unique.length > 0;
    if (onChange) {
      emit({ selectedModems: unique, includeModem: hasAny });
    } else {
      setLocalSelectedModems(unique);
      setLocalIncludeModem(hasAny);
    }
  };

  /* ---------- single modal controller ---------- */
  // modal: null | "modem" | "extender" | "phone"
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  // Close modal with ESC
// Prevent body scroll while modal is open
useEffect(() => {
  if (!modal) return;
  const { style } = document.body;
  const prev = style.overflow;
  style.overflow = "hidden";
  return () => { style.overflow = prev; };
}, [modal]);

  /* ---------- shared UI shell for consistent card sizing ---------- */
  const CardShell = ({ children, highlight = false }) => (
    <div
      className={`relative h-full rounded-2xl p-[1px] shadow-sm transition ${
        highlight ? "bg-gradient-to-b from-white to-gray-100" : "bg-gradient-to-b from-gray-200 to-gray-100"
      } hover:shadow-md`}
      style={{ minHeight: CARD_MIN_H }}
    >
      <div className="relative flex h-full flex-col rounded-[15px] border border-gray-100 bg-white p-4">
        {children}
      </div>
    </div>
  );

  /* ---------- UI atoms ---------- */
  const EmptyTile = ({ label, onClick, disabled, hint }) => (
    <CardShell>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`group flex h-full flex-1 flex-col items-center justify-center gap-3 rounded-[12px] border-2 border-dashed p-4 text-center transition ${
          disabled
            ? "cursor-not-allowed border-gray-200 text-gray-400"
            : "border-gray-300 hover:border-[#1DA6DF] hover:bg-[#f0faff]"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl ${
            disabled ? "border-gray-200" : "border-gray-300 group-hover:border-[#1DA6DF]"
          }`}
        >
          +
        </div>
        <div className="text-sm font-semibold">{label}</div>

        {hint && (
          <div className="mt-auto w-full px-2 text-center text-xs text-gray-500">{hint}</div>
        )}
      </button>
    </CardShell>
  );

  const SelectedCard = ({ title, img, subtitle, price, note, details, onRemove, secondary }) => (
    <CardShell highlight>
      {/* Ribbon */}
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#1DA6DF]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1DA6DF]">
        Added
      </div>

      <div className="flex gap-4">
        {img ? (
          <div className="shrink-0">
            {/* Fixed image box to avoid card height shifts */}
            <div className="flex h-[--imgH] w-[--imgH] items-center justify-center rounded-lg bg-gray-50"
                 style={{ ["--imgH"]: `${IMG_BOX_H}px` }}>
              <Image
                unoptimized
                src={img}
                alt={title}
                width={IMG_BOX_H}
                height={IMG_BOX_H}
                className="object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="shrink-0" style={{ width: IMG_BOX_H, height: IMG_BOX_H }} />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <h4 className="truncate text-base font-semibold text-gray-900">{title}</h4>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>

          {!!details?.length && (
            <div className="mt-2 text-sm text-gray-700">
              <ul className="ml-4 list-disc space-y-1">
                {details.map((d, i) =>
                  Array.isArray(d) ? (
                    <li key={i}>
                      <span className="font-medium">{d[0]}</span> {d[1]}
                    </li>
                  ) : (
                    <li key={i}>{d}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {(price || note) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {price && (
                <span className="inline-flex items-center rounded-full bg-[#1DA6DF]/10 px-2 py-0.5 text-xs font-semibold text-[#1DA6DF]">
                  {price}
                </span>
              )}
              {note && <span className="text-xs text-gray-500">{note}</span>}
            </div>
          )}

          {/* actions pinned bottom: keep heights identical */}
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-[#1DA6DF] px-3 py-2 text-xs font-semibold text-white shadow-sm"
              disabled
              aria-disabled="true"
            >
              <CheckIcon className="h-4 w-4" /> Selected
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
            >
              Remove
            </button>
            {secondary}
          </div>
        </div>
      </div>
    </CardShell>
  );

  // Center with CSS grid (no translate), animate scale/opacity, stop click bubbling
const Modal = ({ open, onClose, title, children }) =>
  !open ? null : (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      <div
        className="relative w-[95vw] max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-[modalIn_140ms_ease-out_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA6DF]/50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>

      {/* Smooth in without moving position */}
      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.98); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );


  const OptionDetails = ({ opt, onConfirm, onCancel }) => (
    <div className="flex gap-4">
      <div className="hidden shrink-0 sm:block">
        <div className="flex h-[--imgH] w-[--imgH] items-center justify-center rounded-lg bg-gray-50"
             style={{ ["--imgH"]: `${IMG_BOX_H + 60}px` }}>
          <Image
            unoptimized
            src={opt.img}
            alt={opt.title}
            width={IMG_BOX_H + 60}
            height={IMG_BOX_H + 60}
            className="object-contain"
            loading="lazy"
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h4 className="text-lg font-semibold text-gray-900">{opt.title}</h4>
        {opt.subtitle && <p className="text-sm text-gray-500">{opt.subtitle}</p>}
        <ul className="ml-4 mt-3 list-disc space-y-1 text-sm text-gray-700">
          {opt.details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#1DA6DF]/10 px-2 py-0.5 text-xs font-semibold text-[#1DA6DF]">
            {opt.price}
          </span>
          {opt.note && <span className="text-xs text-gray-500">{opt.note}</span>}
        </div>
        <div className="mt-6 ml-auto flex gap-2">
          <button className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="rounded-md bg-[#1DA6DF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f7fb3]"
            onClick={onConfirm}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  /* ---------- render ---------- */
  const summary = [
    isModemSelected ? "Modem" : null,
    isExtenderSelected ? "Extender" : null,
    includePhone ? (selectedPhone === "pack" ? "Phone: Unlimited Pack" : "Phone: PAYG") : null,
  ].filter(Boolean);

  return (
    <div className="space-y-10">
      <header className="text-center">
        <h2 className="text-2xl font-extrabold md:text-3xl">
          Enhance your plan with some <span className="text-[#1DA6DF]">extras</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">Choose a modem, add an extender, and pick a phone option.</p>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {/* Modem */}
        {isModemSelected ? (
          <SelectedCard
            {...MODEM_OPTIONS.modem}
            onRemove={() => {
              // Removing modem also removes extender (original behavior)
              const next = selectedModems.filter((x) => x !== "modem" && x !== "extender");
              setSelectedModems(next);
            }}
            secondary={
              <button
                className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
                onClick={() => setModal("modem")}
                type="button"
              >
                View details
              </button>
            }
          />
        ) : (
          <EmptyTile label="Add a modem" onClick={() => setModal("modem")} />
        )}

        {/* Extender */}
        {isExtenderSelected ? (
          <SelectedCard
            {...MODEM_OPTIONS.extender}
            onRemove={() => setSelectedModems(selectedModems.filter((x) => x !== "extender"))}
            secondary={
              <button
                className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
                onClick={() => setModal("extender")}
                type="button"
              >
                View details
              </button>
            }
          />
        ) : (
          <EmptyTile
            label="Add an extender"
            disabled={!isModemSelected}
            onClick={() => isModemSelected && setModal("extender")}
            hint={!isModemSelected ? "Select the modem first to enable the extender option." : undefined}
          />
        )}

        {/* Phone */}
        {includePhone === true ? (
          <SelectedCard
            title={selectedPhone === "pack" ? PHONE_OPTIONS.pack.title : PHONE_OPTIONS.payg.title}
            img={undefined}
            price={selectedPhone === "pack" ? "$10 / month" : undefined}
            details={selectedPhone === "pack" ? PHONE_OPTIONS.pack.details : PHONE_OPTIONS.payg.details}
            onRemove={() =>
              onChange ? onChange({ ...value, includePhone: false }) : setLocalIncludePhone(false)
            }
            secondary={
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
                onClick={() => setModal("phone")}
              >
                Change
              </button>
            }
          />
        ) : (
          <EmptyTile label="Phone service" onClick={() => setModal("phone")} />
        )}
      </div>

      {/* Summary (purely visual, no logic change) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {summary.length === 0 ? (
          <span className="text-xs text-gray-500">No extras selected yet.</span>
        ) : (
          summary.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-[#1DA6DF]/30 bg-[#1DA6DF]/5 px-2.5 py-1 text-[11px] font-semibold text-[#1DA6DF]"
            >
              <CheckIcon className="h-3.5 w-3.5" /> {t}
            </span>
          ))
        )}
      </div>

      {/* Single modal for all three cases */}
      <Modal
        open={modal !== null}
        onClose={closeModal}
        title={
          modal === "modem"
            ? "Add a Modem"
            : modal === "extender"
            ? "Add an Extender"
            : modal === "phone"
            ? "Phone service"
            : ""
        }
      >
        {modal === "modem" && (
          <OptionDetails
            opt={MODEM_OPTIONS.modem}
            onCancel={closeModal}
            onConfirm={() => {
              if (!isModemSelected) setSelectedModems([...selectedModems, "modem"]);
              closeModal();
            }}
          />
        )}

        {modal === "extender" && (
          <OptionDetails
            opt={MODEM_OPTIONS.extender}
            onCancel={closeModal}
            onConfirm={() => {
              if (!isModemSelected) return; // guard: extender depends on modem
              if (!isExtenderSelected) setSelectedModems([...selectedModems, "extender"]);
              closeModal();
            }}
          />
        )}

        {modal === "phone" && (
          <PhoneChooser
            selected={selectedPhone}
            onCancel={closeModal}
            onConfirm={(choice) => {
              if (onChange) onChange({ ...value, includePhone: true, selectedPhone: choice });
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

/* ---------- Extracted phone chooser (logic unchanged) ---------- */
function PhoneChooser({ selected, onCancel, onConfirm, phoneOptions }) {
  const [choice, setChoice] = useState(selected || "pack");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RadioCard
          checked={choice === "pack"}
          onChange={() => setChoice("pack")}
          title={phoneOptions.pack.title}
          details={phoneOptions.pack.details}
        />
        <RadioCard
          checked={choice === "payg"}
          onChange={() => setChoice("payg")}
          title={phoneOptions.payg.title}
          details={phoneOptions.payg.details}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="rounded-md bg-[#1DA6DF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f7fb3]"
          onClick={() => onConfirm(choice)}
        >
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
        checked
          ? "border-[#1DA6DF] ring-2 ring-[#1DA6DF]"
          : "border-gray-200 hover:border-[#1DA6DF]"
      } bg-white`}
    >
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
            checked ? "border-[#1DA6DF] bg-[#1DA6DF]" : "border-gray-300 bg-white"
          }`}
        >
          {checked && <CheckIcon className="h-3 w-3 text-white" />}
        </span>
        <div className="font-semibold text-gray-900">{title}</div>
      </div>
      <ul className="ml-4 list-disc space-y-1 text-sm text-gray-700">
        {details.map((d, i) =>
          Array.isArray(d) ? (
            <li key={i}>
              <span className="font-medium">{d[0]}</span> {d[1]}
            </li>
          ) : (
            <li key={i}>{d}</li>
          )
        )}
      </ul>
    </label>
  );
}

/* ---------- tiny icon ---------- */
function CheckIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 00-1.414 0L8.5 12.086 6.207 9.793a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

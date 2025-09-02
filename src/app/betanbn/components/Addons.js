"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Addons (Modem + Extender + Phone)
 * Props:
 *  - value?: { includeModem?, selectedModems?, includePhone?, selectedPhone? }
 *  - onChange?: (nextValue) => void
 */
export default function Addons({ value = {}, onChange }) {
  /* ---------- data ---------- */
  const modemOptions = {
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

  const phoneOptions = {
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

  // If includeModem is toggled off externally, clear any selected modem/extender
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

  // Always flip includeModem to true if there is at least one device, else false
  const setSelectedModems = (next) => {
    const hasAny = next.length > 0;
    if (onChange) {
      emit({ selectedModems: next, includeModem: hasAny });
    } else {
      setLocalSelectedModems(next);
      setLocalIncludeModem(hasAny);
    }
  };

  /* ---------- single modal controller ---------- */
  // modal: null | "modem" | "extender" | "phone"
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  // phone chooser temp state (only used when modal === "phone")
  const [tempPhone, setTempPhone] = useState(selectedPhone);
  useEffect(() => {
    if (modal === "phone") setTempPhone(selectedPhone);
  }, [modal, selectedPhone]);

  /* ---------- UI atoms ---------- */
const EmptyTile = ({ label, onClick, disabled, hint }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative h-full min-h-[240px] w-full rounded-xl border-2 border-dashed
        flex flex-col items-center justify-center gap-3 p-4 transition
        ${
          disabled
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 hover:border-[#1DA6DF] hover:bg-[#f0faff]"
        }`}
    >
      <div
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl
          ${disabled ? "border-gray-200" : "border-gray-300"}`}
      >
        +
      </div>
      <div className="text-sm">{label}</div>

      {/* inline hint anchored to bottom, doesn't change outer height */}
      {hint && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 text-center text-xs text-gray-500">
          {hint}
        </div>
      )}
    </button>
  );

  // SelectedCard now stretches and pins actions to bottom for consistent height
  const SelectedCard = ({ title, img, subtitle, price, note, details, onRemove, secondary }) => (
    <div className="flex h-full min-h-[240px] flex-col rounded-xl border-2 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        {img && (
          <div className="shrink-0">
            <Image src={img} alt={title} width={110} height={110} className="object-contain" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}

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
            <div className="mt-2">
              {price && <div className="font-semibold">{price}</div>}
              {note && <div className="text-xs text-gray-500">{note}</div>}
            </div>
          )}

          {/* push actions to bottom */}
          <div className="mt-auto flex gap-2 pt-3">
            <button type="button" className="rounded-md bg-[#1DA6DF] px-4 py-2 font-semibold text-white" disabled aria-disabled>
              Selected
            </button>
            <button type="button" onClick={onRemove} className="rounded-md border border-gray-300 px-4 py-2">
              Remove
            </button>
            {secondary}
          </div>
        </div>
      </div>
    </div>
  );

  const Modal = ({ open, onClose, title, children }) =>
    !open ? null : (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">{title}</h3>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );

  const OptionDetails = ({ opt, onConfirm, onCancel }) => (
    <div className="flex gap-4">
      <div className="hidden shrink-0 sm:block">
        <Image src={opt.img} alt={opt.title} width={160} height={160} className="object-contain" />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold">{opt.title}</h4>
        {opt.subtitle && <p className="text-sm text-gray-500">{opt.subtitle}</p>}
        <ul className="ml-4 mt-3 list-disc space-y-1 text-sm text-gray-700">
          {opt.details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
        <div className="mt-4">
          <div className="font-semibold">{opt.price}</div>
          {opt.note && <div className="text-xs text-gray-500">{opt.note}</div>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-md border px-4 py-2" onClick={onCancel}>
            Cancel
          </button>
          <button className="rounded-md bg-[#1DA6DF] px-4 py-2 font-semibold text-white" onClick={onConfirm}>
            Add
          </button>
        </div>
      </div>
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold md:text-3xl">
          Enhance your plan with some <span className="text-[#1DA6DF]">extras</span>
        </h2>
      </div>

      {/* Stretch children to equal heights */}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {/* Modem */}
        {isModemSelected ? (
          <SelectedCard
            {...modemOptions.modem}
            onRemove={() => {
              const next = selectedModems.filter((x) => x !== "modem" && x !== "extender");
              setSelectedModems(next);
            }}
            secondary={
              <button className="rounded-md border border-gray-300 px-4 py-2" onClick={() => setModal("modem")}>
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
            {...modemOptions.extender}
            onRemove={() => setSelectedModems(selectedModems.filter((x) => x !== "extender"))}
            secondary={
              <button className="rounded-md border border-gray-300 px-4 py-2" onClick={() => setModal("extender")}>
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

        {/* Phone (no image) */}
        {includePhone === true ? (
          <SelectedCard
            title={selectedPhone === "pack" ? phoneOptions.pack.title : phoneOptions.payg.title}
            img={undefined}
            price={selectedPhone === "pack" ? "$10 / month" : undefined}
            details={selectedPhone === "pack" ? phoneOptions.pack.details : phoneOptions.payg.details}
            onRemove={() => (onChange ? onChange({ ...value, includePhone: false }) : setLocalIncludePhone(false))}
            secondary={
              <button type="button" className="rounded-md border border-gray-300 px-4 py-2" onClick={() => setModal("phone")}>
                Change
              </button>
            }
          />
        ) : (
          <EmptyTile label="Phone service" onClick={() => setModal("phone")} />
        )}
      </div>

      {/* ONE modal for all three cases (unchanged content) */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "modem" ? "Add a Modem" : modal === "extender" ? "Add an Extender" : modal === "phone" ? "Phone service" : ""}
      >
        {modal === "modem" && (
          <OptionDetails
            opt={modemOptions.modem}
            onCancel={() => setModal(null)}
            onConfirm={() => {
              if (!isModemSelected) setSelectedModems([...selectedModems, "modem"]);
              setModal(null);
            }}
          />
        )}

        {modal === "extender" && (
          <OptionDetails
            opt={modemOptions.extender}
            onCancel={() => setModal(null)}
            onConfirm={() => {
              if (!isModemSelected) return;
              if (!isExtenderSelected) setSelectedModems([...selectedModems, "extender"]);
              setModal(null);
            }}
          />
        )}

        {modal === "phone" && (
          <PhoneChooser
            selected={selectedPhone}
            onCancel={() => setModal(null)}
            onConfirm={(choice) => {
              if (onChange) onChange({ ...value, includePhone: true, selectedPhone: choice });
              else {
                setLocalIncludePhone(true);
                setLocalSelectedPhone(choice);
              }
              setModal(null);
            }}
            phoneOptions={phoneOptions}
          />
        )}
      </Modal>
    </div>
  );
}

/* Extracted phone chooser to keep the modal lean (same logic) */
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
        <button className="rounded-md border px-4 py-2" onClick={onCancel}>
          Cancel
        </button>
        <button className="rounded-md bg-[#1DA6DF] px-4 py-2 font-semibold text-white" onClick={() => onConfirm(choice)}>
          {selected ? "Update" : "Add phone"}
        </button>
      </div>
    </div>
  );
}

function RadioCard({ checked, onChange, title, details }) {
  return (
    <label
      className={`cursor-pointer rounded-xl border-2 p-4 transition ${
        checked ? "border-[#1DA6DF] ring-2 ring-[#1DA6DF]" : "border-gray-200 hover:border-[#1DA6DF]"
      }`}
    >
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <div className="mb-2 font-semibold">{title}</div>
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
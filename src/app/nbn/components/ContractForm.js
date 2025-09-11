"use client";

import React, { useEffect, useState, useCallback } from "react";
// NEW: use your bridge if present (safe to keep even if not used elsewhere)
import { notifyParentModal as _notifyParentModal } from "@/utils/embedBridge";

/* ---------- Constants ---------- */
const TITLES = ["Mr", "Mrs", "Ms"];
const PRIMARY = "#1DA6DF";

const MODEM_OPTIONS = [
  { id: "modem", title: "Gigabit WiFi-6 MESH 1800Mbps Modem", price: 170 },
  { id: "extender", title: "Gigabit WiFi-6 MESH 1800Mbps Extender", price: 120 },
];

const PHONE_OPTIONS = [
  { id: "payg", title: "Pay-as-you-go call rates", price: 0 },
  { id: "pack", title: "$10/mth Unlimited call pack", price: 10 },
];

const PBX_HANDSETS = [
  { name: "Yealink T31G", cost: 129 },
  { name: "Yealink T43U", cost: 259 },
  { name: "Yealink T54W", cost: 399 },
  { name: "Yealink WH62 Mono", cost: 205 },
  { name: "Yealink WH62 Dual", cost: 235 },
  { name: "Yealink BH72", cost: 355 },
];

/* ---------- Reusable UI ---------- */
const Modal = ({ open, title, onClose, children }) =>
  !open ? null : (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-white" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[96vw] max-w-4xl -translate-x-1/2 -translate-y-1/2">
        <div className="max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-xl font-bold">{title}</h3>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

// Buttons that match your sample
const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-[--primary] text-white px-5 py-2.5 font-semibold shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[--primary]/40";
const btnSecondary =
  "inline-flex items-center justify-center rounded-lg bg-white text-gray-800 border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[--primary]/30";
const pill = (active) =>
  `rounded-full px-5 py-2 font-medium transition ${
    active
      ? "bg-[--primary] text-white shadow-sm"
      : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
  }`;

/* ---------- Light toast for warnings ---------- */
function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 z-[80] max-w-sm rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 shadow">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none">⚠️</span>
        <div className="text-sm">{message}</div>
        <button
          className="ml-auto rounded-md border border-amber-300 px-2 py-0.5 text-xs hover:bg-amber-100"
          onClick={onClose}
          aria-label="Dismiss"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function ContractForm({
  serviceAddress = "",
  selectedPlan = null,
  extras = {},
  onSuccess,
  onRestart,
  onSubmitSuccess,
  connectionType, // kept for compatibility, not used anymore
}) {
  const today = new Date().toISOString().split("T")[0];

  const [open, setOpen] = useState(false);

  // NEW: preflight warning message before opening modal
  const [preflightWarning, setPreflightWarning] = useState("");

  const [form, setForm] = useState({
    title: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    dob: "",
    serviceAddress,
    // NEW: Business fields
    businessName: "",
    businessAddress: "",
    // ---
    activateASAP: true,
    activationDate: "",
    deliverySame: true,
    deliveryAddress: "",
    deliveryName: "",
    companyName: "",
    keepPhone: false,
    phoneNumber: "",
    transferVoip: false,
    accountNumber: "",
  });

  // small pbx note on sticky bar
  const [pbxMonthlyPreview, setPbxMonthlyPreview] = useState(0);
  const [pbxUpfrontPreview, setPbxUpfrontPreview] = useState(0);

  const [submitSuccess, setSubmitSuccess] = useState(false);

  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");

  /* ---------- NEW: notify parent about modal open/close ---------- */
  const notifyParent = useCallback(
    (isOpen) => {
      try {
        // Preferred: your bridge helper if it exists
        if (typeof _notifyParentModal === "function") {
          _notifyParentModal(isOpen, { title: "Complete your order" });
          return;
        }
      } catch (_) {}

      // Fallback: postMessage for iframe parents
      try {
        if (typeof window !== "undefined" && window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              __embed: "nbn",
              type: "modal",
              open: isOpen,
              title: "Complete your order",
            },
            "*"
          );
        }
      } catch (_) {}
    },
    []
  );

  useEffect(() => {
    notifyParent(open);
  }, [open, notifyParent]);

  /* ---------- SYNC: serviceAddress prop → form.serviceAddress ---------- */
  useEffect(() => {
    setForm((f) => ({ ...f, serviceAddress }));
  }, [serviceAddress]);

  /* ---------- SYNC: deliverySame + serviceAddress → deliveryAddress ---------- */
  // 1) When serviceAddress changes, keep deliveryAddress in sync if deliverySame is on
  useEffect(() => {
    setForm((f) => {
      if (!f.deliverySame) return f;
      if (f.deliveryAddress === serviceAddress) return f;
      return { ...f, deliveryAddress: serviceAddress || "" };
    });
  }, [serviceAddress]);

  // Optional: countdown for resend timer (preserves original behavior if omitted)
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // 2) When user toggles deliverySame, copy the service address immediately on TRUE
  const handleChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => {
      if (key !== "deliverySame") return { ...prev, [key]: value };
      const nextDelivery = value
        ? serviceAddress || prev.serviceAddress || ""
        : prev.deliveryAddress;
      return { ...prev, deliverySame: value, deliveryAddress: nextDelivery };
    });
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/30";

  const normalizePhoneNumber = (input) => {
    let phone = (input || "").trim();
    if (phone.startsWith("88") || phone.startsWith("+88")) {
      if (!phone.startsWith("+")) phone = "+" + phone;
      return phone;
    }
    if (phone.startsWith("0")) phone = phone.slice(1);
    if (phone.startsWith("+")) phone = phone.slice(1);
    return "+61" + phone;
  };

  const sendOtp = async (method = "sms") => {
    setLoading(true);
    setError("");
    try {
      const phone = normalizePhoneNumber(form.contactNumber);
      const res = await fetch("/api/contract-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, channel: method }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setResendTimer(30);
      } else {
        setError(data?.error || "Failed to send OTP");
      }
    } catch {
      setError("Failed to send OTP");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const phone = normalizePhoneNumber(form.contactNumber);
      const res = await fetch("/api/contract-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) setOtpVerified(true);
      else setError(data?.error || "Invalid OTP");
    } catch {
      setError("Failed to verify OTP");
    }
    setLoading(false);
  };

  /* ---------- NEW: preflight check before opening modal ---------- */
  const canOpenModal = () => {
    const hasAddress = Boolean((serviceAddress || "").trim());
    const hasPlan =
      !!selectedPlan &&
      (selectedPlan.id ||
        selectedPlan.name ||
        selectedPlan.subtitle ||
        typeof selectedPlan.price !== "undefined" ||
        typeof selectedPlan.discountPrice !== "undefined" ||
        selectedPlan.speed);

    if (!hasAddress && !hasPlan) {
      setPreflightWarning("Please select a service address and an NBN plan before completing your order.");
      return false;
    }
    if (!hasAddress) {
      setPreflightWarning("Please select a service address before completing your order.");
      return false;
    }
    if (!hasPlan) {
      setPreflightWarning("Please select an NBN plan before completing your order.");
      return false;
    }
    setPreflightWarning("");
    return true;
  };

  const handleOpenClick = () => {
    if (canOpenModal()) setOpen(true);
  };

  /* ---------- Order items + payload ---------- */
  const buildOrderItems = () => {
    const items = [];

    // Plan first
    const planPrice =
      typeof selectedPlan?.discountPrice !== "undefined"
        ? Number(selectedPlan.discountPrice)
        : typeof selectedPlan?.price !== "undefined"
        ? Number(selectedPlan.price)
        : 0;

    if (planPrice > 0 || selectedPlan?.subtitle || selectedPlan?.name) {
      items.push({
        key: selectedPlan?.subtitle || selectedPlan?.name || "Plan",
        value: 1,
        price: planPrice,
      });
    }

    // Modems
    (extras?.modems || []).forEach((id) => {
      const m = MODEM_OPTIONS.find((x) => x.id === id);
      if (m) items.push({ key: m.title, value: 1, price: m.price });
    });

    // Phone service
    if (extras?.phone) {
      const p = PHONE_OPTIONS.find((x) => x.id === extras.phone);
      if (p) items.push({ key: p.title, value: 1, price: p.price });
    }

    // PBX plan
    if (extras?.pbx?.selectedPlan && Number(extras.pbx.numUsers) > 0) {
      const perUser =
        extras.pbx.selectedPlan === "Hosted UNLIMITED"
          ? 33.0
          : extras.pbx.selectedPlan === "Hosted PAYG"
          ? 5.5
          : 0;

      items.push({
        key: `${extras.pbx.selectedPlan}`,
        value: Number(extras.pbx.numUsers),
        price: perUser,
      });
    }

    // PBX handsets
    if (extras?.pbx?.handsets) {
      Object.entries(extras.pbx.handsets)
        .filter(([, qty]) => Number(qty) > 0)
        .forEach(([model, qty]) => {
          const h = PBX_HANDSETS.find((x) => x.name === model);
          if (h) items.push({ key: model, value: Number(qty), price: h.cost });
        });
    }

    // PBX notes for sticky bar
    let perUser =
      extras?.pbx?.selectedPlan === "Hosted UNLIMITED"
        ? 33
        : extras?.pbx?.selectedPlan === "Hosted PAYG"
        ? 5.5
        : 0;

    const monthly = (Number(extras?.pbx?.numUsers) || 0) * perUser;
    const upfront = Object.entries(extras?.pbx?.handsets || {}).reduce(
      (sum, [model, qty]) => {
        const h = PBX_HANDSETS.find((x) => x.name === model);
        return sum + (h ? h.cost * Number(qty || 0) : 0);
      },
      0
    );
    setPbxMonthlyPreview(monthly);
    setPbxUpfrontPreview(upfront);

    return items;
  };

  const buildPayload = () => {
    const plan = selectedPlan || {};
    const activationDateValue =
      form.activateASAP || !form.activationDate ? "ASAP" : form.activationDate;
    const deliveryAddressValue = form.deliverySame
      ? form.serviceAddress
      : form.deliveryAddress;

    const items = buildOrderItems();
    const total = items.reduce((s, it) => s + it.price * it.value, 0);

    const payload = {
      contactDetails: {
        title: form.title,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        contactNumber: form.contactNumber,
        dob: form.dob,
      },
      // include business fields
      businessDetails: {
        businessName: form.businessName,
        businessAddress: form.businessAddress,
      },
      connectionDetails: {
        serviceAddress: form.serviceAddress,
        activationDate: activationDateValue,
        planSpeed: plan.speed || "",
        planName: plan.name || "",
        planId: plan.id || "",
      },
      deliveryDetails: {
        deliveryAddress: deliveryAddressValue,
        deliveryName: form.deliveryName,
        companyName: form.companyName,
      },
      phoneDetails: {
        keepPhone: form.keepPhone,
        phoneNumber: form.phoneNumber,
        transferVoip: form.transferVoip,
        accountNumber: form.accountNumber,
      },
      pricing: { total },
      rawForm: form,
      rawSelections: { selectedPlan, extras },
    };

    // data1..data10 in order
    items
      .filter((f) => f.value > 0)
      .slice(0, 10)
      .forEach((item, i) => {
        const idx = i + 1;
        const subtotal = Number((item.price * item.value).toFixed(2));
        payload[`data${idx}`] = item.key;
        payload[`data${idx}Value`] = item.value;
        payload[`data${idx}Price`] = item.price;
        payload[`data${idx}Subtotal`] = subtotal;
      });

    return payload;
  };

  /* ---------- Submit flow ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // step 1: send OTP
    if (!otpSent) {
      if (!form.contactNumber || form.contactNumber.trim().length < 6) {
        setError("Please enter a valid contact number before verifying.");
        return;
      }
      await sendOtp();
      return;
    }

    // must verify
    if (!otpVerified) {
      setError("Please verify the OTP sent to your contact number.");
      return;
    }

    // final submit
    setLoading(true);
    setError("");
    const payload = buildPayload();

    try {
      // Always use the PBX contract endpoint
      const apiRoute = "/api/nbnpbx-contract";
      const res = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setForm({
          title: "Mr",
          firstName: "",
          lastName: "",
          email: "",
          contactNumber: "",
          dob: "",
          serviceAddress,
          // reset business fields
          businessName: "",
          businessAddress: "",
          activateASAP: true,
          activationDate: "",
          deliverySame: true,
          deliveryAddress: "",
          deliveryName: "",
          companyName: "",
          keepPhone: false,
          phoneNumber: "",
          transferVoip: false,
          accountNumber: "",
        });
        setOtpSent(false);
        setOtp("");
        setOtpVerified(false);
        onSuccess?.();
        onSubmitSuccess?.();
      } else {
        const data = await res.json();
        setError(data?.error || "Failed to submit contract.");
      }
    } catch {
      setError("Failed to submit contract.");
    }
    setLoading(false);
  };

  /* ---------- Render ---------- */
  return (
    <div style={{ "--primary": PRIMARY }}>
      {/* Page CTA that opens the modal (toast inline beside it) */}
      <div className="flex justify-end items-center gap-4">
        {preflightWarning && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2">
            <h1 className="text-sm font-medium text-red-600">{preflightWarning}</h1>
            <button
              type="button"
              onClick={() => setPreflightWarning("")}
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <button
          type="button"
          className="rounded-md bg-[#1DA6DF] px-4 py-2 font-semibold text-white"
          onClick={handleOpenClick}
        >
          Complete order
        </button>
      </div>

      {/* Modal with the full submit form */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Complete your order"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* loading overlay */}
          {loading && !submitSuccess && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/70">
              <div className="flex flex-col items-center">
                <svg
                  className="mb-4 h-10 w-10 animate-spin text-[--primary]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-lg font-semibold text-[--primary]">Submitting…</span>
              </div>
            </div>
          )}

          {/* success */}
          {submitSuccess ? (
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="mb-6 rounded bg-green-100 px-4 py-3 text-center font-semibold text-green-800">
                Form submit complete
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => {
                    setSubmitSuccess(false);
                    onRestart?.();
                  }}
                >
                  Submit another one
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Contact Details */}
              <div className="space-y-6 rounded-2xl bg-white p-6 shadow">
                <h2 className="text-2xl font-semibold text-[--primary]">Contact Details</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <select
                      className={inputClasses}
                      value={form.title}
                      onChange={handleChange("title")}
                      disabled={otpSent && !otpVerified}
                    >
                      {TITLES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      className={inputClasses}
                      value={form.firstName}
                      onChange={handleChange("firstName")}
                      required
                      disabled={otpSent && !otpVerified}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      className={inputClasses}
                      value={form.lastName}
                      onChange={handleChange("lastName")}
                      required
                      disabled={otpSent && !otpVerified}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      className={inputClasses}
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                      disabled={otpSent && !otpVerified}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number <span className="text-xs text-gray-500">(Mobile or Home)</span>
                    </label>
                    <input
                      type="tel"
                      className={inputClasses}
                      value={form.contactNumber}
                      onChange={handleChange("contactNumber")}
                      required
                      placeholder="e.g. 0412345678 (AU)"
                      disabled={otpSent && !otpVerified}
                    />
                    <span className="text-xs text-gray-500">
                      Enter your number without country code (e.g. 412345678 or 0412345678).
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      className={inputClasses}
                      value={form.dob}
                      onChange={handleChange("dob")}
                      required
                      max={today}
                      disabled={otpSent && !otpVerified}
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-6 rounded-2xl bg-white p-6 shadow">
                <h2 className="text-2xl font-semibold text-[--primary]">Business Details</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                      type="text"
                      className={inputClasses}
                      value={form.businessName}
                      onChange={handleChange("businessName")}
                      placeholder="e.g. Acme Pty Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Address</label>
                    <input
                      type="text"
                      className={inputClasses}
                      value={form.businessAddress}
                      onChange={handleChange("businessAddress")}
                      placeholder="e.g. 123 King St, Sydney NSW 2000"
                    />
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="space-y-6 rounded-2xl bg-white p-6 shadow">
                <h2 className="text-2xl font-semibold text-[--primary]">Connection Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Address</label>
                    <input
                      type="text"
                      className={`${inputClasses} cursor-not-allowed bg-gray-100 text-black`}
                      value={form.serviceAddress}
                      readOnly
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Activate ASAP?</span>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, activateASAP: true }))}
                        className={`rounded-md px-4 py-2 font-semibold ${
                          form.activateASAP ? "bg-[#1DA6DF] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        ASAP
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, activateASAP: false }))}
                        className={`rounded-md px-4 py-2 font-semibold ${
                          !form.activateASAP ? "bg-[#1DA6DF] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Pick Date
                      </button>
                    </div>
                    {!form.activateASAP && (
                      <input
                        type="date"
                        className={`${inputClasses} mt-2`}
                        value={form.activationDate}
                        onChange={handleChange("activationDate")}
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-6 rounded-2xl bg-white p-6 shadow">
                <h2 className="text-2xl font-semibold text-[--primary]">Delivery Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-[--primary] focus:ring focus:ring-[--primary]/30"
                        checked={form.deliverySame}
                        onChange={handleChange("deliverySame")}
                      />
                      <span className="text-gray-700">Same as Service Address</span>
                    </label>

                    {!form.deliverySame && (
                      <input
                        type="text"
                        className={`${inputClasses} mt-2`}
                        placeholder="Delivery Address"
                        value={form.deliveryAddress}
                        onChange={handleChange("deliveryAddress")}
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name (Delivery)</label>
                      <input
                        type="text"
                        className={inputClasses}
                        value={form.deliveryName}
                        onChange={handleChange("deliveryName")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Company Name <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        className={inputClasses}
                        value={form.companyName}
                        onChange={handleChange("companyName")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OTP panel */}
              {otpSent && !otpVerified && (
                <div className="rounded-2xl border border-[--primary]/30 bg-white p-6 shadow">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter OTP sent to your contact number
                  </label>
                  <input
                    type="text"
                    className={`${inputClasses} mt-2`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={verifyOtp}
                      className="rounded-md bg-[#1DA6DF] px-4 py-2 font-semibold text-white"
                      disabled={loading || !otp.trim()}
                    >
                      {loading ? "Verifying…" : "Verify OTP"}
                    </button>
                    {resendTimer > 0 ? (
                      <span className="text-sm text-gray-500">Resend in {resendTimer}s</span>
                    ) : (
                      <>
                        <button type="button" onClick={() => sendOtp("sms")} className={btnSecondary}>
                          Resend via SMS
                        </button>
                        <button type="button" onClick={() => sendOtp("call")} className={btnSecondary}>
                          Send via Call
                        </button>
                      </>
                    )}
                  </div>
                  {error && <div className="mt-2 text-red-500">{error}</div>}
                </div>
              )}

              {/* Sticky submit bar */}
              <div className=" bottom-0 z-10 -mx-6 mt-6 bg-white/90 px-6 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:border-gray-200">
                <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {extras?.pbx && (pbxMonthlyPreview > 0 || pbxUpfrontPreview > 0) ? (
                    <div className="text-xs text-gray-600">
                      * PBX monthly: ${pbxMonthlyPreview.toFixed(2)} | First month upfront: $
                      {(pbxMonthlyPreview + pbxUpfrontPreview).toFixed(2)}
                    </div>
                  ) : (
                    <div />
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="rounded-md bg-[#1DA6DF] px-4 py-2 font-semibold text-white"
                      disabled={loading || (otpSent && !otpVerified)}
                      title={
                        !otpSent
                          ? "Sends an OTP to your number"
                          : otpVerified
                          ? "Submit your contract"
                          : "Verify the OTP to enable submission"
                      }
                    >
                      {otpSent ? (otpVerified ? "Submit Contract" : "Submit Contract") : "Verify & Submit"}
                    </button>
                    <button type="button" className={btnSecondary} onClick={() => setOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
                {error && !otpSent && (
                  <div className="mt-2 text-right text-sm text-red-500">{error}</div>
                )}
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}

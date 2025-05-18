// File: src/components/ContractForm.jsx
"use client";

import React, { useState, useEffect } from "react";

const TITLES = ["Mr", "Mrs", "Ms"];
const PRIMARY = "#1DA6DF";

export default function ContractForm({
  serviceAddress,
  selectedPlan,
  extras,
  onSuccess,
  onRestart,
  onSubmitSuccess,
}) {
  const [form, setForm] = useState({
    title: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    dob: "",
    serviceAddress: serviceAddress || "",
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
    planSpeed: "",
    includeModem: false,
    includePhoneService: false,
    packagePrice:
      selectedPlan && typeof selectedPlan.discountPrice !== "undefined"
        ? selectedPlan.discountPrice
        : 0,
    modemPrice: 0,
    phoneServicePrice: 0,
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // sync serviceAddress prop
  useEffect(() => {
    setForm((f) => ({ ...f, serviceAddress: serviceAddress || "" }));
  }, [serviceAddress]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  // OTP state and logic
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSendOtp = async (method = "sms") => {
    setLoading(true);
    setError("");
    try {
      // Normalize phone number: trim and ensure leading +
      let normalizedPhone = form.contactNumber.trim();
      if (!normalizedPhone.startsWith("+"))
        normalizedPhone = "+" + normalizedPhone;
      const res = await fetch("/api/contract-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, method }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setResendTimer(30);
      } else {
        setError(data?.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      // Normalize phone number: trim and ensure leading +
      let normalizedPhone = form.contactNumber.trim();
      if (!normalizedPhone.startsWith("+"))
        normalizedPhone = "+" + normalizedPhone;
      const res = await fetch("/api/contract-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code: otp }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setOtpVerified(true);
      } else {
        setError(data?.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Failed to verify OTP");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      // First step: send OTP to the contact number
      if (!form.contactNumber || form.contactNumber.trim().length < 6) {
        setError("Please enter a valid contact number before verifying.");
        return;
      }
      await handleSendOtp();
      return;
    }
    if (!otpVerified) {
      setError("Please verify the OTP sent to your contact number.");
      return;
    }
    // Final submit
    setLoading(true);
    // Build activationDate logic
    let activationDateValue =
      form.activateASAP || !form.activationDate ? "ASAP" : form.activationDate;

    // Build deliveryAddress logic
    let deliveryAddressValue = form.deliverySame
      ? form.serviceAddress
      : form.deliveryAddress;

    // Extract plan/package info
    const plan = selectedPlan || {};
    // Reconstruct modem and phone objects from IDs
    const modemOptions = [
      {
        id: "modem",
        title: "Gigabit WiFi-6 MESH 1800Mbps Modem",
        subtitle: "(valued at $200)",
        price: "$170 / Upfront",
        note: "(Free shipping)",
      },
      {
        id: "extender",
        title: "Gigabit WiFi-6 MESH 1800Mbps Extender",
        subtitle: "(valued at $150)",
        price: "$120 / Upfront",
        note: "(Free shipping)",
      },
    ];
    const phoneOptions = [
      {
        id: "payg",
        title: "Pay-as-you-go call rates",
      },
      {
        id: "pack",
        title: "$10/mth Unlimited call pack",
      },
    ];

    // Get selected modem object (first selected)
    const modemId = extras?.modems?.length ? extras.modems[0] : null;
    const modem = modemOptions.find((m) => m.id === modemId) || null;

    // Parse modem price string to number
    let modemPrice = 0;
    let modemModel = "";
    if (modem) {
      modemModel = modem.title;
      const match = modem.price && modem.price.match(/\$([\d.]+)/);
      if (match) {
        modemPrice = Number(match[1]);
      }
    }

    // Get selected phone object
    const phoneId = extras?.phone || null;
    const phoneService = phoneOptions.find((p) => p.id === phoneId) || null;

    // Phone service price logic
    let phoneServicePrice = 0;
    let phoneServiceName = "";
    if (phoneService) {
      phoneServiceName = phoneService.title;
      if (phoneServiceName === "Pay-as-you-go call rates") {
        phoneServicePrice = 0;
      } else if (phoneServiceName === "$10/mth Unlimited call pack") {
        phoneServicePrice = 10;
      }
    }

    // Use correct price fields
    const packagePrice =
      typeof plan.discountPrice !== "undefined"
        ? Number(plan.discountPrice)
        : typeof plan.price !== "undefined"
        ? Number(plan.price)
        : 0;
    const totalPrice = packagePrice + modemPrice + phoneServicePrice;

    const finalData = {
      contactDetails: {
        title: form.title,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        contactNumber: form.contactNumber,
        dob: form.dob,
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
        modem: modem
          ? {
              id: modem.id,
              model: modemModel,
              price: modemPrice,
            }
          : null,
      },
      phoneDetails: {
        keepPhone: form.keepPhone,
        phoneNumber: form.phoneNumber,
        transferVoip: form.transferVoip,
        accountNumber: form.accountNumber,
        phoneService: phoneService
          ? {
              id: phoneService.id,
              name: phoneServiceName,
              price: phoneServicePrice,
            }
          : null,
      },
      pricing: {
        packagePrice,
        modemPrice,
        phoneServicePrice,
        total: totalPrice,
      },
      rawForm: form, // for reference, includes all fields
      rawSelections: {
        selectedPlan,
        extras,
      },
    };

    console.log(
      "Submitting full contract data for Go High Level webhook:",
      finalData
    );

    // Send to Go High Level webhook
    const webhookUrl = process.env.NEXT_PUBLIC_CONTRACT_WEBHOOK;
    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
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
            serviceAddress: serviceAddress || "",
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
            planSpeed: "",
            includeModem: false,
            includePhoneService: false,
            packagePrice: selectedPlan.discountPrice,
            modemPrice: 0,
            phoneServicePrice: 0,
          });
          setOtpSent(false);
          setOtp("");
          setOtpVerified(false);
          if (typeof onSuccess === "function") {
            onSuccess();
          }
          if (typeof onSubmitSuccess === "function") {
            onSubmitSuccess();
          }
        } else {
          setError("Failed to submit contract to webhook.");
        }
      } catch (err) {
        setError("Failed to submit contract to webhook.");
      }
    } else {
      setError("Webhook URL is not configured.");
    }
    setLoading(false);
  };

  // common input style
  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/30";
  // toggle button style
  const toggleBtn = (active) =>
    `px-5 py-2 rounded-full font-medium transition ${
      active
        ? "bg-[--primary] text-white shadow-md hover:bg-opacity-90"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto space-y-8"
      style={{ "--primary": PRIMARY }}
    >
      {/* Loading overlay for form submission */}
      {loading && !submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-[#1DA6DF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#1DA6DF" strokeWidth="4"></circle>
              <path className="opacity-75" fill="#1DA6DF" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-[#1DA6DF] font-semibold text-lg">Submitting...</span>
          </div>
        </div>
      )}
      {submitSuccess ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded text-center font-semibold mb-6">
            Form submit complete
          </div>
          <button
            className="px-8 py-3 rounded-lg font-semibold bg-[#1DA6DF] text-white hover:bg-[#199CCF] transition"
            onClick={() => {
              if (typeof onRestart === "function") {
                onRestart();
              }
            }}
            type="button"
          >
            Submit another one
          </button>
        </div>
      ) : null}
      {!submitSuccess && (
        <>
          {/* Section Card */}
          {/** Wrap each fieldset in a card-like container **/}
          {/** Contact Details **/}
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-[--primary]">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <select
                  className={inputClasses}
                  value={form.title}
                  onChange={handleChange("title")}
                  disabled={otpSent && !otpVerified}
                >
                  {TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  required
                  disabled={otpSent && !otpVerified}
                />
              </div>
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  required
                  disabled={otpSent && !otpVerified}
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className={inputClasses}
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                  disabled={otpSent && !otpVerified}
                />
              </div>
              {/* Contact Number */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Number{" "}
                  <span className="text-xs text-gray-500">
                    (Mobile or Home)
                  </span>
                </label>
                <input
                  type="tel"
                  className={inputClasses}
                  value={form.contactNumber}
                  onChange={handleChange("contactNumber")}
                  required
                  placeholder="e.g. 8801799859736 (include country code)"
                  disabled={otpSent && !otpVerified}
                />
                <span className="text-xs text-gray-500">
                  Please enter your full number with country code (e.g.
                  8801799859736)
                </span>
              </div>
              {/* Date of Birth */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className={inputClasses}
                  value={form.dob}
                  onChange={handleChange("dob")}
                  required
                  disabled={otpSent && !otpVerified}
                />
              </div>
            </div>
          </div>

          {/** Connection Details **/}
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-[--primary]">
              Connection Details
            </h2>
            <div className="space-y-4">
              {/* Service Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Service Address
                </label>
                <input
                  type="text"
                  className={`${inputClasses} bg-gray-100 cursor-not-allowed text-black`}
                  value={form.serviceAddress}
                  readOnly
                />
              </div>
              {/* Activation Date */}
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Activate ASAP?
                </span>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, activateASAP: true }))
                    }
                    className={`px-5 py-2 rounded-full font-medium transition ${
                      form.activateASAP
                        ? "bg-[#1DA6DF] text-white"
                        : "bg-white text-black border border-gray-300"
                    }`}
                  >
                    ASAP
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, activateASAP: false }))
                    }
                    className={`px-5 py-2 rounded-full font-medium transition ${
                      !form.activateASAP
                        ? "bg-[#1DA6DF] text-white"
                        : "bg-white text-black border border-gray-300"
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

          {/** Delivery Details **/}
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-[--primary]">
              Delivery Details
            </h2>
            <div className="space-y-4">
              {/* Same as Service? */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-[--primary] border-gray-300 rounded focus:ring focus:ring-[--primary]/30"
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
              {/* Recipient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name (Delivery)
                  </label>
                  <input
                    type="text"
                    className={inputClasses}
                    value={form.deliveryName}
                    onChange={handleChange("deliveryName")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name{" "}
                    <span className="text-xs text-gray-500">(Optional)</span>
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

          {/** Phone Details **/}
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-[--primary]">
              Phone Details
            </h2>
            <div className="space-y-4">
              {/* Keep Number */}
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Keep existing number?
                </span>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, keepPhone: true }))}
                    className={`px-5 py-2 rounded-full font-medium transition ${
                      form.keepPhone
                        ? "bg-[#1DA6DF] text-white"
                        : "bg-white text-black border border-gray-300"
                    }`}
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, keepPhone: false }))}
                    className={`px-5 py-2 rounded-full font-medium transition ${
                      !form.keepPhone
                        ? "bg-[#1DA6DF] text-white"
                        : "bg-white text-black border border-gray-300"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
              {/* Porting */}
              {form.keepPhone && (
                <>
                  <input
                    type="tel"
                    className={inputClasses}
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    required
                  />
                  <span className="block text-sm font-medium text-gray-700">
                    Transfer as VoIP?
                  </span>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, transferVoip: true }))
                      }
                      className={`px-5 py-2 rounded-full font-medium transition ${
                        form.transferVoip
                          ? "bg-[#1DA6DF] text-white"
                          : "bg-white text-black border border-gray-300"
                      }`}
                    >
                      Yes
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, transferVoip: false }))
                      }
                      className={`px-5 py-2 rounded-full font-medium transition ${
                        !form.transferVoip
                          ? "bg-[#1DA6DF] text-white"
                          : "bg-white text-black border border-gray-300"
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {form.transferVoip && (
                    <input
                      type="text"
                      className={inputClasses}
                      placeholder="Account Number"
                      value={form.accountNumber}
                      onChange={handleChange("accountNumber")}
                      required
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Pricing Summary Section */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[--primary]">
              Order Summary
            </h2>
            <div className="flex flex-col gap-2">
              {/* Plan */}
              <div className="flex justify-between">
                <span className="font-medium">
                  {selectedPlan?.subtitle || "N/A"}
                </span>
                <span>
                  {typeof selectedPlan?.discountPrice !== "undefined"
                    ? `$${Number(selectedPlan.discountPrice).toFixed(2)}`
                    : typeof selectedPlan?.price !== "undefined"
                    ? `$${Number(selectedPlan.price).toFixed(2)}`
                    : "$0.00"}
                </span>
              </div>
              {/* Modem */}
              {(() => {
                const modemOptions = [
                  {
                    id: "modem",
                    title: "Gigabit WiFi-6 MESH 1800Mbps Modem",
                    price: "$170 / Upfront",
                  },
                  {
                    id: "extender",
                    title: "Gigabit WiFi-6 MESH 1800Mbps Extender",
                    price: "$120 / Upfront",
                  },
                ];
                const modemId = extras?.modems?.length
                  ? extras.modems[0]
                  : null;
                const modem =
                  modemOptions.find((m) => m.id === modemId) || null;
                let modemPrice = 0;
                if (modem) {
                  const match = modem.price && modem.price.match(/\$([\d.]+)/);
                  if (match) {
                    modemPrice = Number(match[1]);
                  }
                }
                return modem ? (
                  <div className="flex justify-between">
                    <span className="font-medium">{modem.title}</span>
                    <span>{`$${modemPrice.toFixed(2)}`}</span>
                  </div>
                ) : null;
              })()}
              {/* Phone Service */}
              {(() => {
                const phoneOptions = [
                  {
                    id: "payg",
                    title: "Pay-as-you-go call rates",
                  },
                  {
                    id: "pack",
                    title: "$10/mth Unlimited call pack",
                  },
                ];
                const phoneId = extras?.phone || null;
                const phoneService =
                  phoneOptions.find((p) => p.id === phoneId) || null;
                let phoneServicePrice = 0;
                if (phoneService) {
                  if (phoneService.title === "Pay-as-you-go call rates") {
                    phoneServicePrice = 0;
                  } else if (
                    phoneService.title === "$10/mth Unlimited call pack"
                  ) {
                    phoneServicePrice = 10;
                  }
                }
                return phoneService ? (
                  <div className="flex justify-between">
                    <span className="font-medium">{phoneService.title}</span>
                    <span>{`$${phoneServicePrice.toFixed(2)}`}</span>
                  </div>
                ) : null;
              })()}
              {/* Total */}
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg">
                <span>Total</span>
                <span>
                  {(() => {
                    // Plan price
                    let planPrice =
                      typeof selectedPlan?.discountPrice !== "undefined"
                        ? Number(selectedPlan.discountPrice)
                        : typeof selectedPlan?.price !== "undefined"
                        ? Number(selectedPlan.price)
                        : 0;
                    // Modem price
                    const modemOptions = [
                      {
                        id: "modem",
                        price: "$170 / Upfront",
                      },
                      {
                        id: "extender",
                        price: "$120 / Upfront",
                      },
                    ];
                    const modemId = extras?.modems?.length
                      ? extras.modems[0]
                      : null;
                    const modem =
                      modemOptions.find((m) => m.id === modemId) || null;
                    let modemPrice = 0;
                    if (modem) {
                      const match =
                        modem.price && modem.price.match(/\$([\d.]+)/);
                      if (match) {
                        modemPrice = Number(match[1]);
                      }
                    }
                    // Phone service price
                    const phoneOptions = [
                      {
                        id: "payg",
                        title: "Pay-as-you-go call rates",
                      },
                      {
                        id: "pack",
                        title: "$10/mth Unlimited call pack",
                      },
                    ];
                    const phoneId = extras?.phone || null;
                    const phoneService =
                      phoneOptions.find((p) => p.id === phoneId) || null;
                    let phoneServicePrice = 0;
                    if (phoneService) {
                      if (phoneService.title === "Pay-as-you-go call rates") {
                        phoneServicePrice = 0;
                      } else if (
                        phoneService.title === "$10/mth Unlimited call pack"
                      ) {
                        phoneServicePrice = 10;
                      }
                    }
                    return `$${(
                      planPrice +
                      modemPrice +
                      phoneServicePrice
                    ).toFixed(2)}`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* OTP Verification UI */}
      {otpSent && !otpVerified && (
        <div className="bg-white border-1 border-[#1DA6DF] rounded-2xl shadow p-6 space-y-4">
          <label className="label">Enter OTP sent to your contact number</label>
          <input
            type="text"
            className={inputClasses}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
          />
          <button
            type="button"
            onClick={handleVerifyOtp}
            className="btn btn-neutral mt-4"
            disabled={loading || !otp.trim()}
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
          <div className="mt-4 text-center">
            {resendTimer > 0 ? (
              <span>Resend in {resendTimer}s</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSendOtp("sms")}
                  className="btn btn-link"
                >
                  Resend via SMS
                </button>
                <button
                  type="button"
                  onClick={() => handleSendOtp("call")}
                  className="btn btn-link ml-2"
                >
                  Send via Call
                </button>
              </>
            )}
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      )}

      {!submitSuccess && (
        <div className="text-right">
          <button
            type="submit"
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              loading || (otpSent && !otpVerified)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#1DA6DF] text-white hover:bg-[#199CCF]"
            }`}
            disabled={
              loading || (otpSent && !otpVerified) // Disable when waiting for OTP verification
            }
          >
            {otpSent
              ? otpVerified
                ? "Submit Contract"
                : "Submit Contract"
              : "Verify & Submit"}
          </button>
        </div>
      )}

      {error && !otpSent && (
        <div className="text-red-500 mt-2 text-right">{error}</div>
      )}
    </form>
  );
}

// File: src/components/ContractForm.jsx
"use client";

import React, { useState, useEffect } from "react";
const PRIMARY = "#1DA6DF";

export default function leadform() {
  // NEW: store the embedding page URL or referrer
  const [pageUrl, setPageUrl] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  // sync serviceAddress prop

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

  // NEW: grab pageUrl from query or referrer
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("parentUrl");
      if (fromParam) {
        setPageUrl(decodeURIComponent(fromParam));
      } else {
        const ref = document.referrer;
        setPageUrl(ref && ref !== "" ? ref : window.location.href);
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const normalizePhoneNumber = (input) => {
    let phone = input.trim();
    // Bangladesh: starts with 88 or +88
    if (phone.startsWith("88") || phone.startsWith("+88")) {
      if (!phone.startsWith("+")) phone = "+" + phone;
      return phone;
    }
    // Remove any leading 0 for Australian numbers
    if (phone.startsWith("0")) phone = phone.slice(1);
    // Remove any leading + for Australian numbers
    if (phone.startsWith("+")) phone = phone.slice(1);
    // Ensure +61 for Australia
    return "+61" + phone;
  };

  const handleSendOtp = async (method = "sms") => {
    setLoading(true);
    setError("");
    try {
      let normalizedPhone = normalizePhoneNumber(form.contactNumber);
      const res = await fetch("/api/contract-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, channel: method }),
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
      let normalizedPhone = normalizePhoneNumber(form.contactNumber);
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
    setLoading(true);

    // Build the payload for webhook, preserving order + pageUrl
    const payload = {
      contactDetails: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        contactNumber: form.contactNumber,
      },
      meta: {
        pageUrl, // NEW: where form was embedded
        submittedAt: new Date().toISOString(),
      },
    };

    try {
      const res = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setForm({ firstName: "", lastName: "", email: "", contactNumber: "" });
        setOtpSent(false);
        setOtp("");
        setOtpVerified(false);
      } else {
        const data = await res.json();
        setError(data?.error || "Failed to submit contract.");
      }
    } catch (err) {
      setError("Failed to submit contract.");
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
            <svg
              className="animate-spin h-10 w-10 text-[#1DA6DF] mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="#1DA6DF"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="#1DA6DF"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-[#1DA6DF] font-semibold text-lg">
              Submitting...
            </span>
          </div>
        </div>
      )}
      {submitSuccess && (
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded text-center font-semibold mb-6">
            Form submit complete
          </div>
        </div>
      )}
      {!submitSuccess && (
        <>
          {/* Section Card */}
          {/** Wrap each fieldset in a card-like container **/}
          {/** Contact Details **/}
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
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
                  placeholder="e.g. 0412345678 (AU) "
                  disabled={otpSent && !otpVerified}
                />
                <span className="text-xs text-gray-500">
                  Enter your number without country code (e.g. 412345678).
                </span>
                {error && !otpSent && (
                  <div className="text-red-500 mt-2 text-right">
                    Please use a active number
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* OTP Verification UI */}
      {otpSent && !otpVerified && (
        <div className="bg-white border-1 border-[#1DA6DF] rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between gap-10">
            <input
              type="text"
              className={inputClasses}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP sent to your contact number"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="btn btn-neutral "
              disabled={loading || !otp.trim()}
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
          </div>
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
        <div className="w-full text-center">
          <button
            type="submit"
            className={`w-full px-8 py-3 rounded-lg font-semibold transition ${
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
    </form>
  );
}

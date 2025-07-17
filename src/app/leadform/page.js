// File: src/components/ContractForm.jsx
"use client";

import React, { useState, useEffect } from "react";
const PRIMARY = "#1DA6DF";

export default function Leadform() {
  // Will hold the parent page URL sent via postMessage or fallback
  const [pageUrl, setPageUrl] = useState("");

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  });

  // Reintroduce handleChange
  const handleChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");

  // Allowed parent origins (production + local testing)
  const ALLOWED_ORIGINS = [
    "https://2mit.com.au",
    "http://localhost:400"
  ];

  // Listen for parent URL via postMessage
  useEffect(() => {
    function handleMessage(e) {
      if (ALLOWED_ORIGINS.includes(e.origin) && e.data.parentUrl) {
        setPageUrl(e.data.parentUrl);
      }
    }
    window.addEventListener("message", handleMessage);
    // Fallback to referrer if not received in 1s
    const fallback = setTimeout(() => {
      if (!pageUrl) {
        const ref = document.referrer;
        setPageUrl(ref && ref !== "" ? ref : window.location.href);
      }
    }, 1000);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(fallback);
    };
  }, [pageUrl]);

  // OTP resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Normalize phone numbers
  const normalizePhoneNumber = (input) => {
    let phone = input.trim();
    if (phone.startsWith("88") || phone.startsWith("+88")) {
      if (!phone.startsWith("+")) phone = "+" + phone;
      return phone;
    }
    if (phone.startsWith("0")) phone = phone.slice(1);
    if (phone.startsWith("+")) phone = phone.slice(1);
    return "+61" + phone;
  };

  // Send OTP
  const handleSendOtp = async (method = "sms") => {
    setLoading(true);
    setError("");
    try {
      const normalized = normalizePhoneNumber(form.contactNumber);
      const res = await fetch("/api/contract-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, channel: method }),
      });
      if (res.ok) {
        setOtpSent(true);
        setResendTimer(30);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Failed to send OTP");
    }
    setLoading(false);
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const normalized = normalizePhoneNumber(form.contactNumber);
      const res = await fetch("/api/contract-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, code: otp }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setOtpVerified(true);
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch {
      setError("Failed to verify OTP");
    }
    setLoading(false);
  };

  // Submit form
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

    const payload = {
      contactDetails: { ...form },
      meta: { pageUrl, submittedAt: new Date().toISOString() },
    };

    try {
      const res = await fetch("/api/lead", {
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
        setError(data.error || "Failed to submit contract.");
      }
    } catch {
      setError("Failed to submit contract.");
    }
    setLoading(false);
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/30";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8" style={{ "--primary": PRIMARY }}>
      {/* Loading overlay */}
      {loading && !submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-[#1DA6DF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#1DA6DF" strokeWidth="4" />
              <path className="opacity-75" fill="#1DA6DF" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-[#1DA6DF] font-semibold text-lg">Submitting...</span>
          </div>
        </div>
      )}

      {/* Success message */}
      {submitSuccess && (
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded text-center font-semibold mb-6">
            Form submit complete
          </div>
        </div>
      )}

      {/* Contact Details */}
      {!submitSuccess && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" className={inputClasses} value={form.firstName} onChange={handleChange("firstName")} required disabled={otpSent && !otpVerified} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" className={inputClasses} value={form.lastName} onChange={handleChange("lastName")} required disabled={otpSent && !otpVerified} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" className={inputClasses} value={form.email} onChange={handleChange("email")} required disabled={otpSent && !otpVerified} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number <span className="text-xs text-gray-500">(Mobile or Home)</span></label>
              <input type="tel" className={inputClasses} value={form.contactNumber} onChange={handleChange("contactNumber")} required placeholder="e.g. 0412345678 (AU)" disabled={otpSent && !otpVerified} />
              <span className="text-xs text-gray-500">Enter number without country code (e.g. 412345678).</span>
              {error && !otpSent && <div className="text-red-500 mt-2 text-right">{error}</div>}
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification UI */}
      {otpSent && !otpVerified && (
        <div className="bg-white border border-[#1DA6DF] rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between gap-10">
            <input type="text" className={inputClasses} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
            <button type="button" onClick={handleVerifyOtp} className="btn btn-neutral" disabled={loading || !otp.trim()}>{loading ? "Verifying…" : "Verify OTP"}</button>
          </div>
          <div className="mt-4 text-center">
            {resendTimer > 0 ? <span>Resend in {resendTimer}s</span> : (
              <>
                <button type="button" onClick={() => handleSendOtp("sms")} className="btn btn-link">Resend via SMS</button>
                <button type="button" onClick={() => handleSendOtp("call")} className="btn btn-link ml-2">Send via Call</button>
              </>
            )}
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      )}

      {/* Submit Button */}
      {!submitSuccess && (
        <div className="w-full text-center">
          <button type="submit" className={`w-full px-8 py-3 rounded-lg font-semibold transition ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#1DA6DF] text-white hover:bg-[#199CCF]"}`} disabled={loading}>{loading ? "Submitting…" : "Submit Contract"}</button>
        </div>
      )}
    </form>
  );
}

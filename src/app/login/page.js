// File: pages/login.js
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [step, setStep] = useState("creds");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendOtp = async (channel = "sms") => {
    setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          channel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("verify");
      setResendTimer(30);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="card bg-base-100 w-full max-w-sm shadow-2xl">
        <div className="card-body">
          {step === "creds" ? (
            <>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <label className="label">Phone</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0123456789"
              />
              <button
                onClick={() => handleSendOtp("sms")}
                className="btn btn-neutral mt-4"
                disabled={
                  loading ||
                  !email.trim() ||
                  !password ||
                  !phone.trim()
                }
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <label className="label">Enter OTP</label>
              <input
                type="text"
                className="input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />
              <button
                onClick={handleVerifyOtp}
                className="btn btn-neutral mt-4"
                disabled={loading || !otp.trim()}
              >
                {loading ? "Verifying…" : "Verify & Login"}
              </button>
              <div className="mt-4 text-center">
                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <>
                    <button
                      onClick={() => handleSendOtp("sms")}
                      className="btn btn-link"
                    >
                      Resend via SMS
                    </button>
                    <button
                      onClick={() => handleSendOtp("call")}
                      className="btn btn-link ml-2"
                    >
                      Send via Call
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// File: pages/login.js (using Next.js Pages Router and "use client")
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [step, setStep] = useState('creds'); // 'creds' | 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  // Countdown for resend button
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const sendOtp = async (channel = 'sms') => {
    setLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel }),
      });
      if (!res.ok) throw new Error();
      setStep('verify');
      setResendTimer(30);
    } catch (err) {
      alert('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      router.push('/dashboard');
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
          {step === 'creds' ? (
            <>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />

              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
              />

              <label className="label">Phone</label>
              <input
                type="tel"
                className="input"
                placeholder="+1234567890"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />

              <button
                onClick={() => sendOtp('sms')}
                className="btn btn-neutral mt-4"
                disabled={loading || !phone}
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <label className="label">Enter OTP</label>
              <input
                type="text"
                className="input"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
              />
              <button
                onClick={verifyOtp}
                className="btn btn-neutral mt-4"
                disabled={loading || !otp}
              >
                {loading ? 'Verifying…' : 'Verify & Login'}
              </button>

              <div className="mt-4 text-center">
                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <>
                    <button
                      onClick={() => sendOtp('sms')}
                      className="btn btn-link"
                    >
                      Resend via SMS
                    </button>
                    <button
                      onClick={() => sendOtp('call')}
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

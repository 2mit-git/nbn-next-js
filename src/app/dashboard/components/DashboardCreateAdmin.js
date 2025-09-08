"use client";
import React, { useState } from "react";

export default function DashboardCreateAdmin({ onGoBack, onSuccess }) {
  const [form, setForm] = useState({ email: "", number: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    let to = form.number.trim();
    if (!to.startsWith("+")) to = "+" + to;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, number: to, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      if (onSuccess) {
        onSuccess();
      } else {
        onGoBack();
      }
    } catch (err) {
      console.error(err);
      setError("Error creating admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Error Alert */}
      {error && (
        <div className="toast toast-end z-50">
          <div className="alert alert-error rounded-2xl shadow-lg">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full bg-base-200/60 p-4 sm:p-6">
        <div className="mx-auto max-w-md">
          <div className="card rounded-2xl border border-base-content/10 bg-base-100/80 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
            <div className="card-body space-y-4 p-5 sm:p-6">
              <fieldset className="fieldset space-y-3">
                <label className="label text-xs opacity-70">Email</label>
                <input type="email" className="input input-bordered rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" placeholder="name@example.com" value={form.email} onChange={handleChange("email")} />

                <label className="label text-xs opacity-70">Number</label>
                <input type="number" className="input input-bordered rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" placeholder="e.g. 61412345678" value={form.number} onChange={handleChange("number")} />

                <label className="label text-xs opacity-70">Password</label>
                <input type="password" className="input input-bordered rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" placeholder="Password" value={form.password} onChange={handleChange("password")} />

                <label className="label text-xs opacity-70">Confirm Password</label>
                <input type="password" className="input input-bordered rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" placeholder="Confirm Password" value={form.confirm} onChange={handleChange("confirm")} />

                <button onClick={handleCreate} className="btn mt-4 w-full rounded-xl border-[#1EA6DF] bg-[#1EA6DF] text-white hover:brightness-95" disabled={loading}>
                  {loading ? "Creating…" : "Create"}
                </button>

                <button onClick={onGoBack} className="btn btn-neutral mt-2 w-full rounded-xl" disabled={loading}>
                  Go Back
                </button>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

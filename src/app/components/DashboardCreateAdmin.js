"use client";
import React, { useState } from "react";

export default function DashboardCreateAdmin({ onGoBack, onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    number: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
        body: JSON.stringify({
          email: form.email,
          number: to,
          password: form.password,
        }),
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
        <div className="toast">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="hero bg-base-200 min-h-screen w-full bg-white">
        <div className="card bg-base-100 w-full max-w-sm shadow-2xl">
          <div className="card-body space-y-4">
            <fieldset className="fieldset space-y-2">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={form.email}
                onChange={handleChange("email")}
              />

              <label className="label">Number</label>
              <input
                type="number"
                className="input"
                placeholder="number"
                value={form.number}
                onChange={handleChange("number")}
              />
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={form.password}
                onChange={handleChange("password")}
              />

              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={handleChange("confirm")}
              />

              <button
                onClick={handleCreate}
                className="btn btn-success mt-4"
                disabled={loading}
              >
                {loading ? "Creating…" : "Create"}
              </button>

              <button
                onClick={onGoBack}
                className="btn btn-neutral mt-2"
                disabled={loading}
              >
                Go Back
              </button>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}

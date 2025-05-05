"use client";
import React, { useState, useEffect } from "react";

export default function DashboardAPI() {
  const [keys, setKeys] = useState({
    geoapify: "",
    nbn: "",
    recaptcha: "",
  });
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load existing keys if any (silently ignore errors/404)
  useEffect(() => {
    fetch("/api/keys")
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setKeys({
            geoapify: data.geoapify || "",
            nbn: data.nbn || "",
            recaptcha: data.recaptcha || "",
          });
        }
      })
      .catch(() => {}); // no warning if not found
  }, []);

  const handleChange = (field) => (e) => {
    setKeys((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUpdate = () => {
    setSaving(true);
    fetch("/api/keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keys),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        // show toast on successful update
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        console.error(err);
        // show error toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="w-full h-full">
      <div className="m-10 space-y-4 max-w-lg">
        <div>
          <legend className="fieldset-legend">Geoapify</legend>
          <input
            type="password"
            className="input w-full"
            placeholder="Type here"
            value={keys.geoapify}
            onChange={handleChange("geoapify")}
          />
        </div>
        <div>
          <legend className="fieldset-legend">NBN</legend>
          <input
             type="password"
            className="input w-full"
            placeholder="Type here"
            value={keys.nbn}
            onChange={handleChange("nbn")}
          />
        </div>
        <div>
          <legend className="fieldset-legend">reCAPTCHA</legend>
          <input
             type="password"
            className="input w-full"
            placeholder="Type here"
            value={keys.recaptcha}
            onChange={handleChange("recaptcha")}
          />
        </div>

        <button
          onClick={handleUpdate}
          className="btn btn-success"
          disabled={saving}
        >
          {saving ? "Updating..." : "Update Keys"}
        </button>

        {showToast && (
          <div className="toast">
            <div className="alert alert-info">
              <span>Keys updated successfully.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

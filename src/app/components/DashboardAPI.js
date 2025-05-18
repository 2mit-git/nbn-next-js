// File: src/components/DashboardAPI.js
"use client";
import React, { useState, useEffect } from "react";

export default function DashboardAPI() {
  const [keys, setKeys] = useState({
    TWILIO_ACCOUNT_SID: "",
    TWILIO_AUTH_TOKEN: "",
    TWILIO_SERVICE_SID: "",
    GHL_WEBHOOK: "",
    GEO_API_KEY: "",
    RAPIDAPI_KEY: "",
  });
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // new states
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState({
    TWILIO_ACCOUNT_SID: false,
    TWILIO_AUTH_TOKEN: false,
    TWILIO_SERVICE_SID: false,
    GHL_WEBHOOK: false,
    GEO_API_KEY: false,
    RAPIDAPI_KEY: false,
  });

  const CACHE_KEY = "dashboard_api_keys";

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          setKeys(JSON.parse(cached));
          return;
        }
      } catch {}
    }
    fetch("/api/keys")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setKeys({
            TWILIO_ACCOUNT_SID: data.TWILIO_ACCOUNT_SID || "",
            TWILIO_AUTH_TOKEN: data.TWILIO_AUTH_TOKEN || "",
            TWILIO_SERVICE_SID: data.TWILIO_SERVICE_SID || "",
            GHL_WEBHOOK: data.GHL_WEBHOOK || "",
            GEO_API_KEY: data.GEO_API_KEY || "",
            RAPIDAPI_KEY: data.RAPIDAPI_KEY || "",
          });
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field) => (e) => {
    setKeys((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggleShow = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
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
        setShowToast(true);
        setEditMode(false);
        localStorage.setItem(CACHE_KEY, JSON.stringify(keys));
      })
      .catch((err) => {
        console.error(err);
        setShowToast(true);
      })
      .finally(() => {
        setTimeout(() => setShowToast(false), 3000);
        setSaving(false);
      });
  };

  const fields = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_SERVICE_SID",
    "GHL_WEBHOOK",
    "GEO_API_KEY",
    "RAPIDAPI_KEY",
  ];

  // Inline SVG icons
  const EyeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12s4.5-7 9-7 9 7 9 7-4.5 7-9 7-9-7-9-7z"
      />
      <circle cx={12} cy={12} r={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18M10.58 10.58a3 3 0 104.24 4.24"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.53 8.53C6.6 10.46 5 12 5 12s4.5 7 9 7c1.52 0 2.94-.37 4.2-1"
      />
    </svg>
  );

  return (
    <div className="w-full h-full">
      <div className="m-10 space-y-4 max-w-lg">
        {fields.map((field) => (
          <div key={field}>
            <legend className="fieldset-legend">{field}</legend>
            <div className="relative">
              <input
                type={showPassword[field] ? "text" : "password"}
                className="input w-full pr-10"
                placeholder="Type here"
                value={keys[field]}
                onChange={handleChange(field)}
                disabled={!editMode}
              />
              {editMode && (
                <button
                  type="button"
                  onClick={() => toggleShow(field)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword[field] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              )}
            </div>
          </div>
        ))}

        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="btn btn-primary">
            Edit
          </button>
        ) : (
          <button
            onClick={handleUpdate}
            className="btn btn-success"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}

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

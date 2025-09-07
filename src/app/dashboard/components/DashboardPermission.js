"use client";
import React, { useEffect, useState } from "react";

export default function DashboardPermission() {
  const [permissions, setPermissions] = useState({ business: true, residential: true });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Fetch current permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/permissions");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setPermissions({
          business: data.business,
          residential: data.residential,
        });
      } catch (err) {
        console.error(err);
        setMsg("❌ Failed to load permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Toggle handler
  const handleToggle = async (field) => {
    const newValue = !permissions[field];
    setPermissions((prev) => ({ ...prev, [field]: newValue }));

    try {
      const res = await fetch("/api/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setPermissions({
        business: data.business,
        residential: data.residential,
      });
      setMsg("✅ Permissions updated!");
    } catch (err) {
      console.error(err);
      setMsg("❌ Failed to update.");
      // rollback UI if error
      setPermissions((prev) => ({ ...prev, [field]: !newValue }));
    }
  };

  /* --- Loading state (skeleton) --- */
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-sky-50 to-cyan-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-sky-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-sky-200" />
                <div className="h-3 w-64 animate-pulse rounded bg-sky-100" />
              </div>
            </div>
          </div>
          <div className="space-y-6 px-6 py-6">
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  /* --- Status badge helper (purely visual) --- */
  const Badge = ({ active }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {active ? "Visible" : "Hidden"}
    </span>
  );

  /* --- Message style (no logic change) --- */
  const isError = msg.startsWith("❌");
  const isSuccess = msg.startsWith("✅");

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
             
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Visible Packages on Frontend
                </h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Control which package categories are visible to users on the site.
                </p>
              </div>
            </div>

            {/* Quick glance badges (visual only) */}
            <div className="hidden gap-2 sm:flex">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-gray-200">
                <span className="text-xs text-gray-500">Business</span>
                <Badge active={permissions.business} />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 ring-1 ring-gray-200">
                <span className="text-xs text-gray-500">Residential</span>
                <Badge active={permissions.residential} />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          {/* Business Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-4 transition hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Business</p>
              <p className="text-xs text-gray-500">Show business packages</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3">
              <Badge active={permissions.business} />
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={permissions.business}
                onChange={() => handleToggle("business")}
                aria-label="Toggle business package visibility"
              />
            </label>
          </div>

          {/* Residential Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-4 transition hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Residential</p>
              <p className="text-xs text-gray-500">Show residential packages</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3">
              <Badge active={permissions.residential} />
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={permissions.residential}
                onChange={() => handleToggle("residential")}
                aria-label="Toggle residential package visibility"
              />
            </label>
          </div>

          {/* Message (no behavior change) */}
          {msg && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ring-1 ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : isError
                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                  : "bg-sky-50 text-sky-700 ring-sky-200"
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center">
                  {isSuccess ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                      <path d="M12 9v4m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </span>
                <span>{msg}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer (optional hint) */}
      <p className="mx-auto mt-4 text-center text-xs text-gray-400">
        Changes apply instantly on the storefront.
      </p>
    </div>
  );
}

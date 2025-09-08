"use client";
import React, { useState, useEffect } from "react";
import DashboardCreateAdmin from "./DashboardCreateAdmin";

// AlertPopup component (design-only tweaks, same logic)
function AlertPopup({ show, message, onClose }) {
  if (!show) return null;
  return (
    <div
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, minWidth: 300, maxWidth: 420, transition: "opacity 0.3s" }}
      className="animate-fade-in"
    >
      <div
        role="alert"
        className="flex items-center gap-2 rounded-2xl border border-info/20 bg-info/10 px-4 py-3 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-info/15 text-info-content"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="btn btn-xs btn-circle btn-ghost ml-2" aria-label="Close">✕</button>
      </div>
    </div>
  );
}

export default function DashboardSuperAdmin() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "" });

  // Show alert for 3 seconds
  const triggerAlert = (message) => {
    setAlert({ show: true, message });
    setTimeout(() => setAlert({ show: false, message: "" }), 3000);
  };

  // Cache key
  const CACHE_KEY = "dashboard_admins";

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdmins(data);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {}
      }
    } catch (err) {
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) setAdmins(parsed);
          }
        } catch (e) {}
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadAdmins();
    }
  }, []);

  const handleEdit = (id) => {
    setEditingId(id);
    setNewPassword("");
  };

  const handleSave = async (id) => {
    if (!newPassword) return alert("Enter a new password");
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: newPassword }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/admin");
          if (res.ok) {
            const data = await res.json();
            setAdmins(data);
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          }
        } catch (e) {}
      }
      triggerAlert("Admin password updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update password");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this admin?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/admin");
          if (res.ok) {
            const data = await res.json();
            setAdmins(data);
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          }
        } catch (e) {}
      }
      triggerAlert("Admin deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete admin");
    }
  };

  if (showCreateForm) {
    return (
      <div className="w-full h-full">
        <DashboardCreateAdmin
          onGoBack={() => {
            setShowCreateForm(false);
            loadAdmins();
          }}
          onSuccess={() => {
            setShowCreateForm(false);
            loadAdmins();
            triggerAlert("Admin created successfully.");
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3 sm:p-6">
      {/* Alert Popup */}
      <AlertPopup show={alert.show} message={alert.message} onClose={() => setAlert({ show: false, message: "" })} />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header / Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="stats shadow-sm rounded-2xl border border-base-content/10 bg-base-100/80 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
            <div className="stat px-6 py-4">
              <div className="stat-title text-xs opacity-70">Total Admins</div>
              <div className="stat-value text-3xl">{admins.length}</div>
            </div>
          </div>
          <button className="btn ml-auto border-[#1EA6DF] bg-[#1EA6DF] text-white hover:brightness-95 rounded-xl" onClick={() => setShowCreateForm(true)}>
            Create Admin
          </button>
        </div>

        {/* Table / Content */}
        {loading ? (
          <div className="rounded-2xl border border-base-content/10 bg-base-100/60 p-6 text-sm opacity-70">Loading…</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-base-content/10 bg-base-100/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
            <table className="table table-sm md:table-md w-full">
              <thead className="sticky top-0 z-10 text-[11px] uppercase tracking-wide">
                <tr className="bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
                  <th className="w-10">#</th>
                  <th>Email</th>
                  <th className="w-[280px]">Password</th>
                  <th className="text-right w-[220px]">Actions</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {admins.map((admin, i) => (
                  <tr key={admin._id} className="hover">
                    <th className="text-xs opacity-70">{i + 1}</th>
                    <td className="max-w-[360px]">
                      <span className="break-all align-middle">{admin.email}</span>
                      {admin.type == "superadmin" && (
                        <span className="badge badge-outline badge-success ml-2 align-middle">superadmin</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="password"
                        className="input input-xs md:input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40"
                        disabled={editingId !== admin._id}
                        placeholder="••••••••"
                        value={editingId === admin._id ? newPassword : ""}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </td>
                    <td className="text-right">
                      {editingId === admin._id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleSave(admin._id)} className="btn btn-success btn-xs rounded-lg">Save</button>
                          <button onClick={() => setEditingId(null)} className="btn btn-neutral btn-xs rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(admin._id)} className="btn btn-warning btn-xs rounded-lg">Edit</button>
                          {admin.type == "admin" && (
                            <button onClick={() => handleDelete(admin._id)} className="btn btn-error btn-xs rounded-lg">Delete</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import DashboardCreateAdmin from "./DashboardCreateAdmin";

// AlertPopup component
function AlertPopup({ show, message, onClose }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        minWidth: 300,
        maxWidth: 400,
        transition: "opacity 0.3s",
      }}
      className="animate-fade-in"
    >
      <div role="alert" className="alert alert-info shadow-lg flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span className="ml-2">{message}</span>
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost ml-2"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function DashboardSuperAdmin() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [admins, setAdmins]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editingId, setEditingId]     = useState(null);
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
      // Always try to fetch fresh data from the API first
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
      // If API fails, fallback to cache
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              setAdmins(parsed);
            }
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
      // After update, fetch fresh and update cache
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
      // After delete, fetch fresh and update cache
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
    <div className="w-full h-full">
      {/* Alert Popup */}
      <AlertPopup
        show={alert.show}
        message={alert.message}
        onClose={() => setAlert({ show: false, message: "" })}
      />
      <div className="m-10 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="stats shadow border-1 h-30">
            <div className="stat">
              <div className="stat-title">Total Admins</div>
              <div className="stat-value">{admins.length}</div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Admin
          </button>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, i) => (
                  <tr key={admin._id}>
                    <th>{i + 1}</th>
                    <td>{admin.email} {
                      admin.type=="superadmin" && (<div className="badge badge-outline badge-success ms-2">superadmin</div>)}</td>
                    <td>
                      <input
                        type="password"
                        className="input input-sm w-full"
                        disabled={editingId !== admin._id}
                        placeholder="••••••••"
                        value={editingId === admin._id ? newPassword : ""}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </td>
                    <td className="space-x-2">
                      {editingId === admin._id ? (
                        <>
                          <button
                            onClick={() => handleSave(admin._id)}
                            className="btn btn-success btn-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-neutral btn-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(admin._id)}
                            className="btn btn-warning btn-sm"
                          >
                            Edit
                          </button>
                          {admin.type=="admin" && (<button
                            onClick={() => handleDelete(admin._id)}
                            className="btn btn-error btn-sm"
                          >
                            Delete
                          </button>)}
                        </>
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

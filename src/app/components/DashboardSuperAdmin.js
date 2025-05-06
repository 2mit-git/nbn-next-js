"use client";
import React, { useState, useEffect } from "react";
import DashboardCreateAdmin from "./DashboardCreateAdmin";

export default function DashboardSuperAdmin() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [admins, setAdmins]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editingId, setEditingId]     = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error();
      setAdmins(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
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
      loadAdmins();
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
      loadAdmins();
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
      />
     </div>
    );
  }

  return (
    <div className="w-full h-full">
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
                      admin.type=="superadmin" && (<div class="badge badge-outline badge-success ms-2">superadmin</div>)}</td>
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

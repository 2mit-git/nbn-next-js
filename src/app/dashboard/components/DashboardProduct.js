// File: src/components/DashboardProduct.js
"use client";
import React, { useState, useEffect, useMemo } from "react";

export default function DashboardProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const alertTimeoutRef = React.useRef(null);

  const [sortKey, setSortKey] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    subtitle: "",
    speed: "",
    actualPrice: 0,
    discountPrice: 0,
    termsAndConditions: "",   // single string in form
    recommendation: "",
    categories: []
  });

  const [editingId, setEditingId] = useState(null);
  const [edited, setEdited] = useState({});

  const categories = ["All", "FTTP", "HFC", "FTTN","FTTC","FTTB", "Wireless"];

  // Cache key
  const CACHE_KEY = "nbn_products_cache";

  // Load products: use cache if fresh, otherwise fetch from API
  useEffect(() => {
    if (typeof window === "undefined") return;
    setLoading(true);
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms
    let usedCache = false;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        const now = Date.now();
        if (
          cached &&
          typeof cached === "object" &&
          !Array.isArray(cached) &&
          Array.isArray(cached.products) &&
          cached.updatedAt &&
          now - new Date(cached.updatedAt).getTime() < CACHE_TTL
        ) {
          setProducts(cached.products);
          setLoading(false);
          usedCache = true;
        }
      }
    } catch (e) {}
    if (!usedCache) {
      fetch("/api/products")
        .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch products"))
        .then(data => {
          setProducts(data.products || []);
          setLoading(false);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ products: data.products, updatedAt: data.updatedAt || new Date().toISOString() })
            );
          }
        })
        .catch(err => {
          setError("Failed to load products from API.");
          setLoading(false);
        });
    }
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    // prepare payload
    const payload = {
      ...newProduct,
      termsAndConditions: newProduct.termsAndConditions
        .split("\n")
        .map(l => l.trim())
        .filter(l => l),
      actualPrice: Number(newProduct.actualPrice),
      discountPrice: Number(newProduct.discountPrice),
    };
    

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Server rejected the add");

      setShowAddForm(false);
      setNewProduct({
        title: "",
        subtitle: "",
        speed: "",
        actualPrice: 0,
        discountPrice: 0,
        termsAndConditions: "",
        recommendation: "",
        categories: []
      });
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      setAlert({ show: true, type: "success", message: "Product has been created successfully!" });
      alertTimeoutRef.current = setTimeout(() => setAlert(a => ({ ...a, show: false })), 6000);
      // After add, fetch fresh and update cache
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            const data = await res.json();
            setProducts(data.products || []);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ products: data.products, updatedAt: data.updatedAt })
            );
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error("Add failed:", err);
      alert(err.message || "Failed to add product");
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p._id);
    setEdited({ ...p });
  };

  const handleSaveClick = async (id) => {
    const payload = {
      ...edited,
      id: edited._id,
      termsAndConditions: Array.isArray(edited.termsAndConditions)
        ? edited.termsAndConditions
        : [],
      actualPrice: Number(edited.actualPrice),
      discountPrice: Number(edited.discountPrice),
    };
    

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Server rejected the update");

      setEditingId(null);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      setAlert({ show: true, type: "success", message: "Product has been updated successfully!" });
      alertTimeoutRef.current = setTimeout(() => setAlert(a => ({ ...a, show: false })), 6000);
      // After update, fetch fresh and update cache
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            const data = await res.json();
            setProducts(data.products || []);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ products: data.products, updatedAt: data.updatedAt })
            );
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.message || "Failed to update product");
    }
  };

  const handleDeleteClick = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete request failed");
      // After delete, fetch fresh and update cache
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            const data = await res.json();
            setProducts(data.products || []);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ products: data.products, updatedAt: data.updatedAt })
            );
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
            setAlert({ show: true, type: "danger", message: "Product has been deleted successfully!" });
            alertTimeoutRef.current = setTimeout(() => setAlert(a => ({ ...a, show: false })), 6000);
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product");
    }
  };

  const filtered = useMemo(() => {
    if (filterCategory === "All") return products;
    return products.filter(
      p => Array.isArray(p.categories) && p.categories.includes(filterCategory)
    );
  }, [products, filterCategory]);

  const displayProducts = useMemo(() => {
    let list = [...filtered];
    if (sortKey === "speed") {
      list.sort((a, b) => a.speed.localeCompare(b.speed));
    }
    if (sortKey === "actualPrice") {
      list.sort((a, b) => a.actualPrice - b.actualPrice);
    }
    return list;
  }, [filtered, sortKey]);

  if (loading) return <p className="m-10">Loading products…</p>;
  if (error) return <p className="m-10 text-red-500">{error}</p>;

  return (
    <div className="w-full min-h-screen h-full sm:p-10 p-3">
      {alert.show && (
        <div
          role="alert"
          className={`alert fixed bottom-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-xs z-50 flex items-center gap-2 shadow-lg px-3 py-2
            sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 sm:w-auto sm:max-w-sm
            ${alert.type === "success" ? "alert-success" : "alert-error"}`}
        >
          {alert.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert(a => ({ ...a, show: false }))}
            className="ml-auto text-lg font-bold px-2"
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={() => setSortKey("speed")} className="btn">Sort by Speed</button>
        <button onClick={() => setSortKey("actualPrice")} className="btn">Sort by Price</button>
        <button onClick={() => setSortKey(null)} className="btn">Clear Sort</button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary ml-auto"
        >
          {showAddForm ? "Cancel" : "Add New Package"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="mb-6 p-4 border border-gray-200 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block">Title</label>
              <input
                type="text"
                className="input w-full"
                value={newProduct.title}
                onChange={e =>
                  setNewProduct(prev => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            {/* Subtitle */}
            <div>
              <label className="block">Subtitle</label>
              <input
                type="text"
                className="input w-full"
                value={newProduct.subtitle}
                onChange={e =>
                  setNewProduct(prev => ({ ...prev, subtitle: e.target.value }))
                }
                required
              />
            </div>
            {/* Speed */}
            <div>
              <label className="block">Speed</label>
              <input
                type="text"
                className="input w-full"
                value={newProduct.speed}
                onChange={e =>
                  setNewProduct(prev => ({ ...prev, speed: e.target.value }))
                }
                placeholder="e.g. 100Mbps/20Mbps"
                required
              />
            </div>
            {/* Actual Price */}
            <div>
              <label className="block">Actual Price</label>
              <input
                type="number"
                className="input w-full"
                value={newProduct.actualPrice}
                onChange={e =>
                  setNewProduct(prev => ({
                    ...prev,
                    actualPrice: e.target.value === "" ? 0 : Number(e.target.value)
                  }))
                }
                required
              />
            </div>
            {/* Discount Price */}
            <div>
              <label className="block">Discount Price</label>
              <input
                type="number"
                className="input w-full"
                value={newProduct.discountPrice}
                onChange={e =>
                  setNewProduct(prev => ({
                    ...prev,
                    discountPrice: e.target.value === "" ? 0 : Number(e.target.value)
                  }))
                }
                required
              />
            </div>
            {/* Recommendation */}
            <div>
              <label className="block">Recommendation</label>
              <input
                type="text"
                className="input w-full"
                value={newProduct.recommendation}
                onChange={e =>
                  setNewProduct(prev => ({ ...prev, recommendation: e.target.value }))
                }
              />
            </div>
            {/* Terms & Conditions */}
            <div className="col-span-2">
              <label className="block">Terms &amp; Conditions (one per line)</label>
              <textarea
                className="textarea w-full"
                rows={3}
                value={newProduct.termsAndConditions}
                onChange={e =>
                  setNewProduct(prev => ({
                    ...prev,
                    termsAndConditions: e.target.value
                  }))
                }
              />
            </div>
            {/* Categories */}
            <div className="col-span-2">
              <label className="block mb-1">Categories</label>
              <div className="flex flex-wrap space-x-4">
                {categories.slice(1).map(cat => (
                  <label key={cat} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={newProduct.categories.includes(cat)}
                      onChange={e => {
                        const checked = e.target.checked;
                        setNewProduct(prev => ({
                          ...prev,
                          categories: checked
                            ? [...prev.categories, cat]
                            : prev.categories.filter(c => c !== cat)
                        }));
                      }}
                    />
                    <span className="ml-2">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-success">Save Package</button>
        </form>
      )}

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 min-h-[400px]">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Speed</th>
              <th>Actual Price</th>
              <th>Discount Price</th>
              <th>T&C</th>
              <th>Recommendation</th>
              <th>Categories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((p, idx) => (
              <tr key={p._id}>
                <th>{idx + 1}</th>
                {["title", "subtitle", "speed"].map(field => (
                  <td key={field}>
                    {editingId === p._id ? (
                      <input
                        className="input input-sm w-full"
                        value={edited[field] || ""}
                        onChange={e =>
                          setEdited(prev => ({
                            ...prev,
                            [field]: e.target.value
                          }))
                        }
                      />
                    ) : (
                      p[field]
                    )}
                  </td>
                ))}
                {["actualPrice", "discountPrice"].map(field => (
                  <td key={field}>
                    {editingId === p._id ? (
                      <input
                        type="number"
                        className="input input-sm w-full"
                        value={edited[field] || 0}
                        onChange={e =>
                          setEdited(prev => ({
                            ...prev,
                            [field]: Number(e.target.value)
                          }))
                        }
                      />
                    ) : (
                      p[field]
                    )}
                  </td>
                ))}
                <td>
                  {editingId === p._id ? (
                    <textarea
                      className="textarea textarea-sm w-full"
                      rows={3}
                      value={(edited.termsAndConditions || []).join("\n")}
                      onChange={e =>
                        setEdited(prev => ({
                          ...prev,
                          termsAndConditions: e.target.value
                            .split("\n")
                            .map(l => l.trim())
                            .filter(l => l)
                        }))
                      }
                    />
                  ) : (
                    Array.isArray(p.termsAndConditions) &&
                    p.termsAndConditions.map((t, i) => (
                      <div key={i} className="text-xs">
                        {t}
                      </div>
                    ))
                  )}
                </td>
                <td>
                  {editingId === p._id ? (
                    <input
                      className="input input-sm w-full"
                      value={edited.recommendation || ""}
                      onChange={e =>
                        setEdited(prev => ({
                          ...prev,
                          recommendation: e.target.value
                        }))
                      }
                    />
                  ) : (
                    p.recommendation
                  )}
                </td>
                <td>
                  {editingId === p._id ? (
                    <div className="flex flex-wrap gap-2">
                      {categories.slice(1).map((cat) => (
                        <label key={cat} className="inline-flex items-center gap-1">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={Array.isArray(edited.categories) && edited.categories.includes(cat)}
                            onChange={e => {
                              const checked = e.target.checked;
                              setEdited(prev => ({
                                ...prev,
                                categories: checked
                                  ? [...(prev.categories || []), cat]
                                  : (prev.categories || []).filter(c => c !== cat)
                              }));
                            }}
                          />
                          <span className="text-xs">{cat}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    Array.isArray(p.categories) ? p.categories.join(", ") : ""
                  )}
                </td>
                <td className="space-x-2 py-2">
                  {editingId === p._id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveClick(p._id)}
                        className="btn btn-success btn-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-neutral btn-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="btn btn-warning btn-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p._id)}
                        className="btn btn-error btn-xs"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        table.table {
          border-collapse: separate;
          border-spacing: 0 0.25rem;
        }
        table th, table td {
          padding: 0.5rem 0.75rem;
          vertical-align: middle;
        }
        input.input, input[type="number"], textarea.textarea {
          min-width: 80px;
          padding: 0.25rem 0.5rem;
        }
        .checkbox-xs {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </div>
  );
}

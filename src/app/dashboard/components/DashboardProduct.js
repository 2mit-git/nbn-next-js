// File: src/components/DashboardProduct.js
"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

export default function DashboardProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const alertTimeoutRef   = useRef(null);

  const [sortKey, setSortKey]             = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showAddForm, setShowAddForm]     = useState(false);

  const [newProduct, setNewProduct] = useState({
    title: "",
    subtitle: "",
    speed: "",
    actualPrice: 0,
    discountPrice: 0,
    termsAndConditions: "",
    recommendation: "",
    categories: [],
    types: [],
  });

  const [editingId, setEditingId] = useState(null);
  const [edited, setEdited]       = useState({});

  const categories = ["All", "FTTP", "HFC", "FTTN", "FTTC", "FTTB", "Wireless"];
  const types      = ["Business", "Residential"];

  const CACHE_KEY  = "nbn_products_cache";
  const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes

  const pushAlert = useCallback((type, message, timeout = 6000) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlert({ show: true, type, message });
    alertTimeoutRef.current = setTimeout(() => setAlert((a) => ({ ...a, show: false })), timeout);
  }, []);

  const writeCache = useCallback((data) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ products: data?.products || [], updatedAt: data?.updatedAt || new Date().toISOString() })
      );
    } catch {}
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const res  = await fetch("/api/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch products");
      setProducts(data.products || []);
      writeCache(data);
    } catch (e) {
      setError("Failed to load products from API.");
    } finally {
      setLoading(false);
    }
  }, [writeCache]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLoading(true);
    let usedCache = false;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        const fresh  = cached?.updatedAt && (Date.now() - new Date(cached.updatedAt).getTime() < CACHE_TTL);
        if (fresh && Array.isArray(cached?.products)) {
          setProducts(cached.products);
          setLoading(false);
          usedCache = true;
        }
      }
    } catch {}
    if (!usedCache) refreshProducts();
  }, [refreshProducts]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...newProduct,
      termsAndConditions: newProduct.termsAndConditions.split("").map((l) => l.trim()).filter(Boolean),
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
      if (!res.ok) throw new Error(body?.message || "Server rejected the add");

      setShowAddForm(false);
      setNewProduct({
        title: "",
        subtitle: "",
        speed: "",
        actualPrice: 0,
        discountPrice: 0,
        termsAndConditions: "",
        recommendation: "",
        categories: [],
        types: [],
      });

      pushAlert("success", "Product has been created successfully!");
      await refreshProducts();
    } catch (err) {
      console.error("Add failed:", err);
      pushAlert("error", err.message || "Failed to add product");
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p._id);
    setEdited({ ...p });
  };

  const handleSaveClick = async () => {
    const payload = {
      ...edited,
      id: edited._id,
      termsAndConditions: Array.isArray(edited.termsAndConditions) ? edited.termsAndConditions : [],
      actualPrice: Number(edited.actualPrice),
      discountPrice: Number(edited.discountPrice),
    };

    try {
      const res  = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Server rejected the update");

      setEditingId(null);
      pushAlert("success", "Product has been updated successfully!");
      await refreshProducts();
    } catch (err) {
      console.error("Update failed:", err);
      pushAlert("error", err.message || "Failed to update product");
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
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || "Delete request failed");

      await refreshProducts();
      pushAlert("danger", "Product has been deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      pushAlert("error", "Failed to delete product");
    }
  };

  const filtered = useMemo(() => {
    if (filterCategory === "All") return products;
    return products.filter((p) => Array.isArray(p.categories) && p.categories.includes(filterCategory));
  }, [products, filterCategory]);

  const displayProducts = useMemo(() => {
    const list = [...filtered];
    if (sortKey === "speed")       list.sort((a, b) => (a.speed || "").localeCompare(b.speed || ""));
    if (sortKey === "actualPrice") list.sort((a, b) => (a.actualPrice || 0) - (b.actualPrice || 0));
    return list;
  }, [filtered, sortKey]);

  if (loading) return <p className="m-10 text-sm opacity-70">Loading products…</p>;
  if (error)   return <p className="m-10 text-error">{error}</p>;

  return (
    <div className="w-full">
      {/* Alert */}
      {alert.show && (
        <div
          role="alert"
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-base-100/70 ${
            alert.type === "success"
              ? "border-success/30 text-success-content bg-success/10"
              : "border-error/30 text-error-content bg-error/10"
          }`}
        >
          {alert.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          )}
          <span className="text-sm">{alert.message}</span>
          <button onClick={() => setAlert((a) => ({ ...a, show: false }))} className="ml-2 rounded-full px-2 text-lg leading-none hover:opacity-70" aria-label="Close" type="button">×</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mx-auto w-full">
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-base-content/10 bg-base-100/80 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60">Filter</span>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="select select-sm select-bordered rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40">
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="join">
            <button onClick={() => setSortKey("speed")} className={`btn btn-sm btn-outline join-item rounded-l-xl focus-visible:ring-2 focus-visible:ring-[#1EA6DF]/40 ${sortKey === "speed" ? "btn-active" : ""}`}>Sort by Speed</button>
            <button onClick={() => setSortKey("actualPrice")} className={`btn btn-sm btn-outline join-item focus-visible:ring-2 focus-visible:ring-[#1EA6DF]/40 ${sortKey === "actualPrice" ? "btn-active" : ""}`}>Sort by Price</button>
            <button onClick={() => setSortKey(null)} className="btn btn-sm btn-outline join-item rounded-r-xl focus-visible:ring-2 focus-visible:ring-[#1EA6DF]/40">Clear Sort</button>
          </div>

          <button onClick={() => setShowAddForm((s) => !s)} className="btn btn-sm ml-auto border-[#1EA6DF] bg-[#1EA6DF] text-white hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#1EA6DF]/40">
            {showAddForm ? "Cancel" : "Add New Package"}
          </button>
        </div>

        {/* Create form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="mb-6 rounded-2xl border border-base-content/10 bg-base-100/80 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs opacity-70">Title</label>
                <input type="text" className="input input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={newProduct.title} onChange={(e) => setNewProduct((prev) => ({ ...prev, title: e.target.value }))} required />
              </div>
              {/* Subtitle */}
              <div>
                <label className="mb-1 block text-xs opacity-70">Subtitle</label>
                <input type="text" className="input input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={newProduct.subtitle} onChange={(e) => setNewProduct((prev) => ({ ...prev, subtitle: e.target.value }))} required />
              </div>
              {/* Speed */}
              <div>
                <label className="mb-1 block text-xs opacity-70">Speed</label>
                <input type="text" className="input input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={newProduct.speed} onChange={(e) => setNewProduct((prev) => ({ ...prev, speed: e.target.value }))} placeholder="e.g. 100Mbps/20Mbps" required />
              </div>
              {/* Actual Price */}
              <div>
                <label className="mb-1 block text-xs opacity-70">Actual Price</label>
                <input type="number" className="input input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={newProduct.actualPrice} onChange={(e) => setNewProduct((prev) => ({ ...prev, actualPrice: e.target.value === "" ? 0 : Number(e.target.value) }))} required />
              </div>
              {/* Discount Price */}
              <div>
                <label className="mb-1 block text-xs opacity-70">Discount Price</label>
                <input type="number" className="input input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={newProduct.discountPrice} onChange={(e) => setNewProduct((prev) => ({ ...prev, discountPrice: e.target.value === "" ? 0 : Number(e.target.value) }))} required />
              </div>
              {/* Recommendation */}
              <div>
                <label className="mb-1 block text-xs opacity-70">Recommendation</label>
                <input type="text" className="input input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={newProduct.recommendation} onChange={(e) => setNewProduct((prev) => ({ ...prev, recommendation: e.target.value }))} />
              </div>
              {/* T&C */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs opacity-70">Terms &amp; Conditions (one per line)</label>
                <textarea className="textarea textarea-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" rows={3} value={newProduct.termsAndConditions} onChange={(e) => setNewProduct((prev) => ({ ...prev, termsAndConditions: e.target.value }))} />
              </div>
              {/* Categories */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs opacity-70">Categories</label>
                <div className="flex flex-wrap gap-3">
                  {categories.slice(1).map((cat) => (
                    <label key={cat} className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-3 py-1 text-xs shadow-sm">
                      <input type="checkbox" className="checkbox checkbox-xs" checked={newProduct.categories.includes(cat)} onChange={(e) => {
                        const checked = e.target.checked;
                        setNewProduct((prev) => ({
                          ...prev,
                          categories: checked ? [...prev.categories, cat] : prev.categories.filter((c) => c !== cat),
                        }));
                      }} />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Types */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs opacity-70">Type</label>
                <div className="flex flex-wrap gap-3">
                  {types.map((type) => (
                    <label key={type} className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-3 py-1 text-xs shadow-sm">
                      <input type="checkbox" className="checkbox checkbox-xs" checked={newProduct.types.includes(type)} onChange={(e) => {
                        const checked = e.target.checked;
                        setNewProduct((prev) => ({
                          ...prev,
                          types: checked ? [...prev.types, type] : prev.types.filter((t) => t !== type),
                        }));
                      }} />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-success rounded-xl">Save Package</button>
            </div>
          </form>
        )}

        {/* Table */}
        <div className="min-h-[420px] overflow-x-auto rounded-2xl border border-base-content/10 bg-base-100/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
          <table className="table table-sm md:table-md w-full">
            <thead className="sticky top-0 z-10 text-[11px] uppercase tracking-wide">
              <tr className="bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">
                <th className="w-10 sticky left-0 z-10 bg-base-100/90">#</th>
                <th>Title</th>
                <th>Subtitle</th>
                <th>Speed</th>
                <th>Actual Price</th>
                <th>Discount Price</th>
                <th className="hidden lg:table-cell">T&amp;C</th>
                <th className="hidden md:table-cell">Recommendation</th>
                <th>Categories</th>
                <th>Types</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="align-middle">
              {displayProducts.map((p, idx) => (
                <tr key={p._id} className="hover">
                  <th className="sticky left-0 z-10 bg-base-100/90 text-xs opacity-70">{idx + 1}</th>

                  {["title", "subtitle", "speed"].map((field) => (
                    <td key={field} className="max-w-[220px] whitespace-pre-wrap">
                      {editingId === p._id ? (
                        <input className="input input-xs md:input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={edited[field] ?? ""} onChange={(e) => setEdited((prev) => ({ ...prev, [field]: e.target.value }))} />
                      ) : (
                        <span className="line-clamp-2">{p[field]}</span>
                      )}
                    </td>
                  ))}

                  {["actualPrice", "discountPrice"].map((field) => (
                    <td key={field}>
                      {editingId === p._id ? (
                        <input type="number" className="input input-xs md:input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={edited[field] ?? 0} onChange={(e) => setEdited((prev) => ({ ...prev, [field]: Number(e.target.value) }))} />
                      ) : (
                        <span className="font-semibold">{p[field]}</span>
                      )}
                    </td>
                  ))}

                  <td className="hidden lg:table-cell max-w-[320px]">
                    {editingId === p._id ? (
                      <textarea className="textarea textarea-bordered w-full rounded-xl textarea-xs md:textarea-sm focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" rows={3} value={(edited.termsAndConditions || []).join("")} onChange={(e) => setEdited((prev) => ({ ...prev, termsAndConditions: e.target.value.split("").map((l) => l.trim()).filter(Boolean) }))} />
                    ) : Array.isArray(p.termsAndConditions) ? (
                      <div className="max-h-24 space-y-1 overflow-auto pr-1">
                        {p.termsAndConditions.map((t, i) => (
                          <div key={i} className="text-[11px] leading-4 opacity-80">{t}</div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </td>

                  <td className="hidden md:table-cell max-w-[220px]">
                    {editingId === p._id ? (
                      <input className="input input-xs md:input-sm input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1EA6DF]/40" value={edited.recommendation ?? ""} onChange={(e) => setEdited((prev) => ({ ...prev, recommendation: e.target.value }))} />
                    ) : (
                      <span className="line-clamp-2">{p.recommendation}</span>
                    )}
                  </td>

                  <td className="max-w-[240px]">
                    {editingId === p._id ? (
                      <div className="flex flex-wrap gap-2">
                        {categories.slice(1).map((cat) => (
                          <label key={cat} className="inline-flex items-center gap-1 rounded-full border border-base-content/10 bg-base-100 px-2 py-1 text-[11px] shadow-sm">
                            <input type="checkbox" className="checkbox checkbox-[10px]" checked={Array.isArray(edited.categories) && edited.categories.includes(cat)} onChange={(e) => {
                              const checked = e.target.checked;
                              setEdited((prev) => ({
                                ...prev,
                                categories: checked ? [...(prev.categories || []), cat] : (prev.categories || []).filter((c) => c !== cat),
                              }));
                            }} />
                            <span>{cat}</span>
                          </label>
                        ))}
                      </div>
                    ) : Array.isArray(p.categories) ? (
                      <div className="flex flex-wrap gap-1">
                        {p.categories.map((c) => (
                          <span key={c} className="badge badge-ghost badge-sm border border-[#1EA6DF]/30 text-[#1EA6DF]">{c}</span>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </td>

                  <td className="max-w-[200px]">
                    {editingId === p._id ? (
                      <div className="flex flex-wrap gap-2">
                        {types.map((type) => (
                          <label key={type} className="inline-flex items-center gap-1 rounded-full border border-base-content/10 bg-base-100 px-2 py-1 text-[11px] shadow-sm">
                            <input type="checkbox" className="checkbox checkbox-[10px]" checked={Array.isArray(edited.types) && edited.types.includes(type)} onChange={(e) => {
                              const checked = e.target.checked;
                              setEdited((prev) => ({
                                ...prev,
                                types: checked ? [...(prev.types || []), type] : (prev.types || []).filter((t) => t !== type),
                              }));
                            }} />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    ) : Array.isArray(p.types) ? (
                      <div className="flex flex-wrap gap-1">
                        {p.types.map((t) => (
                          <span key={t} className="badge badge-outline badge-sm">{t}</span>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </td>

                  <td className="py-2 text-right">
                    {editingId === p._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleSaveClick} className="btn btn-success btn-xs rounded-lg">Save</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-neutral btn-xs rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(p)} className="btn btn-warning btn-xs rounded-lg">Edit</button>
                        <button onClick={() => handleDeleteClick(p._id)} className="btn btn-error btn-xs rounded-lg">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

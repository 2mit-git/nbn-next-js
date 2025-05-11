// File: src/components/DashboardProduct.js
"use client";
import React, { useState, useEffect } from "react";

export default function DashboardProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [edited, setEdited] = useState({});
  const [addingCategory, setAddingCategory] = useState(null);
  const [newProduct, setNewProduct] = useState({});
  const [openCats, setOpenCats] = useState({});

  const categories = ["FTTP", "HFC", "FTTN_FTTC_FTTB", "Wireless"];

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const toggleCategory = (cat) =>
    setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleEditClick = (p) => {
    setEditingId(p._id);
    setEdited({ ...p });
    setOpenCats((prev) => ({ ...prev, [p.category]: true }));
  };

  const handleSaveClick = async (id) => {
    try {
      const trimmedTCs = Array.isArray(edited.termsAndConditions)
        ? edited.termsAndConditions.map((l) => l.trim()).filter((l) => l)
        : [];
      const payload = { ...edited, termsAndConditions: trimmedTCs, id };
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      loadProducts();
    } catch {
      alert("Failed to update product");
    }
  };

  const handleDeleteClick = async (id, category) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setOpenCats((prev) => ({ ...prev, [category]: true }));
      loadProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleAddClick = (category) => {
    setAddingCategory(category);
    setNewProduct({ category, termsAndConditions: [] });
    setOpenCats((prev) => ({ ...prev, [category]: true }));
  };

  const handleSaveNew = async (category) => {
    try {
      const tcs = Array.isArray(newProduct.termsAndConditions)
        ? newProduct.termsAndConditions.map((l) => l.trim()).filter((l) => l)
        : [];
      const payload = { ...newProduct, category, termsAndConditions: tcs };
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setAddingCategory(null);
      loadProducts();
    } catch {
      alert("Failed to add product");
    }
  };

  if (loading) return <p className="m-10">Loading products…</p>;
  if (error)   return <p className="m-10 text-red-500">{error}</p>;

  return (
    <div className="w-full h-full">
      <div className="m-10 space-y-6">
        {categories.map((cat) => {
          const items = products.filter((p) => p.category === cat);
          const isOpen = !!openCats[cat];
          return (
            <div
              key={cat}
              className={`collapse collapse-arrow bg-base-100 border border-base-300 ${
                isOpen ? "collapse-open" : ""
              }`}
            >
              <input type="checkbox" />
              <div
                onClick={() => toggleCategory(cat)}
                className="collapse-title flex items-center justify-between font-semibold"
              >
                <span>{cat}</span>
              </div>

              <div className="collapse-content text-sm">
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((p, idx) => {
                        const tcs = Array.isArray(p.termsAndConditions)
                          ? p.termsAndConditions
                          : [];
                        return (
                          <tr key={p._id}>
                            <th>{idx + 1}</th>
                            {['title', 'subtitle', 'speed', 'actualPrice', 'discountPrice'].map((field) => (
                              <td key={field}>
                                {editingId === p._id ? (
                                  <input
                                    type={field.includes('Price') ? 'number' : 'text'}
                                    className="input input-sm w-full"
                                    value={edited[field] || ''}
                                    onChange={(e) =>
                                      setEdited((prev) => ({
                                        ...prev,
                                        [field]: field.includes('Price')
                                          ? parseFloat(e.target.value)
                                          : e.target.value,
                                      }))}
                                  />
                                ) : (
                                  p[field]
                                )}
                              </td>
                            ))}

                            {/* T&C */}
                            <td>
                              {editingId === p._id ? (
                                <textarea
                                  className="textarea textarea-sm w-full"
                                  rows={Math.max(3, tcs.length)}
                                  value={(edited.termsAndConditions || []).join("\n")}
                                  onChange={(e) =>
                                    setEdited((prev) => ({
                                      ...prev,
                                      termsAndConditions: e.target.value
                                        .split("\n")
                                        .map((l) => l.trim())
                                        .filter((l) => l),
                                    }))
                                  }
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              ) : (
                                tcs.map((t, i) => (
                                  <div key={i} className="text-xs">
                                    {t}
                                  </div>
                                ))
                              )}
                            </td>

                            {/* Recommendation */}
                            <td>
                              {editingId === p._id ? (
                                <input
                                  type="text"
                                  className="input input-sm w-full"
                                  value={edited.recommendation || ''}
                                  onChange={(e) =>
                                    setEdited((prev) => ({
                                      ...prev,
                                      recommendation: e.target.value,
                                    }))
                                  }
                                />
                              ) : (
                                p.recommendation
                              )}
                            </td>

                            {/* Actions */}
                            <td className="space-x-2">
                              {editingId === p._id ? (
                                <>
                                  <button onClick={() => handleSaveClick(p._id)} className="btn btn-success btn-sm">
                                    Save
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="btn btn-neutral btn-sm">
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEditClick(p)} className="btn btn-warning btn-sm">
                                    Edit
                                  </button>
                                  <button onClick={() => handleDeleteClick(p._id, cat)} className="btn btn-error btn-sm">
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {addingCategory === cat && (
                        <tr>
                          <th>*</th>
                          {['title', 'subtitle', 'speed', 'actualPrice', 'discountPrice'].map((field) => (
                            <td key={field}>
                              <input
                                type={field.includes('Price') ? 'number' : 'text'}
                                className="input input-sm w-full"
                                placeholder={field}
                                value={newProduct[field] || ''}
                                onChange={(e) =>
                                  setNewProduct((prev) => ({
                                    ...prev,
                                    [field]: field.includes('Price')
                                      ? parseFloat(e.target.value)
                                      : e.target.value,
                                  }))
                                }
                              />
                            </td>
                          ))}
                          <td>
                            <textarea
                              className="textarea textarea-sm w-full"
                              rows={3}
                              placeholder="One term per line"
                              value={(newProduct.termsAndConditions || []).join("\n")}
                              onChange={(e) =>
                                setNewProduct((prev) => ({
                                  ...prev,
                                  termsAndConditions: e.target.value
                                    .split("\n")
                                    .map((l) => l.trim())
                                    .filter((l) => l),
                                }))
                              }
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input input-sm w-full"
                              placeholder="recommendation"
                              value={newProduct.recommendation || ''}
                              onChange={(e) =>
                                setNewProduct((prev) => ({
                                  ...prev,
                                  recommendation: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="space-x-2">
                            <button onClick={() => handleSaveNew(cat)} className="btn btn-success btn-sm">
                              Add
                            </button>
                            <button onClick={() => setAddingCategory(null)} className="btn btn-neutral btn-sm">
                              Cancel
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddClick(cat); }}
                  className="btn btn-success btn-sm mt-5"
                >Add Item</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

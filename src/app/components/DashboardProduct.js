"use client";
import React, { useState, useEffect } from "react";

export default function DashboardProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedSpeed, setEditedSpeed] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [addingCategory, setAddingCategory] = useState(null);
  const [newSpeed, setNewSpeed] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [openCats, setOpenCats] = useState({});

  const categories = ["FTTP", "HFC", "FTTN_FTTC_FTTB", "Wireless"];

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleCategory = (cat) => {
    setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setEditedSpeed(product.speed);
    setEditedPrice(product.price);
    setOpenCats((prev) => ({ ...prev, [product.category]: true }));
  };

  const handleSaveClick = async (id) => {
    if (!editedSpeed || !editedPrice) {
      return alert("Speed and price required");
    }
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          category: products.find((p) => p._id === id).category,
          speed: editedSpeed,
          price: editedPrice,
        }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      setOpenCats((prev) => ({
        ...prev,
        [products.find((p) => p._id === id).category]: true,
      }));
      loadProducts();
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleAddClick = (category) => {
    setAddingCategory(category);
    setNewSpeed("");
    setNewPrice("");
    setOpenCats((prev) => ({ ...prev, [category]: true }));
  };

  const handleSaveNew = async (category) => {
    if (!newSpeed || !newPrice) {
      return alert("Speed and price required");
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, speed: newSpeed, price: newPrice }),
      });
      if (!res.ok) throw new Error();
      setAddingCategory(null);
      setOpenCats((prev) => ({ ...prev, [category]: true }));
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    }
  };

  if (loading) return <p className="m-10">Loading products…</p>;
  if (error) return <p className="m-10 text-red-500">{error}</p>;

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
                        <th></th>
                        <th>Speed</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((p, idx) => (
                        <tr key={p._id}>
                          <th>{idx + 1}</th>
                          <td>
                            {editingId === p._id ? (
                              <input
                                type="text"
                                className="input input-sm w-full"
                                value={editedSpeed}
                                onChange={(e) => setEditedSpeed(e.target.value)}
                              />
                            ) : (
                              p.speed
                            )}
                          </td>
                          <td>
                            {editingId === p._id ? (
                              <input
                                type="text"
                                className="input input-sm w-full"
                                value={editedPrice}
                                onChange={(e) => setEditedPrice(e.target.value)}
                              />
                            ) : (
                              p.price
                            )}
                          </td>
                          <td className="space-x-2">
                            {editingId === p._id ? (
                              <>
                                <button
                                  onClick={() => handleSaveClick(p._id)}
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
                                  onClick={() => handleEditClick(p)}
                                  className="btn btn-warning btn-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(p._id, cat)}
                                  className="btn btn-error btn-sm"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}

                      {addingCategory === cat && (
                        <tr>
                          <th>*</th>
                          <td>
                            <input
                              type="text"
                              className="input input-sm w-full"
                              placeholder="Speed"
                              value={newSpeed}
                              onChange={(e) => setNewSpeed(e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input input-sm w-full"
                              placeholder="Price"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                            />
                          </td>
                          <td className="space-x-2">
                            <button
                              onClick={() => handleSaveNew(cat)}
                              className="btn btn-success btn-sm"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setAddingCategory(null)}
                              className="btn btn-neutral btn-sm"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddClick(cat);
                  }}
                  className="btn btn-success btn-sm ml-2 mt-5"
                >
                  Add Item
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// File: src/app/components/ProductGrid.jsx
"use client";
import React, { useState, useEffect } from "react";

export default function ProductGrid({ tech, onSelectPlan }) {
  const [all, setAll]             = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error("Network error");
        return r.json();
      })
      .then(setAll)
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="m-10">Loading…</p>;
  if (error)   return <p className="m-10 text-red-500">{error}</p>;

  // Only show plans matching the selected tech
  const list = tech
    ? all.filter((p) => p.category.toLowerCase() === tech.toLowerCase())
    : [];

  if (tech && list.length === 0) {
    return (
      <p className="m-10 text-center italic">
        No plans available for <strong>{tech}</strong>.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {list.map((p) => (
        <div key={p._id} className="card bg-base-100 shadow-sm">
          {p.recommendation && (
            <div className="card-actions justify-end p-2">
              <span className="badge badge-warning">{p.recommendation}</span>
            </div>
          )}
          <div className="card-body">
            <div className="flex justify-between items-baseline">
              <h2 className="text-3xl font-bold">{p.title}</h2>
              <div className="flex items-baseline space-x-2">
                <span className="line-through text-base-content/50">
                  ${p.actualPrice.toFixed(2)}
                </span>
                <span className="text-2xl text-primary font-semibold">
                  ${p.discountPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{p.subtitle}</p>
            <p className="mt-1 text-xs text-gray-500">{p.speed}</p>
            <ul className="mt-4 space-y-1 text-xs">
              {p.termsAndConditions.map((t, i) => (
                <li key={i} className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-success mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            {/* <-- Here we call onSelectPlan when clicked --> */}
            <button
              className="btn btn-primary btn-block mt-6"
              onClick={() => onSelectPlan(p)}
            >
              Select plan
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

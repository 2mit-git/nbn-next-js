// File: src/app/components/ProductGrid.jsx
"use client";
import React, { useState, useEffect } from "react";

export default function ProductGrid({ tech, onSelectPlan }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log(tech)

  // Cache key
  const CACHE_KEY = "product_grid_cache";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Try to load cache
    let cached = null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch (e) {}

    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error("Network error");
        return r.json();
      })
      .then((data) => {
        // data: { products, updatedAt }
        if (
          cached &&
          cached.updatedAt &&
          data.updatedAt &&
          cached.updatedAt === data.updatedAt &&
          Array.isArray(cached.products)
        ) {
          setAll(cached.products);
        } else {
          setAll(data.products);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ products: data.products, updatedAt: data.updatedAt })
            );
          } catch (e) {}
        }
      })
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex gap-6">
        <div >
          <div className="flex w-80 flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </div>
        <div>
          <div className="flex w-80 flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </div>
        <div>
          <div className="flex w-80 flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </div>
        <div>
          <div className="flex w-80 flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </div>
      </div>;
  if (error) return <p className="m-10 text-red-500">{error}</p>;

  // Only show plans matching the selected tech, sorted by price (low to high)
  console.log(all)
  const list = tech
    ? all
        .filter(
          (p) =>
            Array.isArray(p.categories) &&
            p.categories.some(
              (cat) => cat.toLowerCase() === tech.toLowerCase()
            )
        )
        .sort((a, b) => (a.discountPrice ?? a.actualPrice ?? 0) - (b.discountPrice ?? b.actualPrice ?? 0))
    : [];

  if (tech && list.length === 0) {
    return (
      <p className="m-10 text-center italic">
        No plans available for <strong>{tech}</strong>.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {list.map((p) => (
        // ⬅️ CHANGED: Using Uiverse-style card design
        <div
          key={typeof p._id === "object" && p._id.$oid ? p._id.$oid : String(p._id)}
          className="rounded-2xl shadow-lg p-3 bg-[#1DA6DF] text-gray-600 mx-auto max-w-xs w-full"
        >
          <div className="relative flex flex-col items-center p-5 pt-20 pb-10 bg-[#c1e4f5] rounded-xl">
            {/* Price badge */}

            <div className="mt-[-12px] me-[-12px]  absolute top-0 right-0 flex flex-col items-center bg-[#0B3559] rounded-l-full rounded-tr-2xl py-2 px-3 text-2xl">
              <div>
                <span className="font-semibold text-white">
                  ${p.discountPrice}{" "}
                  <small className="text-xs ml-1 text-white">/ month</small>
                </span>
              </div>
              <div className="flex w-full justify-end">
                <small className="block m-0 p-0 text-[10px] text-white leading-none text-end">
                For the first 6 months
               <br /> 
                after that <strong>{p.actualPrice}</strong>/mth
              </small>
              </div>
            </div>

            {/* Plan title */}
            <p className="text-xl font-semibold text-white bg-[#1DA6DF] px-2 py-1 rounded-lg ">
              {p.speed}
            </p>

            {/* Subtitle */}
            <p className="text-center mt-3 text-sm text-gray-700">
              {p.subtitle}
            </p>
            <div className="divider"></div>
            {/* Features list (T&C) */}
            <ul className="flex flex-col space-y-3 mt-4 w-full">
              {p.termsAndConditions.map((t, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 bg-teal-500 text-white rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path
                        d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="text-gray-800">{t}</span>
                </li>
              ))}
            </ul>

            <div className="divider"></div>
            <div className="flex flex-col w-full text-[13px] text-black">
              <strong>Recomended for : </strong>
              <p>{p.recommendation}</p>
            </div>
            {/* Action button */}
            <div className="w-full flex justify-end mt-6">
              <button
                className="w-full py-3 text-center text-white bg-[#0B3559] rounded-lg font-medium text-lg hover:bg-[#000000] focus:outline-none"
                onClick={() => onSelectPlan(p)} // ⬅️ Calls parent handler
              >
                Select plan
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

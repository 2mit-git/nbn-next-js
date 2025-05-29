// File: src/app/components/ProductGrid.jsx
"use client";
import React, { useState, useEffect } from "react";

export default function ProductGrid({ tech, onSelectPlan, onLoadingChange }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error("Network error");
        return r.json();
      })
      .then((data) => {
        setAll(data.products);
      })
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof onLoadingChange === "function") {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  if (loading)
    return (
      <div className="flex gap-6 items-center justify-center">
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
        <div>
          <div className="flex w-80 flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </div>
      </div>
    );
  if (error) return <p className="m-10 text-red-500">{error}</p>;

  // Only show plans matching the selected tech, sorted by price (low to high)

  // inside your component render/body
  const list = tech
    ? all
        .filter((p) => {
          // special case for FTTP_Upgrade
          if (tech === "FTTP_Upgrade") {
            // match only FTTP packages and speed 100Mbps or above
            if (
              Array.isArray(p.categories) &&
              p.categories.some((cat) => cat.toLowerCase() === "fttp") &&
              typeof p.speed === "string"
            ) {
              // Extract the numeric part before 'Mbps'
              const match = p.speed.match(/^(\d+)/);
              const speedNum = match ? parseInt(match[1], 10) : 0;
              return speedNum >= 100;
            }
            return false;
          }
          // default behaviour: match whatever tech the user picked
          return (
            Array.isArray(p.categories) &&
            p.categories.some((cat) => cat.toLowerCase() === tech.toLowerCase())
          );
        })
        .sort(
          (a, b) =>
            (a.discountPrice ?? a.actualPrice ?? 0) -
            (b.discountPrice ?? b.actualPrice ?? 0)
        )
    : [];

  if (tech && list.length === 0) {
    return (
      <p className="m-10 text-center italic">
        No plans available for <strong>{tech}</strong>.
      </p>
    );
  }

  // Helper to extract download and upload speeds as numbers
  function getSpeeds(speedStr) {
    const match = speedStr.match(/^(\d+)[^\d]+(\d+)/);
    if (match) {
      return { down: parseInt(match[1], 10), up: parseInt(match[2], 10) };
    }
    // fallback: try to extract only download if upload missing
    const single = speedStr.match(/^(\d+)/);
    return { down: single ? parseInt(single[1], 10) : 0, up: 0 };
  }

  // Find min upload speed among plans with down === 100
  const minUpFor100 = list.reduce((min, p) => {
    if (typeof p.speed === "string") {
      const { down, up } = getSpeeds(p.speed);
      if (down === 100) {
        return Math.min(min, up);
      }
    }
    return min;
  }, Infinity);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 items-stretch">
      {list.map((p) => (
        // ⬅️ CHANGED: Using Uiverse-style card design
        <div
          key={
            typeof p._id === "object" && p._id.$oid ? p._id.$oid : String(p._id)
          }
          className="rounded-2xl shadow-lg p-3 bg-[#1DA6DF] text-gray-600 mx-auto max-w-xs w-full h-full flex"
        >
          <div className="relative flex flex-col justify-between items-stretch p-5 pt-20 pb-6 bg-[#c1e4f5] rounded-xl min-h-[500px] h-full w-full">
            {/* Price badge */}
            {(() => {
              const { down, up } = getSpeeds(p.speed);

              // Show "Best Deal" only if down is 100 and up is the minimum for 100Mbps plans
              if (down === 100 && up === minUpFor100) {
                return (
                  <div className="mt-[-12px] me-[-12px] absolute top-0 right-0 flex flex-col items-center bg-primary rounded-l-full rounded-tr-2xl py-2 px-3 text-xl sm:text-2xl">
                    <div>
                      <span className="font-bold text-[#FFFFFF]">
                        <p className="text-xs font-bold text-[#FFFFFF] text-end w-full">Best Deal</p>${p.discountPrice}
                        <small className="text-xs ml-1 text-[#FFFFFF]">
                          / month
                        </small>
                      </span>
                    </div>
                    <div className="flex w-full justify-end">
                      <small className="block m-0 p-0 text-[11px] text-[#FFFFFF] leading-none text-end">
                        For the first 6 months
                        <br />
                        after that <strong>{p.actualPrice}</strong>/mth
                      </small>
                    </div>
                  </div>
                );
              }
              // Default badge for other plans
              return (
                <div className="mt-[-12px] me-[-12px] absolute top-0 right-0 flex flex-col items-center bg-[#0B3559] rounded-l-full rounded-tr-2xl py-2 px-3 text-xl sm:text-2xl">
                  <div>
                    <span className="font-bold text-white">
                      ${p.discountPrice}
                      <small className="text-xs ml-1 text-white">/ month</small>
                    </span>
                  </div>
                  <div className="flex w-full justify-end">
                    <small className="block m-0 p-0 text-[11px] text-white leading-none text-end">
                      For the first 6 months
                      <br />
                      after that <strong>{p.actualPrice}</strong>/mth
                    </small>
                  </div>
                </div>
              );
            })()}

            {/* Main content */}
            <div className="flex flex-col flex-1 justify-between items-stretch">
              {/* Top: Title + Subtitle */}
              <div
                className="flex flex-col items-stretch mb-2"
                style={{ minHeight: 90 }}
              >
                <p className="text-2xl md:text-base  sm:text-xl font-bold text-white bg-[#1DA6DF] px-3 py-2 rounded-lg text-center mb-2">
                  {p.speed}
                </p>

                <p className="text-center text-base  text-gray-700 font-medium min-h-[32px] flex items-center justify-center">
                  {p.subtitle}
                </p>
              </div>
              {/* Features list (T&C) */}
              <div
                className="flex flex-col justify-start"
                style={{ minHeight: 110 }}
              >
                <div className="divider my-2"></div>
                <ul className="flex flex-col space-y-2 mt-2 w-full">
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
                      <span className="text-gray-800 text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Recommended for */}
              <div
                className="flex flex-col w-full text-[14px] text-black mb-2 mt-2"
                style={{ minHeight: 56 }}
              >
                <div className="divider my-2"></div>
                <strong className="mb-1">Recommended for:</strong>
                <p className="min-h-[24px]">{p.recommendation}</p>
              </div>
            </div>
            {/* Action button */}
            <div className="w-full flex mt-4">
              <button
                className="w-full py-2 sm:py-3 text-center text-white bg-[#0B3559] rounded-lg font-semibold text-base sm:text-lg hover:bg-[#000000] focus:outline-none transition-all"
                onClick={() => onSelectPlan(p)}
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

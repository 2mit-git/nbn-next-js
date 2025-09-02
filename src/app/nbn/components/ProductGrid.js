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

  // CircularProgress component
  const CircularProgress = ({ speed }) => {
    const { down } = getSpeeds(speed);
    const percentage = Math.min((down / 1000) * 100, 100); // Assuming 1000 Mbps as max
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#1DA6DF"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{down}</span>
          <span className="text-sm text-gray-600">Mbps</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {list.map((p) => {
        const { down, up } = getSpeeds(p.speed);
        const isBestDeal = down === 100 && up === minUpFor100;

        return (
          <div
            key={
              typeof p._id === "object" && p._id.$oid
                ? p._id.$oid
                : String(p._id)
            }
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
          >
            {/* Best Deal Badge */}
            {isBestDeal && (
              <div className="absolute top-0 left-0 right-0 bg-[#1DA6DF] text-white text-center py-2 text-sm font-semibold z-10">
                BEST DEAL
              </div>
            )}

            <div
              className={`pt-10 flex flex-col h-full ${
                isBestDeal ? "pt-10" : ""
              }`}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {(() => {
                    const words = p.title.split(" ");
                    const first = words[0];
                    const rest = words.slice(1).join(" ");
                    return (
                      <>
                        {first} <span className="text-[#1DA6DF]">{rest}</span>
                      </>
                    );
                  })()}
                </h3>
              </div>

              {/* Circular Progress */}
              <div className="flex justify-center mb-6">
                <CircularProgress speed={p.speed} />
              </div>

              {/* Speed indicators */}
              <div className="mb-4 px-4">
                <div className="text-center flex justify-evenly w-full">
                  <div className="flex items-center justify-center mb-1 w-50">
                    <svg
                      className="w-4 h-4 text-[#1DA6DF] mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {down} Mbps
                    </span>
                  </div>
                  <div className="flex items-center justify-center mb-1 w-50">
                    <svg
                      className="w-4 h-4 text-[#1DA6DF] mr-1 transform rotate-180"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {up} Mbps
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500">{p.subtitle}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-6 text-[#1DA6DF]">
                <div className="text-3xl font-bold ">
                  ${p.discountPrice}
                  <span className="text-lg font-normal">/Month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  for first 6 months, then ${p.actualPrice}/month
                </p>
              </div>

              <div className="bg-[#1DA6DF] text-white p-4   flex-grow flex flex-col">
                {/* Features */}
                <div className="flex-1">
                  <h4 className="font-extrabold mb-3">Key Features</h4>
                  <ul >
                    {p.termsAndConditions.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-white mr-2">•</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Recommendation */}
                <div className="mt-6">
                  <hr />
                  <h4 className="font-extrabold mb-2">Recommended for</h4>
                  <p className="text-sm">{p.recommendation}</p>
                </div>

                {/* Select Plan Button */}
                <button
                  className={`w-full p-3 mt-5 rounded-lg font-semibold text-black transition-colors ${
                    isBestDeal
                      ? "bg-white hover:bg-[#d4d4d4]"
                      : "bg-white  hover:bg-[#d4d4d4]"
                  }`}
                  onClick={() => onSelectPlan(p)}
                >
                  Select Plan
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

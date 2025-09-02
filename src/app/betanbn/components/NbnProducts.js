"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Props:
 * - selectedTech?: "FTTP_Upgrade" | null
 * - originalTech?: "FTTC" | "FTTP" | "HFC" | "FTTN" | null
 * - onSelectPlan?: (product) => void
 * - onLoadingChange?: (loading: boolean) => void
 * - back?: () => void
 * - selectedTab?: "regular" | "upgrade"
 * - setSelectedTab?: (tab) => void
 */
export default function NbnProducts({
  selectedTech,
  originalTech,
  onSelectPlan,
  onLoadingChange,
  back,
  selectedTab,
  setSelectedTab,
}) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const upgradeEligible = selectedTech === "FTTP_Upgrade";
  const showTabs = upgradeEligible;

  // Tabs (only when upgrade eligible)
  const [internalTab, setInternalTab] = useState(upgradeEligible ? "upgrade" : "regular");
  const activeTab = selectedTab ?? internalTab;
  const handleSetTab = setSelectedTab ?? setInternalTab;

  useEffect(() => {
    if (!showTabs) setInternalTab("regular");
    else setInternalTab("upgrade");
  }, [showTabs]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Network error"))))
      .then((data) => setAll(data.products || []))
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  /* ------------ helpers ------------ */
  const effectivePrice = (p) =>
    (p?.discountPrice ?? p?.actualPrice ?? Number.MAX_SAFE_INTEGER);

  const hasCategory = (p, cat) =>
    Array.isArray(p?.categories) &&
    p.categories.some((c) => String(c).toLowerCase() === String(cat).toLowerCase());

  const getSpeeds = (speedStr = "") => {
    const match = String(speedStr).match(/^(\d+)[^\d]+(\d+)/);
    if (match) return { down: parseInt(match[1], 10) || 0, up: parseInt(match[2], 10) || 0 };
    const single = String(speedStr).match(/^(\d+)/);
    return { down: single ? parseInt(single[1], 10) : 0, up: 0 };
  };

  const isUpgradePlan = (p) => {
    if (!hasCategory(p, "FTTP")) return false;
    const { down } = getSpeeds(p.speed);
    return down >= 100; // FTTP & 100+ Mbps
  };

  /* ------------ visible list (same logic as before) ------------ */
  const effectiveTab = showTabs ? activeTab : "regular";

  const visible = useMemo(() => {
    let list = [...all];

    if (effectiveTab === "upgrade") {
      list = list.filter(isUpgradePlan);
    } else {
      if (originalTech) list = list.filter((p) => hasCategory(p, originalTech));
      // else (no address) -> show all
    }

    list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    return list;
  }, [all, effectiveTab, originalTech]);

  // “BEST DEAL” within the visible set (min upload among 100-down plans)
  const minUpFor100 = useMemo(() => {
    return visible.reduce((min, p) => {
      const speed = String(p.speed || "");
      const m = speed.match(/^(\d+)[^\d]+(\d+)/);
      if (m && parseInt(m[1], 10) === 100) {
        const up = parseInt(m[2], 10) || 0;
        return Math.min(min, up);
      }
      return min;
    }, Infinity);
  }, [visible]);

  /* ------------ SMOOTH SLIDER ------------ */
  const containerRef = useRef(null);
  const [perView, setPerView] = useState(4);
  const [page, setPage] = useState(0);

  // responsive per-view (1/2/4)
  useEffect(() => {
    const updatePerView = () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(min-width: 1024px)").matches) setPerView(4);
      else if (window.matchMedia("(min-width: 640px)").matches) setPerView(2);
      else setPerView(1);
    };
    updatePerView();
    window.addEventListener("resize", updatePerView);
    return () => window.removeEventListener("resize", updatePerView);
  }, []);

  const totalPages = Math.max(1, Math.ceil(visible.length / perView));

  // keep page/scroll in sync when data or layout changes
  useEffect(() => {
    setPage(0);
    const el = containerRef.current;
    if (el) el.scrollTo({ left: 0, behavior: "smooth" });
  }, [visible, perView, effectiveTab]);

  // update current page from scroll position (throttled)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const p = Math.round(el.scrollLeft / el.clientWidth);
        if (p !== page) setPage(p);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [page]);

  const scrollToPage = (idx) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, totalPages - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setPage(clamped);
  };

  const prev = () => scrollToPage(page - 1);
  const next = () => scrollToPage(page + 1);

  /* ------------ UI ------------ */
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="flex w-80 flex-col gap-4">
              <div className="skeleton h-32 w-full"></div>
              <div className="skeleton h-4 w-28"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error) return <p className="m-10 text-red-500">{error}</p>;

  const showEmptyRegular = effectiveTab === "regular" && originalTech && visible.length === 0;
  const showEmptyUpgrade = effectiveTab === "upgrade" && visible.length === 0;

  return (
    <div className="relative">
      {/* Tabs only if upgrade eligible */}
      {showTabs && <TabStrip activeTab={activeTab} setTab={handleSetTab} />}

      {/* Empty states */}
      {showEmptyRegular && (
        <p className="m-10 text-center italic">
          No plans available for <strong>{originalTech}</strong>.
        </p>
      )}
      {showEmptyUpgrade && (
        <p className="m-10 text-center italic">No upgrade packages available.</p>
      )}

      {/* Smooth slider */}
      {!showEmptyRegular && !showEmptyUpgrade && (
        <div className="relative">
          {/* Left arrow */}
          {page > 0 && (
            <button
              aria-label="Previous"
              onClick={prev}
              className="absolute left-[-1.75rem] top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#1DA6DF] p-2 text-[#1DA6DF] hover:bg-blue-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {page < totalPages - 1 && (
            <button
              aria-label="Next"
              onClick={next}
              className="absolute right-[-1.75rem] top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#1DA6DF] p-2 text-[#1DA6DF] hover:bg-blue-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Track */}
          <div
            ref={containerRef}
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory"
            style={{ scrollPadding: "0 12px" }}
          >
            {visible.map((p) => {
              const { down, up } = getSpeeds(p.speed);
              const isBestDeal = down === 100 && up === minUpFor100;
              const key =
                typeof p._id === "object" && p._id?.$oid ? p._id.$oid : String(p._id);

              return (
                <div
                  key={key}
                  className="snap-start shrink-0"
                    style={{ width: `calc((100% - ${perView * 12}px) / ${perView})` }}
                >
                  {/* CARD — unchanged */}
                  <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
                    {isBestDeal && (
                      <div className="absolute left-0 right-0 top-0 z-10 bg-[#1DA6DF] py-2 text-center text-sm font-semibold text-white">
                        BEST DEAL
                      </div>
                    )}

                    <div className="flex h-full flex-col pt-10">
                      <div className="mb-6 text-center">
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                          {(() => {
                            const words = String(p.title || "").split(" ");
                            const first = words.shift() || "";
                            const rest = words.join(" ");
                            return (
                              <>
                                {first} <span className="text-[#1DA6DF]">{rest}</span>
                              </>
                            );
                          })()}
                        </h3>
                      </div>

                      <div className="mb-6 flex justify-center">
                        <CircularProgress speed={p.speed} />
                      </div>

                      <div className="mb-4 px-4">
                        <div className="flex w-full justify-evenly text-center">
                          <div className="mb-1 flex w-50 items-center justify-center">
                            <svg className="mr-1 h-4 w-4 text-[#1DA6DF]" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">{down} Mbps</span>
                          </div>
                          <div className="mb-1 flex w-50 items-center justify-center">
                            <svg className="mr-1 h-4 w-4 rotate-180 text-[#1DA6DF]" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">{up} Mbps</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-gray-500">{p.subtitle}</span>
                        </div>
                      </div>

                      <div className="mb-6 text-center text-[#1DA6DF]">
                        <div className="text-3xl font-bold">
                          ${p.discountPrice}
                          <span className="text-lg font-normal">/Month</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          for first 6 months, then ${p.actualPrice}/month
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col bg-[#1DA6DF] p-4 text-white">
                        <div className="flex-1">
                          <h4 className="mb-3 font-extrabold">Key Features</h4>
                          <ul>
                            {(p.termsAndConditions || []).map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 text-white">•</span>
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-6">
                          <hr />
                          <h4 className="mb-2 font-extrabold">Recommended for</h4>
                          <p className="text-sm">{p.recommendation}</p>
                        </div>

                        <button
                          className="mt-5 w-full rounded-lg bg-white p-3 font-semibold text-black transition-colors hover:bg-[#d4d4d4]"
                          onClick={() => onSelectPlan?.(p)}
                        >
                          Select Plan
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* /CARD */}
                </div>
              );
            })}
          </div>

          {/* Dots */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToPage(i)}
                  className={`h-2 w-2 rounded-full ${i === page ? "bg-[#1DA6DF]" : "bg-gray-300"}`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {typeof back === "function" && (
        <button className="btn btn-neutral mt-6" onClick={back}>
          ← Back
        </button>
      )}
    </div>
  );
}

/* ---------------- UI helpers ---------------- */
function TabStrip({ activeTab, setTab }) {
  return (
    <div className="mb-6 flex justify-center gap-2">
      <button
        className={`rounded-t-lg border-b-2 px-6 py-2 font-semibold transition-colors ${
          activeTab === "regular"
            ? "border-[#1DA6DF] bg-blue-50 text-[#1DA6DF]"
            : "border-transparent bg-white text-gray-500"
        }`}
        onClick={() => setTab("regular")}
        disabled={activeTab === "regular"}
      >
        Regular Packages
      </button>
      <button
        className={`rounded-t-lg border-b-2 px-6 py-2 font-semibold transition-colors ${
          activeTab === "upgrade"
            ? "border-[#1DA6DF] bg-blue-50 text-[#1DA6DF]"
            : "border-transparent bg-white text-gray-500"
        }`}
        onClick={() => setTab("upgrade")}
        disabled={activeTab === "upgrade"}
      >
        Upgrade Packages
      </button>
    </div>
  );
}

function CircularProgress({ speed }) {
  const { down } = getSpeedsLocal(speed);
  const percentage = Math.min((down / 1000) * 100, 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-32 w-32 items-center justify-center">
      <svg className="-rotate-90 h-32 w-32" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
        <circle
          cx="50" cy="50" r={radius}
          stroke="#1DA6DF" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{down}</span>
        <span className="text-sm text-gray-600">Mbps</span>
      </div>
    </div>
  );
}
function getSpeedsLocal(speedStr = "") {
  const match = String(speedStr).match(/^(\d+)[^\d]+(\d+)/);
  if (match) return { down: parseInt(match[1], 10) || 0, up: parseInt(match[2], 10) || 0 };
  const single = String(speedStr).match(/^(\d+)/);
  return { down: single ? parseInt(single[1], 10) : 0, up: 0 };
}

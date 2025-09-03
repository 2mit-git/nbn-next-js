"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------------- Shared helpers (deduped) ---------------- */
function getSpeeds(speedStr = "") {
  const s = String(speedStr);
  const pair = s.match(/^(\d+)[^\d]+(\d+)/);
  if (pair) return { down: parseInt(pair[1], 10) || 0, up: parseInt(pair[2], 10) || 0 };
  const single = s.match(/^(\d+)/);
  return { down: single ? parseInt(single[1], 10) : 0, up: 0 };
}
const effectivePrice = (p) => (p?.discountPrice ?? p?.actualPrice ?? Number.MAX_SAFE_INTEGER);
const hasCategory = (p, cat) => {
  if (!p?.categories || !cat) return false;
  const want = String(cat).toLowerCase();
  return p.categories.some((c) => String(c).toLowerCase() === want);
};
const isUpgradePlan = (p) => {
  if (!hasCategory(p, "FTTP")) return false;
  const { down } = getSpeeds(p.speed);
  return down >= 100; // FTTP & 100+ Mbps
};

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
  const [selectedId, setSelectedId] = useState(null); // << NEW: track which card is selected

  const upgradeEligible = selectedTech === "FTTP_Upgrade";
  const showTabs = upgradeEligible;

  // Tabs (only when upgrade eligible)
  const [internalTab, setInternalTab] = useState(upgradeEligible ? "upgrade" : "regular");
  const activeTab = selectedTab ?? internalTab;
  const handleSetTab = setSelectedTab ?? setInternalTab;

  useEffect(() => {
    setInternalTab(showTabs ? "upgrade" : "regular");
  }, [showTabs]);

  // Fetch products
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Network error"))))
      .then((data) => {
        if (!alive) return;
        setAll(Array.isArray(data?.products) ? data.products : []);
      })
      .catch(() => alive && setError("Could not load products"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  /* ------------ visible list (same logic) ------------ */
  const effectiveTab = showTabs ? activeTab : "regular";

  const visible = useMemo(() => {
    let list = all.slice();

    if (effectiveTab === "upgrade") {
      list = list.filter(isUpgradePlan);
    } else if (originalTech) {
      list = list.filter((p) => hasCategory(p, originalTech));
      // else (no address) -> show all
    }

    list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    return list;
  }, [all, effectiveTab, originalTech]);

  // “BEST DEAL” within the visible set (min upload among 100-down plans)
  const minUpFor100 = useMemo(() => {
    return visible.reduce((min, p) => {
      const m = String(p.speed || "").match(/^(\d+)[^\d]+(\d+)/);
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
  const pageRef = useRef(0);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // responsive per-view (1/2/4)
  useEffect(() => {
    const updatePerView = () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(min-width: 1280px)").matches) setPerView(4);
      else if (window.matchMedia("(min-width: 768px)").matches) setPerView(2);
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

  // update current page from scroll position (throttled with rAF, stable listener)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (!el) return;
        const p = Math.round(el.scrollLeft / el.clientWidth);
        if (p !== pageRef.current) setPage(p);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
          <div key={i} className="w-80">
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <div className="skeleton h-32 w-full rounded-xl" />
              <div className="skeleton h-4 w-28 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
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
          {/* Edge fades (scroll affordance) */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />

          {/* Left arrow */}
          {page > 0 && (
            <button
              aria-label="Previous"
              onClick={prev}
              className="absolute left-[-1.75rem] top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#1DA6DF]/70 bg-white/70 p-2 text-[#1DA6DF] shadow-sm backdrop-blur transition hover:bg-white"
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
              className="absolute right-[-1.75rem] top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#1DA6DF]/70 bg-white/70 p-2 text-[#1DA6DF] shadow-sm backdrop-blur transition hover:bg-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Track */}
          <div
            ref={containerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1"
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
                  style={{ width: `calc((100% - ${perView * 16}px) / ${perView})` }}
                >
                  {/* CARD — design only */}
                  <div
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/60 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-[#1DA6DF] focus-within:ring-offset-2"
                    tabIndex={0}
                  >
                    {/* Ribbon */}
                    {isBestDeal && (
                      <div className="pointer-events-none absolute right-[-60px] top-4 z-10 w-[200px] rotate-45 bg-[#1DA6DF] py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-white shadow">
                        Best Deal
                      </div>
                    )}

                    {/* header */}
                    <div className="flex h-full flex-col pt-8">
                      <div className="mb-5 px-5 text-center">
                        <h3 className="mb-1 text-[22px] font-extrabold tracking-tight text-gray-900">
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

                        {/* chips (only if data exists) */}
                        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                          {(Array.isArray(p.categories) ? p.categories : [])
                            .slice(0, 3)
                            .map((c, i) => (
                              <Chip key={`c-${i}`}>{String(c)}</Chip>
                            ))}
                          {(Array.isArray(p.types) ? p.types : [])
                            .slice(0, 2)
                            .map((t, i) => (
                              <Chip key={`t-${i}`} variant="outline">{String(t)}</Chip>
                            ))}
                        </div>
                      </div>

                      {/* meter */}
                      <div className="mb-6 flex justify-center">
                        <CircularProgress speed={p.speed} />
                      </div>

                      {/* speed + subtitle */}
                      <div className="mb-4 px-4">
                        <div className="flex w-full justify-evenly text-center">
                          <div className="mb-1 flex w-1/2 items-center justify-center">
                            <svg className="mr-1 h-4 w-4 text-[#1DA6DF]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">{down} Mbps</span>
                          </div>
                          <div className="mb-1 flex w-1/2 items-center justify-center">
                            <svg className="mr-1 h-4 w-4 rotate-180 text-[#1DA6DF]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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

                      {/* price */}
                      <div className="mb-6 text-center text-[#1DA6DF]">
                        <div className="text-3xl font-extrabold tracking-tight">
                          ${p.discountPrice}
                          <span className="ml-0.5 text-sm font-medium text-gray-500">/mo</span>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500">
                          for first 6 months, then ${p.actualPrice}/mo
                        </p>
                      </div>

                      {/* features & CTA */}
                      <div className="flex flex-1 flex-col bg-[#1DA6DF] p-4 text-white">
                        <div className="flex-1">
                          <h4 className="mb-3 text-sm font-extrabold uppercase tracking-wide">Key Features</h4>
                          <ul className="space-y-1.5">
                            {(p.termsAndConditions || []).map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 translate-y-[2px] text-white">•</span>
                                <span className="text-sm/5">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-6">
                          <hr className="border-white/30" />
                          <h4 className="mb-2 mt-3 text-sm font-extrabold uppercase tracking-wide">Recommended for</h4>
                          <p className="text-sm/5 opacity-95">{p.recommendation}</p>
                        </div>

                        {/* === Only change is below: track & show "Selected" === */}
                        {(() => {
                          const key =
                            typeof p._id === "object" && p._id?.$oid ? p._id.$oid : String(p._id);
                          const isSelected = selectedId === key;
                          return (
                            <button
                              className={`mt-5 w-full rounded-lg p-3 font-semibold shadow-sm transition hover:bg-gray-100 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10
                                ${isSelected ? "bg-[#1DA6DF] text-white hover:bg-[#1DA6DF]/90" : "bg-white text-black"}`}
                              onClick={() => {
                                setSelectedId(key);
                                onSelectPlan?.(p);
                              }}
                            >
                              {isSelected ? "✓ Selected" : "Select Plan"}
                            </button>
                          );
                        })()}
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
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === page ? "bg-[#1DA6DF]" : "bg-gray-300 hover:bg-gray-400"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA6DF]/50`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {typeof back === "function" && (
        <button
          className="btn mt-6 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-[1px] hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA6DF] focus-visible:ring-offset-1"
          onClick={back}
        >
          ← Back
        </button>
      )}
    </div>
  );
}

/* ---------------- UI helpers ---------------- */
function TabStrip({ activeTab, setTab }) {
  return (
    <div className="mb-6 flex w-full justify-center">
      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <TabButton
          isActive={activeTab === "regular"}
          onClick={() => setTab("regular")}
          label="Regular"
        />
        <TabButton
          isActive={activeTab === "upgrade"}
          onClick={() => setTab("upgrade")}
          label="Upgrade"
        />
      </div>
    </div>
  );
}

function TabButton({ isActive, onClick, label }) {
  return (
    <button
      className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-[#1DA6DF] text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-50"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA6DF]/50`}
      onClick={onClick}
      disabled={isActive}
      aria-pressed={isActive}
      type="button"
    >
      {label}
    </button>
  );
}

function Chip({ children, variant = "solid" }) {
  const base = "px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide";
  const styles =
    variant === "outline"
      ? "border border-[#1DA6DF]/30 text-[#1DA6DF]"
      : "bg-[#1DA6DF]/10 text-[#1DA6DF]";
  return <span className={`${base} ${styles}`}>{children}</span>;
}

function CircularProgress({ speed }) {
  const { down } = getSpeeds(speed);
  const percentage = Math.min((down / 1000) * 100, 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-32 w-32">
      <div className="absolute inset-0 animate-pulse rounded-full bg-[#1DA6DF]/5 blur-[10px]" aria-hidden="true" />
      <svg className="-rotate-90 h-32 w-32" viewBox="0 0 100 100" role="img" aria-label={`${down} Mbps`}>
        <circle cx="50" cy="50" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
        <circle
          cx="50" cy="50" r={radius}
          stroke="#1DA6DF" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-gray-900">{down}</span>
        <span className="text-xs font-medium text-gray-600">Mbps</span>
      </div>
    </div>
  );
}

// app/nbnaddress-finder/page.js
"use client";
import React, { useState } from "react";
import NbnAddressSearching from "../nbn/components/NbnAddressSearching";

export default function Page() {
  const [state, setState] = useState({
    address: null,
    tech: null,
    upgrade: false,
  });

  const goToPlans = () => {
    if (!state.address) return;

    const qs = new URLSearchParams({
      address: state.address,
      tech: state.tech || "",
      upgrade: state.upgrade ? "1" : "0",
    }).toString();

    const target = `https://2mit.com.au/nbn/?${qs}`;

    if (typeof window !== "undefined") {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: "NAVIGATE", url: target },
          "https://2mit.com.au"
        );
        try {
          window.top.location.href = target;
        } catch {
          window.location.href = target;
        }
      } else {
        window.location.href = target;
      }
    }
  };

  return (
    <div className="nbn-embed relative min-h-screen bg-white">
      {/* Top content: Title mimicking your example (white page) */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        {/* <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl text-center font-extrabold text-gray-900">
              Find out what <span className="text-[#1EA6DF]">nbn plans</span>{" "}
              are at your address
            </h2>
          </div>
        </div> */}

        {/* Big capsule containing search (left) + buttons (right) */}
        <div className="mt-6">
          <div className="min-w-0 flex-1">
            <div className="nbn-embed__search">
              <NbnAddressSearching
                onAddressChange={(addr) =>
                  setState((s) => ({ ...s, address: addr || null }))
                }
                onTechChange={(tech, canUpgrade) =>
                  setState((s) => ({
                    ...s,
                    tech: tech || null,
                    upgrade: !!canUpgrade,
                  }))
                }
                onSeePlans={goToPlans}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 ms-10">
              *Type your full address (including unit number if applicable) to
              see available options.
            </p>
          </div>
        </div>
      </div>

      {/* ---- Scoped style overrides for the child (visual only) ---- */}
      <style jsx global>{`
        /* Hide the child's big headline so the input sits alone inside our capsule */
        .nbn-embed .nbn-embed__search > div > div.grid > div:first-child {
          display: none !important;
        }
        /* Make the hero grid act like a block so the search is full width */
        .nbn-embed .nbn-embed__search > div > div.grid {
          display: block !important;
        }

        /* Neutralize brand-blue accents inside the search bar (visual only) */
        /* 1) Outer blue pill */
        .nbn-embed .nbn-embed__search .rounded-full.bg-\\[\\#1EA6DF\\] {
          background-color: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        /* 2) Inner ring color -> light gray, thicker for presence */
        .nbn-embed .nbn-embed__search .ring-\\[\\#1EA6DF\\] {
          --tw-ring-color: #e5e7eb !important; /* gray-200 */
        }
        .nbn-embed
          .nbn-embed__search
          .focus-within\\:ring-\\[\\#1EA6DF\\]\\/40:focus-within {
          --tw-ring-color: rgba(0, 0, 0, 0.08) !important;
        }
        .nbn-embed .nbn-embed__search .px-4.py-1 {
          padding: 10px 16px !important;
        }
        .nbn-embed .nbn-embed__search input {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
        }

        /* 3) Magnifier + accents -> neutral gray */
        .nbn-embed .nbn-embed__search .text-\\[\\#1EA6DF\\] {
          color: #6b7280 !important; /* gray-500 */
        }

        /* 4) Spinner tip -> neutral gray */
        .nbn-embed .nbn-embed__search .border-t-\\[\\#1EA6DF\\] {
          border-top-color: #9ca3af !important; /* gray-400 */
        }

        /* 5) Keep the suggestions dropdown layered above our capsule edges */
        .nbn-embed .nbn-embed__search .z-50 {
          z-index: 60 !important;
        }

        /* 6) Tighten vertical spacing around result blocks inside the page shell */
        .nbn-embed .nbn-embed__search .space-y-5 {
          margin-top: 10px !important;
        }
      `}</style>
    </div>
  );
}

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
    if (!state.address) return; // safety guard

    const qs = new URLSearchParams({
      address: state.address,
      tech: state.tech || "",
      upgrade: state.upgrade ? "1" : "0",
    }).toString();

    const target = `https://2mit.com.au/nbn/?${qs}`;

    if (typeof window !== "undefined") {
      // If inside an iframe, tell parent to navigate
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: "NAVIGATE", url: target },
          "https://2mit.com.au"
        );

        // Fallback: try forcing top-level navigation
        try {
          window.top.location.href = target;
        } catch (e) {
          // Last fallback: navigate iframe itself
          window.location.href = target;
        }
      } else {
        // Not embedded — navigate normally
        window.location.href = target;
      }
    }
  };

  return (
    <div className="m-4 lg:m-10 space-y-6">
      <NbnAddressSearching
        onAddressChange={(addr) =>
          setState((s) => ({ ...s, address: addr || null }))
        }
        onTechChange={(tech, canUpgrade) =>
          setState((s) => ({ ...s, tech: tech || null, upgrade: !!canUpgrade }))
        }
        onSeePlans={goToPlans} // CTA hooked up
      />
    </div>
  );
}

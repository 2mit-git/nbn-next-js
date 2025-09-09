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
    window.location.href = `/nbn?${qs}`; // full page load
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
        onSeePlans={goToPlans}   // ← hook up the CTA inside the component
      />
      {/* Removed the separate "Get started" button */}
    </div>
  );
}

"use client";
import React from "react";

const PLANS = [
  {
    name: "Hosted UNLIMITED",
    description:
      "The Hosted Unlimited plan is best suited for businesses with high numbers of incoming & outgoing calls, such as call centres.",
    features: [
      "Predictable monthly telecom costs.",
      <>
        Calls to all local/national & mobile numbers{" "}
        <span className="italic">(subject to fair‑use policy)</span>.
      </>,
    ],
    price: 33.0,
    color: "primary",
  },
  {
    name: "Hosted PAYG",
    description:
      "Our Hosted PAYG plan is a cost‑saving solution for businesses with low outbound traffic.",
    features: [
      "No contracts or setup fees with 2mit.",
      "Inbound calls to local/national DIDs are free.",
    ],
    price: 5.5,
    color: "success",
  },
];

export default function PlanSelection({ selectedPlan, setSelectedPlan, goToNext }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={`card cursor-pointer border-0 shadow-xl transition-all duration-300 transform hover:scale-105 ${
            selectedPlan === plan.name
              ? "ring-4 ring-[#1da6df] scale-105"
              : ""
          } bg-gradient-to-br ${
            plan.name === "Hosted UNLIMITED"
              ? "from-[#ecf0ff] to-white"
              : "from-[#e8f8ef] to-white"
          }`}
          onClick={() => {
            setSelectedPlan(plan.name);
            setTimeout(goToNext, 200);
          }}
          style={{
            minHeight: 340,
          }}
        >
          <div
            className={`rounded-t-xl p-5 text-white`}
            style={{
              background:
                plan.name === "Hosted UNLIMITED"
                  ? "linear-gradient(90deg, #4a80f6 60%, #1da6df 100%)"
                  : "linear-gradient(90deg, #2ba864 60%, #1da6df 100%)",
            }}
          >
            <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
          </div>
          <div className="card-body pt-4">
            <p className="mb-3 text-base font-medium text-base-content/80">{plan.description}</p>
            <ul className="mb-4 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      plan.color === "primary"
                        ? "bg-[#4a80f6]"
                        : "bg-[#2ba864]"
                    }`}
                  ></span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-[#1da6df]">${plan.price.toFixed(2)}</span>
              <span className="text-base text-base-content/60 mb-1">/user/mo</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

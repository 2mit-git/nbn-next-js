"use client";
import React, { useState } from "react";
import PlanSelection from "./components/PlanSelection";
import UserAddons from "./components/UserAddons";
import HandsetSelection from "./components/HandsetSelection";
import ContactForm from "./components/ContactForm";

// Handset data (shared)
const HANDSETS = [
  {
    name: "Yealink T31G",
    price: 129,
    img: "https://2mit.com.au/wp-content/uploads/2025/04/b600de47-6888-441a-af46-274215e21a47.png",
    features: ["2‑line IP phone", "132×64 LCD", "Dual Gig Ports", "PoE"],
  },
  {
    name: "Yealink T43U",
    price: 259,
    img: "https://2mit.com.au/wp-content/uploads/2025/04/202204111053513320ed653424d3f9ec4ad1877ef0588.png",
    features: ["3.7″ LCD", "Dual USB", "PoE", "Wall‑mountable"],
  },
  {
    name: "Yealink T54W",
    price: 399,
    img: "https://2mit.com.au/wp-content/uploads/2025/04/20220412014042818e5253f80492aae3227fc1468a05a.png",
    features: ["4.3″ colour screen", "HD Voice", "Dual Gig Ports"],
  },
  {
    name: "Yealink WH62 Mono",
    price: 205,
    img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png",
    features: ["UC DECT", "Wireless", "Range 180 m", "Acoustic Shield"],
  },
  {
    name: "Yealink WH62 Dual",
    price: 235,
    img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png",
    features: ["UC DECT", "Wireless", "Range 180 m", "Acoustic Shield"],
  },
  {
    name: "Yealink BH72",
    price: 355,
    img: "https://2mit.com.au/wp-content/uploads/2025/04/70963a5b-8c96-44ca-9045-35b2a52c3b0e.png",
    features: ["Bluetooth stereo headset", "40 h battery", "Charging stand"],
  },
];

const PLANS = [
  {
    name: "Hosted UNLIMITED",
    price: 33.0,
  },
  {
    name: "Hosted PAYG",
    price: 5.5,
  },
];

const ADDON_PRICES = {
  callRecording: 2.95,
  ivr: 2.95,
  queue: 4.95,
};

function parsePositiveInt(val, def = 0) {
  const n = parseInt(val, 10);
  return isNaN(n) || n < 0 ? def : n;
}

export default function PBXWizard() {
  // Stepper state
  const [step, setStep] = useState(1);

  // Step 1: Plan selection
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Step 2: User/addon selection
  const [numUsers, setNumUsers] = useState(1);
  const [callRecordingEnabled, setCallRecordingEnabled] = useState(false);
  const [callRecordingQty, setCallRecordingQty] = useState(1);
  const [ivrCount, setIvrCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);

  // Step 3: Handset selection
  const [handsets, setHandsets] = useState(
    HANDSETS.reduce((acc, h) => {
      acc[h.name] = { selected: false, qty: 0 };
      return acc;
    }, {})
  );

  // Step 4: Contact details
  const [contact, setContact] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Address: "",
    CitySuburb: "",
    StateTerritory: "",
    PostCode: "",
    BusinessName: "",
  });

  // Error state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Price calculation
  const planObj = PLANS.find((p) => p.name === selectedPlan);
  const planPrice = planObj ? planObj.price : 0;
  const monthlyBase = planPrice * numUsers;
  let monthlyTotal = monthlyBase;
  if (callRecordingEnabled) monthlyTotal += callRecordingQty * ADDON_PRICES.callRecording;
  monthlyTotal += ivrCount * ADDON_PRICES.ivr;
  monthlyTotal += queueCount * ADDON_PRICES.queue;

  let handsetTotal = 0;
  Object.entries(handsets).forEach(([name, { selected, qty }]) => {
    if (selected && qty > 0) {
      const h = HANDSETS.find((h) => h.name === name);
      if (h) handsetTotal += h.price * qty;
    }
  });
  const upfrontTotal = monthlyTotal + handsetTotal;

  // Handset selection validation
  const maxHandsets = numUsers + queueCount;
  const totalHandsets = Object.values(handsets).reduce(
    (sum, { selected, qty }) => sum + (selected ? qty : 0),
    0
  );

  // Step navigation
  function goToStep(n) {
    setStep(n);
    setError("");
    setSuccess("");
  }

  // Handset selection logic
  function toggleHandset(name) {
    setHandsets((prev) => {
      const selected = !prev[name].selected;
      return {
        ...prev,
        [name]: {
          selected,
          qty: selected ? 1 : 0,
        },
      };
    });
  }
  function changeHandsetQty(name, delta) {
    setHandsets((prev) => {
      if (!prev[name].selected) return prev;
      let qty = prev[name].qty + delta;
      if (qty < 1) qty = 1;
      return {
        ...prev,
        [name]: { ...prev[name], qty },
      };
    });
  }

  // Form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!selectedPlan) return setError("Please select a plan.");
    if (numUsers < 1) return setError("Number of users must be at least 1.");
    if (callRecordingEnabled && callRecordingQty < 1)
      return setError("Call recording quantity must be at least 1.");
    if (totalHandsets > maxHandsets)
      return setError(
        `You can select up to ${maxHandsets} devices only. (Currently selected: ${totalHandsets})`
      );
    for (const [k, v] of Object.entries(contact)) {
      if (!v.trim()) return setError("Please fill in all contact details.");
    }

    // Build payload
    const handsetsSelected = {};
    const handsetCosts = {};
    Object.entries(handsets).forEach(([name, { selected, qty }]) => {
      handsetsSelected[name] = selected ? qty : 0;
      const h = HANDSETS.find((h) => h.name === name);
      handsetCosts[name] = h ? h.price : 0;
    });

    const payload = {
      Plan: selectedPlan,
      User: numUsers,
      UserPrice: planPrice,
      UserSubtotal: parseFloat((planPrice * numUsers).toFixed(2)),
      ...contact,
      MonthlyPrice: parseFloat(monthlyTotal.toFixed(2)),
      FirstMonthUpfrontTotal: parseFloat(upfrontTotal.toFixed(2)),
    };

    // Optional fields
    const optionalFields = [
      { key: "Call recording", value: callRecordingEnabled ? callRecordingQty : 0, price: ADDON_PRICES.callRecording },
      { key: "IVR", value: ivrCount, price: ADDON_PRICES.ivr },
      { key: "Queues", value: queueCount, price: ADDON_PRICES.queue },
      ...HANDSETS.map((h) => ({
        key: h.name,
        value: handsetsSelected[h.name],
        price: h.price,
      })),
    ];
    optionalFields
      .filter((f) => f.value > 0)
      .slice(0, 10)
      .forEach((field, i) => {
        const idx = i + 1;
        const subtotal = parseFloat((field.price * field.value).toFixed(2));
        payload[`data${idx}`] = field.key;
        payload[`data${idx}Value`] = field.value;
        payload[`data${idx}Price`] = parseFloat(field.price.toFixed(2));
        payload[`data${idx}Subtotal`] = subtotal;
      });

    // Send to webhook
    try {
      const webhookUrl =
        "https://services.leadconnectorhq.com/hooks/zWfrr4KgkfFrSbjEHOba/webhook-trigger/de0d38a2-beca-46df-bd16-6eef388ccb0b";
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess("Order submitted successfully!");
        setStep(1);
        setSelectedPlan(null);
        setNumUsers(1);
        setCallRecordingEnabled(false);
        setCallRecordingQty(1);
        setIvrCount(0);
        setQueueCount(0);
        setHandsets(
          HANDSETS.reduce((acc, h) => {
            acc[h.name] = { selected: false, qty: 0 };
            return acc;
          }, {})
        );
        setContact({
          Name: "",
          Email: "",
          Phone: "",
          Address: "",
          CitySuburb: "",
          StateTerritory: "",
          PostCode: "",
          BusinessName: "",
        });
      } else {
        setError("Failed to submit order. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while submitting your order.");
    }
  }

  // Stepper UI
  const stepsArr = [
    { label: "Select Your Plan" },
    { label: "Select Number of Users" },
    { label: "Select Your Handsets" },
    { label: "Your Contact Details" },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-8 px-2">
      <div className="card shadow-lg bg-base-100">
        <div className="card-body">
          {/* Stepper */}
          <ul className="steps w-full mb-8">
            {stepsArr.map((s, i) => (
              <li
                key={i}
                className={`step ${step > i ? "step-primary" : ""} ${step === i + 1 ? "font-bold text-primary" : ""}`}
              >
                {s.label}
              </li>
            ))}
          </ul>

          {/* Error/Success */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
              <button className="btn btn-sm btn-ghost ml-auto" onClick={() => setError("")}>
                ✖
              </button>
            </div>
          )}
          {success && (
            <div className="alert alert-success mb-4">
              <span>{success}</span>
              <button className="btn btn-sm btn-ghost ml-auto" onClick={() => setSuccess("")}>
                ✖
              </button>
            </div>
          )}

          {/* Step 1: Plan Selection */}
          {step === 1 && (
            <PlanSelection
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              goToNext={() => goToStep(2)}
            />
          )}

          {/* Step 2: User/Addons */}
          {step === 2 && (
            <UserAddons
              numUsers={numUsers}
              setNumUsers={setNumUsers}
              callRecordingEnabled={callRecordingEnabled}
              setCallRecordingEnabled={setCallRecordingEnabled}
              callRecordingQty={callRecordingQty}
              setCallRecordingQty={setCallRecordingQty}
              ivrCount={ivrCount}
              setIvrCount={setIvrCount}
              queueCount={queueCount}
              setQueueCount={setQueueCount}
              monthlyBase={monthlyBase}
              monthlyTotal={monthlyTotal}
              goToPrev={() => goToStep(1)}
              goToNext={() => goToStep(3)}
              parsePositiveInt={parsePositiveInt}
            />
          )}

          {/* Step 3: Handset Selection */}
          {step === 3 && (
            <HandsetSelection
              handsets={handsets}
              HANDSETS={HANDSETS}
              toggleHandset={toggleHandset}
              changeHandsetQty={changeHandsetQty}
              maxHandsets={maxHandsets}
              totalHandsets={totalHandsets}
              goToPrev={() => goToStep(2)}
              goToNext={() => goToStep(4)}
            />
          )}

          {/* Step 4: Contact Details */}
          {step === 4 && (
            <ContactForm
              contact={contact}
              setContact={setContact}
              monthlyTotal={monthlyTotal}
              upfrontTotal={upfrontTotal}
              handleSubmit={handleSubmit}
              goToPrev={() => goToStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// File: src/components/ContractForm.jsx
"use client";

import React, { useState, useEffect } from "react";

const TITLES = ["Mr", "Mrs", "Ms", "Dr", "Prof"];
const PRIMARY = "#1DA6DF";

export default function ContractForm({ serviceAddress }) {
  console.log(serviceAddress);
  const [form, setForm] = useState({
    title: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    dob: "",
    serviceAddress: serviceAddress || "",
    activateASAP: true,
    activationDate: "",
    deliverySame: true,
    deliveryAddress: "",
    deliveryName: "",
    companyName: "",
    keepPhone: false,
    phoneNumber: "",
    transferVoip: false,
    accountNumber: "",
  });

  // sync serviceAddress prop
  useEffect(() => {
    setForm((f) => ({ ...f, serviceAddress: serviceAddress || "" }));
  }, [serviceAddress]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", form);
    // TODO: send to backend
  };

  // common input style
  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/30";
  // toggle button style
  const toggleBtn = (active) =>
    `px-5 py-2 rounded-full font-medium transition ${
      active
        ? "bg-[--primary] text-white shadow-md hover:bg-opacity-90"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto space-y-8"
      style={{ "--primary": PRIMARY }}
    >
      {/* Section Card */}
      {/** Wrap each fieldset in a card-like container **/}
      {/** Contact Details **/}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-[--primary]">
          Contact Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <select
              className={inputClasses}
              value={form.title}
              onChange={handleChange("title")}
            >
              {TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              className={inputClasses}
              value={form.firstName}
              onChange={handleChange("firstName")}
              required
            />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              className={inputClasses}
              value={form.lastName}
              onChange={handleChange("lastName")}
              required
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              className={inputClasses}
              value={form.email}
              onChange={handleChange("email")}
              required
            />
          </div>
          {/* Contact Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Contact Number{" "}
              <span className="text-xs text-gray-500">(Mobile or Home)</span>
            </label>
            <input
              type="tel"
              className={inputClasses}
              value={form.contactNumber}
              onChange={handleChange("contactNumber")}
              required
            />
          </div>
          {/* Date of Birth */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              className={inputClasses}
              value={form.dob}
              onChange={handleChange("dob")}
              required
            />
          </div>
        </div>
      </div>

      {/** Connection Details **/}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-[--primary]">
          Connection Details
        </h2>
        <div className="space-y-4">
          {/* Service Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Address
            </label>
            <input
              type="text"
              className={`${inputClasses} bg-gray-100 cursor-not-allowed text-black`}
              value={form.serviceAddress}
              readOnly
            />
          </div>
          {/* Activation Date */}
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Activate ASAP?
            </span>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, activateASAP: true }))}
                className={`px-5 py-2 rounded-full font-medium transition ${
                  form.activateASAP
                    ? "bg-[#1DA6DF] text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              >
                ASAP
              </button>

              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, activateASAP: false }))}
                className={`px-5 py-2 rounded-full font-medium transition ${
                  !form.activateASAP
                    ? "bg-[#1DA6DF] text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              >
                Pick Date
              </button>
            </div>

            {!form.activateASAP && (
              <input
                type="date"
                className={`${inputClasses} mt-2`}
                value={form.activationDate}
                onChange={handleChange("activationDate")}
                required
              />
            )}
          </div>
        </div>
      </div>

      {/** Delivery Details **/}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-[--primary]">
          Delivery Details
        </h2>
        <div className="space-y-4">
          {/* Same as Service? */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-5 w-5 text-[--primary] border-gray-300 rounded focus:ring focus:ring-[--primary]/30"
                checked={form.deliverySame}
                onChange={handleChange("deliverySame")}
              />
              <span className="text-gray-700">Same as Service Address</span>
            </label>
            {!form.deliverySame && (
              <input
                type="text"
                className={`${inputClasses} mt-2`}
                placeholder="Delivery Address"
                value={form.deliveryAddress}
                onChange={handleChange("deliveryAddress")}
                required
              />
            )}
          </div>
          {/* Recipient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name (Delivery)
              </label>
              <input
                type="text"
                className={inputClasses}
                value={form.deliveryName}
                onChange={handleChange("deliveryName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name{" "}
                <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                className={inputClasses}
                value={form.companyName}
                onChange={handleChange("companyName")}
              />
            </div>
          </div>
        </div>
      </div>

      {/** Phone Details **/}
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-[--primary]">
          Phone Details
        </h2>
        <div className="space-y-4">
          {/* Keep Number */}
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Keep existing number?
            </span>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, keepPhone: true }))}
                className={`px-5 py-2 rounded-full font-medium transition ${
                  form.keepPhone
                    ? "bg-[#1DA6DF] text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, keepPhone: false }))}
                className={`px-5 py-2 rounded-full font-medium transition ${
                  !form.keepPhone
                    ? "bg-[#1DA6DF] text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              >
                No
              </button>
            </div>
          </div>
          {/* Porting */}
          {form.keepPhone && (
            <>
              <input
                type="tel"
                className={inputClasses}
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange("phoneNumber")}
                required
              />
              <span className="block text-sm font-medium text-gray-700">
                Transfer as VoIP?
              </span>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, transferVoip: true }))}
                  className={`px-5 py-2 rounded-full font-medium transition ${
                    form.transferVoip
                      ? "bg-[#1DA6DF] text-white"
                      : "bg-white text-black border border-gray-300"
                  }`}
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, transferVoip: false }))
                  }
                  className={`px-5 py-2 rounded-full font-medium transition ${
                    !form.transferVoip
                      ? "bg-[#1DA6DF] text-white"
                      : "bg-white text-black border border-gray-300"
                  }`}
                >
                  No
                </button>
              </div>

              {form.transferVoip && (
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Account Number"
                  value={form.accountNumber}
                  onChange={handleChange("accountNumber")}
                  required
                />
              )}
            </>
          )}
        </div>
      </div>

      {/** Submit Button **/}
     <div className="text-right">
  <button
    type="submit"
    className="px-8 py-3 bg-[#1DA6DF] text-white rounded-lg font-semibold hover:bg-[#199CCF] transition"
  >
    Submit Contract
  </button>
</div>

    </form>
  );
}

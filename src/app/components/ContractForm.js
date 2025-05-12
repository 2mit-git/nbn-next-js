// File: src/components/ContractForm.jsx
"use client";
import React, { useState, useEffect } from "react";

const TITLES = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

export default function ContractForm({ serviceAddress }) {
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

  // keep serviceAddress in sync
  useEffect(() => {
    setForm(f => ({ ...f, serviceAddress: serviceAddress || "" }));
  }, [serviceAddress]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", form);
    // TODO: send to backend
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-base-100 shadow-lg rounded-lg p-8 space-y-8"
    >
      {/* Contact Details */}
      <fieldset className="border border-base-300 rounded-lg p-6 space-y-4">
        <legend className="text-xl font-bold">Enter your contact details</legend>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={form.title}
            onChange={handleChange("title")}
          >
            {TITLES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">First name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.firstName}
              onChange={handleChange("firstName")}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Last name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.lastName}
              onChange={handleChange("lastName")}
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email address</span>
          </label>
          <input
            type="email"
            className="input input-bordered"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Contact number</span>
            <span className="label-text-alt">(Mobile or Home Phone)</span>
          </label>
          <input
            type="tel"
            className="input input-bordered"
            value={form.contactNumber}
            onChange={handleChange("contactNumber")}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Date of birth</span>
            <span className="label-text-alt">DD/MM/YYYY</span>
          </label>
          <input
            type="date"
            className="input input-bordered"
            value={form.dob}
            onChange={handleChange("dob")}
            required
          />
        </div>
      </fieldset>

      {/* Connection Details */}
      <fieldset className="border border-base-300 rounded-lg p-6 space-y-4">
        <legend className="text-xl font-bold">Connection details</legend>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Service address</span>
          </label>
          <input
            type="text"
            className="input input-bordered bg-base-200 cursor-not-allowed"
            value={form.serviceAddress}
            readOnly
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Preferred activation date</span>
            <span className="label-text-alt">DD/MM/YYYY</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="asap"
              className="checkbox checkbox-success"
              checked={form.activateASAP}
              onChange={handleChange("activateASAP")}
            />
            <label htmlFor="asap">As soon as possible</label>
          </div>
          {!form.activateASAP && (
            <input
              type="date"
              className="input input-bordered mt-2"
              value={form.activationDate}
              onChange={handleChange("activationDate")}
              required
            />
          )}
        </div>
      </fieldset>

      {/* Delivery Details */}
      <fieldset className="border border-base-300 rounded-lg p-6 space-y-4">
        <legend className="text-xl font-bold">Delivery details</legend>

        <div className="form-control">
          <label className="label">
            <span className="label-text">
              Delivery address (Physical only)
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="same"
              className="checkbox checkbox-success"
              checked={form.deliverySame}
              onChange={handleChange("deliverySame")}
            />
            <label htmlFor="same">Same as service address</label>
          </div>
          {!form.deliverySame ? (
            <input
              type="text"
              className="input input-bordered mt-2"
              value={form.deliveryAddress}
              onChange={handleChange("deliveryAddress")}
              required
            />
          ) : (
            <input
              type="text"
              className="input input-bordered bg-base-200 cursor-not-allowed mt-2"
              value={form.serviceAddress}
              readOnly
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full name (Delivery)</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.deliveryName}
              onChange={handleChange("deliveryName")}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Company name <span className="opacity-50">(if applicable)</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.companyName}
              onChange={handleChange("companyName")}
            />
          </div>
        </div>
      </fieldset>

      {/* Phone Porting */}
      <fieldset className="border border-base-300 rounded-lg p-6 space-y-4">
        <legend className="text-xl font-bold">Your phone details</legend>

        <div className="form-control">
          <label className="label">
            <span className="label-text">
              Do you want to keep an existing phone number?
            </span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={form.keepPhone ? "btn btn-success" : "btn btn-outline"}
              onClick={() => setForm((f) => ({ ...f, keepPhone: true }))}
            >
              Yes
            </button>
            <button
              type="button"
              className={!form.keepPhone ? "btn btn-success" : "btn btn-outline"}
              onClick={() => setForm((f) => ({ ...f, keepPhone: false }))}
            >
              No
            </button>
          </div>
        </div>

        {form.keepPhone && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Your phone number (fixed line)
                </span>
              </label>
              <input
                type="tel"
                className="input input-bordered"
                value={form.phoneNumber}
                onChange={handleChange("phoneNumber")}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Transfer as Exetel VoIP number?
                </span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={form.transferVoip ? "btn btn-success" : "btn btn-outline"}
                  onClick={() => setForm((f) => ({ ...f, transferVoip: true }))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={!form.transferVoip ? "btn btn-success" : "btn btn-outline"}
                  onClick={() => setForm((f) => ({ ...f, transferVoip: false }))}
                >
                  No
                </button>
              </div>
            </div>

            {form.transferVoip && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Account number (with current provider)
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={form.accountNumber}
                  onChange={handleChange("accountNumber")}
                  required
                />
              </div>
            )}
          </>
        )}
      </fieldset>

      {/* Submit */}
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary btn-block">
          Submit Contract
        </button>
      </div>
    </form>
  );
}

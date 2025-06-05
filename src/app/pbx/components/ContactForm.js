"use client";
import React from "react";

export default function ContactForm({
  contact,
  setContact,
  monthlyTotal,
  upfrontTotal,
  handleSubmit,
  goToPrev,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <h5 className="mb-4 font-bold">Order Summary</h5>
      <div className="card bg-base-200 mb-4">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div>
              <p className="mb-0">
                <strong>Plan & Product Charges</strong> | Send my order to local authorised reseller
              </p>
            </div>
            <div className="text-end">
              <p className="mb-0">
                <strong>Monthly Price</strong>
                <br />${monthlyTotal.toFixed(2)} inc GST
              </p>
              <p className="mb-0 mt-3">
                <strong>First Month Upfront Total</strong>
                <br />${upfrontTotal.toFixed(2)} inc GST
              </p>
            </div>
          </div>
          <hr />
          <p className="text-error text-center mb-0 text-xs">
            *Note – Monthly charges will be billed by 2mit. Upfront hardware costs billed by reseller who contacts you
          </p>
        </div>
      </div>
      <h5 className="mb-4 font-bold">Your Contact Details</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div>
          <label className="form-label">Name</label>
          <input
            required
            type="text"
            className="input input-bordered w-full"
            value={contact.Name}
            onChange={(e) =>
              setContact((c) => ({ ...c, Name: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            required
            type="email"
            className="input input-bordered w-full"
            value={contact.Email}
            onChange={(e) =>
              setContact((c) => ({ ...c, Email: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input
            required
            type="text"
            className="input input-bordered w-full"
            maxLength={10}
            value={contact.Phone}
            onChange={(e) =>
              setContact((c) => ({ ...c, Phone: e.target.value }))
            }
          />
          <small className="text-gray-500">
            {contact.Phone.length} of 10 max characters
          </small>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Address</label>
        <input
          required
          type="text"
          className="input input-bordered w-full"
          value={contact.Address}
          onChange={(e) =>
            setContact((c) => ({ ...c, Address: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div>
          <label className="form-label">City/Suburb</label>
          <input
            required
            type="text"
            className="input input-bordered w-full"
            value={contact.CitySuburb}
            onChange={(e) =>
              setContact((c) => ({ ...c, CitySuburb: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="form-label">State/Territory</label>
          <input
            required
            type="text"
            className="input input-bordered w-full"
            value={contact.StateTerritory}
            onChange={(e) =>
              setContact((c) => ({
                ...c,
                StateTerritory: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className="form-label">Post Code</label>
          <input
            required
            type="text"
            className="input input-bordered w-full"
            value={contact.PostCode}
            onChange={(e) =>
              setContact((c) => ({ ...c, PostCode: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Business/Company Name</label>
        <input
          required
          type="text"
          className="input input-bordered w-full"
          value={contact.BusinessName}
          onChange={(e) =>
            setContact((c) => ({
              ...c,
              BusinessName: e.target.value,
            }))
          }
          placeholder="(Leave blank)"
        />
        <small className="text-gray-500">
          This field is for validation purposes and should be left unchanged.
        </small>
      </div>
      {/* No reCAPTCHA, as this is a static site */}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={goToPrev}
        >
          Previous
        </button>
        <button type="submit" className="btn btn-warning">
          SUBMIT
        </button>
      </div>
    </form>
  );
}

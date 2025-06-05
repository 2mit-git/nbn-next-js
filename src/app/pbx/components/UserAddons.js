"use client";
import React from "react";

export default function UserAddons({
  numUsers,
  setNumUsers,
  callRecordingEnabled,
  setCallRecordingEnabled,
  callRecordingQty,
  setCallRecordingQty,
  ivrCount,
  setIvrCount,
  queueCount,
  setQueueCount,
  monthlyBase,
  monthlyTotal,
  goToPrev,
  goToNext,
  parsePositiveInt,
}) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="font-semibold mb-1 block">
            Number of Users
            <span
              className="tooltip ml-1"
              data-tip="Enter the total number of users"
            >
              <span className="badge badge-secondary badge-sm ml-1">i</span>
            </span>
          </label>
          <input
            type="number"
            min={1}
            step={1}
            className="input input-bordered w-full"
            value={numUsers}
            onChange={(e) => setNumUsers(parsePositiveInt(e.target.value, 1))}
          />
          <small className="text-gray-500">Enter at least 1 user.</small>
        </div>
        <div>
          <label className="font-semibold mb-1 block">
            Call recordings?
            <span
              className="tooltip ml-1"
              data-tip="Enable this option if you want all calls to be recorded"
            >
              <span className="badge badge-secondary badge-sm ml-1">i</span>
            </span>
          </label>
          <button
            className={`btn w-full ${callRecordingEnabled ? "btn-primary text-white" : "btn-outline-primary"}`}
            type="button"
            onClick={() => setCallRecordingEnabled((v) => !v)}
          >
            {callRecordingEnabled ? "YES" : "NO"}
          </button>
        </div>
        {callRecordingEnabled && (
          <div>
            <label className="font-semibold mb-1 block">
              Call recording Qty
            </label>
            <input
              type="number"
              min={1}
              step={1}
              className="input input-bordered w-full"
              value={callRecordingQty}
              onChange={(e) =>
                setCallRecordingQty(parsePositiveInt(e.target.value, 1))
              }
            />
            <small className="text-gray-500">
              Number of users to have call recording
            </small>
          </div>
        )}
      </div>
      <hr className="my-4" />
      <h6 className="font-bold mb-3">Flow Options</h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="font-semibold mb-1 block">
            IVR
            <span
              className="tooltip ml-1"
              data-tip="Enter the total number of IVRs"
            >
              <span className="badge badge-secondary badge-sm ml-1">i</span>
            </span>
          </label>
          <input
            type="number"
            min={0}
            step={1}
            className="input input-bordered w-full"
            value={ivrCount}
            onChange={(e) => setIvrCount(parsePositiveInt(e.target.value, 0))}
          />
        </div>
        <div>
          <label className="font-semibold mb-1 block">
            Queues
            <span
              className="tooltip ml-1"
              data-tip="Enter the total number of queues"
            >
              <span className="badge badge-secondary badge-sm ml-1">i</span>
            </span>
          </label>
          <input
            type="number"
            min={0}
            step={1}
            className="input input-bordered w-full"
            value={queueCount}
            onChange={(e) => setQueueCount(parsePositiveInt(e.target.value, 0))}
          />
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div>
          <label className="font-semibold mb-1 block">
            Monthly Price (so far)
          </label>
          <div className="text-2xl">${monthlyBase.toFixed(2)}</div>
        </div>
        <div>
          <label className="font-semibold mb-1 block">
            Monthly Total
          </label>
          <div className="text-2xl">${monthlyTotal.toFixed(2)}</div>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex justify-between">
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={goToPrev}
        >
          Go Back
        </button>
        <button
          className="btn btn-primary text-white"
          type="button"
          onClick={goToNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

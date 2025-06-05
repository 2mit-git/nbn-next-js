"use client";
import React from "react";

export default function HandsetSelection({
  handsets,
  HANDSETS,
  toggleHandset,
  changeHandsetQty,
  maxHandsets,
  totalHandsets,
  goToPrev,
  goToNext,
}) {
  return (
    <div>
      <h5 className="mb-4 font-bold">Select Your Handsets</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HANDSETS.map((h) => (
          <div
            key={h.name}
            className={`card cursor-pointer transition-all duration-200 border-2 relative ${
              handsets[h.name].selected
                ? "border-primary ring-2 ring-primary"
                : "border-base-200"
            }`}
            onClick={() => toggleHandset(h.name)}
          >
            <div className="absolute top-2 right-2">
              {handsets[h.name].selected && (
                <span className="text-green-500">
                  <svg width="32" height="32" viewBox="0 0 29 29" fill="none">
                    <path
                      fill="green"
                      d="M22.5 7.5L11 19l-5.5-5.5L7 11l4 4L22.5 7.5z"
                    ></path>
                  </svg>
                </span>
              )}
            </div>
            <div className="card-body items-center">
              <div
                className="rounded-lg mb-2"
                style={{
                  width: 120,
                  height: 120,
                  backgroundImage: `url(${h.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div className="font-bold text-lg mb-1">{h.name}</div>
              <ul className="text-sm mb-2">
                {h.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between w-full mt-2">
                <div className="badge badge-primary badge-lg text-white text-lg px-4 py-2">
                  ${h.price}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-sm btn-circle btn-outline"
                    type="button"
                    disabled={!handsets[h.name].selected}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeHandsetQty(h.name, -1);
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="input input-bordered w-16 text-center"
                    min={1}
                    value={
                      handsets[h.name].selected
                        ? handsets[h.name].qty
                        : ""
                    }
                    disabled={!handsets[h.name].selected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      changeHandsetQty(
                        h.name,
                        parseInt(e.target.value, 10) - handsets[h.name].qty
                      )
                    }
                  />
                  <button
                    className="btn btn-sm btn-circle btn-outline"
                    type="button"
                    disabled={!handsets[h.name].selected}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeHandsetQty(h.name, 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col md:flex-row justify-between gap-4">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={goToPrev}
        >
          Previous
        </button>
        <button
          className="btn btn-primary text-white"
          type="button"
          onClick={() => {
            if (totalHandsets > maxHandsets) {
              alert(
                `You can select up to ${maxHandsets} devices only. (Currently selected: ${totalHandsets})`
              );
              return;
            }
            goToNext();
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

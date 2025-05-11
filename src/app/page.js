"use client";

import NbnAddressLookup from "./components/NbnAddressLookup";
import ProductGrid from "./components/ProductGrid";
import { useState } from "react";



export default function Home() {

  const [selectedTech, setSelectedTech] = useState(null);
  return (
    <div>
      {/* header section */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />{" "}
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a>Item 1</a>
              </li>
              <li>
                <a>Parent</a>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </li>
              <li>
                <a>Item 3</a>
              </li>
            </ul>
          </div>
          <img
            className="h-15 mb-3 mt-3 ms-10"
            src="https://2mit.com.au/wp-content/uploads/2025/03/CMYK-Logo_Rectangle-Border.png"
            alt=""
          />
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 font-semibold  text-[15px] gap-4 ms-25">
            <li>
              <a>Home</a>
            </li>
            <li>
              <details>
                <summary>IT Services</summary>
                <ul className="p-2">
                  <li>
                    <a>Managed IT Support </a>
                  </li>
                  <li>
                    <a>IT Consulting</a>
                  </li>
                  <li>
                    <a>Cloud Migration</a>
                  </li>
                  <li>
                    <a>Microsoft 365 Management</a>
                  </li>
                  <li>
                    <a>Hardware Procurement and Installation</a>
                  </li>
                  <li>
                    <a>Cloud Backup and Disaster Recovery</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Telcom Services</summary>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Web Services</summary>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Integrated Solutions</summary>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li>
            <li>
              <a>Contact Us</a>
            </li>
          </ul>
        </div>
        <div className="navbar-end"></div>
      </div>

      <div>
        <ul className="steps w-full">
          <li className="step step-primary">check nbn</li>
          <li className="step ">Choose plan</li>
          <li className="step">Select Modem</li>
          <li className="step">Final Step</li>
        </ul>
      </div>
      <div className="w-full m-20 space-y-10">
        <NbnAddressLookup onTechChange={setSelectedTech} />
      </div>
      <div>
      <h1 className="text-2xl font-bold p-6">Our NBN Plans</h1>
      <ProductGrid tech={selectedTech} />
      </div>

      <div></div>
    </div>
  );
}

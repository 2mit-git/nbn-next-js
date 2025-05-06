"use client";

import React, { useState } from "react";
import DashboardSuperAdmin from "../../app/components/DashboardSuperAdmin";
import DashboardProduct from "../../app/components/DashboardProduct";
import DashboardAPI from "../../app/components/DashboardAPI";

export default function DashboardClient({ type }) {
  console.log(type);

  const [page, setPage] = useState("NBNProducts");

  const handleNavigation = (p) => setPage(p);
  const handleLogout = async () => {
    // call the logout API to clear the cookie
    await fetch("/api/logout", { method: "POST" });
    // then send the user back to login
    window.location.href = "/login";
  };

  const renderPages = () => {
    switch (page) {
      case "SuperAdmin":
        return <DashboardSuperAdmin />;
      case "NBNProducts":
        return <DashboardProduct />;
      case "API":
        return <DashboardAPI />;
      default:
        return null;
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content flex flex-col items-center justify-center">
        {renderPages()}
        <label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden"
        >
          Open drawer
        </label>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          className="drawer-overlay"
          aria-label="close sidebar"
        />
        <ul className="menu bg-base-200 text-base-content w-80 h-[90%] p-4">
          {type === "superadmin" && (
            <>
              <li>
                <a onClick={() => handleNavigation("SuperAdmin")}>
                  Super Admin
                </a>
              </li>
              <li>
                <a onClick={() => handleNavigation("API")}>API</a>
              </li>
            </>
          )}
          <li>
            <a onClick={() => handleNavigation("NBNProducts")}>NBN Products</a>
          </li>
        </ul>

        <div className="menu bg-base-200 text-base-content w-80 h-[10%] p-4 ">
          <button
            className="bg-black p-2 text-white hover:cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

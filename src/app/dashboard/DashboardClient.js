// File: src/components/DashboardClient.js
"use client";

import React, { useState } from "react";
import DashboardSuperAdmin from "../../app/components/DashboardSuperAdmin";
import DashboardProduct from "../../app/components/DashboardProduct";
import DashboardAPI from "../../app/components/DashboardAPI";

const menuItems = [
  { label: "Super Admin", page: "SuperAdmin", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.91 0 5.585.945 7.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), roles: ['superadmin']
  },
  { label: "NBN Products", page: "NBNProducts", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ), roles: ['superadmin','user']
  },
  { label: "API", page: "API", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4-4-4-4m5 8l4-4-4-4" />
      </svg>
    ), roles: ['superadmin']
  }
];

export default function DashboardClient({ type }) {
  const [page, setPage] = useState("NBNProducts");
  const [isMinimized, setIsMinimized] = useState(true);

  const handleNavigation = (p) => setPage(p);
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (page) {
      case "SuperAdmin": return <DashboardSuperAdmin />;
      case "NBNProducts": return <DashboardProduct />;
      case "API": return <DashboardAPI />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen h-full sm:h-screen">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-gray-800 text-gray-200 transition-all duration-200
          ${isMinimized ? "w-14 min-w-14" : "w-64 min-w-64"} py-4 space-y-2`}
      >
        {/* Minimize/Expand Button */}
        <button
          onClick={() => setIsMinimized((v) => !v)}
          className="flex items-center justify-center h-10 w-full hover:bg-gray-700 mb-2"
          title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
        >
          {isMinimized ? (
            // Expand icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-7-7l7 7-7 7" />
            </svg>
          ) : (
            // Minimize icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m7-7l-7 7 7 7" />
            </svg>
          )}
        </button>
        {menuItems.map(item => (
          item.roles.includes(type) && (
            <button
              key={item.page}
              onClick={() => handleNavigation(item.page)}
              className={`flex items-center h-12 w-full hover:bg-gray-700 ${page===item.page?'bg-gray-700':''} ${isMinimized ? "justify-center" : "pl-4"}`}
              title={item.label}
            >
              {item.icon}
              {!isMinimized && <span className="ml-3">{item.label}</span>}
            </button>
          )
        ))}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center h-12 w-full bg-red-600 hover:bg-gray-700"
            title="Logout"
          >
            {/* logout icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v1a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h7a2 2 0 012 2v1" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h10m0 0l-3-3m3 3l-3 3" />
            </svg>
            {!isMinimized && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <h1 className="text-2xl font-semibold">
            {menuItems.find(i => i.page === page)?.label}
          </h1>
        </header>
        <main className="flex-1 overflow-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

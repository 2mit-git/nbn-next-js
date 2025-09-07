// File: src/components/DashboardClient.js
"use client";

import React, { useState } from "react";
import DashboardSuperAdmin from "./components/DashboardSuperAdmin";
import DashboardProduct from "./components/DashboardProduct";
import DashboardPermission from "./components/DashboardPermission";

const menuItems = [
  {
    label: "Super Admin",
    page: "SuperAdmin",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.91 0 5.585.945 7.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    roles: ["superadmin"],
  },
  {
    label: "NBN Products",
    page: "NBNProducts",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
    roles: ["superadmin", "user"],
  },
  {
    label: "Permission",
    page: "Permission",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7zm7.94-2.34l-1.22-.71a6.97 6.97 0 000-3.9l1.22-.71a.75.75 0 00.28-1.02l-1-1.73a.75.75 0 00-1.02-.28l-1.22.71a6.97 6.97 0 00-3.38-1.95V3.75a.75.75 0 00-.75-.75h-2a.75.75 0 00-.75.75v1.42a6.97 6.97 0 00-3.38 1.95l-1.22-.71a.75.75 0 00-1.02.28l-1 1.73a.75.75 0 00.28 1.02l1.22.71a6.97 6.97 0 000 3.9l-1.22.71a.75.75 0 00-.28 1.02l1 1.73a.75.75 0 001.02.28l1.22-.71a6.97 6.97 0 003.38 1.95v1.42c0 .41.34.75.75.75h2c.41 0 .75-.34.75-.75v-1.42a6.97 6.97 0 003.38-1.95l1.22.71a.75.75 0 001.02-.28l1-1.73a.75.75 0 00-.28-1.02z"
        />
      </svg>
    ),
    roles: ["superadmin", "user"],
  },
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
      case "SuperAdmin":
        return <DashboardSuperAdmin />;
      case "NBNProducts":
        return <DashboardProduct />;
      case "Permission":
        return <DashboardPermission />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[70vh] md:min-h-[75vh] lg:min-h-screen h-full bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-slate-200 bg-slate-900 text-slate-100 shadow-xl transition-all duration-200 ${
          isMinimized ? "w-16 min-w-16" : "w-64 min-w-64"
        }`}
      >
        {/* Brand / Toggle */}
        <div className="flex items-center justify-between px-3 py-3">
          <div
            className={`flex items-center gap-2 ${isMinimized ? "justify-center w-full" : ""}`}
            title="Menu"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 10h8V3H3v7Zm10 11h8v-7h-8v7ZM3 21h8v-7H3v7Zm10-11h8V3h-8v7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {!isMinimized && <span className="text-sm font-semibold text-white/90">Admin Panel</span>}
          </div>
          {!isMinimized && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70 ring-1 ring-white/10">
              {type}
            </span>
          )}
        </div>

        {/* Minimize/Expand Button */}
        <button
          onClick={() => setIsMinimized((v) => !v)}
          className="mx-2 mb-2 flex h-10 items-center justify-center rounded-lg bg-white/5 text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
          title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
        >
          {isMinimized ? (
            // Expand icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-7-7l7 7-7 7" />
            </svg>
          ) : (
            // Minimize icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m7-7l-7 7 7 7" />
            </svg>
          )}
        </button>

        {/* Nav */}
        <nav className="mt-1 flex-1 space-y-1 px-2">
          {menuItems.map(
            (item) =>
              item.roles.includes(type) && (
                <button
                  key={item.page}
                  onClick={() => handleNavigation(item.page)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    page === item.page
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  } ${isMinimized ? "justify-center" : ""}`}
                  title={item.label}
                >
                  {/* Active indicator */}
                  <span
                    className={`absolute left-0 h-6 w-1 rounded-r-full bg-sky-400 transition-all ${
                      page === item.page ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                    }`}
                    aria-hidden="true"
                  />
                  {item.icon}
                  {!isMinimized && <span className="truncate">{item.label}</span>}
                </button>
              )
          )}
        </nav>

        {/* Logout */}
        <div className="mt-auto p-2">
          <button
            onClick={handleLogout}
            className={`group flex w-full items-center justify-center gap-3 rounded-lg bg-rose-500/90 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 ${
              isMinimized ? "" : "justify-start"
            }`}
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v1a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h7a2 2 0 012 2v1" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h10m0 0l-3-3m3 3l-3 3" />
            </svg>
            {!isMinimized && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                {/* section icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="text-base md:text-lg font-semibold text-slate-900">
                {menuItems.find((i) => i.page === page)?.label}
              </h1>
            </div>

            {/* Role badge (visual only) */}
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 sm:inline-flex">
              {type}
            </span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

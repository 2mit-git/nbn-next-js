"use client";
import React, { useState } from "react";
import DashboardSuperAdmin from "../components/DashboardSuperAdmin";
import DashboardProduct from "../components/DashboardProduct";
import DashboardAPI from "../components/DashboardAPI";

export default function Page() {

    const [page,setPages] = useState("NBNProducts")
  const handleNavigation = (page) => {
    
    setPages(page)
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Add logout logic here
  };
  const randerPages =()=>{
    if(page == "SuperAdmin"){
        return <DashboardSuperAdmin/>
    }
    else if(page == "NBNProducts"){
        return  <DashboardProduct/>
    }
    else if(page =="API"){
        return <DashboardAPI/>
    }
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
      
       {randerPages()}
        <label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden"
        >
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content w-80 h-[90%] p-4">
          <div className="bg-black text-white flex flex-col justify-around">
            <div>
              <li>
                <a onClick={() => handleNavigation("SuperAdmin")}>
                  Super Admin
                </a>
              </li>
              <li>
                <a onClick={() => handleNavigation("NBNProducts")}>NBN Products</a>
              </li>
              <li>
                <a onClick={() => handleNavigation("API")}>API</a>
              </li>
            </div>
          </div>
        </ul>
        <div className="menu bg-base-200 text-base-content w-80 h-[10%] p-4">
          <button className="bg-black p-2 text-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
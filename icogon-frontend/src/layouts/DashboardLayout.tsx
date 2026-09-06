import { Outlet } from "react-router-dom";

import { useState } from "react";
import Sidebar from "../components/dashboard/DashboardSidebar";
import Topbar from "../components/navbar/Topbar";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={collapsed ? "ml-20" : "ml-64"}>

        <Topbar />

        <main className="p-8 bg-slate-100 min-h-screen">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;

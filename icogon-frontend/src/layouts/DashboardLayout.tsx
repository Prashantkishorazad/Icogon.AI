import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/navbar/Topbar";

const DashboardLayout = () => {
  return (
    <div>

      <Sidebar />

      <div className="ml-64">

        <Topbar />

        <main className="p-8 bg-slate-100 min-h-screen">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;
import { Outlet } from "react-router-dom";

// import Topbar from "../components/navbar/Topbar";
import {Sidebar} from "lucide-react";

const DashboardLayout = () => {
  return (
    <div>

      <Sidebar />

      <div className="ml-64">

        {/*<Topbar />*/}

        <main className="p-8 bg-slate-100 min-h-screen">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;
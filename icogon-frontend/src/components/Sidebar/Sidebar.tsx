import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const menus = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Projects",
      icon: FolderKanban,
      path: "/projects",
    },
    {
      name: "AI Chat",
      icon: Bot,
      path: "/ai-chat",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white fixed">

      <div className="text-2xl font-bold p-6">
        Icogon AI
      </div>

      <nav className="px-4">

        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 mb-2"
          >
            <menu.icon size={20} />
            {menu.name}
          </NavLink>
        ))}

      </nav>

    </aside>
  );
};

export default Sidebar;
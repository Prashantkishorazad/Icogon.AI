import { Bell, UserCircle } from "lucide-react";

const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8">

      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-5">

        <Bell className="cursor-pointer" />

        <UserCircle size={34} />

      </div>

    </header>
  );
};

export default Topbar;
import {
  Bell,
  Search,
} from "lucide-react";

interface Props {
  userName?: string;
}

const DashboardHeader = ({
  userName,
}: Props) => {

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-20 items-center
        justify-between
        border-b border-slate-800
        bg-[#080c14]/90
        px-6 backdrop-blur-xl
      "
    >

      <div>

        <p className="text-xs text-slate-500">
          ICOGON AI Workspace
        </p>

        <h2 className="text-lg font-semibold">
          Welcome back
          {userName
            ? `, ${userName}`
            : ""}
        </h2>

      </div>


      <div className="flex items-center gap-3">

        <button
          className="
            hidden h-10 w-10
            items-center justify-center
            rounded-xl border border-slate-800
            text-slate-400
            hover:text-white
            sm:flex
          "
        >
          <Search size={18} />
        </button>


        <button
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl border border-slate-800
            text-slate-400
            hover:text-white
          "
        >
          <Bell size={18} />
        </button>


        <div
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-full
            bg-gradient-to-br
            from-blue-600 to-cyan-400
            font-bold
          "
        >
          {userName?.charAt(0)?.toUpperCase() || "U"}
        </div>

      </div>

    </header>
  );
};

export default DashboardHeader;
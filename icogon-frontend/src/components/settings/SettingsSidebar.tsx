import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Search,
  X,
  Zap,
} from "lucide-react";
import { settingsNavigationGroups } from "../../data/settingsNavigation";

interface SettingsSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const SettingsSidebar = ({
  mobileOpen,
  onCloseMobile,
}: SettingsSidebarProps) => {
  const [query, setQuery] = useState("");
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return settingsNavigationGroups;

    return settingsNavigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [
            item.label,
            item.description,
            ...item.keywords,
            group.title,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  const closeOnNavigate = () => onCloseMobile();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close settings navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-[#e8e8e8] bg-[#fafafa] text-[#242424] transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#ededed] px-5">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#555] transition hover:text-black"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="rounded-lg p-2 text-[#777] hover:bg-[#eee] lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-3 pb-3 pt-4">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-[#dedede] bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#aaa] focus-within:ring-2 focus-within:ring-black/5">
            <Search size={16} className="shrink-0 text-[#777]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search settings..."
              aria-label="Search settings"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#222] outline-none placeholder:text-[#999]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-[#888] hover:text-black"
              >
                <X size={14} />
              </button>
            ) : null}
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-5">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-[#f0f0f0]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a83b08] text-[13px] font-semibold text-white">
                I
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">ICOGON Workspace</span>
                <span className="mt-0.5 block text-[11px] text-[#858585]">Personal workspace</span>
              </span>
              <ChevronDown
                size={15}
                className={`text-[#888] transition-transform ${workspaceMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {workspaceMenuOpen && (
              <div className="ml-10 mt-1 rounded-lg border border-[#e8e8e8] bg-white p-2 text-[11px] text-[#777]">
                Workspace switching will be connected to workspace membership in the next backend milestone.
              </div>
            )}
          </div>

          {filteredGroups.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <Search size={19} className="mx-auto mb-2 text-[#aaa]" />
              <p className="text-[12px] font-medium text-[#555]">No settings found</p>
              <p className="mt-1 text-[11px] text-[#999]">Try another search term.</p>
            </div>
          ) : (
            <nav aria-label="Settings navigation" className="space-y-5">
              {filteredGroups.map((group) => (
                <section key={group.title}>
                  <h2 className="mb-1 px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929292]">
                    {group.title}
                  </h2>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active =
                        location.pathname === item.path ||
                        location.pathname.startsWith(`${item.path}/`);

                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={closeOnNavigate}
                          aria-current={active ? "page" : undefined}
                          className={({ isActive }) =>
                            [
                              "group flex min-h-[37px] items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                              isActive || active
                                ? "bg-[#e9e9e9] font-semibold text-[#202020]"
                                : "text-[#555] hover:bg-[#f0f0f0] hover:text-[#202020]",
                            ].join(" ")
                          }
                        >
                          <Icon size={16} strokeWidth={1.8} className="shrink-0 text-[#737373]" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.premium && (
                            <span
                              title="Planned premium capability"
                              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e5e5e5] text-[#555]"
                            >
                              <Zap size={11} fill="currentColor" />
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>
          )}
        </div>

        <div className="shrink-0 border-t border-[#e8e8e8] p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7e7e7] text-[12px] font-semibold text-[#555]">
              I
            </span>
            <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-medium text-[#333]">Personal account</span>
            <span className="block truncate text-[10px] text-[#999]">ICOGON AI</span>
            </span>
        </div>
        </div>
    </aside>
    </>
);
};

export default SettingsSidebar;

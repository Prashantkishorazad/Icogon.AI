import {
  ChevronDown,
  Code2,
  ExternalLink,
  Eye,
  File,
  Layers3,
  Menu,
  Monitor,
  RefreshCw,
  Rocket,
  Share2,
  Smartphone,
  Tablet,
  Zap,
} from "lucide-react";

export type BuilderTab = "preview" | "files" | "code" | "more";
export type BuilderDevice = "desktop" | "tablet" | "mobile";

type Props = {
  projectName: string;
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  device?: BuilderDevice;
  onDeviceChange?: (device: BuilderDevice) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  pageName?: string;
  onPageChange?: (page: string) => void;
  onOpenPreview?: () => void;
  onShare?: () => void;
  onUpgrade?: () => void;
  onPublish?: () => void;
  publishing?: boolean;
};

const tabs = [
  { id: "preview", label: "Preview", Icon: Eye },
  { id: "files", label: "Files", Icon: File },
  { id: "code", label: "Code", Icon: Code2 },
  { id: "more", label: "More", Icon: Layers3 },
] as const;

const devices = [
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "mobile", label: "Mobile", Icon: Smartphone },
] as const;

const iconButton =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40";

export default function BuilderTopbar({
  projectName,
  activeTab,
  onTabChange,
  sidebarOpen = true,
  onToggleSidebar,
  device = "desktop",
  onDeviceChange,
  onRefresh,
  refreshing = false,
  pageName = "Homepage",
  onOpenPreview,
  onShare,
  onUpgrade,
  onPublish,
  publishing = false,
}: Props) {
  const isPreview = activeTab === "preview";

  return (
    <header className="icogon-builder-topbar relative z-30 flex min-h-[56px] w-full shrink-0 items-center gap-1.5 border-b border-slate-200 bg-white px-2.5 text-slate-900">
      {/* Left: workspace navigation and project identity */}
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        {onToggleSidebar && (
          <button
            type="button"
            className={iconButton}
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={sidebarOpen}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={13} strokeWidth={1.9} className="!h-[13px] !w-[13px]" />
          </button>
        )}

        <div className="flex min-w-0 max-w-[180px] items-center gap-1 rounded-lg px-1.5 py-1 sm:max-w-[220px]">
          <span className="truncate text-sm font-semibold tracking-[-0.01em]">
            {projectName || "Untitled project"}
          </span>
          <ChevronDown
            size={12}
            className="!h-3 !w-3 shrink-0 text-slate-500"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Center: Lovable-style view switcher and preview controls */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden">
        <nav
          className="flex h-9 shrink-0 items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5"
          aria-label="Builder views"
        >
          {tabs.map(({ id, label, Icon }) => {
            const selected = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={selected ? "page" : undefined}
                aria-label={label}
                title={label}
                className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-medium transition-colors sm:px-3 ${
                  selected
                    ? "bg-[#e8edff] text-[#2856d9] shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                <Icon size={13} strokeWidth={1.9} className="!h-[13px] !w-[13px] shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {isPreview && (
          <>
            <div
              className="flex h-9 shrink-0 items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5"
              role="group"
              aria-label="Preview device"
            >
              {devices.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onDeviceChange?.(id)}
                  disabled={!onDeviceChange}
                  aria-label={`${label} preview`}
                  aria-pressed={device === id}
                  title={`${label} preview`}
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed ${
                    device === id
                      ? "bg-[#e8edff] text-[#2856d9] shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon size={13} strokeWidth={1.9} className="!h-[13px] !w-[13px]" />
                </button>
              ))}
            </div>

            <div className="flex h-9 min-w-0 max-w-[160px] shrink items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 px-0.5">
              <button
                type="button"
                onClick={onRefresh}
                disabled={!onRefresh || refreshing}
                aria-label="Refresh preview"
                title="Refresh preview"
                className={iconButton}
              >
                <RefreshCw
                  size={13}
                  className={`!h-[13px] !w-[13px] ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <div
                className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1.5 text-[13px] font-medium"
                title={pageName || "Homepage"}
              >
                <span className="truncate">{pageName || "Homepage"}</span>
                <ChevronDown
                  size={11}
                  className="!h-[11px] !w-[11px] shrink-0 text-slate-500"
                  aria-hidden="true"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPreview}
              disabled={!onOpenPreview}
              className={`${iconButton} hidden xl:inline-flex`}
              aria-label="Open preview in new tab"
              title="Open preview in new tab"
            >
              <ExternalLink size={13} className="!h-[13px] !w-[13px]" />
            </button>
          </>
        )}
      </div>

      {/* Right: project actions */}
      <div className="flex shrink-0 items-center justify-end gap-1">
        <button
          type="button"
          onClick={onShare}
          disabled={!onShare}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Share2 size={12} className="!h-3 !w-3" />
          <span className="hidden md:inline">Share</span>
        </button>

        {onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-gradient-to-r from-[#914cf4] to-[#7048e8] px-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            <Zap size={12} className="!h-3 !w-3" fill="currentColor" />
            <span className="hidden lg:inline">Upgrade</span>
          </button>
        )}

        <button
          type="button"
          onClick={onPublish}
          disabled={!onPublish || publishing}
          className="inline-flex h-8 items-center gap-1 rounded-full bg-[#2856dc] px-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1f49c3] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Rocket size={12} className="!h-3 !w-3" />
          <span>{publishing ? "Publishing…" : "Publish"}</span>
        </button>
      </div>
    </header>
  );
}
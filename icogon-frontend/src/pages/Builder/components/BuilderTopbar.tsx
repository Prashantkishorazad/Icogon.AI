import { Code2, Eye, Folder, MoreHorizontal, Play, Rocket, Share2 } from "lucide-react";

export type BuilderTab = "preview" | "code" | "files" | "more";

type Props = {
  projectName: string;
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  onRun?: () => void;
  onPublish?: () => void;
  onShare?: () => void;
  onMoreActions?: () => void;
  runDisabled?: boolean;
  publishDisabled?: boolean;
  running?: boolean;
};

const tabs = [
  { id: "preview", label: "Preview", Icon: Eye },
  { id: "code", label: "Code", Icon: Code2 },
  { id: "files", label: "Files", Icon: Folder },
  { id: "more", label: "More", Icon: MoreHorizontal },
] as const;

export default function BuilderTopbar({
  projectName, activeTab, onTabChange, onRun, onPublish, onShare,
  onMoreActions, runDisabled = true, publishDisabled = true, running = false,
}: Props) {
  return (
    <header className="flex h-[64px] min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 text-slate-800">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{projectName || "Untitled project"}</div>
        <div className="text-[10px] text-slate-400">ICOGON AI Builder</div>
      </div>

      <nav className="flex min-w-0 items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1" aria-label="Builder workspace">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => onTabChange(id)}
            aria-current={activeTab === id ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
              activeTab === id ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white hover:text-slate-800"
            }`}>
            <Icon size={14}/><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        {onShare && <button type="button" onClick={onShare} className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 md:inline-flex"><Share2 size={13}/>Share</button>}
        <button type="button" onClick={onRun} disabled={runDisabled || !onRun}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
          <Play size={13}/>{running ? "Running" : "Run"}
        </button>
        <button type="button" onClick={onPublish} disabled={publishDisabled || !onPublish}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
          <Rocket size={13}/>Publish
        </button>
        <button type="button" onClick={onMoreActions} aria-label="More actions" className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"><MoreHorizontal size={17}/></button>
      </div>
    </header>
  );
}

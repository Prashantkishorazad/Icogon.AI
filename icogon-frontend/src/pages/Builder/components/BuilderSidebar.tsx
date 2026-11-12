import { ChevronDown, ChevronRight, FileCode2, Folder, Search } from "lucide-react";
import { useMemo, useState } from "react";

export type WorkspaceFile = { path: string; operation?: string; content?: string | null };

type Props = {
  files: WorkspaceFile[];
  selectedPath: string;
  onSelect: (path: string) => void;
  projectName?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

export default function BuilderSidebar({ files, selectedPath, onSelect, projectName = "Project", collapsed = false, onToggle }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => files.filter(f => f.path.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.path.localeCompare(b.path)), [files,query]);
  if (collapsed) return <aside className="flex w-12 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-3"><button onClick={onToggle} aria-label="Expand files" className="rounded-lg p-2 hover:bg-slate-100"><ChevronRight size={16}/></button></aside>;
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white text-slate-700">
      <div className="flex h-12 items-center justify-between border-b border-slate-100 px-3"><div className="min-w-0 truncate text-xs font-semibold">{projectName}</div><button onClick={onToggle} aria-label="Collapse files" className="rounded-lg p-1.5 hover:bg-slate-100"><ChevronDown size={15}/></button></div>
      <label className="mx-3 my-3 flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2"><Search size={13} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search files" className="w-full bg-transparent text-xs outline-none"/></label>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length ? filtered.map(file => {
          const depth = Math.max(0,file.path.split("/").length-1);
          return <button key={file.path} onClick={()=>onSelect(file.path)} title={file.path} className={`flex w-full items-center gap-2 rounded-lg py-2 pr-2 text-left text-xs ${selectedPath===file.path?"bg-violet-50 text-violet-700":"text-slate-600 hover:bg-slate-50"}`} style={{paddingLeft:10+depth*14}}>
            {depth ? <FileCode2 size={14}/> : <Folder size={14}/>}<span className="min-w-0 flex-1 truncate">{file.path.split("/").pop()}</span>
          </button>;
        }) : <div className="px-3 py-8 text-center text-xs text-slate-400">{files.length ? "No matching files" : "Generated files will appear here."}</div>}
      </div>
      <div className="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400">{files.length} files</div>
    </aside>
  );
}

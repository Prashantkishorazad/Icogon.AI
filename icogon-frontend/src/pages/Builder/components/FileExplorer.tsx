import { FileCode2, FileJson, FileText, Folder, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { WorkspaceFile } from "./BuilderSidebar";

type Props = { files: WorkspaceFile[]; selectedPath: string; onSelect: (path:string)=>void };

function IconFor({path}:{path:string}) {
  const ext=path.split(".").pop()?.toLowerCase();
  if(ext==="json") return <FileJson size={15}/>;
  if(["md","txt"].includes(ext||"")) return <FileText size={15}/>;
  if(["tsx","ts","jsx","js","css","html","py"].includes(ext||"")) return <FileCode2 size={15}/>;
  return <Folder size={15}/>;
}

export default function FileExplorer({files,selectedPath,onSelect}:Props) {
  const [search,setSearch]=useState("");
  const rows=useMemo(()=>files.filter(f=>f.path.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.path.localeCompare(b.path)),[files,search]);
  return <section className="flex h-full min-h-0 flex-col bg-white text-slate-800">
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-semibold">Project files</h2><p className="mt-0.5 text-xs text-slate-400">Browse generated source files</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-500">{files.length} files</span></div>
    <label className="m-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5"><Search size={14} className="text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search code" className="w-full text-xs outline-none"/></label>
    <div className="min-h-0 flex-1 overflow-auto px-3 pb-4">{rows.length?rows.map(file=><button key={file.path} onClick={()=>onSelect(file.path)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs ${selectedPath===file.path?"bg-violet-50 text-violet-700":"text-slate-600 hover:bg-slate-50"}`}><IconFor path={file.path}/><span className="truncate">{file.path}</span></button>):<div className="p-8 text-center text-xs text-slate-400">{files.length?"No matching files":"No generated files yet. Ask ICOGON AI to build your project."}</div>}</div>
  </section>;
}

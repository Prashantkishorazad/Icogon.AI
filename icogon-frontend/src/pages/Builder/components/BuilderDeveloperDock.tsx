import { ChevronDown, ChevronRight, Code2, Copy, FileCode2, Folder, ListChecks, Terminal, X } from "lucide-react";
import { useMemo } from "react";

type GeneratedFile = { path: string; operation?: string; content?: string | null };
type DockTab = "files" | "code" | "terminal" | "console";
type Props = {
  open:boolean; onToggle:()=>void; activeTab:DockTab; onTabChange:(tab:DockTab)=>void;
  height:number; onHeightChange:(height:number)=>void; files:GeneratedFile[];
  selectedFilePath:string; onSelectFile:(path:string)=>void; code:string;
  previewError:string|null; previewWarnings:string[]; runStatus:string;
};

export default function BuilderDeveloperDock(p:Props) {
  const files=useMemo(()=>[...p.files].sort((a,b)=>a.path.localeCompare(b.path)),[p.files]);
  const tabs:[DockTab,string,typeof Folder][]=[
    ["files","Files",Folder],["code","Code",Code2],["terminal","Terminal",Terminal],["console","Console",ListChecks]
  ];
  const copy=()=>{if(p.code) void navigator.clipboard?.writeText(p.code);};
  return <section className={`icogon-dev-dock ${p.open?"is-open":"is-closed"}`}>
    <header className="icogon-dev-dock-bar">
      <button type="button" className="icogon-dev-dock-toggle" onClick={p.onToggle} aria-expanded={p.open}>
        {p.open?<ChevronDown size={14}/>:<ChevronRight size={14}/>} Developer workspace
        <span className="icogon-dev-dock-count">{files.length} files</span>
      </button>
      <nav className="icogon-dev-dock-tabs" aria-label="Developer tools">
        {tabs.map(([id,label,Icon])=><button key={id} type="button" className={p.activeTab===id?"is-active":""} onClick={()=>{if(!p.open)p.onToggle();p.onTabChange(id);}}><Icon size={13}/>{label}</button>)}
      </nav>
      {p.open&&<button type="button" className="icogon-dev-dock-close" onClick={p.onToggle} aria-label="Collapse developer workspace"><X size={14}/></button>}
    </header>
    {p.open&&<>
      <div className="icogon-dev-dock-resize"><label htmlFor="icogon-dock-height">Panel height</label><input id="icogon-dock-height" type="range" min={160} max={520} step={10} value={p.height} onChange={e=>p.onHeightChange(Number(e.target.value))}/></div>
      <div className="icogon-dev-dock-content" style={{height:p.height}}>
        {p.activeTab==="files"&&<div className="icogon-dev-file-list">{files.length?files.map(f=><button key={f.path} type="button" className={p.selectedFilePath===f.path?"is-selected":""} onClick={()=>p.onSelectFile(f.path)} title={f.path}><FileCode2 size={14}/><span>{f.path}</span><small>{f.operation||"file"}</small></button>):<div className="icogon-dev-empty"><Folder size={22}/><strong>No project files yet</strong><span>Generated files appear here after a successful run.</span></div>}</div>}
        {p.activeTab==="code"&&<div className="icogon-dev-code"><div className="icogon-dev-code-header"><span><FileCode2 size={13}/>{p.selectedFilePath||"No file selected"}</span><button type="button" disabled={!p.code} onClick={copy}><Copy size={12}/> Copy</button></div>{p.code?<pre><code>{p.code}</code></pre>:<div className="icogon-dev-empty"><Code2 size={22}/><strong>No source selected</strong><span>Select a file in Files to inspect it.</span></div>}</div>}
        {p.activeTab==="terminal"&&<div className="icogon-dev-terminal"><div className="icogon-dev-terminal-header"><Terminal size={13}/> Project terminal <small>Not connected</small></div><div className="icogon-dev-terminal-body"><p>icogon / project workspace</p><p className="muted">Terminal execution requires an isolated runtime. No commands are run from this panel.</p></div></div>}
        {p.activeTab==="console"&&<div className="icogon-dev-console"><div className="icogon-dev-console-summary"><span>Run status: <b>{p.runStatus}</b></span><span>{p.previewWarnings.length+(p.previewError?1:0)} preview messages</span></div>{p.previewError&&<p className="error">Error · {p.previewError}</p>}{p.previewWarnings.map((w,i)=><p className="warning" key={`${i}-${w}`}>Warning · {w}</p>)}{!p.previewError&&!p.previewWarnings.length&&<div className="icogon-dev-empty"><ListChecks size={22}/><strong>No preview issues reported</strong></div>}</div>}
      </div>
    </>}
  </section>;
}

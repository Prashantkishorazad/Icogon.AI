import { LockKeyhole, Terminal } from "lucide-react";

type Props = { projectName?:string; connected?:boolean; message?:string };

export default function TerminalPanel({projectName="project",connected=false,message}:Props) {
  return <section className="flex h-full min-h-[220px] flex-col overflow-hidden rounded-xl border border-[#252b35] bg-[#101318] font-mono text-xs text-slate-200">
    <header className="flex h-11 items-center justify-between border-b border-white/10 px-4"><span className="flex items-center gap-2"><Terminal size={14}/>Terminal</span><span className={`rounded-full px-2 py-1 text-[10px] ${connected?"bg-emerald-400/10 text-emerald-300":"bg-amber-400/10 text-amber-200"}`}>{connected?"Runtime connected":"Not connected"}</span></header>
    <div className="flex-1 space-y-2 p-4"><p className="text-slate-400">icogon@{projectName.toLowerCase().replace(/[^a-z0-9-]/g,"-")}:~$</p><p className="text-slate-300">{message||"Terminal execution is not enabled for this workspace yet."}</p>{!connected&&<p className="flex items-center gap-2 text-slate-500"><LockKeyhole size={13}/>Commands are disabled until an isolated runtime is configured.</p>}</div>
  </section>;
}

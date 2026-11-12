import { AlertCircle, CheckCircle2, Info, Terminal } from "lucide-react";

type Props = { runStatus:string; error?:string|null; warnings?:string[]; events?:Array<{id?:string|number;message?:string;type?:string}> };

export default function ConsolePanel({runStatus,error,warnings=[],events=[]}:Props) {
  const count=(error?1:0)+warnings.length+events.length;
  return <section className="flex h-full min-h-0 flex-col bg-[#101318] text-slate-200">
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-4"><span className="flex items-center gap-2 text-xs font-medium"><Terminal size={14}/>Console</span><span className="text-[10px] text-slate-500">{count} messages · {runStatus}</span></header>
    <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-[11px] leading-6">
      {error&&<div className="flex gap-2 text-red-300"><AlertCircle size={14} className="mt-1 shrink-0"/><span className="whitespace-pre-wrap">{error}</span></div>}
      {warnings.map((w,i)=><div key={`${i}-${w}`} className="flex gap-2 text-amber-200"><Info size={14} className="mt-1 shrink-0"/><span className="whitespace-pre-wrap">{w}</span></div>)}
      {events.map((e,i)=><div key={e.id??i} className="flex gap-2 text-slate-300"><Info size={14} className="mt-1 shrink-0"/><span>{e.message||"Run event"}</span></div>)}
      {!count&&<div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 size={14}/>No preview issues reported.</div>}
    </div>
  </section>;
}

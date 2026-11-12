import { Check, Copy, FileCode2 } from "lucide-react";
import { useState } from "react";

type Props = { path: string; code: string; readOnly?: boolean; onChange?: (value:string)=>void; onSave?:()=>void; saving?:boolean };

export default function CodeEditor({path,code,readOnly=true,onChange,onSave,saving=false}:Props) {
  const [copied,setCopied]=useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);window.setTimeout(()=>setCopied(false),1400);}catch{/* Clipboard unavailable */}};
  return <section className="flex h-full min-h-0 flex-col bg-[#fbfcfe] text-slate-800">
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4"><span className="flex min-w-0 items-center gap-2 truncate text-xs font-medium"><FileCode2 size={14} className="text-violet-500"/>{path||"No file selected"}</span><div className="flex items-center gap-2"><button type="button" onClick={copy} disabled={!code} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] hover:bg-slate-50 disabled:opacity-40">{copied?<Check size={12}/>:<Copy size={12}/>} {copied?"Copied":"Copy"}</button>{!readOnly&&onSave&&<button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-40">{saving?"Saving…":"Save"}</button>}</div></header>
    {path?<textarea spellCheck={false} readOnly={readOnly} value={code} onChange={e=>onChange?.(e.target.value)} className="min-h-0 flex-1 resize-none bg-[#fbfcfe] p-5 font-mono text-[12px] leading-6 text-slate-700 outline-none selection:bg-violet-100" />:<div className="grid flex-1 place-items-center text-xs text-slate-400">Select a file to inspect its source.</div>}
  </section>;
}

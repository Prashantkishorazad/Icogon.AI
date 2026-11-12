import { ExternalLink, FolderCog, Globe, ShieldCheck } from "lucide-react";

type Props = { projectName:string; projectId?:string; onRename?:()=>void; onOpenProject?:()=>void };

export default function ProjectSettings({projectName,projectId,onRename,onOpenProject}:Props) {
  return <section className="mx-auto w-full max-w-3xl space-y-5 p-6 text-slate-800">
    <div><p className="text-[10px] font-semibold tracking-[.16em] text-violet-600">WORKSPACE</p><h2 className="mt-1 text-xl font-semibold">Project settings</h2><p className="mt-1 text-xs text-slate-500">Manage project details and workspace information.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-semibold"><FolderCog size={16}/>General</div><label className="mt-4 block text-xs text-slate-500">Project name</label><div className="mt-1 flex items-center gap-2"><input readOnly value={projectName} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/><button type="button" disabled={!onRename} onClick={onRename} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs disabled:opacity-40">Rename</button></div><p className="mt-3 text-[10px] text-slate-400">Project ID: {projectId||"Not available"}</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Globe size={16}/>Deployment</div><p className="mt-2 text-xs text-slate-500">Connect a deployment provider to publish this project. No deployment provider is currently configured by this panel.</p><button type="button" disabled className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-400"><ExternalLink size={13}/>Deployment unavailable</button></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={16}/>Security</div><p className="mt-2 text-xs text-slate-500">Project security status is provided by backend verification. This screen does not claim a security scan has passed.</p></div>
    {onOpenProject&&<button onClick={onOpenProject} className="text-xs text-violet-700">Open project details</button>}
  </section>;
}

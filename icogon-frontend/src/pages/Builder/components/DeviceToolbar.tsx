import { Maximize2, Minimize2, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";

export type DeviceMode = "desktop" | "tablet" | "mobile";
type Props = { device: DeviceMode; onDeviceChange: (device: DeviceMode)=>void; onRefresh?:()=>void; onFullscreen?:()=>void; fullscreen?:boolean; refreshing?:boolean; refreshDisabled?:boolean };

export default function DeviceToolbar({device,onDeviceChange,onRefresh,onFullscreen,fullscreen=false,refreshing=false,refreshDisabled=false}:Props) {
  const modes = [{id:"desktop" as const,Icon:Monitor,label:"Desktop"},{id:"tablet" as const,Icon:Tablet,label:"Tablet"},{id:"mobile" as const,Icon:Smartphone,label:"Mobile"}];
  return <div className="flex items-center gap-1.5">
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
      {modes.map(({id,Icon,label})=><button key={id} type="button" title={label} aria-label={`${label} preview`} aria-pressed={device===id} onClick={()=>onDeviceChange(id)} className={`grid h-8 w-8 place-items-center rounded-lg ${device===id?"bg-white text-violet-600 shadow-sm":"text-slate-400 hover:text-slate-700"}`}><Icon size={15}/></button>)}
    </div>
    <button type="button" onClick={onRefresh} disabled={!onRefresh||refreshDisabled||refreshing} aria-label="Refresh preview" title="Refresh preview" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-35"><RefreshCw size={15} className={refreshing?"animate-spin":""}/></button>
    <button type="button" onClick={onFullscreen} disabled={!onFullscreen} aria-label={fullscreen?"Exit fullscreen":"Maximize preview"} title={fullscreen?"Restore preview":"Maximize preview"} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-35">{fullscreen?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button>
  </div>;
}

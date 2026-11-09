import type { ReactNode } from "react";
import { Database, ShieldCheck, Unplug } from "lucide-react";
import type { ConnectorConnectionType, ConnectorDefinition } from "../../data/connectors/connectorCatalog";
import { useTheme } from "../../context/ThemeContext";

export type ConnectorStatus = "connected" | "not_connected" | "coming_soon";
interface ConnectorDetailProps {
  connector: ConnectorDefinition;
  status: ConnectorStatus;
  connectedAccount?: string | null;
  onConnect?: () => void;
  connectionContent?: ReactNode;
}

const connectionTypeContent: Record<ConnectorConnectionType, { title: string; description: string }> = {
  app_chat: { title: "App + chat connector", description: "Use an authorized workspace or project connection from your ICOGON app and AI chat. Credentials must be stored and used securely by the backend." },
  chat_mcp: { title: "Chat connector (MCP)", description: "Connect a personal MCP server for tools and context in your ICOGON building environment and chats." },
  app_user: { title: "App user connector", description: "Allow each person using your published application to authorize their own account. Each user's access remains separate." },
};

export default function ConnectorDetail({ connector, status, connectedAccount, onConnect, connectionContent }: ConnectorDetailProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const muted = dark ? "text-zinc-400" : "text-slate-500";
  const border = dark ? "border-white/10" : "border-slate-200";
  const surface = dark ? "bg-[#15181d]" : "bg-slate-50";
  const Icon = connector.icon;
  const label = status === "connected" ? "Connected" : status === "not_connected" ? "Not connected" : "Coming soon";
  const statusClass = status === "connected" ? "bg-emerald-500/10 text-emerald-500" : status === "not_connected" ? (dark ? "bg-white/[0.07] text-zinc-300" : "bg-slate-100 text-slate-600") : "bg-amber-500/10 text-amber-500";

  return <div className="mx-auto w-full max-w-5xl">
    <section className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${border}`}>
      <div className="flex min-w-0 items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${border} ${surface}`}><Icon size={29} color={connector.brandColor} /></div>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold">{connector.name}</h2><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass}`}>{label}</span></div><p className={`mt-1 text-sm ${muted}`}>{connector.description}</p>{connectedAccount && <p className={`mt-1 truncate text-xs ${muted}`}>Connected account: {connectedAccount}</p>}</div>
      </div>
      {status === "not_connected" && onConnect ? <button type="button" onClick={onConnect} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">Connect</button> : status === "connected" ? <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${border} ${muted}`}><ShieldCheck size={15}/>Connection active</span> : <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${border} ${muted}`}><Unplug size={15}/>Not available yet</span>}
    </section>
    <section className="mt-8"><h3 className="text-base font-semibold">Overview</h3><p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>Connect {connector.name} to make its authorized capabilities available to your ICOGON projects and AI workflows. Available actions depend on connection type, granted permissions, and provider support.</p></section>
    <section className={`mt-6 overflow-hidden rounded-2xl border ${border}`}>{connectionContent ? <div className="p-3 sm:p-4">{connectionContent}</div> : status === "connected" ? <div className="flex flex-col items-center px-6 py-10 text-center"><ShieldCheck size={30} className="text-emerald-500"/><h3 className="mt-3 font-medium">Connection active</h3><p className={`mt-1 text-sm ${muted}`}>This provider is connected. Account management will appear here when its provider-specific panel is available.</p></div> : status === "not_connected" ? <div className="flex flex-col items-center px-6 py-10 text-center"><Database size={30} className={muted}/><h3 className="mt-3 font-medium">No connections yet</h3><p className={`mt-1 text-sm ${muted}`}>Connect {connector.name} to use it in your projects.</p></div> : <div className="flex flex-col items-center px-6 py-10 text-center"><Unplug size={30} className={muted}/><h3 className="mt-3 font-medium">Integration not available yet</h3><p className={`mt-1 max-w-lg text-sm ${muted}`}>This connector is listed in the catalog, but its authentication and provider operations have not been implemented yet.</p></div>}</section>
    <section className="mt-8"><h3 className="text-base font-semibold">Features</h3><p className={`mt-1 text-sm ${muted}`}>Connection types supported by this connector.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{connector.connectionTypes.map((type) => { const feature = connectionTypeContent[type]; return <article key={type} className={`rounded-xl border p-4 ${border}`}><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={17}/>{feature.title}</div><p className={`mt-2 text-sm leading-5 ${muted}`}>{feature.description}</p></article>; })}</div></section>
    <div className={`mt-6 flex items-start gap-2 rounded-lg border p-3 ${border} ${surface}`}><ShieldCheck size={16} className={`mt-0.5 shrink-0 ${muted}`}/><p className={`text-xs leading-5 ${muted}`}>Only request permissions needed for the selected workflow. Provider credentials and refresh tokens must remain on the server; never expose secrets in frontend code.</p></div>
  </div>;
}

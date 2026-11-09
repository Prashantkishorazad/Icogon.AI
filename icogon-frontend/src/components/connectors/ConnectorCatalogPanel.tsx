import { useMemo, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { connectorCatalog, type ConnectorDefinition } from "../../data/connectors/connectorCatalog";
import ConnectorDetail, { type ConnectorStatus } from "./ConnectorDetail";

interface ConnectorCatalogPanelProps {
  open: boolean;
  onClose: () => void;
  onConnect?: (connector: ConnectorDefinition) => void;
  statuses?: Record<string, ConnectorStatus>;
  connectedAccounts?: Record<string, string | null | undefined>;
}

export default function ConnectorCatalogPanel({
  open, onClose, onConnect, statuses = {}, connectedAccounts = {},
}: ConnectorCatalogPanelProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return connectorCatalog;
    return connectorCatalog.filter((item) =>
      [item.name, item.description, item.category, ...item.keywords].join(" ").toLowerCase().includes(term)
    );
  }, [query]);

  if (!open) return null;

  const selected = connectorCatalog.find((item) => item.id === selectedId) ?? null;
  const panel = dark ? "border-white/10 bg-[#101216] text-white" : "border-slate-200 bg-white text-slate-900";
  const muted = dark ? "text-zinc-400" : "text-slate-500";
  const card = dark ? "border-white/10 bg-white/[0.025] hover:bg-white/[0.055]" : "border-slate-200 bg-white hover:bg-slate-50";

  const close = () => {
    setSelectedId(null);
    setQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-label="Connector workspace" className={`flex max-h-[min(900px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${panel}`}>
        <header className={`flex min-h-16 items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 ${dark ? "border-white/10" : "border-slate-200"}`}>
          <div className="flex min-w-0 items-center gap-3">
            {selected && <button type="button" onClick={() => setSelectedId(null)} aria-label="Back to connector catalog" className={`rounded-lg p-2 ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><ArrowLeft size={17}/></button>}
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{selected ? selected.name : "Connector workspace"}</h2>
              <p className={`mt-0.5 text-[11px] ${muted}`}>{selected ? "Integration details and connection options" : "Discover and manage your integrations"}</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Close connector workspace" className={`rounded-lg p-2 ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><X size={17}/></button>
        </header>

        {selected ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <ConnectorDetail
              connector={selected}
              status={statuses[selected.id] ?? (selected.availability === "available" ? "not_connected" : "coming_soon")}
              connectedAccount={connectedAccounts[selected.id]}
              onConnect={selected.availability === "available" ? () => onConnect?.(selected) : undefined}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <label className={`mb-5 flex h-11 items-center gap-2.5 rounded-xl border px-3 ${dark ? "border-white/10 bg-white/[0.035]" : "border-slate-200 bg-slate-50"}`}>
              <Search size={16} className={muted}/>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search integrations..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" autoFocus/>
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className={muted}><X size={14}/></button>}
            </label>
            {filtered.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((connector) => {
                const Icon = connector.icon;
                const status = statuses[connector.id] ?? (connector.availability === "available" ? "not_connected" : "coming_soon");
                return <button key={connector.id} type="button" onClick={() => setSelectedId(connector.id)} className={`group rounded-xl border p-4 text-left transition ${card}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${dark ? "bg-white/[0.07]" : "bg-slate-100"}`}><Icon size={20}/></span>
                    <span className={`rounded-full px-2 py-1 text-[10px] ${status === "connected" ? "bg-emerald-500/10 text-emerald-500" : status === "coming_soon" ? "bg-amber-500/10 text-amber-500" : dark ? "bg-white/10 text-zinc-300" : "bg-slate-100 text-slate-600"}`}>{status === "connected" ? "Connected" : status === "coming_soon" ? "Coming soon" : "Not connected"}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{connector.name}</h3>
                  <p className={`mt-1 line-clamp-2 text-xs leading-5 ${muted}`}>{connector.description}</p>
                  <p className={`mt-3 text-[10px] font-medium ${muted}`}>{connector.category}</p>
                </button>;
              })}
            </div> : <div className={`py-16 text-center text-sm ${muted}`}>No integrations match “{query}”.</div>}
          </div>
        )}
      </section>
    </div>
  );
}

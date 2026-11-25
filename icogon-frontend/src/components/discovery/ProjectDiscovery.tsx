import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, FolderOpen, LayoutTemplate, Search, X, Clock, RefreshCw, Plus, ImageOff } from "lucide-react";
import { getProjectsApi, type ProjectResponse } from "../../api/projectApi";
import { useAuthStore } from "../../store/authStore";

// Self-contained gallery: no dependency on the older placeholder or optional discovery files.
export type DiscoveryTab = "projects" | "recent" | "templates";
export interface DiscoveryProject extends ProjectResponse {
  screenshot_url?: string | null;
  thumbnail_url?: string | null;
  preview_image_url?: string | null;
  owner_name?: string | null;
  owner_avatar_url?: string | null;
  last_opened_at?: string | null;
  last_opened?: string | null;
}
type TemplateCategory = "saas" | "dashboard" | "portfolio" | "ecommerce" | "ai-app" | "productivity" | "business" | "crm" | "landing-page" | "internal-tool" | "finance" | "education";
export interface DiscoveryTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  prompt: string;
  tags: string[];
}
export interface ProjectDiscoveryProps {
  isDark: boolean;
  onOpenProject: (project: DiscoveryProject) => void;
  onSelectTemplate: (template: DiscoveryTemplate) => void;
  onCreateProject: () => void;
  onBrowseAll: (tab: DiscoveryTab) => void;
  className?: string;
}
type History = Record<string, { projectId: string; viewedAt: string }>;
const HISTORY_PREFIX = "icogon:project-history:v1";
const TABS: { id: DiscoveryTab; label: string }[] = [
  { id: "projects", label: "My projects" },
  { id: "recent", label: "Recently viewed" },
  { id: "templates", label: "Icogon templates" },
];
const TEMPLATE_ROWS: [TemplateCategory, string, string, string, string][] = [
  ["saas", "saas-starter", "SaaS Starter", "Product launch and subscription workspace", "Build a premium SaaS app with a responsive landing page, pricing, onboarding, account settings and a dashboard. Clearly label demo billing and authentication."],
  ["ai-app", "ai-workspace", "AI Workspace", "AI assistant and conversation history", "Build a responsive AI assistant with conversation history, model selection, Markdown chat and file attachments. Keep provider credentials on the backend and label simulated responses."],
  ["dashboard", "analytics-studio", "Analytics Studio", "Business metrics and visual reports", "Build an analytics dashboard with interactive charts, KPI cards, date filters, data tables and CSV export. Use clearly labeled sample data."],
  ["ecommerce", "modern-store", "Modern Store", "Product catalog and shopping experience", "Build a responsive online store with collections, product filtering, details, cart and checkout validation. Label demo payments."],
  ["portfolio", "creative-portfolio", "Creative Portfolio", "Case studies and personal website", "Build an editorial portfolio with case studies, about page, project gallery, contact form and accessible animations."],
  ["business", "agency-pro", "Agency Pro", "Services and agency case studies", "Build a premium agency website with services, team, work gallery, case studies and inquiry form. Use labeled example content."],
  ["crm", "crm-workspace", "CRM Workspace", "Sales pipeline and customer management", "Build a CRM with contacts, lead management, a Kanban pipeline, search, filters, activity history and sales metrics."],
  ["productivity", "taskflow", "TaskFlow", "Tasks, boards and project planning", "Build a task management app with Kanban boards, calendar, status, priorities, editing and search."],
  ["landing-page", "launchpad", "Launchpad", "Conversion-focused product landing page", "Build a responsive startup landing page with hero, features, pricing, FAQ, validated waitlist form and SEO metadata."],
  ["internal-tool", "admin-control-center", "Admin Control Center", "Users, permissions and system reporting", "Build an admin dashboard with user management, roles, audit logs, tables and settings. Mark demo permissions and enforce real authorization server-side."],
  ["finance", "finance-tracker", "Finance Tracker", "Budgets and expense analytics", "Build a finance tracker with budgets, transactions, savings goals, category filters, accurate calculations and labeled demo data."],
  ["education", "learning-hub", "Learning Hub", "Courses and student progress", "Build a learning platform with a course catalog, lessons, quizzes, student progress and original demonstration content."],
];
const TEMPLATES: DiscoveryTemplate[] = TEMPLATE_ROWS.map(([category, id, name, description, prompt]) => ({ category, id, name, description, prompt, tags: [category] }));
const PALETTES = [
  ["#152035", "#60a5fa"], ["#132c24", "#6ee7b7"], ["#e9eef6", "#3168d9"],
  ["#eadfce", "#936640"], ["#2b203c", "#d8b4fe"], ["#222222", "#e5e5e5"],
  ["#eae5f5", "#8055c9"], ["#1a2e48", "#93c5fd"], ["#1e1e40", "#a78bfa"],
  ["#24313d", "#38bdf8"], ["#18382a", "#86efac"], ["#f3e8db", "#aa7144"],
];
function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
function stamp(value: unknown): number {
  const result = Date.parse(textValue(value));
  return Number.isFinite(result) ? result : 0;
}
function ago(value: unknown): string {
  const date = stamp(value);
  if (!date) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - date) / 60000));
  if (minutes < 1) return "just now";
  const amount = minutes < 60 ? minutes : minutes < 1440 ? Math.floor(minutes / 60) : Math.floor(minutes / 1440);
  const unit = minutes < 60 ? "minute" : minutes < 1440 ? "hour" : "day";
  if (amount >= 30 && unit === "day") return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
}
function readHistory(key: string): History {
  if (!key) return {};
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return Object.fromEntries(Object.entries(raw).filter(([id, entry]) => entry && typeof entry === "object" && entry.projectId === id && stamp(entry.viewedAt) > 0));
  } catch { return {}; }
}
function imageSource(value: unknown): string {
  const url = textValue(value);
  return /^(https?:\/\/|blob:|\/(?!\/)|data:image\/(png|jpeg|webp|gif|avif);base64,)/i.test(url) ? url : "";
}
function ProjectPreview({ project, isDark }: { project: DiscoveryProject; isDark: boolean }) {
  const sources = [...new Set([project.screenshot_url, project.thumbnail_url, project.preview_image_url].map(imageSource).filter(Boolean))];
  return <PreviewImage key={JSON.stringify(sources)} sources={sources} name={project.name} isDark={isDark} />;
}
function PreviewImage({ sources, name, isDark }: { sources: string[]; name: string; isDark: boolean }) {
  const [index, setIndex] = useState(0);
  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-[12px] border ${isDark ? "border-white/10 bg-[#2b2b2b]" : "border-black/[0.06] bg-[#ececef]"}`}>
      {sources[index] ? (
        <img key={sources[index]} src={sources[index]} alt={`${name} preview`} loading="lazy" decoding="async" onError={() => setIndex(i => i + 1)} className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
          <div className={`grid h-12 w-12 place-items-center rounded-xl ${isDark ? "bg-white/10 text-neutral-300" : "bg-white text-neutral-600"}`}><ImageOff size={23} strokeWidth={1.5} /></div>
          <span className="max-w-full truncate text-sm font-medium">{name}</span><span className="text-xs opacity-60">Preview not available</span>
        </div>
      )}
    </div>
  );
}
function Avatar({ name, source }: { name: string; source: string }) {
  const [failed, setFailed] = useState(false);
  return <span title={name} aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#bd460a] text-xs font-semibold text-white">{source && !failed ? <img src={source} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover" /> : (Array.from(name)[0] ?? "?").toUpperCase()}</span>;
}
function TemplateArtwork({ template }: { template: DiscoveryTemplate }) {
  const index = Math.max(0, TEMPLATES.findIndex(t => t.id === template.id));
  const [bg, accent] = PALETTES[index % PALETTES.length]!;
  const dashboard = ["dashboard", "finance", "internal-tool", "crm", "productivity", "ai-app"].includes(template.category);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[12px]" style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 320 180" className="h-full w-full transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none" aria-hidden="true">
        <rect x="13" y="12" width="294" height="156" rx="8" fill={accent} opacity=".10" />
        <circle cx="25" cy="24" r="4" fill={accent} /><rect x="34" y="21" width="35" height="5" rx="2" fill={accent} opacity=".8" />
        <rect x="264" y="19" width="32" height="10" rx="3" fill={accent} />
        {dashboard ? <>
          <rect x="19" y="38" width="53" height="123" rx="4" fill={accent} opacity=".18" />
          {[50, 63, 76, 89].map(y => <rect key={y} x="26" y={y} width="34" height="4" rx="2" fill={accent} opacity=".55" />)}
          {[80, 154, 228].map(x => <g key={x}><rect x={x} y="38" width="68" height="37" rx="5" fill={accent} opacity=".18" /><rect x={x+9} y="49" width="31" height="5" rx="2" fill={accent} /><rect x={x+9} y="60" width="43" height="4" rx="2" fill={accent} opacity=".5" /></g>)}
          <rect x="80" y="83" width="216" height="78" rx="5" fill={accent} opacity=".13" /><polyline points="91,146 120,128 148,137 176,109 207,119 244,94 284,105" stroke={accent} strokeWidth="3" fill="none" strokeLinejoin="round" />
        </> : <>
          <text x="160" y="72" textAnchor="middle" fontSize="19" fontWeight="700" fill={accent}>{template.name}</text>
          <rect x="85" y="85" width="150" height="4" rx="2" fill={accent} opacity=".5" /><rect x="125" y="101" width="70" height="17" rx="5" fill={accent} />
          {[20, 115, 210].map(x => <g key={x}><rect x={x} y="130" width="90" height="30" rx="5" fill={accent} opacity=".18" /><rect x={x+9} y="139" width="30" height="4" rx="2" fill={accent} /><rect x={x+9} y="150" width="62" height="3" rx="1.5" fill={accent} opacity=".5" /></g>)}
        </>}
      </svg>
      <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-white">Design concept</span>
    </div>
  );
}
interface RequestState { key: string; projects: DiscoveryProject[]; error: boolean }

// The named export is intentional: DashboardPage will fail compilation if it
// accidentally resolves the older placeholder rather than this implementation.
export function DashboardProjectDiscovery(props: ProjectDiscoveryProps) {
  const user = useAuthStore(state => state.user);
  const authLoading = useAuthStore(state => state.isLoading);
  return <DiscoveryContent key={user?.id ?? "guest"} {...props} userId={user?.id} authLoading={authLoading} ownerName={textValue(user?.user_metadata?.full_name) || textValue(user?.user_metadata?.name) || user?.email?.split("@")[0] || "You"} ownerAvatar={imageSource(user?.user_metadata?.avatar_url) || imageSource(user?.user_metadata?.picture)} />;
}
function DiscoveryContent({ isDark, onOpenProject, onSelectTemplate, onCreateProject, onBrowseAll, className = "", userId, ownerName, ownerAvatar, authLoading }: ProjectDiscoveryProps & { userId?: string; ownerName: string; ownerAvatar: string; authLoading: boolean }) {
  const [tab, setTab] = useState<DiscoveryTab>("projects");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [retry, setRetry] = useState(0);
  const [request, setRequest] = useState<RequestState | null>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const returnFocus = useRef(false);
  const key = userId ? `${HISTORY_PREFIX}:${encodeURIComponent(userId)}` : "";
  const [history, setHistory] = useState<History>(() => readHistory(key));
  const requestKey = JSON.stringify([userId ?? null, retry]);
  const current = request?.key === requestKey ? request : null;
  const loading = authLoading || (Boolean(userId) && !current);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void getProjectsApi().then(data => {
      if (cancelled) return;
      if (!Array.isArray(data)) throw new Error("Invalid projects response");
      const projects = [...new Map(data.filter(p => p && typeof p.id === "string" && typeof p.name === "string").map(p => [p.id, p])).values()];
      setRequest({ key: requestKey, projects, error: false });
    }).catch(() => { if (!cancelled) setRequest({ key: requestKey, projects: [], error: true }); });
    return () => { cancelled = true; };
  }, [userId, requestKey]);
  useEffect(() => {
    if (searching) searchInput.current?.focus({ preventScroll: true });
    else if (returnFocus.current) { returnFocus.current = false; searchButton.current?.focus({ preventScroll: true }); }
  }, [searching]);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) setHistory(readHistory(key)); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);

  const viewedAt = (p: DiscoveryProject) => [history[p.id]?.viewedAt, p.last_opened_at, p.last_opened].sort((a,b) => stamp(b)-stamp(a))[0];
  const matches = (...values: unknown[]) => query.trim().toLowerCase().split(/\s+/).every(word => values.map(textValue).join(" ").toLowerCase().includes(word));
  const visibleProjects = (current?.projects ?? []).filter(p => {
    if (tab === "projects" && p.user_id && p.user_id !== userId) return false;
    if (tab === "recent" && !stamp(viewedAt(p))) return false;
    return matches(p.name, p.description, p.prompt);
  }).sort((a,b) => tab === "recent" ? stamp(viewedAt(b))-stamp(viewedAt(a)) : (stamp(b.updated_at) || stamp(b.created_at))-(stamp(a.updated_at) || stamp(a.created_at)));
  const visibleTemplates = TEMPLATES.filter(t => matches(t.name, t.description, t.category));
  const open = (project: DiscoveryProject) => {
    if (key) {
      const next = { ...history, ...readHistory(key), [project.id]: { projectId: project.id, viewedAt: new Date().toISOString() } };
      const limited = Object.fromEntries(Object.entries(next).sort((a,b) => stamp(b[1].viewedAt)-stamp(a[1].viewedAt)).slice(0,50));
      setHistory(limited);
      try { localStorage.setItem(key, JSON.stringify(limited)); } catch { /* still works during this session */ }
    }
    onOpenProject(project);
  };
  const closeSearch = () => { returnFocus.current = true; setSearching(false); setQuery(""); };
  const muted = isDark ? "text-[#a3a3a3]" : "text-[#676767]";
  const border = isDark ? "border-[#464646]" : "border-[#d4d4d4]";
  const capsule = isDark ? "bg-[#262626]" : "bg-[#f1f1f1]";
  const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const action = `inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${focus} ${isDark ? "hover:bg-white/10" : "hover:bg-black/[0.05]"}`;
  const empty = (title: string, description: string, label: string, callback: () => void, Icon = FolderOpen) => (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <Icon size={30} strokeWidth={1.5} className={muted} aria-hidden="true" />
      <h3 className="text-[15px] font-semibold">{title}</h3><p className={`max-w-sm text-[13px] ${muted}`}>{description}</p>
      <button type="button" onClick={callback} className={`${action} rounded-lg border ${border}`}>{label}</button>
    </div>
  );
  return (
    <section data-icogon-discovery="gallery-v3" aria-label="Project discovery" className={`relative w-full min-w-0 rounded-[24px] px-4 pb-7 pt-5 sm:px-6 sm:pt-6 sm:pb-8 ${isDark ? "bg-[#212121] text-neutral-100" : "bg-[#f7f7f7] text-[#171717]"} ${className}`} style={{ containerType: "inline-size", containerName: "icogon-discovery-v2" }}>
      <style>{`
        .icogon-discovery-v2-grid { display:grid; grid-template-columns:minmax(0,1fr); gap:24px 20px; }
        @container icogon-discovery-v2 (min-width: 520px) { .icogon-discovery-v2-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @container icogon-discovery-v2 (min-width: 850px) { .icogon-discovery-v2-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
      `}</style>
      <div className="mb-6 flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
        {searching ? (
          <div className={`flex w-full min-w-0 items-center gap-2 rounded-full border px-3 py-1 ${border} ${capsule}`}>
            <Search size={16} className={muted} aria-hidden="true" />
            <input ref={searchInput} type="search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape" && !e.nativeEvent.isComposing) closeSearch(); }} placeholder={`Search ${tab === "templates" ? "templates" : "projects"}...`} aria-label="Search discovery" className="h-9 min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none" />
            {query && <button type="button" onClick={() => { setQuery(""); searchInput.current?.focus(); }} className={action} aria-label="Clear search">Clear</button>}
            <button type="button" onClick={closeSearch} className={action} aria-label="Close search"><X size={17} /></button>
          </div>
        ) : <>
          <div role="group" aria-label="Discovery navigation" className={`flex max-w-full min-w-0 items-center gap-0.5 overflow-x-auto rounded-full border p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${border} ${capsule}`}>
            <button ref={searchButton} type="button" onClick={() => setSearching(true)} aria-label="Search projects and templates" className={`${action} ${muted}`}><Search size={16} strokeWidth={1.7} /><span className="hidden sm:inline">Search</span></button>
            {TABS.map(t => <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => { setTab(t.id); setQuery(""); }} className={`${action} whitespace-nowrap border ${tab === t.id ? isDark ? "border-[#565656] bg-[#414141] text-white shadow-sm" : "border-[#c6c6c6] bg-[#fafafa] text-[#111] shadow-sm" : `border-transparent ${muted}`}`}>{t.label}</button>)}
          </div>
          <button type="button" className={`${action} ml-auto`} onClick={() => onBrowseAll(tab)}>Browse all<ArrowRight size={15} strokeWidth={1.7} /></button>
        </>}
      </div>
      {tab === "templates" ? (
        <section aria-label="Icogon template gallery">
          {visibleTemplates.length ? <div className="icogon-discovery-v2-grid">{visibleTemplates.map(template => <button key={template.id} type="button" onClick={() => onSelectTemplate(template)} className={`group min-w-0 rounded-xl text-left ${focus}`}><TemplateArtwork template={template} /><span className="mt-3 flex items-center justify-between gap-2 px-1 text-[14px] font-medium">{template.name}<ArrowUpRight size={16} className={muted} /></span><span className={`mt-1 block px-1 text-[12px] ${muted}`}>{template.description}</span></button>)}</div> : empty("No matching templates", "Try a different search term.", "Clear search", () => setQuery(""), LayoutTemplate)}
        </section>
      ) : loading ? (
        <div role="status" aria-label="Loading projects" className="icogon-discovery-v2-grid">{[0,1,2].map(i => <div key={i} className="motion-safe:animate-pulse"><div className={`aspect-video rounded-xl ${isDark ? "bg-white/5" : "bg-black/[0.06]"}`} /><div className={`mt-3 h-4 w-1/2 rounded ${isDark ? "bg-white/5" : "bg-black/[0.06]"}`} /></div>)}</div>
      ) : current?.error ? empty("Could not load projects", "Your gallery is ready. Check the API connection and try again.", "Try again", () => setRetry(n => n + 1), RefreshCw) : visibleProjects.length ? (
        <div className="icogon-discovery-v2-grid">
          {visibleProjects.map(project => {
            const own = !project.user_id || project.user_id === userId;
            const name = textValue(project.owner_name) || (own ? ownerName : "Unknown owner");
            const avatar = imageSource(project.owner_avatar_url) || (own ? ownerAvatar : "");
            const date = tab === "recent" ? viewedAt(project) : stamp(project.updated_at) ? project.updated_at : project.created_at;
            const activity = tab === "recent" ? "Viewed" : stamp(project.updated_at) ? "Edited" : "Created";
            return <button key={project.id} type="button" onClick={() => open(project)} aria-label={`Open project ${project.name}`} className={`group min-w-0 rounded-xl text-left ${focus}`}>
              <ProjectPreview project={project} isDark={isDark} />
              <span className="mt-3 flex min-w-0 items-center gap-2.5 px-1">
                <Avatar key={`${name}:${avatar}`} name={name} source={avatar} />
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{project.name}</span><span className={`mt-0.5 block truncate text-[12px] ${muted}`}>{name}{ago(date) ? ` · ${activity} ${ago(date)}` : ""}</span></span>
              </span>
            </button>;
          })}
        </div>
      ) : query.trim() ? empty("No matching projects", "Try another search term.", "Clear search", () => setQuery(""), Search) : tab === "recent" ? empty("No recently viewed projects", "Open a project to find it here next time.", "My projects", () => setTab("projects"), Clock) : empty("No projects yet", "Start with an idea and build your first project.", "Create a project", onCreateProject, Plus)}
    </section>
  );
}
export default DashboardProjectDiscovery;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Camera, ChevronDown, Clock3, FolderOpen, FolderPlus, Grid2X2,
  List, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Trash2, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteProjectApi, getProjectsApi, updateProjectNameApi, type ProjectResponse } from "../../api/projectApi";
import { useTheme } from "../../components/context/ThemeContext";
import { supabase } from "../../lib/supabase";

const projectThumbnailKey = (userId: string, projectId: string) =>
  `icogon-project-thumbnail:${userId}:${projectId}`;

function readLocalProjectThumbnail(userId: string, projectId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(projectThumbnailKey(userId, projectId));
  } catch {
    return null;
  }
}

function saveProjectThumbnail(userId: string, projectId: string, dataUrl: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(projectThumbnailKey(userId, projectId), dataUrl);
}

function removeProjectThumbnail(userId: string, projectId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(projectThumbnailKey(userId, projectId));
}

// Module-level cache survives React route changes but resets on a full browser reload.
const projectsCache = new Map<string, ProjectResponse[]>();
type ViewMode = "grid" | "list";
type SortMode = "updated" | "oldest" | "name";
type ProjectWithPreview = ProjectResponse & {
  thumbnail_url?: string | null;
  screenshot_url?: string | null;
  preview_image_url?: string | null;
};

const styles = `
.ic-projects { --ip-text:#f5f5f6; --ip-muted:#a0a0a8; --ip-border:rgba(255,255,255,.13); --ip-surface:rgba(24,24,27,.76); --ip-hover:rgba(255,255,255,.07); color:var(--ip-text); min-height:100%; background:transparent; }
.ic-projects.light { --ip-text:#18181b; --ip-muted:#71717a; --ip-border:rgba(24,24,27,.15); --ip-surface:rgba(255,255,255,.7); --ip-hover:rgba(24,24,27,.05); }
.ic-projects * { box-sizing:border-box; }
.ic-projects__inner { width:min(100%,1120px); margin:0 auto; padding:clamp(28px,3.6vw,48px) clamp(18px,3vw,40px) 70px; }
.ic-projects__header { display:flex; align-items:center; justify-content:space-between; gap:18px; margin-bottom:30px; }
.ic-projects__title { font-size:clamp(23px,2.2vw,29px); letter-spacing:-.045em; font-weight:650; margin:0; }
.ic-projects__actions,.ic-projects__toolbar,.ic-projects__switch { display:flex; align-items:center; gap:8px; }
.ic-projects__button,.ic-projects__select { min-height:37px; display:inline-flex; align-items:center; justify-content:center; gap:8px; border:1px solid var(--ip-border); border-radius:999px; padding:0 15px; background:var(--ip-surface); color:var(--ip-text); font:inherit; font-size:13px; font-weight:500; cursor:pointer; white-space:nowrap; }
.ic-projects__button:hover:not(:disabled),.ic-projects__select:hover { background:var(--ip-hover); }
.ic-projects__button:focus-visible,.ic-projects__select:focus-visible,.ic-projects__thumb:focus-visible,.ic-projects__menu-trigger:focus-visible { outline:2px solid #4c82ff; outline-offset:3px; }
.ic-projects__button:disabled { opacity:.45; cursor:not-allowed; }
.ic-projects__button--primary { background:#2458ec; border-color:#1947cb; color:#fff; box-shadow:0 2px 4px rgba(0,0,0,.12); }
.ic-projects__button--primary:hover:not(:disabled) { background:#1b4bd5; }
.ic-projects__toolbar { gap:9px; flex-wrap:wrap; margin-bottom:34px; }
.ic-projects__search { width:min(100%,365px); min-height:39px; display:flex; align-items:center; gap:9px; padding:0 13px; border:1px solid var(--ip-border); border-radius:999px; background:var(--ip-surface); color:var(--ip-muted); }
.ic-projects__search:focus-within { border-color:#4c82ff; box-shadow:0 0 0 3px rgba(65,120,255,.12); }
.ic-projects__search input { width:100%; min-width:0; border:0; outline:0; background:transparent; color:var(--ip-text); font:inherit; font-size:13px; }
.ic-projects__search input::placeholder { color:var(--ip-muted); }
.ic-projects__clear { display:grid; place-items:center; padding:3px; border:0; background:transparent; color:var(--ip-muted); cursor:pointer; }
.ic-projects__select { appearance:none; padding-right:34px; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 11px center; }
.ic-projects__view-label { color:var(--ip-muted); font-size:12px; margin-left:4px; }
.ic-projects__switch { margin-left:auto; gap:2px; border:1px solid var(--ip-border); padding:3px; border-radius:999px; background:var(--ip-surface); }
.ic-projects__switch button { width:31px; height:30px; border:0; border-radius:999px; display:grid; place-items:center; background:transparent; color:var(--ip-muted); cursor:pointer; }
.ic-projects__switch button[aria-pressed=true] { background:var(--ip-hover); color:var(--ip-text); }
.ic-projects__count { color:var(--ip-muted); font-size:12px; margin:-12px 0 20px; }
.ic-projects__grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:30px 22px; align-items:start; }
.ic-projects__item { position:relative; min-width:0; }
.ic-projects__thumb { position:relative; width:100%; aspect-ratio:16/9; display:grid; place-items:center; overflow:hidden; padding:0; border:1px solid var(--ip-border); border-radius:13px; background:#111319; color:#b9c5dc; cursor:pointer; text-align:center; transition:border-color .15s,transform .15s; }
.ic-projects__thumb:hover { border-color:#7c9aff; transform:translateY(-2px); }
.ic-projects__thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.ic-projects__thumb-actions { position:absolute; right:9px; bottom:9px; z-index:2; display:flex; gap:5px; opacity:0; transition:opacity .15s; }
.ic-projects__item:hover .ic-projects__thumb-actions,.ic-projects__item:focus-within .ic-projects__thumb-actions,.ic-projects__list-row:hover .ic-projects__thumb-actions,.ic-projects__list-row:focus-within .ic-projects__thumb-actions { opacity:1; }
.ic-projects__thumb-actions button { display:inline-flex; align-items:center; gap:5px; border:1px solid #555; border-radius:8px; padding:7px 9px; background:rgba(15,15,18,.9); color:#fff; cursor:pointer; font-size:11px; }
@media(hover:none) { .ic-projects__thumb-actions { opacity:1; } }
.ic-projects__preview-placeholder { display:flex; flex-direction:column; align-items:center; gap:10px; color:#a6b1c5; font-size:12px; }
.ic-projects__preview-placeholder svg { opacity:.65; }
.ic-projects__info { display:flex; align-items:center; gap:11px; padding:13px 1px 0; min-width:0; }
.ic-projects__avatar { width:37px; height:37px; flex:0 0 37px; display:grid; place-items:center; border-radius:50%; background:#c43a0c; color:white; font-weight:650; font-size:17px; overflow:hidden; }
.ic-projects__avatar img { width:100%; height:100%; object-fit:cover; }
.ic-projects__details { min-width:0; flex:1; }
.ic-projects__name { display:block; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border:0; padding:0; text-align:left; background:transparent; color:var(--ip-text); font:inherit; font-size:14px; font-weight:600; cursor:pointer; }
.ic-projects__date { display:flex; align-items:center; gap:5px; margin-top:4px; color:var(--ip-muted); font-size:12px; }
.ic-projects__menu-wrap { position:relative; align-self:flex-start; }
.ic-projects__menu-trigger { display:grid; place-items:center; width:30px; height:30px; border:0; border-radius:8px; background:transparent; color:var(--ip-muted); cursor:pointer; }
.ic-projects__menu-trigger:hover { background:var(--ip-hover); color:var(--ip-text); }
.ic-projects__menu { position:absolute; z-index:30; right:0; top:34px; width:166px; padding:5px; border:1px solid var(--ip-border); border-radius:11px; background:var(--ip-surface); backdrop-filter:blur(20px); box-shadow:0 15px 35px rgba(0,0,0,.22); }
.ic-projects__menu button { display:flex; align-items:center; gap:9px; width:100%; border:0; border-radius:7px; padding:9px; background:transparent; color:var(--ip-text); font:inherit; font-size:12px; text-align:left; cursor:pointer; }
.ic-projects__menu button:hover { background:var(--ip-hover); }
 .ic-projects__menu button:disabled { opacity:.5; cursor:wait; }
.ic-projects__rename-overlay { position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:20px; background:rgba(0,0,0,.58); backdrop-filter:blur(4px); }
.ic-projects__rename-dialog { width:min(100%,420px); padding:24px; border:1px solid var(--ip-border); border-radius:18px; background:#242428; color:#f5f5f6; box-shadow:0 25px 70px rgba(0,0,0,.4); }
.ic-projects.light .ic-projects__rename-dialog { background:#fff; color:#18181b; }
.ic-projects__rename-dialog h2 { margin:0 0 7px; font-size:19px; font-weight:650; }
.ic-projects__rename-dialog p { margin:0 0 18px; font-size:13px; color:var(--ip-muted); }
.ic-projects__rename-dialog label { display:block; margin-bottom:8px; font-size:12px; font-weight:600; }
.ic-projects__rename-input { display:block; width:100%; height:43px; padding:0 12px; border:1px solid var(--ip-border); border-radius:9px; outline:none; background:var(--ip-surface); color:inherit; font:inherit; font-size:14px; }
.ic-projects__rename-input:focus { border-color:#4c82ff; box-shadow:0 0 0 3px rgba(65,120,255,.15); }
.ic-projects__rename-error { margin-top:9px!important; color:#ef777d!important; }
.ic-projects__rename-actions { display:flex; justify-content:flex-end; gap:9px; margin-top:22px; }
.ic-projects__rename-actions button { min-height:38px; border:1px solid var(--ip-border); border-radius:9px; padding:0 16px; background:var(--ip-surface); color:inherit; font:inherit; font-size:13px; cursor:pointer; }
.ic-projects__rename-actions button[type=submit] { background:#2458ec; color:white; border-color:#2458ec; }
.ic-projects__rename-actions button:disabled { opacity:.55; cursor:not-allowed; }
.ic-projects__list { display:flex; flex-direction:column; gap:9px; }
.ic-projects__list-row { display:flex; align-items:center; gap:15px; padding:10px; border:1px solid var(--ip-border); border-radius:13px; background:var(--ip-surface); }
.ic-projects__list-row .ic-projects__thumb { width:110px; flex:0 0 110px; border-radius:8px; }
.ic-projects__list-row .ic-projects__info { padding:0; flex:1; }
.ic-projects__state { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:290px; gap:11px; padding:30px 15px; text-align:center; border:1px dashed var(--ip-border); border-radius:15px; background:var(--ip-surface); }
.ic-projects__state h2 { margin:0; font-size:17px; font-weight:650; }
.ic-projects__state p { margin:0 0 8px; max-width:400px; color:var(--ip-muted); font-size:13px; line-height:1.6; }
.ic-projects__skeleton { aspect-ratio:16/9; border-radius:13px; background:var(--ip-surface); animation:ic-projects-pulse 1.3s ease-in-out infinite alternate; }
@keyframes ic-projects-pulse { to { opacity:.4; } }
@media(max-width:900px) { .ic-projects__grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:620px) { .ic-projects__inner { padding:25px 17px 50px; } .ic-projects__header { align-items:flex-start; } .ic-projects__actions { gap:6px; } .ic-projects__button { padding:0 11px; font-size:12px; } .ic-projects__search { width:100%; } .ic-projects__switch { margin-left:0; } .ic-projects__grid { grid-template-columns:1fr; gap:25px; } .ic-projects__list-row .ic-projects__thumb { width:76px; flex-basis:76px; } .ic-projects__view-label { display:none; } }
@media(prefers-reduced-motion:reduce) { .ic-projects__thumb,.ic-projects__skeleton { transition:none; animation:none; } .ic-projects__thumb:hover { transform:none; } }
`;

function previewUrl(project: ProjectResponse): string | null {
  const p = project as ProjectWithPreview;
  const candidate = p.thumbnail_url || p.screenshot_url || p.preview_image_url;
  if (!candidate) return null;
  try {
    const url = new URL(candidate, window.location.origin);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function readLocalPreviews(userId: string, projects: ProjectResponse[]): Record<string, string> {
  const images: Record<string, string> = {};
  for (const project of projects) {
    try {
      const saved = readLocalProjectThumbnail(userId, project.id);
      if (saved) images[project.id] = saved;
    } catch { /* Browser storage unavailable */ }
  }
  return images;
}

function formatEdited(project: ProjectResponse, now: number): string {
  const raw = project.updated_at || project.created_at;
  if (!raw) return "Edit date unavailable";
  const time = new Date(raw).getTime();
  if (!Number.isFinite(time)) return "Edit date unavailable";
  const elapsed = Math.max(0, now - time);
  const mins = Math.floor(elapsed / 60000);
  if (mins < 1) return "Edited just now";
  if (mins < 60) return `Edited ${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Edited ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Edited ${days} day${days === 1 ? "" : "s"} ago`;
  return `Edited ${new Date(time).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as { response?: { data?: { detail?: unknown } }; message?: unknown };
    if (typeof e.response?.data?.detail === "string") return e.response.data.detail;
    if (typeof e.message === "string") return e.message;
  }
  return "Something went wrong. Please try again.";
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("updated");
  const [view, setView] = useState<ViewMode>("grid");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<ProjectResponse | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [userId, setUserId] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const localPreviews = useMemo(
    () => userId ? readLocalPreviews(userId, projects) : {},
    [userId, projects, previewVersion],
  );
  const uploadRef = useRef<HTMLInputElement>(null);
  const uploadProjectId = useRef<string | null>(null);
  const requestSequence = useRef(0);
  const [owner, setOwner] = useState({ name: "Your account", avatar: "" });
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const loadProjects = useCallback(async (force = false, accountId?: string | null) => {
    const id = accountId ?? userId;
    if (!id) return;
    const cached = projectsCache.get(id);
    if (cached && !force) {
      setProjects(cached);
      setLoading(false);
      setError("");
      return;
    }
    const sequence = ++requestSequence.current;
    setLoading(!cached);
    setError("");
    try {
      const result = await getProjectsApi();
      projectsCache.set(id, result);
      if (sequence === requestSequence.current) {
        setProjects(result);
        setNow(Date.now());
      }
    } catch (err) {
      if (sequence === requestSequence.current) setError(getErrorMessage(err));
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    const updateOwner = (user: { id?: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!active) return;
      const metadata = user?.user_metadata ?? {};
      const name = [metadata.full_name, metadata.name, metadata.display_name, user?.email?.split("@")[0]]
        .find((v): v is string => typeof v === "string" && v.trim().length > 0) || "Your account";
      const avatar = [metadata.avatar_url, metadata.picture, metadata.profile_image]
        .find((v): v is string => typeof v === "string" && v.trim().length > 0) || "";
      setOwner({ name, avatar });
      const nextId = user?.id ?? null;
      setUserId((previous) => {
        if (previous !== nextId) {
          ++requestSequence.current;
          setProjects(nextId ? projectsCache.get(nextId) ?? [] : []);
          setLoading(Boolean(nextId && !projectsCache.has(nextId)));
          setError("");
        }
        return nextId;
      });
    };
    void supabase.auth.getUser().then(({ data }) => updateOwner(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateOwner(session?.user ?? null);
    });
    return () => { active = false; subscription.unsubscribe(); ++requestSequence.current; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const timer = window.setTimeout(() => { void loadProjects(false, userId); }, 0);
    return () => window.clearTimeout(timer);
  }, [userId, loadProjects]);

  // Close the three-dot menu on outside click or Escape.
  useEffect(() => {
    if (!menuId) return;
    const handleOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !target.closest(".ic-projects__menu-wrap")) {
        setMenuId(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuId(null);
    };
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuId]);

  // Recompute relative timestamps without re-fetching project data.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handlePreviewUpload = async (file: File | undefined) => {
    const projectId = uploadProjectId.current;
    if (!file || !projectId || !userId) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Choose an image file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      window.alert("Choose an image smaller than 15 MB.");
      return;
    }
    try {
      const source = URL.createObjectURL(file);
      const img = new Image();
      try {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Could not read the image."));
          img.src = source;
        });
        const canvas = document.createElement("canvas");
        canvas.width = 960;
        canvas.height = 540;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Image processing is unavailable.");
        ctx.fillStyle = "#111319";
        ctx.fillRect(0, 0, 960, 540);
        const scale = Math.min(960 / img.naturalWidth, 540 / img.naturalHeight);
        const width = img.naturalWidth * scale;
        const height = img.naturalHeight * scale;
        ctx.drawImage(img, (960 - width) / 2, (540 - height) / 2, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.76);
        saveProjectThumbnail(userId, projectId, dataUrl);
        setPreviewVersion((version) => version + 1);
        setBrokenImages((current) => ({ ...current, [projectId]: false }));
      } finally {
        URL.revokeObjectURL(source);
      }
    } catch (err) {
      window.alert(`Could not save the thumbnail: ${getErrorMessage(err)}`);
    }
  };

  const choosePreview = (id: string) => {
    uploadProjectId.current = id;
    if (uploadRef.current) {
      uploadRef.current.value = "";
      uploadRef.current.click();
    }
  };

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((p) => `${p.name} ${p.description ?? ""}`.toLowerCase().includes(query))
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        const aTime = new Date(a.updated_at || a.created_at || 0).getTime() || 0;
        const bTime = new Date(b.updated_at || b.created_at || 0).getTime() || 0;
        return sort === "oldest" ? aTime - bTime : bTime - aTime;
      });
  }, [projects, search, sort]);

  const openProject = (id: string) => navigate(`/builder/${encodeURIComponent(id)}`);
  const beginRename = (project: ProjectResponse) => {
    setMenuId(null);
    setRenameTarget(project);
    setRenameValue(project.name);
    setRenameError("");
  };

  const handleRename = async () => {
    if (!renameTarget || renaming) return;
    const name = renameValue.trim();
    if (!name) {
      setRenameError("Project name cannot be empty.");
      return;
    }
    if (name.length > 120) {
      setRenameError("Project name must be 120 characters or fewer.");
      return;
    }
    if (name === renameTarget.name) {
      setRenameTarget(null);
      return;
    }

    setRenaming(true);
    setRenameError("");
    try {
      const updated = await updateProjectNameApi(renameTarget.id, name);
      setProjects((items) => {
        const next = items.map((item) => item.id === updated.id ? { ...item, ...updated } : item);
        if (userId) projectsCache.set(userId, next);
        return next;
      });
      setRenameTarget(null);
      setNow(Date.now());
    } catch (err) {
      setRenameError(getErrorMessage(err));
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project permanently?")) return;
    setDeletingId(id);
    try {
      await deleteProjectApi(id);
      setProjects((items) => {
        const next = items.filter((item) => item.id !== id);
        if (userId) projectsCache.set(userId, next);
        return next;
      });
      if (userId) {
        try { removeProjectThumbnail(userId, id); } catch { /* ignore */ }
      }
      setMenuId(null);
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const renderProject = (project: ProjectResponse) => {
    const image = localPreviews[project.id] || previewUrl(project);
    const showImage = image && !brokenImages[project.id];
    return (
      <article key={project.id} className={view === "list" ? "ic-projects__list-row" : "ic-projects__item"}>
        <div className="ic-projects__preview-wrap" style={{ position: "relative" }}><button type="button" className="ic-projects__thumb" onClick={() => openProject(project.id)} aria-label={`Open ${project.name}`}>
          {showImage ? (
            <img src={image} alt={`Preview of ${project.name}`} loading="lazy" onError={() => setBrokenImages((prev) => ({ ...prev, [project.id]: true }))} />
          ) : (
            <span className="ic-projects__preview-placeholder"><FolderOpen size={29} strokeWidth={1.4} /><span>Preview not available</span></span>
          )}
        </button>
        <div className="ic-projects__thumb-actions"><button type="button" onClick={() => choosePreview(project.id)} title="Upload a real screenshot for this project"><Camera size={13} /> Add preview</button></div></div>
        <div className="ic-projects__info">
          <span className="ic-projects__avatar" aria-hidden="true">
            {owner.avatar ? <img src={owner.avatar} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : owner.name.charAt(0).toUpperCase()}
          </span>
          <div className="ic-projects__details">
            <button type="button" className="ic-projects__name" title={project.name} onClick={() => openProject(project.id)}>{project.name}</button>
            <div className="ic-projects__date"><Clock3 size={12} aria-hidden="true" />{formatEdited(project, now)}</div>
          </div>
          <div className="ic-projects__menu-wrap">
            <button type="button" className="ic-projects__menu-trigger" aria-label={`Actions for ${project.name}`} aria-expanded={menuId === project.id} onClick={() => setMenuId((id) => id === project.id ? null : project.id)}><MoreHorizontal size={18} /></button>
            {menuId === project.id && (
              <div className="ic-projects__menu">
                <button type="button" onClick={() => openProject(project.id)}><ArrowRight size={14} />Open project</button>
                <button type="button" onClick={() => beginRename(project)}><Pencil size={14} />Rename project</button>
                <button type="button" disabled={deletingId === project.id} onClick={() => void handleDelete(project.id)} style={{ color: "#ef777d" }}><Trash2 size={14} />{deletingId === project.id ? "Deleting..." : "Delete project"}</button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className={`ic-projects ${resolvedTheme === "dark" ? "dark" : "light"}`}>
      <style>{styles}</style>
      {renameTarget && (
        <div
          className="ic-projects__rename-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !renaming) setRenameTarget(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !renaming) setRenameTarget(null);
          }}
        >
          <form
            className="ic-projects__rename-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ic-project-rename-title"
            onSubmit={(event) => { event.preventDefault(); void handleRename(); }}
          >
            <h2 id="ic-project-rename-title">Rename project</h2>
            <p>Choose a new name for your website.</p>
            <label htmlFor="ic-project-rename-input">Project name</label>
            <input
              id="ic-project-rename-input"
              className="ic-projects__rename-input"
              type="text"
              autoFocus
              maxLength={120}
              required
              value={renameValue}
              onChange={(event) => { setRenameValue(event.target.value); setRenameError(""); }}
              disabled={renaming}
            />
            {renameError && <p className="ic-projects__rename-error" role="alert">{renameError}</p>}
            <div className="ic-projects__rename-actions">
              <button type="button" onClick={() => setRenameTarget(null)} disabled={renaming}>Cancel</button>
              <button type="submit" disabled={renaming || !renameValue.trim()}>
                {renaming ? "Saving..." : "Save name"}
              </button>
            </div>
          </form>
        </div>
      )}
      <input ref={uploadRef} type="file" accept="image/*" style={{ display: "none" }} aria-label="Upload project preview" onChange={(event) => { void handlePreviewUpload(event.target.files?.[0]); }} />
      <div className="ic-projects__inner">
        <header className="ic-projects__header">
          <h1 className="ic-projects__title">Projects</h1>
          <div className="ic-projects__actions">
            <button type="button" className="ic-projects__button" disabled title="Folder creation is not supported by the current project API"><FolderPlus size={15} />New folder</button>
            <button type="button" className="ic-projects__button ic-projects__button--primary" onClick={() => navigate("/builder")}><Plus size={16} />New project</button>
          </div>
        </header>
        <section className="ic-projects__toolbar" aria-label="Project controls">
          <label className="ic-projects__search"><Search size={16} aria-hidden="true" /><input type="search" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search projects" />{search && <button type="button" className="ic-projects__clear" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}</label>
          <span className="ic-projects__view-label">Filter</span>
          <select className="ic-projects__select" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} aria-label="Sort projects"><option value="updated">Recently edited</option><option value="oldest">Oldest edited</option><option value="name">Name A–Z</option></select>
          <div className="ic-projects__switch" role="group" aria-label="Project view"><button type="button" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Grid2X2 size={16} /></button><button type="button" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={16} /></button></div>
          <button type="button" className="ic-projects__button" onClick={() => void loadProjects(true)} disabled={loading} aria-label="Refresh projects" title="Refresh projects"><RefreshCw size={15} /></button>
        </section>
        {!loading && !error && <p className="ic-projects__count">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}</p>}
        {error && !loading && <section className="ic-projects__state" role="alert"><FolderOpen size={29} /><h2>Unable to load projects</h2><p>{error}</p><button type="button" className="ic-projects__button" onClick={() => void loadProjects(true)}><RefreshCw size={15} />Try again</button></section>}
        {loading && <div className="ic-projects__grid" aria-label="Loading projects">{[1, 2, 3].map((id) => <div key={id}><div className="ic-projects__skeleton" /><div className="ic-projects__skeleton" style={{ width: "65%", height: 13, marginTop: 15, aspectRatio: "auto" }} /></div>)}</div>}
        {!loading && !error && visibleProjects.length === 0 && <section className="ic-projects__state"><FolderOpen size={32} /><h2>{projects.length ? "No matching projects" : "Your next idea starts here"}</h2><p>{projects.length ? "Try another search or clear the current filter." : "Create your first project and turn an idea into a working website with ICOGON."}</p><button type="button" className="ic-projects__button ic-projects__button--primary" onClick={() => projects.length ? setSearch("") : navigate("/builder")}>{projects.length ? "Clear search" : "Create a project"}<ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} /></button></section>}
        {!loading && !error && visibleProjects.length > 0 && <section className={view === "grid" ? "ic-projects__grid" : "ic-projects__list"} aria-label="Your projects">{visibleProjects.map(renderProject)}</section>}
      </div>
    </div>
  );
};

export default ProjectsPage;

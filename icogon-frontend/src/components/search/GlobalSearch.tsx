import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Clock3, Command, FolderKanban, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { searchNavigation, type SearchNavigationItem } from "../../data/searchNavigation";
import { settingsNavigation } from "../../data/settingsNavigation";
import { connectorData } from "../../data/connectorData";
import { getProjectsApi, type ProjectResponse } from "../../api/projectApi";
import SearchResultItem from "./SearchResultItem";
import SearchPreviewPanel from "./SearchPreviewPanel";

interface GlobalSearchProps { open: boolean; onClose: () => void; }
type SearchItem = SearchNavigationItem & { project?: ProjectResponse };

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(232);

  // Keep the dashboard sidebar outside the search overlay. The sidebar
  // switches between 232px expanded and 72px collapsed in DashboardSidebar.
  useEffect(() => {
    if (!open) return;

    const sidebar = document.querySelector<HTMLElement>(
      "aside.fixed.left-0.top-0.z-50"
    );
    if (!sidebar) {
      setSidebarWidth(232);
      return;
    }

    const updateSidebarWidth = () => {
      setSidebarWidth(Math.round(sidebar.getBoundingClientRect().width) || 232);
    };

    updateSidebarWidth();
    const observer = new ResizeObserver(updateSidebarWidth);
    observer.observe(sidebar);
    window.addEventListener("resize", updateSidebarWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSidebarWidth);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const data = await getProjectsApi();
        if (!cancelled) setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Global search: unable to load projects", error);
        if (!cancelled) setProjectsError("Unable to load recent projects.");
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    };
    void loadProjects();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  const projectItems = useMemo<SearchItem[]>(() => projects.slice(0, 8).map((project) => ({
    id: `project-${project.id}`,
    title: project.name,
    category: "Recent projects",
    type: "action",
    icon: FolderKanban,
    path: `/builder/${project.id}`,
    keywords: [project.name, project.description || "", project.prompt || "", "project", "recent"],
    description: project.description || project.prompt || "",
    project,
  })), [projects]);

  const allItems = useMemo<SearchItem[]>(() => {
    const unique = new Map<string, SearchNavigationItem>();
    [...searchNavigation, ...settingsNavigation, ...connectorData].forEach((item) => {
      if (!unique.has(item.id)) unique.set(item.id, item);
    });
    return [...projectItems, ...Array.from(unique.values())];
  }, [projectItems]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return allItems;
    return allItems.filter((item) => [item.title, item.category, item.description || "", ...(item.keywords || [])]
      .join(" ").toLocaleLowerCase().includes(term));
  }, [allItems, query]);

  const groupedItems = useMemo(() => filteredItems.reduce<Record<string, SearchItem[]>>((groups, item) => {
    (groups[item.category] ||= []).push(item);
    return groups;
  }, {}), [filteredItems]);

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(filteredItems.length - 1, 0)));
  }, [filteredItems.length]);

  const selectedItem = filteredItems[selectedIndex];
  // Only a recent-project selection is allowed to populate the preview panel.
  const selectedProject = selectedItem?.project;

  const handleSelect = (item: SearchItem) => {
    if (item.type === "theme") {
      if (item.id === "theme-light") setTheme("light");
      if (item.id === "theme-dark") setTheme("dark");
      if (item.id === "theme-system") setTheme("system");
      return;
    }
    if (item.path) { onClose(); navigate(item.path); }
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyboard = (event: KeyboardEvent) => {
      const commandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (commandK || event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => Math.min(current + 1, Math.max(filteredItems.length - 1, 0)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === "Enter") {
        const item = filteredItems[selectedIndex];
        if (item) { event.preventDefault(); handleSelect(item); }
      }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [open, filteredItems, selectedIndex, onClose]);

  if (!open) return null;
  const headingClass = `mb-2 flex items-center gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${isDark ? "text-[#858585]" : "text-slate-400"}`;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-[999] flex items-center justify-center overflow-y-auto px-3 py-5 backdrop-blur-[4px] sm:px-6 ${isDark ? "bg-black/55" : "bg-slate-900/15"}`}
      style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px)` }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label="Global search"
        className={`relative flex h-[min(730px,calc(100vh-64px))] w-full max-w-[990px] overflow-hidden rounded-[18px] border shadow-[0_24px_80px_rgba(0,0,0,0.20)] ${isDark ? "border-[#292929] bg-[#111111] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
        <div className={`flex min-w-0 flex-col ${selectedProject ? "flex-[1_1_50%]" : "flex-1"}`}>
          <div className={`flex h-[62px] shrink-0 items-center gap-3 border-b px-5 ${isDark ? "border-[#292929]" : "border-slate-200"}`}>
            <Search size={19} strokeWidth={1.8} className={isDark ? "text-[#858585]" : "text-slate-400"} />
            <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0); }}
              placeholder="Search anything..." aria-label="Search anything"
              className={`min-w-0 flex-1 bg-transparent text-[15px] outline-none ${isDark ? "text-white placeholder:text-[#737373]" : "text-slate-900 placeholder:text-slate-400"}`} />
            {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); setSelectedIndex(0); inputRef.current?.focus(); }}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${isDark ? "text-[#888] hover:bg-[#222] hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}><X size={14} /></button>}
            <button type="button" onClick={onClose} aria-label="Close search"
              className={`flex h-7 items-center rounded-md border px-2 text-[11px] font-medium ${isDark ? "border-[#383838] text-[#888] hover:text-white" : "border-slate-200 text-slate-400 hover:text-slate-700"}`}>ESC</button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
            {filteredItems.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center">
                <Search size={22} className={isDark ? "text-[#666]" : "text-slate-400"} />
                <p className={`mt-3 text-sm font-semibold ${isDark ? "text-[#bbb]" : "text-slate-600"}`}>No results found</p>
              </div>
            ) : <div className="space-y-5">
              {!query.trim() && <section>
                <div className={headingClass}><Clock3 size={12} />Recent projects</div>
                {projectsLoading ? <div className={`flex items-center gap-2 px-2.5 py-4 text-xs ${isDark ? "text-[#777]" : "text-slate-400"}`}><Loader2 size={14} className="animate-spin" />Loading projects...</div>
                  : projectsError ? <p className={`px-2.5 py-3 text-xs ${isDark ? "text-[#888]" : "text-slate-500"}`}>{projectsError}</p>
                  : projectItems.length ? <div className="space-y-1">
                    {projectItems.map((item) => {
                      const index = filteredItems.findIndex((entry) => entry.id === item.id);
                      return <SearchResultItem key={item.id} item={item} isProject selected={index === selectedIndex}
                        activeTheme={theme} onMouseEnter={() => setSelectedIndex(index)} onClick={() => handleSelect(item)} />;
                    })}
                  </div> : <button type="button" onClick={() => { onClose(); navigate("/builder"); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-4 text-left text-sm ${isDark ? "text-[#aaa] hover:bg-[#1d1d1d]" : "text-slate-500 hover:bg-slate-50"}`}>
                    <FolderKanban size={18} />Create your first project
                  </button>}
              </section>}

              {Object.entries(groupedItems).map(([category, items]) => {
                if (!query.trim() && category === "Recent projects") return null;
                return <section key={category}>
                  <div className={headingClass}>{category}</div>
                  <div className="space-y-1">{items.map((item) => {
                    const index = filteredItems.findIndex((entry) => entry.id === item.id);
                    return <SearchResultItem key={item.id} item={item} isProject={Boolean(item.project)} selected={index === selectedIndex}
                      activeTheme={item.type === "theme" ? theme : resolvedTheme}
                      onMouseEnter={() => setSelectedIndex(index)} onClick={() => handleSelect(item)} />;
                  })}</div>
                </section>;
              })}
            </div>}
          </div>

          <div className={`flex h-[42px] shrink-0 items-center gap-3 border-t px-3 text-[10px] ${isDark ? "border-[#292929] text-[#777]" : "border-slate-200 text-slate-400"}`}>
            <span className="flex items-center gap-1"><kbd className={`rounded border px-1 py-0.5 ${isDark ? "border-[#383838]" : "border-slate-200"}`}>↑</kbd><kbd className={`rounded border px-1 py-0.5 ${isDark ? "border-[#383838]" : "border-slate-200"}`}>↓</kbd>Navigate</span>
            <span className="flex items-center gap-1"><kbd className={`rounded border px-1 py-0.5 ${isDark ? "border-[#383838]" : "border-slate-200"}`}>↵</kbd>Open</span>
            <span className="ml-auto flex items-center gap-1"><Command size={11} />K</span>
          </div>
        </div>

        {selectedProject && <SearchPreviewPanel project={selectedProject} isDark={isDark} onOpen={() => selectedProject && handleSelect({
          id: `project-${selectedProject.id}`, title: selectedProject.name, category: "Recent projects",
          type: "action", icon: FolderKanban, path: `/builder/${selectedProject.id}`, project: selectedProject,
        })} />}

        <button type="button" onClick={onClose} aria-label="Close search"
          className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg md:hidden ${isDark ? "text-[#777] hover:bg-[#222]" : "text-slate-400 hover:bg-slate-100"}`}><X size={15} /></button>
      </section>
    </div>
  );
};
export default GlobalSearch;

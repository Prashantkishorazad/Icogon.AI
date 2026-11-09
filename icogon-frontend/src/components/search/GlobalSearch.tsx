import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { searchNavigation, type SearchNavigationItem } from "../../data/searchNavigation";
import { settingsNavigation } from "../../data/settingsNavigation";
import { connectorData } from "../../data/connectorData";
import { getProjectsApi, type ProjectResponse } from "../../api/projectApi";
import SearchInput from "./SearchInput";
import SearchResultList, { type SearchResult } from "./SearchResultList";
import SearchFooter from "./SearchFooter";
import SearchPreviewPanel from "./SearchPreviewPanel";

interface GlobalSearchProps { open: boolean; onClose: () => void; }
type SearchItem = SearchResult;

// Only destinations that are actually registered in the current App.tsx.
const REGISTERED_PATHS = new Set(["/dashboard", "/projects", "/connectors", "/ConnectorsPage", "/profile", "/builder", "/resources"]);
const normalize = (value: unknown) => String(value ?? "").toLocaleLowerCase().trim();

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
 const navigate=useNavigate();
 const { theme, setTheme, resolvedTheme }=useTheme();
 const isDark=resolvedTheme==="dark";
 const inputRef=useRef<HTMLInputElement>(null);
 const [query,setQuery]=useState("");
 const [selectedIndex,setSelectedIndex]=useState(0);
 const [projects,setProjects]=useState<ProjectResponse[]>([]);
 const [projectsLoading,setProjectsLoading]=useState(false);
 const [projectsError,setProjectsError]=useState<string|null>(null);

 useEffect(()=>{ if(!open)return; let active=true; setProjectsLoading(true); setProjectsError(null);
  getProjectsApi().then(data=>{if(active)setProjects(Array.isArray(data)?data:[]);}).catch(error=>{console.error("Global search: unable to load projects",error);if(active)setProjectsError("Unable to load projects. Other search results are still available.");}).finally(()=>{if(active)setProjectsLoading(false);});
  return ()=>{active=false;};
 },[open]);

 useEffect(()=>{if(!open)return;setQuery("");setSelectedIndex(0);const timer=window.setTimeout(()=>inputRef.current?.focus(),50);return()=>window.clearTimeout(timer);},[open]);

 const allItems=useMemo<SearchItem[]>(()=>{
  const projectItems:SearchItem[]=projects.map(project=>({id:`project-${project.id}`,title:project.name,category:"Recent projects",type:"action",icon:(searchNavigation.find(item=>item.id==="projects")?.icon || searchNavigation[0].icon),path:`/builder/${project.id}`,keywords:[project.name,project.description||"",project.prompt||"","project","recent"],description:project.description||project.prompt||"Open this project in the builder",project}));
  const seen=new Set<string>();
  const staticItems:SearchNavigationItem[]=[];
  [...searchNavigation,...settingsNavigation,...connectorData].forEach(item=>{
   if(seen.has(item.id))return; seen.add(item.id);
   if(item.type==="theme" || (item.path && REGISTERED_PATHS.has(item.path))) staticItems.push(item);
  });
  return [...projectItems,...staticItems];
 },[projects]);

 const filteredItems=useMemo(()=>{const term=normalize(query);if(!term)return allItems;return allItems.filter(item=>normalize([item.title,item.category,item.description,...(item.keywords||[])].join(" ")).includes(term));},[allItems,query]);
 const recentItems=useMemo(()=>allItems.filter(item=>item.project).slice(0,8),[allItems]);
 useEffect(()=>{setSelectedIndex(index=>Math.min(index,Math.max(filteredItems.length-1,0)));},[filteredItems.length]);

 const selectItem=(item:SearchItem)=>{if(item.type==="theme"){const next=item.id==="theme-light"?"light":item.id==="theme-dark"?"dark":"system";setTheme(next);onClose();return;}if(item.path){onClose();navigate(item.path);}};
 useEffect(()=>{if(!open)return;const handleKeyDown=(event:KeyboardEvent)=>{const command=(event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k";if(command){event.preventDefault();onClose();return;}if(event.key==="Escape"){event.preventDefault();onClose();}else if(event.key==="ArrowDown"){event.preventDefault();setSelectedIndex(index=>Math.min(index+1,Math.max(filteredItems.length-1,0)));}else if(event.key==="ArrowUp"){event.preventDefault();setSelectedIndex(index=>Math.max(index-1,0));}else if(event.key==="Enter"){const item=filteredItems[selectedIndex];if(item){event.preventDefault();selectItem(item);}}};document.addEventListener("keydown",handleKeyDown);return()=>document.removeEventListener("keydown",handleKeyDown);},[open,onClose,filteredItems,selectedIndex]);

 if(!open)return null;
 const selected=filteredItems[selectedIndex];
 return <div className={`fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto px-3 pb-6 pt-[8vh] backdrop-blur-[3px] sm:px-5 ${isDark?"bg-black/55":"bg-slate-900/15"}`} onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
  <section role="dialog" aria-modal="true" aria-label="Global search" className={`relative flex w-full max-w-[1060px] overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.20)] ${isDark?"border-[#292929] bg-[#111111] text-white":"border-slate-200 bg-white text-slate-900"}`}>
   <div className="flex min-w-0 flex-1 flex-col"><SearchInput value={query} onChange={value=>{setQuery(value);setSelectedIndex(0);}} onClose={onClose} inputRef={inputRef} isDark={isDark}/><div className={`max-h-[min(560px,calc(100vh-190px))] min-h-[240px] flex-1 overflow-y-auto ${isDark?"scrollbar-thin":""}`}><SearchResultList items={filteredItems} recentItems={recentItems} query={query} selectedIndex={selectedIndex} isDark={isDark} activeTheme={theme} loading={projectsLoading} error={projectsError} onSelect={selectItem} onHover={setSelectedIndex} onCreateProject={()=>{onClose();navigate("/builder");}}/></div><SearchFooter isDark={isDark}/></div>
   <SearchPreviewPanel item={selected} isDark={isDark} theme={theme} onOpen={()=>selected&&selectItem(selected)}/>
  </section>
 </div>;
};
export default GlobalSearch;

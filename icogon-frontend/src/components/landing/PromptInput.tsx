import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  FolderKanban,
  Loader2,
  Link2,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Search,
  ArrowUp,
  AppWindow,
  LayoutDashboard,
  PanelsTopLeft,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
type MenuView = "main" | "context" | "skills" | "projects" | "connectors" | "databases";
type BuildMode = "Build" | "Chat" | "Plan";
type ContextType = "skill" | "project" | "connector" | "database";
interface ContextSelection {
  type: ContextType;
  label: string;
}
interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}
interface UploadResponse {
  message?: string;
  file_name: string;
  url: string;
}
interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 5;
const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
]);
const ACCEPTED_EXTENSIONS = new Set([
  "pdf", "docx", "png", "jpg", "jpeg", "webp", "mp3", "wav", "m4a",
]);
const skills = [
  "Goal",
  "Accessibility",
  "Redesign",
  "SEO Review",
  "Video Creator",
  "Skill Creator",
  "Database Optimization",
];
const connectors = [
  "Gmail",
  "Slack",
  "Google Drive",
  "Google Maps",
  "Google Sheets",
  "Google Calendar",
  "Resend",
];
const projects = [
  "Recent Project",
  "AI SaaS Dashboard",
  "E-commerce Website",
  "Portfolio Website",
];
const databases = ["Supabase", "PostgreSQL", "MongoDB"];
const suggestionPrompts = [
  { label: "Create an app", prompt: "Build a modern web application", icon: AppWindow },
  { label: "Create dashboard", prompt: "Create a responsive analytics dashboard", icon: LayoutDashboard },
  { label: "Create portfolio", prompt: "Design a premium personal portfolio", icon: PanelsTopLeft },
];
interface PromptInputProps {
  initialPrompt?: string;
  initialMode?: BuildMode;
  automationIntent?: boolean;
  onAutomationSubmit?: (prompt: string) => void;
}

const PromptInput = ({
  initialPrompt = "",
  initialMode = "Build",
  automationIntent = false,
  onAutomationSubmit,
}: PromptInputProps) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && (document.documentElement.classList.contains("dark") || document.documentElement.getAttribute("data-theme") === "dark"),
  );
  const [prompt, setPrompt] = useState(initialPrompt);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>("main");
  const [buildMode, setBuildMode] = useState<BuildMode>(initialMode);
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContexts, setSelectedContexts] = useState<ContextSelection[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const voiceBaseRef = useRef("");
  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDark(root.classList.contains("dark") || root.getAttribute("data-theme") === "dark");
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    updateTheme();
    return () => observer.disconnect();
  }, []);
  const theme = isDark
    ? {
        shell: "border-[#101010] bg-[#252525] shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
        input: "text-[#f5f5f5] placeholder:text-[#929292]",
        muted: "text-[#999]",
        iconButton: "text-[#aaa] hover:bg-white/10 hover:text-white",
        menu: "border-[#303030] bg-[#1b1b1b] text-white shadow-[0_18px_55px_rgba(0,0,0,0.5)]",
        menuItem: "text-[#d6d6d6] hover:bg-white/[0.07] hover:text-white",
        menuMuted: "text-[#777]",
        divider: "border-[#303030]",
        chip: "border-[#383838] bg-[#222] text-[#ddd]",
        field: "border-[#363636] bg-[#111] text-white placeholder:text-[#929292]",
        suggestion: "border-white/15 bg-black/35 text-[#e4e4e4] hover:bg-black/50",
        send: "bg-white text-black hover:bg-[#e8e8e8]",
        selected: "text-cyan-300",
      }
    : {
        shell: "border-[#e5e7eb] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]",
        input: "text-slate-900 placeholder:text-slate-400",
        muted: "text-slate-500",
        iconButton: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
        menu: "border-slate-200 bg-white text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.15)]",
        menuItem: "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        menuMuted: "text-slate-400",
        divider: "border-slate-200",
        chip: "border-slate-200 bg-slate-50 text-slate-700",
        field: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
        suggestion: "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
        send: "bg-slate-900 text-white hover:bg-slate-700",
        selected: "text-cyan-600",
      };
  const addContext = (type: ContextType, label: string) => {
    setSelectedContexts((current) => {
      if (current.some((item) => item.type === type && item.label === label)) return current;
      return [...current, { type, label }];
    });
    setMenuOpen(false);
    setMenuView("main");
    setSearch("");
  };
  const removeContext = (context: ContextSelection) => {
    setSelectedContexts((current) => current.filter(
      (item) => !(item.type === context.type && item.label === context.label),
    ));
  };
  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!incoming.length) return;
    const nextFiles = [...selectedFiles];
    const problems: string[] = [];
    for (const file of incoming) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ACCEPTED_MIME_TYPES.has(file.type) && !ACCEPTED_EXTENSIONS.has(extension)) {
        problems.push(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        problems.push(`${file.name}: maximum file size is 20 MB`);
        continue;
      }
      if (nextFiles.some((item) => item.name === file.name && item.size === file.size)) continue;
      if (nextFiles.length >= MAX_FILES) {
        problems.push(`You can attach up to ${MAX_FILES} files`);
        break;
      }
      nextFiles.push(file);
    }
    setSelectedFiles(nextFiles);
    setError(problems.join(" · "));
    setMenuOpen(false);
  };
  const uploadAttachment = async (file: File): Promise<UploadedFile> => {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const token = data.session?.access_token;
    if (!token) throw new Error("Your session has expired. Please sign in again.");
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post<UploadResponse>(`${API_URL}/upload/`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data?.url) throw new Error(`The server did not return a URL for ${file.name}.`);
    return {
      name: file.name,
      url: response.data.url,
      type: file.type,
      size: file.size,
    };
  };
  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isGenerating) return;
    setIsGenerating(true);
    setError("");
    try {
      const uploadedFiles: UploadedFile[] = [];
      for (const file of selectedFiles) {
        uploadedFiles.push(await uploadAttachment(file));
      }
      const contextLines = selectedContexts.map(
        (context) => `${context.type}: ${context.label}`,
      );
      if (uploadedFiles.length) {
        contextLines.push(
          "Reference files (uploaded to ICOGON storage):",
          ...uploadedFiles.map((file) => `- ${file.name}: ${file.url}`),
        );
      }
      const finalPrompt = contextLines.length
        ? `${cleanPrompt}\n\nAdditional context:\n${contextLines.join("\n")}`
        : cleanPrompt;
      if (automationIntent) {
        // Draft only: no backend scheduling endpoint is wired up yet.
        // Never redirect a scheduled-task request into the website builder.
        onAutomationSubmit?.(finalPrompt);
        setIsGenerating(false);
        return;
      }

      // Preserve the existing project-builder flow for ordinary prompts.
      navigate(`/builder?prompt=${encodeURIComponent(finalPrompt)}`, {
        state: {
          prompt: cleanPrompt,
          mode: buildMode,
          contexts: selectedContexts,
          attachments: uploadedFiles,
        },
      });
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Unable to prepare your prompt. Please try again.");
      setIsGenerating(false);
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void handleGenerate();
    }
  };
  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };
  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
      return;
    }
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    setError("");
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) =>
        event.results[index]?.[0]?.transcript ?? "",
      ).join(" ");
      const base = voiceBaseRef.current.trim();
      setPrompt(base ? `${base} ${transcript}`.trim() : transcript.trim());
    };
    recognition.onerror = () => {
      setError("Microphone access failed. Check your browser permissions and try again.");
      setIsListening(false);
      recognitionRef.current = null;
      voiceBaseRef.current = "";
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      voiceBaseRef.current = "";
    };
    voiceBaseRef.current = prompt;
    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
      setError("Voice input could not start. Please try again.");
    }
  };
  useEffect(() => () => recognitionRef.current?.stop(), []);
  useEffect(() => {
    const textarea = promptRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(180, Math.max(48, textarea.scrollHeight))}px`;
    textarea.style.overflowY = textarea.scrollHeight > 180 ? "auto" : "hidden";
  }, [prompt]);
  const openMenu = () => {
    setMenuOpen((open) => !open);
    setMenuView("main");
    setSearch("");
  };
  const closeMenu = () => {
    setMenuOpen(false);
    setMenuView("main");
    setSearch("");
  };
  const filteredItems = (items: string[]) => items.filter((item) =>
    item.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const MenuItem = ({
    icon,
    label,
    onClick,
    hasArrow = false,
  }: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    hasArrow?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${theme.menuItem}`}
    >
      <span className="flex items-center gap-3">
        <span className={theme.muted}>{icon}</span>
        {label}
      </span>
      {hasArrow && <ChevronRight size={15} className={theme.menuMuted} />}
    </button>
  );
  const renderListMenu = (title: string, type: ContextType, items: string[]) => (
    <div className="w-[min(320px,calc(100vw-40px))]">
      <div className={`flex items-center gap-2 border-b px-3 py-2.5 ${theme.divider}`}>
        <button type="button" onClick={() => { setMenuView("context"); setSearch(""); }} className={`grid h-8 w-8 place-items-center rounded-lg ${theme.menuItem}`} aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="p-2.5">
        <div className={`flex h-10 items-center gap-2 rounded-xl border px-3 ${theme.field}`}>
          <Search size={15} className={theme.menuMuted} />
          <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto px-2 pb-2">
        {filteredItems(items).length ? filteredItems(items).map((item) => {
          const active = selectedContexts.some((context) => context.type === type && context.label === item);
          return (
            <button key={item} type="button" onClick={() => addContext(type, item)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${theme.menuItem}`}>
              {item}
              {active && <Check size={15} className={theme.selected} />}
            </button>
          );
        }) : <p className={`px-3 py-7 text-center text-sm ${theme.menuMuted}`}>No results found</p>}
      </div>
    </div>
  );
  const renderMenu = () => {
    if (menuView === "skills") return renderListMenu("Skills", "skill", skills);
    if (menuView === "projects") return renderListMenu("Projects", "project", projects);
    if (menuView === "connectors") return renderListMenu("Connectors", "connector", connectors);
    if (menuView === "databases") return renderListMenu("Databases", "database", databases);
    return (
      <div className="w-[min(320px,calc(100vw-40px))] p-2">
        {menuView === "context" ? (
          <>
            <div className={`mb-2 flex items-center gap-2 border-b px-2 pb-3 ${theme.divider}`}>
              <button type="button" onClick={() => setMenuView("main")} className={`grid h-8 w-8 place-items-center rounded-lg ${theme.menuItem}`} aria-label="Back"><ArrowLeft size={16}/></button>
              <span className="text-sm font-semibold">Add context</span>
            </div>
            <MenuItem icon={<Wrench size={17}/>} label="Skills" hasArrow onClick={() => { setMenuView("skills"); setSearch(""); }}/>
            <MenuItem icon={<FolderKanban size={17}/>} label="Projects" hasArrow onClick={() => { setMenuView("projects"); setSearch(""); }}/>
            <MenuItem icon={<Link2 size={17}/>} label="Connectors" hasArrow onClick={() => { setMenuView("connectors"); setSearch(""); }}/>
          </>
        ) : (
          <>
            <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Add to your prompt</div>
            <div className={`mb-2 flex h-10 items-center gap-2 rounded-xl border px-3 ${theme.field}`}>
              <Search size={15} className={theme.menuMuted}/>
              <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search actions..." className="min-w-0 flex-1 bg-transparent text-sm outline-none"/>
            </div>
            {"Attach".toLowerCase().includes(search.toLowerCase()) && <MenuItem icon={<Paperclip size={17}/>} label="Attach files" onClick={() => { fileInputRef.current?.click(); closeMenu(); }}/>} 
            {"Add context".toLowerCase().includes(search.toLowerCase()) && <MenuItem icon={<Sparkles size={17}/>} label="Add context" hasArrow onClick={() => { setMenuView("context"); setSearch(""); }}/>} 
            {"Databases".toLowerCase().includes(search.toLowerCase()) && <MenuItem icon={<Database size={17}/>} label="Databases" hasArrow onClick={() => { setMenuView("databases"); setSearch(""); }}/>} 
          </>
        )}
      </div>
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-[760px]"
    >
      <div className={`relative rounded-[26px] border transition-colors ${theme.shell}`}>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a" className="hidden" onChange={handleFileSelection}/>
        {(selectedContexts.length > 0 || selectedFiles.length > 0) && (
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            {selectedContexts.map((context) => (
              <span key={`${context.type}-${context.label}`} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${theme.chip}`}>
                <span>{context.label}</span>
                <button type="button" aria-label={`Remove ${context.label}`} onClick={() => removeContext(context)} className="opacity-60 transition hover:opacity-100"><X size={12}/></button>
              </span>
            ))}
            {selectedFiles.map((file) => (
              <span key={`${file.name}-${file.size}`} className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${theme.chip}`}>
                <FileText size={12} className="shrink-0"/>
                <span className="max-w-[170px] truncate">{file.name}</span>
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setSelectedFiles((current) => current.filter((item) => item !== file))} className="opacity-60 transition hover:opacity-100"><X size={12}/></button>
              </span>
            ))}
          </div>
        )}
        <div className="px-5 pt-5 pb-1">
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label={automationIntent ? "Describe the task to schedule" : "Describe what you want to build"}
            placeholder={automationIntent ? "What would you like ICOGON to check, and how often?" : "Ask ICOGON to build a web app that..."}
            className={`block min-h-[48px] max-h-[180px] w-full resize-none bg-transparent text-[16px] leading-6 outline-none placeholder:font-medium ${theme.input}`}
          />
        </div>
        <div className="flex items-center justify-between gap-2 px-3 pb-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-1">
            <div className="relative">
              <button type="button" onClick={openMenu} aria-label={menuOpen ? "Close add menu" : "Add files or context"} aria-expanded={menuOpen} className={`grid h-8 w-8 place-items-center rounded-full transition ${theme.iconButton}`}>
                {menuOpen ? <X size={19}/> : <Plus size={20}/>}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, y: 7, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.98 }} transition={{ duration: 0.14 }} className={`absolute bottom-12 left-0 z-[100] overflow-hidden rounded-2xl border ${theme.menu}`}>
                    {renderMenu()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div className="relative">
              <button type="button" onClick={() => setBuildMenuOpen((open) => !open)} aria-expanded={buildMenuOpen} className={`flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium transition ${theme.iconButton}`}>
                {buildMode}<ChevronDown size={14}/>
              </button>
              <AnimatePresence>
                {buildMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className={`absolute bottom-11 right-0 z-50 w-36 rounded-xl border p-1 ${theme.menu}`}>
                    {(automationIntent ? (["Chat", "Plan"] as BuildMode[]) : (["Build", "Chat", "Plan"] as BuildMode[])).map((mode) => (
                      <button key={mode} type="button" onClick={() => { setBuildMode(mode); setBuildMenuOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${theme.menuItem}`}>
                        {mode}{buildMode === mode && <Check size={14} className={theme.selected}/>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button type="button" onClick={toggleVoiceInput} aria-label={isListening ? "Stop voice input" : "Start voice input"} title={isListening ? "Stop voice input" : "Voice input"} className={`grid h-8 w-8 place-items-center rounded-full transition ${isListening ? "bg-red-500/10 text-red-500" : theme.iconButton}`}>
              {isListening ? <MicOff size={17}/> : <Mic size={17}/>}
            </button>
            {(prompt.trim() || isGenerating) && <button type="button" onClick={() => void handleGenerate()} disabled={!prompt.trim() || isGenerating} aria-label={automationIntent ? "Prepare scheduling request" : "Start building"} className={`grid h-8 w-8 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${theme.send}`}>
              {isGenerating ? <Loader2 size={17} className="animate-spin"/> : <ArrowUp size={18}/>}
            </button>}
          </div>
        </div>
      </div>
      {error && (
        <div role="alert" className={`mt-3 flex items-start gap-2 px-2 text-xs ${isDark ? "text-red-300" : "text-red-600"}`}>
          <AlertCircle size={14} className="mt-0.5 shrink-0"/>
          <span>{error}</span>
        </div>
      )}
      {isListening && <p className={`mt-2 px-2 text-xs ${isDark ? "text-red-300" : "text-red-600"}`} aria-live="polite">Listening… speak naturally. Press the microphone again to stop.</p>}
      {selectedFiles.length > 0 && <p className={`mt-2 px-2 text-xs ${theme.muted}`}>{selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} ready to upload · max 20 MB each</p>}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {!automationIntent && suggestionPrompts.map(({ label, prompt: suggestion, icon: Icon }) => (
          <button key={label} type="button" onClick={() => { setPrompt(suggestion); promptRef.current?.focus(); }} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${theme.suggestion}`}>
            <Icon size={15} aria-hidden="true" />{label}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
export default PromptInput;

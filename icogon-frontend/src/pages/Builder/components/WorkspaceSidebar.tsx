import React, { useRef, useEffect, useId } from "react";
import {
  AlertCircle,
  ArrowDown,
  Check,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Loader2,
  PanelLeftClose,
  Send,
  Sparkles,
  Square,
  User,
  WandSparkles,
} from "lucide-react";
import type {
  ChatMessage,
  GeneratedFile,
  RunStage,
} from "../types";
import { PIPELINE_STAGES, stageLabel } from "../types";
import type { OrchestratorRunStep } from "../../../api/projectApi";

interface WorkspaceSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  messages: ChatMessage[];
  prompt: string;
  setPrompt: (value: string) => void;
  onSendPrompt: () => void;
  onCancelRun: () => void;
  isRunning: boolean;
  isCancelling: boolean;
  runStage: RunStage;
  runSteps: OrchestratorRunStep[];
  runError: string;
  generatedFiles: GeneratedFile[];
  onSelectFile: (path: string) => void;
  // Optional integration with the controller's persisted recovery checkpoint.
  // The controller remains responsible for blocking duplicate submissions.
  recoveryPending?: boolean;
}

const CHAT_BOTTOM_THRESHOLD = 72;

const formatMessageTime = (timestamp?: string): { label: string; title: string } | null => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return {
    label: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    title: date.toLocaleString(),
  };
};

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  messages,
  prompt,
  setPrompt,
  onSendPrompt,
  onCancelRun,
  isRunning,
  isCancelling,
  runStage,
  runSteps,
  runError,
  generatedFiles,
  onSelectFile,
  recoveryPending = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesFeedRef = useRef<HTMLDivElement | null>(null);
  const messagesContentRef = useRef<HTMLDivElement | null>(null);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const followLatestRef = useRef(true);
  const previousScrollTopRef = useRef(0);
  const [showJumpToLatest, setShowJumpToLatest] = React.useState(false);
  const [stepperExpanded, setStepperExpanded] = React.useState(true);
  const stepperId = useId();
  const feedId = useId();

  const trackingPaused = !isRunning && (recoveryPending || (
    runStage !== "idle" && runStage !== "completed" &&
    runStage !== "failed" && runStage !== "cancelled"
  ));
  const composerLocked = isRunning || isCancelling || trackingPaused;
  const availablePaths = React.useMemo(
    () => new Set(generatedFiles.map((file) => file.path)),
    [generatedFiles],
  );

  // Scroll only the message feed, not the surrounding Builder layout.
  // Restoring a saved conversation should not force the user to watch a long animation.
  useEffect(() => {
    if (!sidebarOpen) return;
    const feed = messagesFeedRef.current;
    if (!feed) return;
    const moveToSavedPosition = () => {
      if (followLatestRef.current) feed.scrollTop = feed.scrollHeight;
      else feed.scrollTop = previousScrollTopRef.current;
    };
    moveToSavedPosition();
    // Reflow (e.g. responsive width or expanding the stepper) must also keep
    // users at the latest message when they have not scrolled into history.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (followLatestRef.current) feed.scrollTop = feed.scrollHeight;
    });
    observer.observe(feed);
    if (messagesContentRef.current) observer.observe(messagesContentRef.current);
    return () => observer.disconnect();
  }, [sidebarOpen]);

  useEffect(() => {
    const feed = messagesFeedRef.current;
    if (sidebarOpen && feed && followLatestRef.current) {
      feed.scrollTop = feed.scrollHeight;
    }
  }, [sidebarOpen, messages, runSteps, isRunning, runError, runStage]);

  const handleChatScroll = () => {
    const feed = messagesFeedRef.current;
    if (!feed) return;
    previousScrollTopRef.current = feed.scrollTop;
    const nearBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight <= CHAT_BOTTOM_THRESHOLD;
    followLatestRef.current = nearBottom;
    setShowJumpToLatest(!nearBottom);
  };

  const jumpToLatest = () => {
    followLatestRef.current = true;
    const feed = messagesFeedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
    setShowJumpToLatest(false);
  };

  const handleSend = () => {
    if (composerLocked || !prompt.trim()) return;
    jumpToLatest();
    onSendPrompt();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      if (!e.repeat) handleSend();
    }
  };

  const quickPrompts = [
    "Add responsive mobile navigation",
    "Improve color palette & dark mode",
    "Add interactive dashboard cards",
  ];

  if (!sidebarOpen) return null;

  const currentStageIndex = PIPELINE_STAGES.indexOf(runStage);

  return (
    <aside className="absolute inset-y-0 left-0 z-30 flex w-[min(88vw,380px)] shrink-0 flex-col border-r border-[#1f222e] bg-[#0e1017] text-slate-200 shadow-2xl select-none transition-all duration-200 lg:relative lg:z-auto lg:w-[380px] lg:shadow-none">
      {/* SIDEBAR HEADER */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1f222e] px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ICOGON" className="h-5 w-5 object-contain" />
          <span className="text-xs font-semibold tracking-wide text-white">ICOGON Assistant</span>
          <span className="rounded bg-[#1a1d2a] px-1.5 py-0.5 text-[9px] font-mono text-indigo-300 border border-[#262a3d]">
            Engine 2.0
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          title="Collapse Sidebar"
          aria-label="Collapse assistant sidebar"
          className="rounded p-1 text-slate-400 hover:bg-[#1a1d2a] hover:text-white transition"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      {/* PIPELINE LIVE STEPPER (if running or has active steps) */}
      {(isRunning || runSteps.length > 0 || runStage !== "idle") && (
        <div className="border-b border-[#1f222e] bg-[#12141e] p-3 text-xs">
          <button
            type="button"
            onClick={() => setStepperExpanded((prev) => !prev)}
            aria-expanded={stepperExpanded}
            aria-controls={stepperExpanded ? stepperId : undefined}
            className="flex w-full items-center justify-between text-[11px] font-medium text-slate-300 hover:text-white"
          >
            <div className="flex items-center gap-2">
              {isRunning ? (
                <Loader2 size={12} className="animate-spin text-indigo-400" />
              ) : runStage === "completed" ? (
                <Check size={12} className="text-emerald-400" />
              ) : runStage === "failed" ? (
                <AlertCircle size={12} className="text-rose-400" />
              ) : runStage === "cancelled" ? (
                <Square size={11} className="text-slate-400" />
              ) : (
                <Sparkles size={12} className="text-indigo-400" />
              )}
              <span>{trackingPaused ? "Generation tracking paused" : stageLabel(runStage)}</span>
            </div>
            {stepperExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {stepperExpanded && (
            <div id={stepperId} className="mt-2.5 space-y-1 pt-2 border-t border-[#1d202e]">
              {PIPELINE_STAGES.slice(0, 8).map((stage, idx) => {
                const isPast = currentStageIndex > idx || runStage === "completed";
                const isCurrent = runStage === stage;
                return (
                  <div key={stage} className="flex items-center gap-2 text-[10px]">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-mono ${
                        isPast
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : isCurrent
                          ? `bg-indigo-500/30 text-indigo-300 border border-indigo-400 ${isRunning ? "animate-pulse" : ""}`
                          : "bg-[#181a25] text-slate-400 border border-[#232738]"
                      }`}
                    >
                      {isPast ? <Check size={8} /> : isCurrent && isRunning ? <Loader2 size={8} className="animate-spin" /> : idx + 1}
                    </div>
                    <span
                      className={`capitalize ${
                        isCurrent ? "font-semibold text-indigo-300" : isPast ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CHAT MESSAGES FEED */}
      <div className="relative flex-1 min-h-0">
        <div
          id={feedId}
          ref={messagesFeedRef}
          onScroll={handleChatScroll}
          role="region"
          aria-label="Workspace conversation"
          tabIndex={0}
          className="h-full overflow-y-auto overscroll-contain p-4 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-indigo-500/50"
        >
          <div ref={messagesContentRef} className="space-y-4">
            {messages.map((msg) => {
              const timestamp = formatMessageTime(msg.timestamp);
              // A restored chat must describe its own generation, not today's file list.
              const modifiedPaths = [...new Set((msg.filesModified ?? []).filter(path => path.trim()))];
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    {msg.role === "user" ? (
                      <>
                        <span>You</span>
                        <User size={11} className="text-slate-400" />
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} className="text-indigo-400" />
                        <span className="font-medium text-indigo-300">{msg.role === "system" ? "System" : "ICOGON AI"}</span>
                      </>
                    )}
                    {timestamp && <time dateTime={msg.timestamp} title={timestamp.title} className="text-slate-400">{timestamp.label}</time>}
                  </div>

                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[92%] select-text ${
                      msg.role === "user"
                        ? "bg-[#1e2233] text-slate-100 border border-[#2b3147] shadow-sm"
                        : "bg-[#141622] text-slate-200 border border-[#212435]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.content}</p>
                    {msg.planSummary && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-[11px] text-slate-400">{msg.planSummary}</p>
                    )}

                    {/* Generated Files Pills if message contains files */}
                    {msg.role === "ai" && modifiedPaths.length > 0 && (
                      <div className="mt-3 border-t border-[#232738] pt-2">
                        <p className="text-[10px] font-medium text-slate-400 mb-1.5">Modified Files:</p>
                        <div className="flex flex-wrap gap-1">
                          {modifiedPaths.map((path) => (
                            <button
                              type="button"
                              key={path}
                              onClick={() => onSelectFile(path)}
                              disabled={!availablePaths.has(path)}
                              title={availablePaths.has(path) ? `Open current version of ${path}` : `${path} is no longer in the current build`}
                              className="flex min-w-0 max-w-full items-center gap-1 rounded bg-[#1a1d2b] px-2 py-0.5 text-[10px] text-indigo-300 border border-[#2a2f44] enabled:hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              <FileCode2 size={10} />
                              <span className="min-w-0 break-all font-mono">{path}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isRunning && (
              <div role="status" className="flex items-center gap-2 rounded-xl bg-[#141622] border border-[#212435] p-3 text-xs text-slate-400">
                <Loader2 size={13} className="animate-spin text-indigo-400 shrink-0" />
                <span className="text-[11px]">ICOGON AI is working on your application...</span>
              </div>
            )}

            {trackingPaused && (
              <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-900/50 bg-amber-950/20 p-3 text-xs text-amber-200">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>Generation tracking is paused. Use the workspace recovery controls before sending another instruction.</span>
              </div>
            )}

            {runError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-950/30 border border-rose-900/50 p-3 text-xs text-rose-300">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                <span className="text-[11px] leading-relaxed">{runError}</span>
              </div>
            )}

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        </div>
        {showJumpToLatest && (
          <button
            type="button"
            onClick={jumpToLatest}
            aria-controls={feedId}
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#333a50] bg-[#1a1d2b] px-3 py-1.5 text-[11px] text-slate-200 shadow-lg hover:border-indigo-400"
          >
            <ArrowDown size={12} /> Jump to latest
          </button>
        )}
      </div>

      {/* QUICK SUGGESTIONS */}
      {!composerLocked && (
        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              type="button"
              onClick={() => {
                setPrompt(qp);
                promptRef.current?.focus();
              }}
              className="shrink-0 rounded-full border border-[#222636] bg-[#12141c] px-2.5 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:border-[#333a50] transition"
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* PROMPT COMPOSER (Lovable Style) */}
      <div className="border-t border-[#1f222e] bg-[#0c0d12] p-3">
        <div className="rounded-xl border border-[#232738] bg-[#13151f] p-2.5 shadow-lg focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition">
          <textarea
            ref={promptRef}
            aria-label="Instruction for ICOGON AI"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning ? "AI is generating changes..." : trackingPaused ? "Resume generation tracking first..." : "Ask ICOGON AI to make changes or build features..."}
            rows={3}
            disabled={composerLocked}
            className="w-full resize-none bg-transparent text-xs text-slate-100 placeholder:text-slate-400 outline-none leading-relaxed"
          />

          <div className="mt-2 flex items-center justify-between border-t border-[#1d202d] pt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <WandSparkles size={11} className="text-indigo-400" />
              <span>Fullstack App</span>
            </div>

            {isRunning ? (
              <button
                type="button"
                onClick={onCancelRun}
                disabled={isCancelling}
                title="Stop generation"
                aria-label={isCancelling ? "Cancelling generation" : "Stop generation"}
                className="flex h-7 items-center gap-1 rounded-lg bg-rose-600 px-2.5 text-[11px] font-medium text-white hover:bg-rose-700 transition"
              >
                {isCancelling ? <Loader2 size={11} className="animate-spin" /> : <Square size={10} fill="currentColor" />}
                <span>{isCancelling ? "Stopping…" : "Stop"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={composerLocked || !prompt.trim()}
                title="Send instruction"
                aria-label="Send instruction"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/30"
              >
                <Send size={12} />
              </button>
            )}
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-slate-400">
          {trackingPaused ? "Resolve the pending generation to continue" : "Enter to send · Shift + Enter for newline"}
        </p>
      </div>
    </aside>
  );
};

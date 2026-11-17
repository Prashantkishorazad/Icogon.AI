import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Loader2,
  PanelLeftClose,
  Send,
  Square,
  Sparkles,
  User,
  WandSparkles,
} from "lucide-react";
import type { ChatMessage, GeneratedFile, RunStage } from "../types";
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
}

const QUICK_PROMPTS = [
  "Make the layout responsive on mobile",
  "Improve the visual design and spacing",
  "Add a dashboard with interactive cards",
];

const stageState = (stage: RunStage, current: RunStage) => {
  if (current === "completed") return "complete";
  if (current === "failed" || current === "cancelled") return "pending";
  const currentIndex = PIPELINE_STAGES.indexOf(current);
  const stageIndex = PIPELINE_STAGES.indexOf(stage);
  if (stageIndex < currentIndex) return "complete";
  if (stageIndex === currentIndex) return "current";
  return "pending";
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
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [stepperExpanded, setStepperExpanded] = useState(true);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const scrollToLatest = useCallback(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const distanceFromBottom =
      feed.scrollHeight - feed.scrollTop - feed.clientHeight;
    // Do not pull the user away from older messages while they are reading.
    if (distanceFromBottom < 140) {
      messagesEndRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "end",
      });
    }
  }, []);

  useEffect(() => {
    scrollToLatest();
  }, [messages, runSteps, isRunning, runError, scrollToLatest]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [prompt]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (prompt.trim() && !isRunning) onSendPrompt();
    }
  };

  if (!sidebarOpen) return null;

  const hasRunActivity =
    isRunning || runSteps.length > 0 || runStage !== "idle";
  const visibleStages = PIPELINE_STAGES.filter(
    (stage) => stage !== "completed",
  );

  return (
    <aside className="icogon-chat-sidebar" aria-label="ICOGON AI chat">
      <style>{`
        .icogon-chat-sidebar {
          --chat-bg: var(--builder-panel, var(--card, #fff));
          --chat-surface: var(--builder-surface, var(--background, #f8fafc));
          --chat-border: var(--builder-border, var(--border, #e2e8f0));
          --chat-text: var(--builder-text, var(--foreground, #0f172a));
          --chat-muted: var(--builder-muted, #8992a5);
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          color: var(--chat-text);
          background: var(--chat-bg);
          user-select: text;
        }
        .icogon-chat-sidebar * { box-sizing: border-box; }
        .icogon-chat-header {
          display: flex;
          flex: 0 0 54px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-width: 0;
          padding: 0 14px;
          border-bottom: 1px solid var(--chat-border);
        }
        .icogon-chat-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
        .icogon-chat-logo {
          display: grid; place-items: center; flex: 0 0 30px;
          width: 30px; height: 30px; border: 1px solid var(--chat-border);
          border-radius: 9px; background: var(--chat-surface);
        }
        .icogon-chat-logo img { width: 23px; height: 23px; object-fit: contain; }
        .icogon-chat-heading { min-width: 0; }
        .icogon-chat-heading strong {
          display: block; overflow: hidden; color: var(--chat-text);
          font-size: 12px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap;
        }
        .icogon-chat-heading span { display: block; margin-top: 2px; color: var(--chat-muted); font-size: 10px; }
        .icogon-chat-sidebar button { font: inherit; }
        .icogon-chat-icon-button {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; flex: 0 0 30px; border: 1px solid transparent;
          border-radius: 8px; color: var(--chat-muted); background: transparent; cursor: pointer;
        }
        .icogon-chat-icon-button:hover { color: var(--chat-text); background: var(--chat-surface); border-color: var(--chat-border); }
        .icogon-chat-icon-button:focus-visible,
        .icogon-chat-sidebar button:focus-visible,
        .icogon-chat-sidebar textarea:focus-visible {
          outline: 2px solid #7188f5; outline-offset: 2px;
        }
        .icogon-chat-pipeline {
          flex: 0 0 auto; padding: 11px 14px 12px;
          border-bottom: 1px solid var(--chat-border);
          background: color-mix(in srgb, var(--chat-surface) 72%, transparent);
        }
        .icogon-chat-pipeline-toggle {
          display: flex; width: 100%; align-items: center; justify-content: space-between;
          gap: 8px; padding: 0; border: 0; color: var(--chat-text);
          background: transparent; text-align: left; cursor: pointer;
        }
        .icogon-chat-pipeline-title { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 11px; font-weight: 600; }
        .icogon-chat-pipeline-title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .icogon-chat-stage-list { display: grid; gap: 6px; margin-top: 11px; padding-top: 10px; border-top: 1px solid var(--chat-border); }
        .icogon-chat-stage { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--chat-muted); font-size: 10px; }
        .icogon-chat-stage-marker {
          display: grid; place-items: center; width: 17px; height: 17px; flex: 0 0 17px;
          border: 1px solid var(--chat-border); border-radius: 50%; background: var(--chat-bg);
          font-size: 9px; font-variant-numeric: tabular-nums;
        }
        .icogon-chat-stage.is-complete { color: #16a36a; }
        .icogon-chat-stage.is-complete .icogon-chat-stage-marker { border-color: color-mix(in srgb, #16a36a 40%, var(--chat-border)); background: color-mix(in srgb, #16a36a 10%, var(--chat-bg)); }
        .icogon-chat-stage.is-current { color: #7188e8; font-weight: 650; }
        .icogon-chat-stage.is-current .icogon-chat-stage-marker { border-color: #7188e8; color: #7188e8; }
        .icogon-chat-feed {
          display: flex; flex: 1 1 auto; flex-direction: column; gap: 18px;
          min-height: 0; overflow-y: auto; overscroll-behavior: contain;
          padding: 18px 15px 14px; scrollbar-gutter: stable;
        }
        .icogon-chat-message { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-width: 0; }
        .icogon-chat-message.is-user { align-items: flex-end; }
        .icogon-chat-message-meta { display: flex; align-items: center; gap: 6px; color: var(--chat-muted); font-size: 10px; }
        .icogon-chat-message.is-user .icogon-chat-message-meta { flex-direction: row-reverse; }
        .icogon-chat-message-bubble {
          max-width: 94%; padding: 11px 13px; border: 1px solid var(--chat-border);
          border-radius: 13px; color: var(--chat-text); background: var(--chat-surface);
          font-size: 12px; line-height: 1.65; overflow-wrap: anywhere;
        }
        .icogon-chat-message.is-user .icogon-chat-message-bubble {
          border-color: color-mix(in srgb, #657be8 28%, var(--chat-border));
          background: color-mix(in srgb, #657be8 9%, var(--chat-surface));
        }
        .icogon-chat-message-bubble p { margin: 0; white-space: pre-wrap; }
        .icogon-chat-file-list { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--chat-border); }
        .icogon-chat-file-list button {
          display: inline-flex; align-items: center; gap: 5px; max-width: 100%;
          padding: 4px 7px; border: 1px solid var(--chat-border); border-radius: 7px;
          color: #7188e8; background: var(--chat-bg); font-size: 10px; cursor: pointer;
        }
        .icogon-chat-file-list button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .icogon-chat-live, .icogon-chat-error {
          display: flex; align-items: flex-start; gap: 9px; padding: 11px 12px;
          border: 1px solid var(--chat-border); border-radius: 11px;
          color: var(--chat-muted); background: var(--chat-surface); font-size: 11px; line-height: 1.5;
        }
        .icogon-chat-error { color: #e06b7d; border-color: color-mix(in srgb, #e06b7d 35%, var(--chat-border)); }
        .icogon-chat-suggestions {
          display: flex; flex: 0 0 auto; gap: 6px; overflow-x: auto;
          padding: 0 13px 10px; scrollbar-width: none;
        }
        .icogon-chat-suggestions::-webkit-scrollbar { display: none; }
        .icogon-chat-suggestions button {
          flex: 0 0 auto; max-width: 220px; overflow: hidden; padding: 6px 10px;
          border: 1px solid var(--chat-border); border-radius: 999px;
          color: var(--chat-muted); background: var(--chat-bg); font-size: 10px;
          text-overflow: ellipsis; white-space: nowrap; cursor: pointer;
        }
        .icogon-chat-suggestions button:hover { color: var(--chat-text); border-color: #7188e8; }
        .icogon-chat-composer-wrap {
          flex: 0 0 auto; padding: 11px 12px 9px; border-top: 1px solid var(--chat-border);
          background: var(--chat-bg);
        }
        .icogon-chat-composer {
          padding: 10px 11px 9px; border: 1px solid var(--chat-border);
          border-radius: 14px; background: var(--chat-surface);
          transition: border-color 130ms ease, box-shadow 130ms ease;
        }
        .icogon-chat-composer:focus-within { border-color: #7188e8; box-shadow: 0 0 0 2px color-mix(in srgb, #7188e8 16%, transparent); }
        .icogon-chat-composer textarea {
          display: block; width: 100%; min-height: 58px; max-height: 180px; resize: none;
          padding: 1px 1px 8px; border: 0; outline: none; color: var(--chat-text);
          background: transparent; font: inherit; font-size: 12px; line-height: 1.55;
        }
        .icogon-chat-composer textarea::placeholder { color: var(--chat-muted); opacity: 1; }
        .icogon-chat-composer textarea:disabled { opacity: .6; cursor: not-allowed; }
        .icogon-chat-composer-footer {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          padding-top: 8px; border-top: 1px solid var(--chat-border);
        }
        .icogon-chat-mode { display: flex; align-items: center; gap: 6px; color: var(--chat-muted); font-size: 10px; }
        .icogon-chat-send, .icogon-chat-stop {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          min-width: 32px; height: 31px; padding: 0 10px; border: 0; border-radius: 9px;
          color: white; background: #586fe4; font-size: 11px; font-weight: 600; cursor: pointer;
        }
        .icogon-chat-send:disabled { opacity: .35; cursor: not-allowed; }
        .icogon-chat-stop { background: #dc3658; }
        .icogon-chat-stop:disabled { opacity: .6; cursor: wait; }
        .icogon-chat-hint { margin: 7px 0 0; color: var(--chat-muted); font-size: 9px; text-align: center; }
        @media (max-width: 600px) {
          .icogon-chat-feed { padding: 14px 12px; }
          .icogon-chat-message-bubble { max-width: 97%; }
          .icogon-chat-composer-wrap { padding: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .icogon-chat-composer { transition: none; }
        }
      `}</style>

      <div className="icogon-chat-header">
        <div className="icogon-chat-brand">
          <div className="icogon-chat-logo">
            <img src="/logo.png" alt="" />
          </div>
          <div className="icogon-chat-heading">
            <strong>ICOGON Assistant</strong>
            <span>AI workspace</span>
          </div>
        </div>
        <button
          type="button"
          className="icogon-chat-icon-button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Collapse AI chat"
          title="Collapse chat"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {hasRunActivity && (
        <section className="icogon-chat-pipeline" aria-label="Build progress">
          <button
            type="button"
            className="icogon-chat-pipeline-toggle"
            onClick={() => setStepperExpanded((expanded) => !expanded)}
            aria-expanded={stepperExpanded}
          >
            <span className="icogon-chat-pipeline-title">
              {isRunning ? (
                <Loader2 size={13} className="animate-spin" color="#7188e8" />
              ) : runStage === "completed" ? (
                <Check size={13} color="#16a36a" />
              ) : runStage === "failed" ? (
                <AlertCircle size={13} color="#e06b7d" />
              ) : (
                <Sparkles size={13} color="#7188e8" />
              )}
              <span>{stageLabel(runStage)}</span>
            </span>
            {stepperExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {stepperExpanded && (
            <div className="icogon-chat-stage-list">
              {visibleStages.map((stage, index) => {
                const state = stageState(stage, runStage);
                return (
                  <div className={`icogon-chat-stage is-${state}`} key={stage}>
                    <span className="icogon-chat-stage-marker">
                      {state === "complete" ? (
                        <Check size={10} />
                      ) : state === "current" ? (
                        <Loader2 size={10} className={isRunning ? "animate-spin" : ""} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span>{stageLabel(stage)}</span>
                  </div>
                );
              })}
              {runSteps.length > 0 && (
                <div style={{ marginTop: 3, color: "var(--chat-muted)", fontSize: 10 }}>
                  {runSteps.filter((step) => step.status === "completed").length} of{" "}
                  {runSteps.length} reported steps completed
                </div>
              )}
              {runStage === "completed" && (
                <div className="icogon-chat-stage is-complete">
                  <span className="icogon-chat-stage-marker"><Check size={10} /></span>
                  <span>Build completed</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <div
        ref={feedRef}
        className="icogon-chat-feed"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const showFiles =
            !isUser &&
            generatedFiles.length > 0 &&
            index === messages.length - 1;
          return (
            <article
              key={message.id}
              className={`icogon-chat-message ${isUser ? "is-user" : ""}`}
            >
              <div className="icogon-chat-message-meta">
                {isUser ? (
                  <>
                    <span>You</span>
                    <User size={11} />
                  </>
                ) : (
                  <>
                    <Sparkles size={11} color="#7188e8" />
                    <span>ICOGON AI</span>
                  </>
                )}
              </div>
              <div className="icogon-chat-message-bubble">
                <p>{message.content}</p>
                {showFiles && (
                  <div className="icogon-chat-file-list">
                    {generatedFiles.map((file) => (
                      <button
                        type="button"
                        key={file.path}
                        onClick={() => onSelectFile(file.path)}
                        title={`Open ${file.path} in Code`}
                      >
                        <FileCode2 size={11} />
                        <span>{file.path}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {isRunning && (
          <div className="icogon-chat-live">
            <Loader2 size={14} className="animate-spin" color="#7188e8" />
            <span>ICOGON is working on your application…</span>
          </div>
        )}

        {runError && (
          <div className="icogon-chat-error" role="alert">
            <AlertCircle size={14} />
            <span>{runError}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isRunning && (
        <div className="icogon-chat-suggestions" aria-label="Suggested prompts">
          {(showAllSuggestions
            ? [...QUICK_PROMPTS, "Create a polished landing page", "Improve accessibility"]
            : QUICK_PROMPTS
          ).map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => {
                setPrompt(suggestion);
                textareaRef.current?.focus();
              }}
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAllSuggestions((show) => !show)}
            aria-expanded={showAllSuggestions}
          >
            {showAllSuggestions ? "Less" : "More"}
          </button>
        </div>
      )}

      <div className="icogon-chat-composer-wrap">
        <div className="icogon-chat-composer">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRunning
                ? "ICOGON is building your changes…"
                : "Ask ICOGON to build or change something…"
            }
            rows={2}
            disabled={isRunning}
            aria-label="Message ICOGON AI"
          />
          <div className="icogon-chat-composer-footer">
            <div className="icogon-chat-mode">
              <WandSparkles size={12} color="#7188e8" />
              <span>Build mode</span>
            </div>
            {isRunning ? (
              <button
                type="button"
                className="icogon-chat-stop"
                onClick={onCancelRun}
                disabled={isCancelling}
                title="Stop current build"
              >
                {isCancelling ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Square size={10} fill="currentColor" />
                )}
                <span>{isCancelling ? "Stopping…" : "Stop"}</span>
              </button>
            ) : (
              <button
                type="button"
                className="icogon-chat-send"
                onClick={onSendPrompt}
                disabled={!prompt.trim()}
                title="Send message"
                aria-label="Send message"
              >
                <Send size={13} />
              </button>
            )}
          </div>
        </div>
        <p className="icogon-chat-hint">Enter to send · Shift + Enter for a new line</p>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export type WorkspaceLayoutControls = {
  navigationOpen: boolean;
  chatOpen: boolean;
  developerOpen: boolean;
  navigationWidth: number;
  chatWidth: number;
  developerHeight: number;
  toggleNavigation: () => void;
  toggleChat: () => void;
  toggleDeveloper: () => void;
  setNavigationOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setDeveloperOpen: (open: boolean) => void;
};

type ResizeTarget = "navigation" | "chat" | "developer";

export interface WorkspaceLayoutProps {
  topbar?: (controls: WorkspaceLayoutControls) => ReactNode;
  navigation?: ReactNode;
  chat?: ReactNode;
  main: ReactNode;
  developer?: ReactNode;
  statusbar?: ReactNode;
  defaultNavigationOpen?: boolean;
  defaultChatOpen?: boolean;
  defaultDeveloperOpen?: boolean;
  defaultNavigationWidth?: number;
  defaultChatWidth?: number;
  defaultDeveloperHeight?: number;
  minNavigationWidth?: number;
  maxNavigationWidth?: number;
  minChatWidth?: number;
  maxChatWidth?: number;
  minDeveloperHeight?: number;
  maxDeveloperHeight?: number;
  onLayoutChange?: (layout: {
    navigationOpen: boolean;
    chatOpen: boolean;
    developerOpen: boolean;
    navigationWidth: number;
    chatWidth: number;
    developerHeight: number;
  }) => void;
  className?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type ResizeSession = {
  target: ResizeTarget;
  pointerId: number;
  startX: number;
  startY: number;
  startSize: number;
  element: HTMLDivElement;
};

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  topbar,
  navigation,
  chat,
  main,
  developer,
  statusbar,
  defaultNavigationOpen = Boolean(navigation),
  defaultChatOpen = true,
  defaultDeveloperOpen = Boolean(developer),
  defaultNavigationWidth = 248,
  defaultChatWidth = 360,
  defaultDeveloperHeight = 224,
  minNavigationWidth = 200,
  maxNavigationWidth = 360,
  minChatWidth = 300,
  maxChatWidth = 520,
  minDeveloperHeight = 140,
  maxDeveloperHeight = 520,
  onLayoutChange,
  className = "",
}) => {
  const [navigationOpen, setNavigationOpenState] = useState(
    defaultNavigationOpen && Boolean(navigation),
  );
  const [chatOpen, setChatOpenState] = useState(defaultChatOpen && Boolean(chat));
  const [developerOpen, setDeveloperOpenState] = useState(
    defaultDeveloperOpen && Boolean(developer),
  );
  const [navigationWidth, setNavigationWidth] = useState(
    clamp(defaultNavigationWidth, minNavigationWidth, maxNavigationWidth),
  );
  const [chatWidth, setChatWidth] = useState(
    clamp(defaultChatWidth, minChatWidth, maxChatWidth),
  );
  const [developerHeight, setDeveloperHeight] = useState(
    clamp(defaultDeveloperHeight, minDeveloperHeight, maxDeveloperHeight),
  );
  const [compactViewport, setCompactViewport] = useState(false);
  const resizeRef = useRef<ResizeSession | null>(null);

  const isNavigationOpen = navigationOpen && Boolean(navigation);
  const isChatOpen = chatOpen && Boolean(chat);
  const isDeveloperOpen = developerOpen && Boolean(developer);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setCompactViewport(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !compactViewport) return;
      setNavigationOpenState(false);
      setChatOpenState(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [compactViewport]);

  const layout = useMemo(
    () => ({
      navigationOpen: isNavigationOpen,
      chatOpen: isChatOpen,
      developerOpen: isDeveloperOpen,
      navigationWidth,
      chatWidth,
      developerHeight,
    }),
    [
      isNavigationOpen,
      isChatOpen,
      isDeveloperOpen,
      navigationWidth,
      chatWidth,
      developerHeight,
    ],
  );

  useEffect(() => {
    onLayoutChange?.(layout);
  }, [layout, onLayoutChange]);

  const setNavigationOpen = useCallback(
    (open: boolean) => {
      const next = Boolean(open) && Boolean(navigation);
      setNavigationOpenState(next);
      if (next && compactViewport) setChatOpenState(false);
    },
    [navigation, compactViewport],
  );

  const setChatOpen = useCallback(
    (open: boolean) => {
      const next = Boolean(open) && Boolean(chat);
      setChatOpenState(next);
      if (next && compactViewport) setNavigationOpenState(false);
    },
    [chat, compactViewport],
  );

  const setDeveloperOpen = useCallback(
    (open: boolean) => setDeveloperOpenState(Boolean(open) && Boolean(developer)),
    [developer],
  );

  const toggleNavigation = useCallback(
    () => setNavigationOpen(!isNavigationOpen),
    [isNavigationOpen, setNavigationOpen],
  );
  const toggleChat = useCallback(
    () => setChatOpen(!isChatOpen),
    [isChatOpen, setChatOpen],
  );
  const toggleDeveloper = useCallback(
    () => setDeveloperOpen(!isDeveloperOpen),
    [isDeveloperOpen, setDeveloperOpen],
  );

  const controls = useMemo<WorkspaceLayoutControls>(
    () => ({
      ...layout,
      toggleNavigation,
      toggleChat,
      toggleDeveloper,
      setNavigationOpen,
      setChatOpen,
      setDeveloperOpen,
    }),
    [
      layout,
      toggleNavigation,
      toggleChat,
      toggleDeveloper,
      setNavigationOpen,
      setChatOpen,
      setDeveloperOpen,
    ],
  );

  const beginResize = (
    target: ResizeTarget,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0 || compactViewport) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startSize =
      target === "navigation"
        ? navigationWidth
        : target === "chat"
          ? chatWidth
          : developerHeight;

    resizeRef.current = {
      target,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startSize,
      element: event.currentTarget,
    };
  };

  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = resizeRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    if (session.target === "navigation") {
      setNavigationWidth(
        clamp(
          session.startSize + event.clientX - session.startX,
          minNavigationWidth,
          maxNavigationWidth,
        ),
      );
    } else if (session.target === "chat") {
      setChatWidth(
        clamp(
          session.startSize + event.clientX - session.startX,
          minChatWidth,
          maxChatWidth,
        ),
      );
    } else {
      setDeveloperHeight(
        clamp(
          session.startSize + session.startY - event.clientY,
          minDeveloperHeight,
          maxDeveloperHeight,
        ),
      );
    }
  };

  const endResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = resizeRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    try {
      if (session.element.hasPointerCapture(event.pointerId)) {
        session.element.releasePointerCapture(event.pointerId);
      }
    } catch {
      // The browser may already have released capture after pointer cancellation.
    }
  };

  const resizeHandle = (
    target: ResizeTarget,
    label: string,
    orientation: "vertical" | "horizontal",
    min: number,
    max: number,
  ) => {
    const vertical = orientation === "vertical";
    const current =
      target === "navigation"
        ? navigationWidth
        : target === "chat"
          ? chatWidth
          : developerHeight;

    return (
      <div
        role="separator"
        aria-label={label}
        aria-orientation={orientation}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={`${current} pixels`}
        tabIndex={0}
        className={`icogon-workspace-resize ${
          vertical ? "is-vertical" : "is-horizontal"
        }`}
        onPointerDown={(event) => beginResize(target, event)}
        onPointerMove={moveResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        onLostPointerCapture={(event) => {
          if (resizeRef.current?.pointerId === event.pointerId) {
            resizeRef.current = null;
          }
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 24 : 8;
          if (vertical && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
            event.preventDefault();
            const delta = event.key === "ArrowRight" ? step : -step;
            if (target === "navigation") {
              setNavigationWidth((value) =>
                clamp(value + delta, minNavigationWidth, maxNavigationWidth),
              );
            } else {
              setChatWidth((value) =>
                clamp(value + delta, minChatWidth, maxChatWidth),
              );
            }
          } else if (
            !vertical &&
            (event.key === "ArrowUp" || event.key === "ArrowDown")
          ) {
            event.preventDefault();
            const delta = event.key === "ArrowUp" ? step : -step;
            setDeveloperHeight((value) =>
              clamp(value + delta, minDeveloperHeight, maxDeveloperHeight),
            );
          }
        }}
      />
    );
  };

  const shellStyle = {
    "--icogon-nav-width": `${navigationWidth}px`,
    "--icogon-chat-width": `${chatWidth}px`,
    "--icogon-developer-height": `${developerHeight}px`,
  } as CSSProperties;

  const mobileOverlayOpen =
    compactViewport && (isNavigationOpen || isChatOpen);

  return (
    <div
      className={`icogon-workspace-layout ${className}`}
      style={shellStyle}
      data-navigation-open={isNavigationOpen}
      data-chat-open={isChatOpen}
      data-developer-open={isDeveloperOpen}
      data-compact={compactViewport}
    >
      <style>{`
        .icogon-workspace-layout {
          --workspace-bg: var(--builder-bg, var(--background, #f8fafc));
          --workspace-panel: var(--builder-panel, var(--card, #ffffff));
          --workspace-border: var(--builder-border, var(--border, #e2e8f0));
          --workspace-text: var(--builder-text, var(--foreground, #0f172a));
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          color: var(--workspace-text);
          background: var(--workspace-bg);
          isolation: isolate;
        }
        .icogon-workspace-layout,
        .icogon-workspace-layout * { box-sizing: border-box; }
        .icogon-workspace-topbar,
        .icogon-workspace-statusbar { flex: 0 0 auto; min-width: 0; }
        .icogon-workspace-body {
          position: relative;
          display: flex;
          flex: 1 1 auto;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
        }
        .icogon-workspace-panel {
          display: flex;
          flex: 0 0 auto;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          background: var(--workspace-panel);
        }
        .icogon-workspace-navigation { width: var(--icogon-nav-width); }
        .icogon-workspace-chat { width: var(--icogon-chat-width); }
        .icogon-workspace-panel-inner {
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
        }
        .icogon-workspace-main {
          display: flex;
          flex: 1 1 0%;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          background: var(--workspace-bg);
        }
        .icogon-workspace-resize {
          position: relative;
          z-index: 5;
          flex: 0 0 auto;
          touch-action: none;
          outline: none;
          user-select: none;
        }
        .icogon-workspace-resize.is-vertical {
          width: 8px;
          margin: 0 -4px;
          cursor: col-resize;
        }
        .icogon-workspace-resize.is-horizontal {
          height: 8px;
          margin: -4px 0;
          cursor: row-resize;
        }
        .icogon-workspace-resize::after {
          content: "";
          position: absolute;
          border-radius: 999px;
          background: transparent;
          transition: background 120ms ease, width 120ms ease, height 120ms ease;
        }
        .icogon-workspace-resize.is-vertical::after {
          width: 2px;
          top: 0;
          bottom: 0;
          left: 3px;
        }
        .icogon-workspace-resize.is-horizontal::after {
          height: 2px;
          left: 0;
          right: 0;
          top: 3px;
        }
        .icogon-workspace-resize:hover::after,
        .icogon-workspace-resize:focus-visible::after,
        .icogon-workspace-resize:active::after { background: #647de8; }
        .icogon-workspace-developer {
          display: flex;
          flex: 0 0 auto;
          flex-direction: column;
          width: 100%;
          height: var(--icogon-developer-height);
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          background: var(--workspace-panel);
          border-top: 1px solid var(--workspace-border);
        }
        .icogon-workspace-mobile-backdrop { display: none; }

        @media (max-width: 1100px) and (min-width: 901px) {
          .icogon-workspace-navigation { width: min(var(--icogon-nav-width), 22vw); }
          .icogon-workspace-chat { width: min(var(--icogon-chat-width), 30vw); }
        }
        @media (max-width: 900px) {
          .icogon-workspace-mobile-backdrop {
            display: block;
            position: absolute;
            z-index: 15;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
            padding: 0;
            background: rgba(2, 6, 23, .48);
            backdrop-filter: blur(2px);
          }
          .icogon-workspace-navigation,
          .icogon-workspace-chat {
            position: absolute;
            z-index: 20;
            top: 0;
            bottom: 0;
            max-width: calc(100% - 24px);
            box-shadow: 0 16px 44px rgba(0, 0, 0, .28);
          }
          .icogon-workspace-navigation { left: 0; }
          .icogon-workspace-chat { right: 0; }
          .icogon-workspace-main { width: 100%; }
          .icogon-workspace-resize { display: none; }
        }
        @media (max-width: 600px) {
          .icogon-workspace-navigation { width: min(var(--icogon-nav-width), 86vw); }
          .icogon-workspace-chat { width: min(var(--icogon-chat-width), 94vw); }
          .icogon-workspace-developer {
            height: min(var(--icogon-developer-height), 45vh);
            max-height: 45vh;
          }
          .icogon-workspace-statusbar { overflow-x: auto; }
        }
        @media (max-height: 620px) {
          .icogon-workspace-developer { max-height: 38vh; }
        }
        @media (prefers-reduced-motion: reduce) {
          .icogon-workspace-resize::after { transition: none; }
        }
      `}</style>

      {topbar && (
        <div className="icogon-workspace-topbar">{topbar(controls)}</div>
      )}

      <div className="icogon-workspace-body">
        {mobileOverlayOpen && (
          <button
            type="button"
            className="icogon-workspace-mobile-backdrop"
            aria-label="Close open side panel"
            onClick={() => {
              setNavigationOpenState(false);
              setChatOpenState(false);
            }}
          />
        )}

        {navigation && isNavigationOpen && (
          <>
            <aside
              className="icogon-workspace-panel icogon-workspace-navigation"
              aria-label="Application navigation"
            >
              <div className="icogon-workspace-panel-inner">{navigation}</div>
            </aside>
            {!compactViewport &&
              resizeHandle(
                "navigation",
                "Resize application navigation",
                "vertical",
                minNavigationWidth,
                maxNavigationWidth,
              )}
          </>
        )}

        {chat && isChatOpen && (
          <>
            <aside
              className="icogon-workspace-panel icogon-workspace-chat"
              aria-label="AI conversation"
            >
              <div className="icogon-workspace-panel-inner">{chat}</div>
            </aside>
            {!compactViewport &&
              resizeHandle(
                "chat",
                "Resize AI conversation panel",
                "vertical",
                minChatWidth,
                maxChatWidth,
              )}
          </>
        )}

        <main className="icogon-workspace-main">{main}</main>
      </div>

      {developer && isDeveloperOpen && (
        <>
          {resizeHandle(
            "developer",
            "Resize developer workspace",
            "horizontal",
            minDeveloperHeight,
            maxDeveloperHeight,
          )}
          <section
            className="icogon-workspace-developer"
            aria-label="Developer workspace"
          >
            <div className="icogon-workspace-panel-inner">{developer}</div>
          </section>
        </>
      )}

      {statusbar && (
        <div className="icogon-workspace-statusbar">{statusbar}</div>
      )}
    </div>
  );
};

export default WorkspaceLayout;

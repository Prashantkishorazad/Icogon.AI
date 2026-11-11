
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Database,
  HardDrive,
  Network,
  Plus,
  Search,
  Settings,
  Server,
  ShieldCheck,
  Unplug,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  connectorCatalog,
  connectorCategories,
} from "../../data/connectors/connectorCatalog";

import GmailConnectionModal from "./GmailConnectionModal";
import { getGmailStatus } from "../../api/connectors/connectorsApi";
import GmailConnectorPanel from "./GmailConnectorPanel";
import ConnectorDetail from "./ConnectorDetail";

type Filter = "enabled" | "all" | string;

interface ConnectorModalProps {
  open: boolean;
  sidebarWidth: number;
}

const nativeConnectors = [
  {
    id: "icogon-database",
    name: "ICOGON Database",
    description: "Store and query your app's data",
    icon: Database,
    color: "#4F8DF7",
    background: "#EAF2FF",
  },
  {
    id: "icogon-auth",
    name: "ICOGON Auth",
    description: "Sign users in and manage accounts",
    icon: ShieldCheck,
    color: "#E83E8C",
    background: "#FCE8F1",
  },
  {
    id: "icogon-storage",
    name: "ICOGON Storage",
    description: "Upload and serve files",
    icon: HardDrive,
    color: "#D946EF",
    background: "#F9E8FF",
  },
  {
    id: "icogon-ai",
    name: "AI",
    description: "Use leading AI models in your ICOGON app",
    icon: Bot,
    color: "#A78BFA",
    background: "#F1F2F4",
  },
];

export default function ConnectorModal({
  open,
  sidebarWidth,
}: ConnectorModalProps) {
  const [params, setParams] = useSearchParams();

  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [customOpen, setCustomOpen] = useState(false);

  const [gmailConnectOpen, setGmailConnectOpen] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  // References for outside-click handling
  const panelRef = useRef<HTMLElement>(null);
  const customMenuRef = useRef<HTMLDivElement>(null);

  const selectedSlug = params.get("connector");

  const selected = connectorCatalog.find(
    (item) => item.slug === selectedSlug
  );

  const isDetail =
    params.get("subtab") === "connector-detail" &&
    Boolean(selected);

  // ---------------------------------------------------------
  // CLOSE CONNECTOR PANEL
  // ---------------------------------------------------------

  const close = () => {
    const next = new URLSearchParams(params);

    next.delete("connectors");
    next.delete("subtab");
    next.delete("connector");

    setParams(next);
    setCustomOpen(false);
    setGmailConnectOpen(false);
  };

  // ---------------------------------------------------------
  // CLOSE WHEN CLICKING OUTSIDE THE CONNECTOR PANEL
  // ---------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      // Click inside connector panel: keep it open.
      if (panelRef.current?.contains(target)) return;

      // Click inside Gmail OAuth dialog: keep workspace open.
      if (target.closest('[aria-modal="true"]')) return;

      // Any other click outside closes the connector panel.
      close();
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick,
      true
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick,
        true
      );
    };
  }, [open, params, setParams]);

  // ---------------------------------------------------------
  // CUSTOM DROPDOWN OUTSIDE CLICK
  // ---------------------------------------------------------

  useEffect(() => {
    if (!customOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        !customMenuRef.current?.contains(
          event.target as Node
        )
      ) {
        setCustomOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCustomOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [customOpen]);

  // ---------------------------------------------------------
  // LOAD GMAIL STATUS
  // ---------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getGmailStatus()
      .then((data) => {
        if (!cancelled) {
          setGmailConnected(Boolean(data.connected));
          setGmailEmail(data.email ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGmailConnected(false);
          setGmailEmail(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // ---------------------------------------------------------
  // FILTER CONNECTORS
  // ---------------------------------------------------------

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return connectorCatalog.filter((item) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "enabled"
            ? item.id === "gmail" && gmailConnected
            : item.category === filter;

      const matchesQuery =
        !normalized ||
        `${item.name} ${item.description} ${item.category} ${item.slug} ${item.keywords.join(" ")}`
          .toLowerCase()
          .includes(normalized);

      return matchesFilter && matchesQuery;
    });
  }, [filter, gmailConnected, query]);

  // ---------------------------------------------------------
  // CONNECTOR NAVIGATION
  // ---------------------------------------------------------

  const openDetail = (slug: string) => {
    const next = new URLSearchParams(params);

    next.set("connectors", "");
    next.set("subtab", "connector-detail");
    next.set("connector", slug);

    setParams(next);
    setCustomOpen(false);
  };

  const backToCatalog = () => {
    const next = new URLSearchParams(params);

    next.set("connectors", "");
    next.delete("subtab");
    next.delete("connector");

    setParams(next);
  };

  // ---------------------------------------------------------
  // CONDITIONAL DATA
  // ---------------------------------------------------------

  if (!open) return null;

  const shell = dark
    ? "border-white/10 bg-[#101216] text-white"
    : "border-[#dedfe3] bg-white text-[#17191d]";

  const muted = dark
    ? "text-zinc-400"
    : "text-[#686b72]";

  const subtle = dark
    ? "border-white/10"
    : "border-[#dedfe3]";

  const hover = dark
    ? "hover:bg-white/[0.06]"
    : "hover:bg-[#f3f4f6]";

  const selectedStatus =
    selected?.id === "gmail"
      ? gmailConnected
        ? "connected"
        : "not_connected"
      : "coming_soon";

  const selectedConnectionContent =
    selected?.id === "gmail" && gmailConnected ? (
      <GmailConnectorPanel
        email={gmailEmail || "Connected Gmail account"}
        onDisconnected={() => {
          setGmailConnected(false);
          setGmailEmail(null);
        }}
      />
    ) : undefined;

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <>
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close connectors overlay"
        onClick={close}
        className="
          fixed
          inset-y-0
          right-0
          z-[40]
          cursor-default
          bg-black/15
          backdrop-blur-[2px]
          max-md:left-0
        "
        style={{
          left: `${sidebarWidth}px`,
        }}
      />

      {/* CONNECTOR WORKSPACE */}

      <section
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Connectors"
        className={`
          fixed
          z-[60]
          flex
          min-w-0
          overflow-hidden
          rounded-[18px]
          border
          shadow-[0_24px_80px_rgba(15,23,42,0.22)]
          ${shell}
          max-md:!inset-2
          max-md:!rounded-xl
        `}
        style={{
          left: `calc(${sidebarWidth}px + 12px)`,
          right: "14px",
          top: "14px",
          bottom: "14px",
        }}
      >
        {/* LEFT SIDEBAR */}

        <aside
          className={`
            flex
            w-[260px]
            shrink-0
            flex-col
            border-r
            ${subtle}
            ${dark ? "bg-[#15181d]" : "bg-[#f5f5f6]"}
            max-xl:w-[230px]
            max-md:w-[190px]
            max-sm:w-[150px]
          `}
        >
          {/* SEARCH */}

          <div className="p-2.5">
            <label
              className={`
                flex
                h-9
                items-center
                gap-2
                rounded-lg
                border
                px-3
                ${subtle}
                ${dark ? "bg-[#101216]" : "bg-white"}
              `}
            >
              <Search size={16} className={muted} />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search"
                aria-label="Search connectors"
                className="
                  min-w-0
                  w-full
                  bg-transparent
                  text-sm
                  outline-none
                  placeholder:text-[#92959c]
                "
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={13} className={muted} />
                </button>
              )}
            </label>
          </div>

          {/* FILTERS */}

          <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            <button
              type="button"
              onClick={() => setFilter("enabled")}
              className={`
                mb-1
                flex
                w-full
                items-center
                justify-between
                rounded-lg
                px-3
                py-2
                text-[13px]
                ${
                  filter === "enabled"
                    ? dark
                      ? "bg-white/10"
                      : "bg-[#e7e7e9]"
                    : hover
                }
              `}
            >
              <span>Enabled</span>
              <span className={muted}>
                {gmailConnected ? 1 : 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`
                mb-5
                flex
                w-full
                items-center
                justify-between
                rounded-lg
                px-3
                py-2
                text-[13px]
                ${
                  filter === "all"
                    ? dark
                      ? "bg-white/10"
                      : "bg-[#e7e7e9]"
                    : hover
                }
              `}
            >
              <span>All</span>
              <span className={muted}>
                {connectorCatalog.length}
              </span>
            </button>

            <p className={`px-3 pb-2 text-xs font-medium ${muted}`}>
              Categories
            </p>

            {connectorCategories.map((category) => {
              const count = connectorCatalog.filter(
                (item) => item.category === category
              ).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFilter(category)}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    ${
                      filter === category
                        ? dark
                          ? "bg-white/10"
                          : "bg-[#e7e7e9]"
                        : hover
                    }
                  `}
                >
                  <span>{category}</span>
                  <span className={muted}>{count}</span>
                </button>
              );
            })}
          </nav>

          {/* ADMIN SETTINGS */}

          <div className={`border-t p-2.5 ${subtle}`}>
            <button
  type="button"
  onClick={() => navigate("/settings/connector-settings")}
  className="
    flex
    w-full
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    border-slate-200
    bg-white
    px-4
    py-3
    text-sm
    font-medium
    text-slate-700
    transition
    hover:bg-slate-50
  "
>
  <Settings size={16} />
  Admin settings
</button>
          </div>
        </aside>

        {/* RIGHT CONTENT */}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* HEADER */}

          <header
            className={`
              z-10
              flex
              h-[60px]
              shrink-0
              items-center
              justify-between
              border-b
              px-6
              ${subtle}
              ${dark ? "bg-[#101216]" : "bg-white"}
            `}
          >
            <div className="flex min-w-0 items-center gap-2 text-[14px]">
              <Network size={16} />

              <button
                type="button"
                onClick={isDetail ? backToCatalog : undefined}
                className={
                  isDetail
                    ? `rounded-md px-1 py-1 font-medium transition ${hover}`
                    : "font-medium"
                }
                aria-label={
                  isDetail
                    ? "Return to all connectors"
                    : undefined
                }
              >
                Connectors
              </button>

              {isDetail && selected && (
                <>
                  <ChevronRight
                    size={13}
                    className={muted}
                  />

                  <span className="truncate font-medium">
                    {selected.name}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* ADD CUSTOM */}

              {!isDetail && (
                <div
                  className="relative"
                  ref={customMenuRef}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCustomOpen((value) => !value)
                    }
                    className={`
                      flex
                      h-9
                      items-center
                      gap-2
                      rounded-lg
                      border
                      px-3
                      text-[13px]
                      ${subtle}
                      ${hover}
                    `}
                    aria-expanded={customOpen}
                  >
                    Add custom
                    <ChevronDown size={14} />
                  </button>

                  {customOpen && (
                    <div
                      className={`
                        absolute
                        right-0
                        top-[calc(100%+7px)]
                        z-30
                        w-[248px]
                        rounded-xl
                        border
                        p-1.5
                        shadow-xl
                        ${shell}
                      `}
                    >
                      {[
                        {
                          title: "Custom connector",
                          desc: "Connect an API to your workspace",
                          icon: Unplug,
                        },
                        {
                          title: "MCP server",
                          desc: "Connect an MCP server to your chat",
                          icon: Server,
                        },
                        {
                          title: "MCP registry",
                          desc: "Add a directory of MCP servers",
                          icon: Network,
                        },
                      ].map(
                        ({ title, desc, icon: Icon }) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => {
                              setCustomOpen(false);

                              window.alert(
                                `${title} configuration will be implemented in the next stage.`
                              );
                            }}
                            className={`
                              flex
                              w-full
                              items-start
                              gap-2.5
                              rounded-lg
                              px-2.5
                              py-2.5
                              text-left
                              ${hover}
                            `}
                          >
                            <Icon
                              size={17}
                              className="mt-0.5 shrink-0"
                            />

                            <span>
                              <span className="block text-sm font-medium">
                                {title}
                              </span>

                              <span
                                className={`mt-0.5 block text-xs ${muted}`}
                              >
                                {desc}
                              </span>
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CLOSE */}

              <button
                type="button"
                onClick={close}
                className={`rounded-md p-2 ${hover}`}
                aria-label="Close connectors"
              >
                <X size={19} />
              </button>
            </div>
          </header>

          {/* MAIN CONTENT */}

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
            {isDetail && selected ? (
              <ConnectorDetail
                connector={selected}
                status={selectedStatus}
                connectedAccount={
                  selected.id === "gmail"
                    ? gmailEmail
                    : null
                }
                onConnect={
                  selected.id === "gmail"
                    ? () => setGmailConnectOpen(true)
                    : undefined
                }
                connectionContent={selectedConnectionContent}
              />
            ) : (
              <>
                {/* NATIVE ICOGON CONNECTORS */}

                {filter === "all" && !query && (
                  <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {nativeConnectors.map(
                      ({
                        id,
                        name,
                        description,
                        icon: Icon,
                        color,
                        background,
                      }) => (
                        <div
                          key={id}
                          className={`
                            flex
                            min-h-[66px]
                            items-center
                            gap-2.5
                            rounded-[14px]
                            border
                            px-2.5
                            ${subtle}
                            ${dark ? "bg-[#14171b]" : "bg-white"}
                          `}
                        >
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-[10px]
                            "
                            style={{
                              background: dark
                                ? `${color}20`
                                : background,
                            }}
                          >
                            <Icon size={21} color={color} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold">
                              {name}
                            </p>

                            <p
                              className={`mt-0.5 truncate text-[12px] ${muted}`}
                            >
                              {description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* CONNECTOR LIST */}

                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold">
                    {filter === "all"
                      ? "All connectors"
                      : filter === "enabled"
                        ? "Enabled connectors"
                        : filter}
                  </h2>

                  <span className={`text-xs ${muted}`}>
                    {filtered.length} results
                  </span>
                </div>

                {filtered.length ? (
                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                    {filtered.map((item) => {
                      const Icon = item.icon;
                      const connected =
                        item.id === "gmail" && gmailConnected;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openDetail(item.slug)}
                          className={`
                            group
                            flex
                            min-h-[66px]
                            min-w-0
                            items-center
                            gap-2.5
                            rounded-[14px]
                            border
                            px-2.5
                            text-left
                            transition
                            duration-150
                            hover:-translate-y-px
                            hover:shadow-sm
                            ${subtle}
                            ${
                              dark
                                ? "bg-[#14171b] hover:bg-white/[0.035]"
                                : "bg-white hover:bg-[#fafafa]"
                            }
                          `}
                        >
                          <span
                            className={`
                              relative
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-[10px]
                              border
                              ${subtle}
                              ${dark ? "bg-white/[0.025]" : "bg-white"}
                            `}
                          >
                            <Icon
                              size={21}
                              color={item.brandColor}
                            />

                            {connected && (
                              <span
                                className="
                                  absolute
                                  -right-1
                                  -top-1
                                  h-3.5
                                  w-3.5
                                  rounded-full
                                  border-2
                                  border-white
                                  bg-[#45a43a]
                                "
                              />
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold">
                              {item.name}
                            </span>

                            <span
                              className={`mt-0.5 block truncate text-[12px] ${muted}`}
                            >
                              {item.description}
                            </span>
                          </span>

                          <ChevronRight
                            size={16}
                            className={`
                              ${muted}
                              shrink-0
                              opacity-0
                              transition
                              group-hover:translate-x-0.5
                              group-hover:opacity-100
                            `}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className={`
                      rounded-xl
                      border
                      border-dashed
                      p-12
                      text-center
                      ${subtle}
                    `}
                  >
                    <Search
                      size={25}
                      className={`mx-auto ${muted}`}
                    />

                    <p className="mt-3 font-medium">
                      No connectors found
                    </p>

                    <p className={`mt-1 text-sm ${muted}`}>
                      Try another search or category.
                    </p>
                  </div>
                )}

                {/* WORKSPACE SECURITY */}

                <section className="mt-10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-semibold">
                        Workspace security
                      </h3>

                      <p className={`mt-1 text-xs ${muted}`}>
                        Security tools an admin configures once
                        for the whole workspace.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2.5 xl:grid-cols-2">
                    {["Aikido", "Wiz"].map((name) => (
                      <div
                        key={name}
                        className={`
                          flex
                          min-h-[66px]
                          items-center
                          gap-3
                          rounded-[15px]
                          border
                          px-3
                          ${subtle}
                        `}
                      >
                        <span
                          className={`
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-lg
                            ${dark ? "bg-white/5" : "bg-slate-50"}
                          `}
                        >
                          <ShieldCheck size={21} />
                        </span>

                        <div>
                          <p className="text-sm font-medium">
                            {name}
                          </p>

                          <p className={`text-xs ${muted}`}>
                            Workspace security integration
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* MCP REGISTRIES */}

                <section className="mt-9">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-semibold">
                        MCP registries
                      </h3>

                      <p className={`mt-1 text-xs ${muted}`}>
                        Browse directories of MCP servers and
                        connect them to chat.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        window.alert(
                          "MCP registry setup will be implemented in the MCP stage."
                        )
                      }
                      className={`
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        px-3
                        py-2
                        text-xs
                        ${subtle}
                        ${hover}
                      `}
                    >
                      <Plus size={14} />
                      Add registry
                    </button>
                  </div>

                  <p className={`mt-4 text-sm ${muted}`}>
                    No registries yet. Add one to start browsing
                    servers.
                  </p>
                </section>
              </>
            )}
          </main>
        </div>
      </section>

      {/* GMAIL OAUTH DIALOG */}

      <GmailConnectionModal
        open={gmailConnectOpen}
        onClose={() => setGmailConnectOpen(false)}
      />
    </>
  );
}

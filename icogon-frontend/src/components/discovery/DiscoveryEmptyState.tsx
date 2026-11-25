
import type { FC } from "react";

import {
  FolderPlus,
  History,
  SearchX,
  LayoutTemplate,
  CloudOff,
  Plus,
  ArrowRight,
  RefreshCw,
  X,
  type LucideIcon,
} from "lucide-react";

import type {
  DiscoveryEmptyStateProps,
  DiscoveryEmptyStateType,
} from "./types";

/* =========================================================
   EXTENDED COMPONENT PROPS
========================================================= */

interface ExtendedDiscoveryEmptyStateProps
  extends DiscoveryEmptyStateProps {
  onBrowseProjects?: () => void;

  onResetFilters?: () => void;

  compact?: boolean;

  retrying?: boolean;

  className?: string;
}

/* =========================================================
   EMPTY STATE CONFIGURATION
========================================================= */

interface EmptyStateConfig {
  icon: LucideIcon;

  title: string;

  description: string;

  actionLabel: string;

  actionIcon: LucideIcon;
}

/* =========================================================
   STATE CONTENT
========================================================= */

const EMPTY_STATE_CONFIG: Record<
  DiscoveryEmptyStateType,
  EmptyStateConfig
> = {
  projects: {
    icon: FolderPlus,

    title: "Create your first project",

    description:
      "Turn your ideas into real applications. Start building something amazing with Icogon AI.",

    actionLabel: "Create project",

    actionIcon: Plus,
  },

  recent: {
    icon: History,

    title: "No recently viewed projects",

    description:
      "Projects you open will appear here, making it easier to pick up where you left off.",

    actionLabel: "Browse projects",

    actionIcon: ArrowRight,
  },

  search: {
    icon: SearchX,

    title: "No matching results",

    description:
      "Try a different search term or clear your search to explore more results.",

    actionLabel: "Clear search",

    actionIcon: X,
  },

  templates: {
    icon: LayoutTemplate,

    title: "No templates found",

    description:
      "Try another category or adjust your search to discover the right starting point.",

    actionLabel: "Show all templates",

    actionIcon: LayoutTemplate,
  },

  error: {
    icon: CloudOff,

    title: "Unable to load projects",

    description:
      "Something went wrong while loading your projects. Please try again.",

    actionLabel: "Try again",

    actionIcon: RefreshCw,
  },
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const DiscoveryEmptyState: FC<
  ExtendedDiscoveryEmptyStateProps
> = ({
  type,
  isDark,

  query = "",
  error,

  onCreateProject,
  onClearSearch,
  onRetry,

  onBrowseProjects,
  onResetFilters,

  compact = false,
  retrying = false,

  className = "",
}) => {
  /* =======================================================
     RESOLVE STATE CONFIGURATION
  ======================================================= */

  const config =
    EMPTY_STATE_CONFIG[type];

  const StateIcon = config.icon;

  const ActionIcon =
    config.actionIcon;

  const isError =
    type === "error";

  const isRetrying =
    isError && retrying;

  const hasQuery =
    query.trim().length > 0;

  /* =======================================================
     RESOLVE CONTEXTUAL ACTION

     Buttons are only rendered when their corresponding
     action is supplied by the parent component.
  ======================================================= */

  const getAction = ():
    | (() => void)
    | undefined => {
    switch (type) {
      case "projects":
        return onCreateProject;

      case "recent":
        return onBrowseProjects;

      case "search":
        return onClearSearch;

      case "templates":
        return (
          onResetFilters ||
          onClearSearch
        );

      case "error":
        return onRetry;

      default:
        return undefined;
    }
  };

  const action = getAction();

  /* =======================================================
     DYNAMIC DESCRIPTION
  ======================================================= */

  const description =
    type === "search" && hasQuery
      ? `We couldn't find anything matching "${query.trim()}". Try another search term.`
      : config.description;

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        title: "text-[#ededed]",

        description: "text-[#a3a3a3]",

        iconContainer: `
          border-white/[0.08]
          bg-white/[0.045]
          text-[#a3a3a3]
        `,

        errorContainer: `
          border-red-400/15
          bg-red-500/[0.06]
          text-red-300
        `,

        errorDetails: `
          border-white/[0.07]
          bg-white/[0.025]
          text-[#a3a3a3]
        `,

        primaryButton: `
          border-[#3978ff]/30
          bg-[#2455e6]
          text-white
          hover:bg-[#3464ed]
        `,

        secondaryButton: `
          border-white/10
          bg-[#303030]
          text-[#ededed]
          hover:bg-[#414141]
        `,
      }
    : {
        title: "text-slate-900",

        description: "text-slate-500",

        iconContainer: `
          border-slate-200
          bg-slate-100
          text-slate-500
        `,

        errorContainer: `
          border-red-200
          bg-red-50
          text-red-600
        `,

        errorDetails: `
          border-slate-200
          bg-slate-50
          text-slate-600
        `,

        primaryButton: `
          border-blue-600
          bg-[#2455e6]
          text-white
          hover:bg-blue-700
        `,

        secondaryButton: `
          border-slate-200
          bg-white
          text-slate-700
          hover:bg-slate-100
        `,
      };

  /* =======================================================
     PRIMARY OR SECONDARY ACTION
  ======================================================= */

  const isPrimaryAction =
    type === "projects" ||
    type === "error";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      aria-busy={
        isRetrying || undefined
      }
      className={`
        relative

        flex
        w-full
        min-w-0
        flex-col
        items-center
        justify-center

        px-5
        text-center

        ${
          compact
            ? "min-h-200px py-8"
            : "min-h-280px py-12 sm:py-16"
        }

        ${className}
      `}
    >
      {/* ===============================================
          EMPTY STATE ICON
      =============================================== */}

      <div
        aria-hidden="true"
        className={`
          flex
          shrink-0
          items-center
          justify-center

          rounded-16px
          border

          ${
            compact
              ? "h-12 w-12"
              : "h-14 w-14"
          }

          ${
            isError
              ? colors.errorContainer
              : colors.iconContainer
          }
        `}
      >
        <StateIcon
          size={compact ? 23 : 27}
          strokeWidth={1.5}
        />
      </div>

      {/* ===============================================
          STATE HEADING AND DESCRIPTION
      =============================================== */}

      <div
        role={
          isError
            ? "alert"
            : "status"
        }
        aria-atomic="true"
        className="
          flex
          w-full
          min-w-0
          flex-col
          items-center
        "
      >
        <h3
          className={`
            mt-4
            max-w-full
            wrap-break-word

            font-semibold
            leading-6
            tracking--0.025em

            ${
              compact
                ? "text-[15px]"
                : "text-[17px]"
            }

            ${colors.title}
          `}
        >
          {config.title}
        </h3>

        <p
          className={`
            mt-2
            w-full
            max-w-350px
            wrap-break-word

            text-[13px]
            leading-[1.7]

            ${colors.description}
          `}
        >
          {description}
        </p>
      </div>

      {/* ===============================================
          OPTIONAL ERROR DETAILS
      =============================================== */}

      {isError && error?.trim() && (
        <details
          className={`
            mt-4
            w-full
            max-w-400px

            rounded-lg
            border
            px-3
            py-2

            text-left
            text-[12px]

            ${colors.errorDetails}
          `}
        >
          <summary
            className="
              cursor-pointer
              rounded-sm
              font-medium
              outline-none

              focus-visible:ring-2
              focus-visible:ring-[#3978ff]
            "
          >
            Error details
          </summary>

          <p
            className="
              mt-2
              max-h-28
              overflow-auto
              whitespace-pre-wrap
              wrap-break-word
              leading-relaxed
            "
          >
            {error}
          </p>
        </details>
      )}

      {/* ===============================================
          CONTEXTUAL RECOVERY ACTION
      =============================================== */}

      {action && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={action}
          className={`
            group
            mt-5

            inline-flex
            min-h-9
            max-w-full
            items-center
            justify-center
            gap-2

            rounded-[9px]
            border
            px-4
            py-2

            text-[12px]
            font-medium
            leading-5

            outline-none
            transition-colors
            duration-200

            focus-visible:ring-2
            focus-visible:ring-[#3978ff]
            focus-visible:ring-offset-2
            focus-visible:ring-offset-transparent

            disabled:cursor-not-allowed
            disabled:opacity-60

            motion-reduce:transition-none

            ${
              isPrimaryAction
                ? colors.primaryButton
                : colors.secondaryButton
            }
          `}
        >
          <ActionIcon
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
            className={`
              shrink-0

              ${
                isRetrying
                  ? "motion-safe:animate-spin"
                  : ""
              }
            `}
          />

          <span>
            {isRetrying
              ? "Retrying..."
              : config.actionLabel}
          </span>
        </button>
      )}
    </div>
  );
};

export default DiscoveryEmptyState;

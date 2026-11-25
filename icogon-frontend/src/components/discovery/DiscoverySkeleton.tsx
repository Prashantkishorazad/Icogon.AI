
import type { FC } from "react";

/* =========================================================
   TYPES
========================================================= */

export type DiscoverySkeletonVariant =
  | "projects"
  | "recent"
  | "templates";

interface DiscoverySkeletonProps {
  isDark: boolean;

  variant?: DiscoverySkeletonVariant;

  count?: number;

  showNavigation?: boolean;

  showFilters?: boolean;

  showHeader?: boolean;

  compact?: boolean;

  className?: string;
}

interface SkeletonTheme {
  primary: string;
  secondary: string;
  border: string;
  container: string;
  shimmer: string;
}

/* =========================================================
   THEME CONFIGURATION
========================================================= */

const getSkeletonTheme = (
  isDark: boolean,
): SkeletonTheme => {
  return isDark
    ? {
        primary: "bg-[#303030]",
        secondary: "bg-[#383838]",
        border: "border-white/[0.065]",
        container: "bg-[#262626]",
        shimmer: "rgba(255,255,255,0.045)",
      }
    : {
        primary: "bg-slate-200/80",
        secondary: "bg-slate-200",
        border: "border-slate-200",
        container: "bg-slate-100",
        shimmer: "rgba(255,255,255,0.65)",
      };
};

/* =========================================================
   BASE SKELETON BLOCK
========================================================= */

const SkeletonBlock: FC<{
  theme: SkeletonTheme;
  className?: string;
  secondary?: boolean;
}> = ({
  theme,
  className = "",
  secondary = false,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`
        relative
        isolate
        overflow-hidden

        ${
          secondary
            ? theme.secondary
            : theme.primary
        }

        ${className}
      `}
    />
  );
};

/* =========================================================
   NAVIGATION CAPSULE SKELETON
========================================================= */

const NavigationSkeleton: FC<{
  theme: SkeletonTheme;
}> = ({ theme }) => {
  return (
    <div
      aria-hidden="true"
      className="
        flex
        w-full
        min-w-0
        flex-wrap
        items-center
        justify-between
        gap-3
      "
    >
      {/* Navigation capsule */}

      <div
        className={`
          flex
          max-w-full
          min-w-0
          items-center
          gap-3

          overflow-hidden
          rounded-full
          border
          p-2

          ${theme.border}
          ${theme.container}
        `}
      >
        {/* Search icon */}

        <SkeletonBlock
          theme={theme}
          secondary
          className="
            h-7
            w-7
            shrink-0
            rounded-full
          "
        />

        {/* Separator */}

        <SkeletonBlock
          theme={theme}
          className="
            h-4
            w-px
            shrink-0
          "
        />

        {/* My projects */}

        <SkeletonBlock
          theme={theme}
          secondary
          className="
            h-7
            w-88px
            shrink-0
            rounded-full
          "
        />

        {/* Recently viewed */}

        <SkeletonBlock
          theme={theme}
          className="
            h-3
            w-92px
            shrink-0
            rounded-full
          "
        />

        {/* Icogon templates */}

        <SkeletonBlock
          theme={theme}
          className="
            mr-2
            h-3
            w-96px
            shrink-0
            rounded-full
          "
        />
      </div>

      {/* Browse all */}

      <SkeletonBlock
        theme={theme}
        secondary
        className="
          ml-auto
          h-3
          w-84px
          rounded-full
        "
      />
    </div>
  );
};

/* =========================================================
   PROJECT CARD SKELETON
========================================================= */

const ProjectCardSkeleton: FC<{
  theme: SkeletonTheme;
}> = ({ theme }) => {
  return (
    <div
      aria-hidden="true"
      className="
        w-full
        min-w-0
      "
    >
      {/* Website preview */}

      <SkeletonBlock
        theme={theme}
        className={`
          aspect-video
          w-full
          rounded-12px
          border

          ${theme.border}
        `}
      />

      {/* Project information */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-2.5

          px-1
          pb-1
          pt-3
        "
      >
        {/* Owner avatar */}

        <SkeletonBlock
          theme={theme}
          secondary
          className="
            h-9
            w-9
            shrink-0
            rounded-full
          "
        />

        {/* Project title and timestamp */}

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <SkeletonBlock
            theme={theme}
            secondary
            className="
              h-3
              w-[68%]
              rounded-full
            "
          />

          <SkeletonBlock
            theme={theme}
            className="
              mt-2
              h-2.5
              w-[46%]
              rounded-full
            "
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TEMPLATE CARD SKELETON
========================================================= */

const TemplateCardSkeleton: FC<{
  theme: SkeletonTheme;
}> = ({ theme }) => {
  return (
    <div
      aria-hidden="true"
      className="
        flex
        h-full
        w-full
        min-w-0
        flex-col
      "
    >
      {/* Template preview */}

      <SkeletonBlock
        theme={theme}
        className={`
          aspect-video
          w-full
          rounded-12px
          border

          ${theme.border}
        `}
      />

      {/* Template information */}

      <div
        className="
          flex
          flex-1
          flex-col
          px-1
          pb-1
          pt-3
        "
      >
        {/* Template title */}

        <SkeletonBlock
          theme={theme}
          secondary
          className="
            h-15px
            w-[65%]
            rounded-full
          "
        />

        {/* Category and difficulty */}

        <div
          className="
            mt-2
            flex
            items-center
            gap-2
          "
        >
          <SkeletonBlock
            theme={theme}
            className="
              h-2.5
              w-65px
              rounded-full
            "
          />

          <SkeletonBlock
            theme={theme}
            className="
              h-2.5
              w-54px
              rounded-full
            "
          />
        </div>

        {/* Description */}

        <SkeletonBlock
          theme={theme}
          className="
            mt-3
            h-2.5
            w-full
            rounded-full
          "
        />

        <SkeletonBlock
          theme={theme}
          className="
            mt-2
            h-2.5
            w-[78%]
            rounded-full
          "
        />

        {/* Technology stack */}

        <div
          className="
            mt-3
            flex
            flex-wrap
            items-center
            gap-1.5
          "
        >
          {[49, 66, 58].map(
            (_width, index) => (
              <SkeletonBlock
                key={index}
                theme={theme}
                className="
                  h-6
                  flex-1
                  rounded-md
                "
              />
            ),
          )}
        </div>

        {/* Use template button */}

        <SkeletonBlock
          theme={theme}
          secondary
          className={`
            mt-4
            h-9
            w-full
            rounded-8px
            border

            ${theme.border}
          `}
        />
      </div>
    </div>
  );
};

/* =========================================================
   TEMPLATE HEADER SKELETON
========================================================= */

const TemplateHeaderSkeleton: FC<{
  theme: SkeletonTheme;
}> = ({ theme }) => {
  return (
    <div
      aria-hidden="true"
      className="
        mb-4
        flex
        w-full
        items-center
        justify-between
        gap-3
      "
    >
      <div className="min-w-0 flex-1">
        <SkeletonBlock
          theme={theme}
          secondary
          className="
            h-4
            w-155px
            max-w-full
            rounded-full
          "
        />

        <SkeletonBlock
          theme={theme}
          className="
            mt-2
            h-3
            w-215px
            max-w-full
            rounded-full
          "
        />
      </div>

      <SkeletonBlock
        theme={theme}
        className="
          h-3
          w-70px
          shrink-0
          rounded-full
        "
      />
    </div>
  );
};

/* =========================================================
   CATEGORY FILTER SKELETON
========================================================= */

const CategoryFilterSkeleton: FC<{
  theme: SkeletonTheme;
}> = ({ theme }) => {
  return (
    <div
      aria-hidden="true"
      className="
        mb-5
        flex
        w-full
        min-w-0
        items-center
        gap-2
        overflow-hidden
        pb-2
        pt-1
      "
    >
      {[
        "w-[104px]",
        "w-[58px]",
        "w-[110px]",
        "w-[95px]",
        "w-[90px]",
        "w-[76px]",
      ].map((width, index) => (
        <SkeletonBlock
          key={index}
          theme={theme}
          secondary={index === 0}
          className={`
            h-8
            shrink-0
            rounded-full
            border

            ${width}
            ${theme.border}
          `}
        />
      ))}
    </div>
  );
};

/* =========================================================
   MAIN DISCOVERY SKELETON
========================================================= */

const DiscoverySkeleton: FC<
  DiscoverySkeletonProps
> = ({
  isDark,

  variant = "projects",

  count = 6,

  showNavigation = false,
  showFilters = true,
  showHeader = true,

  compact = false,

  className = "",
}) => {
  const theme =
    getSkeletonTheme(isDark);

  const isTemplate =
    variant === "templates";

  /* =======================================================
     SAFE SKELETON COUNT

     Prevent unnecessary DOM elements if an invalid
     or excessively large count is provided.
  ======================================================= */

  const safeCount = Number.isFinite(count)
    ? Math.min(
        12,
        Math.max(1, Math.floor(count)),
      )
    : 6;

  const visibleCount = compact
    ? Math.min(safeCount, 3)
    : safeCount;

  /* =======================================================
     ACCESSIBLE LOADING LABEL
  ======================================================= */

  const loadingLabel =
    variant === "templates"
      ? "Loading Icogon templates"
      : variant === "recent"
        ? "Loading recently viewed projects"
        : "Loading your projects";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-label={loadingLabel}
      aria-busy="true"
      className={`
        relative
        w-full
        min-w-0

        ${className}
      `}
      style={{
        containerType: "inline-size",
        containerName: "icogon-skeleton",
      }}
    >
      {/* ===============================================
          RESPONSIVE GRID AND SHIMMER ANIMATION
      =============================================== */}

      <style>{`
        .icogon-discovery-skeleton-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px 20px;
          align-items: start;
        }

        .icogon-discovery-skeleton-grid.is-template {
          gap: 28px 20px;
          align-items: stretch;
        }

        @container icogon-skeleton (min-width: 520px) {
          .icogon-discovery-skeleton-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @container icogon-skeleton (min-width: 850px) {
          .icogon-discovery-skeleton-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @keyframes icogon-discovery-shimmer {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(100%);
          }
        }

        .icogon-discovery-skeleton-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;

          background: linear-gradient(
            100deg,
            transparent 20%,
            ${theme.shimmer} 50%,
            transparent 80%
          );

          animation:
            icogon-discovery-shimmer
            2s
            ease-in-out
            infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .icogon-discovery-skeleton-shimmer::after {
            animation: none;
            display: none;
          }
        }
      `}</style>

      {/* ===============================================
          SCREEN READER ANNOUNCEMENT
      =============================================== */}

      <span
        role="status"
        className="sr-only"
      >
        {loadingLabel}
      </span>

      {/* ===============================================
          OPTIONAL NAVIGATION SKELETON
      =============================================== */}

      {showNavigation && (
        <div className="mb-6">
          <NavigationSkeleton
            theme={theme}
          />
        </div>
      )}

      {/* ===============================================
          TEMPLATE HEADER
      =============================================== */}

      {isTemplate && showHeader && (
        <TemplateHeaderSkeleton
          theme={theme}
        />
      )}

      {/* ===============================================
          TEMPLATE CATEGORY FILTERS
      =============================================== */}

      {isTemplate && showFilters && (
        <CategoryFilterSkeleton
          theme={theme}
        />
      )}

      {/* ===============================================
          GALLERY LOADING STATE
      =============================================== */}

      <div
        aria-hidden="true"
        className={`
          relative
          isolate
          overflow-hidden

          icogon-discovery-skeleton-shimmer
          icogon-discovery-skeleton-grid

          ${
            isTemplate
              ? "is-template"
              : ""
          }
        `}
      >
        {Array.from(
          { length: visibleCount },
          (_, index) =>
            isTemplate ? (
              <TemplateCardSkeleton
                key={index}
                theme={theme}
              />
            ) : (
              <ProjectCardSkeleton
                key={index}
                theme={theme}
              />
            ),
        )}
      </div>
    </section>
  );
};

export default DiscoverySkeleton;

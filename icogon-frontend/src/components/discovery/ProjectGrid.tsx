
import {
  useState,
  type FC,
} from "react";

import ProjectThumbnail from "./ProjectThumbnail";

import {
  formatProjectActivity,
  formatProjectDateTime,
  getProjectActivityDate,
  parseProjectDate,
} from "../../utils/projectDates";

import type {
  DiscoveryProject,
  ProjectGridProps,
  ProjectActivityType,
  ProjectHistory,
} from "./types";

/* =========================================================
   TYPES
========================================================= */

interface OwnerAvatarProps {
  ownerName: string;
  avatarUrl?: string | null;
  isDark: boolean;
}

interface ProjectGridCardProps {
  project: DiscoveryProject;

  ownerName: string;
  ownerAvatarUrl?: string | null;
  currentUserId?: string | null;

  isDark: boolean;

  activityType: ProjectActivityType;

  history?: ProjectHistory;

  onOpen: (
    project: DiscoveryProject,
  ) => void;
}

interface ExtendedProjectGridProps
  extends ProjectGridProps {
  ownerAvatarUrl?: string | null;

  currentUserId?: string | null;

  className?: string;
}

/* =========================================================
   OWNER AVATAR COLORS
========================================================= */

const AVATAR_COLORS = [
  "#c94700",
  "#2563eb",
  "#7c3aed",
  "#0d9488",
  "#be185d",
  "#475569",
];

/* =========================================================
   OWNER AVATAR COLOR
========================================================= */

const getAvatarColor = (
  name: string,
): string => {
  let hash = 0;

  for (const character of name) {
    hash =
      (hash * 31 +
        character.charCodeAt(0)) >>> 0;
  }

  return AVATAR_COLORS[
    hash % AVATAR_COLORS.length
  ]!;
};

/* =========================================================
   OWNER INITIAL
========================================================= */

const getOwnerInitial = (
  name: string,
): string => {
  return (
    Array.from(name.trim())[0]
      ?.toUpperCase() || "?"
  );
};

/* =========================================================
   OWNER AVATAR
========================================================= */

const OwnerAvatar: FC<OwnerAvatarProps> = ({
  ownerName,
  avatarUrl,
  isDark,
}) => {
  const [failedUrl, setFailedUrl] =
    useState<string | null>(null);

  const showAvatar =
    Boolean(avatarUrl) &&
    avatarUrl !== failedUrl;

  return (
    <span
      title={ownerName}
      aria-hidden="true"
      className={`
        relative
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center

        overflow-hidden
        rounded-full
        border

        text-[14px]
        font-semibold
        text-white

        ${
          isDark
            ? "border-white/10"
            : "border-black/5"
        }
      `}
      style={{
        backgroundColor:
          getAvatarColor(ownerName),
      }}
    >
      {showAvatar && avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => {
            setFailedUrl(avatarUrl);
          }}
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        getOwnerInitial(ownerName)
      )}
    </span>
  );
};

/* =========================================================
   PROJECT OWNER RESOLUTION

   Avoid assigning the current user's identity to a
   project that belongs to another user.
========================================================= */

const resolveProjectOwner = (
  project: DiscoveryProject,
  ownerName: string,
  ownerAvatarUrl?: string | null,
  currentUserId?: string | null,
) => {
  const belongsToCurrentUser =
    Boolean(currentUserId) &&
    project.user_id === currentUserId;

  if (belongsToCurrentUser) {
    return {
      name:
        project.owner_name?.trim() ||
        ownerName ||
        "You",

      avatar:
        project.owner_avatar_url ||
        ownerAvatarUrl ||
        null,
    };
  }

  return {
    name:
      project.owner_name?.trim() ||
      "Unknown owner",

    avatar:
      project.owner_avatar_url || null,
  };
};

/* =========================================================
   INDIVIDUAL PROJECT CARD

   Kept internal to avoid changing your two existing
   ProjectCard.tsx implementations.
========================================================= */

const DiscoveryProjectCard: FC<
  ProjectGridCardProps
> = ({
  project,
  ownerName,
  ownerAvatarUrl,
  currentUserId,
  isDark,
  activityType,
  history,
  onOpen,
}) => {
  /* =======================================================
     OWNER INFORMATION
  ======================================================= */

  const owner = resolveProjectOwner(
    project,
    ownerName,
    ownerAvatarUrl,
    currentUserId,
  );

  /* =======================================================
     PROJECT ACTIVITY
  ======================================================= */

  const activityLabel =
    formatProjectActivity(
      project,
      activityType,
      history,
    );

  const activityDate =
    getProjectActivityDate(
      project,
      activityType,
      history,
    );

  const exactActivityDate =
    formatProjectDateTime(
      activityDate,
    );

  /* =======================================================
     CREATED DATE FALLBACK

     If no edited timestamp exists, show the creation
     date explicitly rather than inventing an edit date.
  ======================================================= */

  const useCreatedFallback =
    activityType === "edited" &&
    !activityDate &&
    Boolean(
      parseProjectDate(project.created_at),
    );

  const displayActivity =
    useCreatedFallback
      ? formatProjectActivity(
          project,
          "created",
        )
      : activityLabel;

  const displayActivityTitle =
    useCreatedFallback
      ? formatProjectDateTime(
          project.created_at,
        )
      : exactActivityDate;

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        title:
          "text-[#ededed]",

        muted:
          "text-[#a3a3a3]",

        hover:
          "group-hover:text-white",

        avatarBorder:
          "border-[#333333]",
      }
    : {
        title:
          "text-slate-900",

        muted:
          "text-slate-500",

        hover:
          "group-hover:text-slate-950",

        avatarBorder:
          "border-slate-200",
      };

  /* =======================================================
     CARD RENDER
  ======================================================= */

  return (
    <article className="min-w-0">
      <button
        type="button"
        aria-label={`Open project ${project.name}`}
        onClick={() => {
          onOpen(project);
        }}
        className="
          group
          relative
          flex
          w-full
          min-w-0
          cursor-pointer
          flex-col

          rounded-[13px]
          text-left
          outline-none

          focus-visible:ring-2
          focus-visible:ring-[#3978ff]
          focus-visible:ring-offset-2
          focus-visible:ring-offset-transparent
        "
      >
        {/* ===============================================
            PROJECT SCREENSHOT
        =============================================== */}

        <ProjectThumbnail
          project={project}
          isDark={isDark}
          className="
            transition-shadow
            duration-300

            group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]

            motion-reduce:transition-none
          "
        />

        {/* ===============================================
            PROJECT INFORMATION
        =============================================== */}

        <div
          className="
            flex
            w-full
            min-w-0
            items-center
            gap-2.5

            px-1
            pb-1
            pt-3
          "
        >
          {/* OWNER AVATAR */}

          <OwnerAvatar
            ownerName={owner.name}
            avatarUrl={owner.avatar}
            isDark={isDark}
          />

          {/* PROJECT NAME AND ACTIVITY */}

          <div className="min-w-0 flex-1">
            <h3
              title={project.name}
              className={`
                truncate

                text-[13px]
                font-medium
                leading-5
                tracking-[-0.015em]

                transition-colors
                duration-150

                sm:text-[14px]

                ${colors.title}
                ${colors.hover}
              `}
            >
              {project.name}
            </h3>

            <p
              title={displayActivityTitle}
              className={`
                mt-0.5
                truncate

                text-[11px]
                leading-4

                sm:text-[12px]

                ${colors.muted}
              `}
            >
              {displayActivity}
            </p>
          </div>
        </div>
      </button>
    </article>
  );
};

/* =========================================================
   PROJECT GRID LOADING STATE
========================================================= */

const ProjectGridLoading: FC<{
  isDark: boolean;
}> = ({ isDark }) => {
  const surface = isDark
    ? "bg-white/[0.055]"
    : "bg-slate-200/80";

  const border = isDark
    ? "border-white/[0.06]"
    : "border-slate-200";

  return (
    <>
      {Array.from(
        { length: 3 },
        (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="
              min-w-0
              motion-safe:animate-pulse
            "
          >
            <div
              className={`
                aspect-video
                w-full
                rounded-12px
                border

                ${surface}
                ${border}
              `}
            />

            <div
              className="
                flex
                items-center
                gap-3
                px-1
                pb-1
                pt-3
              "
            >
              <div
                className={`
                  h-9
                  w-9
                  shrink-0
                  rounded-full

                  ${surface}
                `}
              />

              <div className="min-w-0 flex-1">
                <div
                  className={`
                    h-3
                    w-[65%]
                    rounded-md

                    ${surface}
                  `}
                />

                <div
                  className={`
                    mt-2
                    h-2.5
                    w-[42%]
                    rounded-md

                    ${surface}
                  `}
                />
              </div>
            </div>
          </div>
        ),
      )}
    </>
  );
};

/* =========================================================
   MAIN PROJECT GRID
========================================================= */

const ProjectGrid: FC<
  ExtendedProjectGridProps
> = ({
  projects,
  isDark,
  ownerName,

  ownerAvatarUrl,
  currentUserId,

  loading = false,
  activityType = "edited",
  history,

  onOpenProject,

  className = "",
}) => {
  const showLoading =
    loading && projects.length === 0;

  /* =======================================================
     EMPTY STATE

     The parent ProjectDiscovery component controls
     contextual empty states and error recovery.
  ======================================================= */

  if (!showLoading && !projects.length) {
    return null;
  }

  /* =======================================================
     RESPONSIVE GRID

     Uses available container space, not viewport width.

     This allows the grid to adapt automatically when
     the dashboard sidebar expands or collapses.
  ======================================================= */

  return (
    <div
      aria-label={
        activityType === "viewed"
          ? "Recently viewed projects"
          : "My projects"
      }
      aria-busy={loading}
      className={`
        w-full
        min-w-0

        ${className}
      `}
      style={{
        containerType: "inline-size",
        containerName: "icogon-projects",
      }}
    >
      {/* ===============================================
          CONTAINER-RESPONSIVE GRID STYLES
      =============================================== */}

      <style>{`
        .icogon-discovery-project-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px 20px;
          align-items: start;
        }

        @container icogon-projects (min-width: 520px) {
          .icogon-discovery-project-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @container icogon-projects (min-width: 850px) {
          .icogon-discovery-project-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>

      {showLoading && (
        <span
          role="status"
          className="sr-only"
        >
          Loading your projects
        </span>
      )}

      <div
        className="
          icogon-discovery-project-grid
          w-full
          min-w-0
        "
      >
        {showLoading ? (
          <ProjectGridLoading
            isDark={isDark}
          />
        ) : (
          projects.map((project) => (
            <DiscoveryProjectCard
              key={project.id}
              project={project}
              ownerName={ownerName}
              ownerAvatarUrl={ownerAvatarUrl}
              currentUserId={currentUserId}
              isDark={isDark}
              activityType={activityType}
              history={history}
              onOpen={onOpenProject}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectGrid;

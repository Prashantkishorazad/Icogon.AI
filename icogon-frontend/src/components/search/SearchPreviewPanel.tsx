
import React, { useState } from "react";

import {
  Globe2,
  ArrowUpRight,
  ImageOff,
} from "lucide-react";

import type { ProjectResponse } from "../../api/projectApi";
import { useAuthStore } from "../../store/authStore";
import { useProjectThumbnail } from "../../utils/projectThumbnails";

/* =========================================================
   TYPES
========================================================= */

type ProjectWithPreview = ProjectResponse & {
  preview_url?: string | null;
  preview_image_url?: string | null;
  thumbnail_url?: string | null;
  screenshot_url?: string | null;

  visibility?: string | null;
  status?: string | null;

  owner_name?: string | null;

  last_opened_at?: string | null;
  last_opened?: string | null;
};

interface Props {
  project: ProjectResponse;
  isDark: boolean;
  onOpen: () => void;
}

interface MetaItemProps {
  label: string;
  value: string;
  isDark: boolean;
  title?: string;
}

interface ProjectImageProps {
  name: string;
  sources: string[];
  isDark: boolean;
  onOpen: () => void;
}

/* =========================================================
   DATE FORMATTERS
========================================================= */

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatRelativeDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();

  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const targetDay = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const days = Math.round(
    (today - targetDay) / 86_400_000,
  );

  if (days === 0) return "Today";

  if (days === 1) return "Yesterday";

  if (days < 0) return formatDate(value);

  if (days < 30) {
    return `${days} days ago`;
  }

  return formatDate(value);
};

/* =========================================================
   STATUS FORMATTER
========================================================= */

const formatStatus = (
  value?: string | null,
) => {
  if (!value?.trim()) return "—";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
};

/* =========================================================
   METADATA ITEM
========================================================= */

const MetaItem: React.FC<MetaItemProps> = ({
  label,
  value,
  isDark,
  title,
}) => {
  return (
    <div className="min-w-0">
      <dt
        className={`
          text-[12px]
          font-medium
          ${
            isDark
              ? "text-[#929292]"
              : "text-slate-500"
          }
        `}
      >
        {label}
      </dt>

      <dd
        title={title || value}
        className={`
          mt-1
          truncate
          text-[13px]
          font-medium
          leading-5
          tracking-[-0.01em]
          sm:text-[14px]
          ${
            isDark
              ? "text-[#e2e2e2]"
              : "text-slate-800"
          }
        `}
      >
        {value}
      </dd>
    </div>
  );
};

/* =========================================================
   PROJECT SCREENSHOT
========================================================= */

const ProjectImage: React.FC<ProjectImageProps> = ({
  name,
  sources,
  isDark,
  onOpen,
}) => {
  const [sourceIndex, setSourceIndex] = useState(0);

  const imageSource = sources[sourceIndex];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${name}`}
      className={`
        group
        relative
        block
        aspect-video
        w-full
        cursor-pointer
        overflow-hidden
        rounded-[12px]
        border
        text-left
        outline-none
        transition-colors
        duration-200
        focus-visible:ring-2
        focus-visible:ring-[#3978ff]
        ${
          isDark
            ? "border-[#3c3c3c] bg-[#181818] hover:border-[#666666]"
            : "border-slate-200 bg-slate-100 hover:border-slate-400"
        }
      `}
    >
      {imageSource ? (
        <img
          key={imageSource}
          src={imageSource}
          alt={`${name} website preview`}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => {
            setSourceIndex(
              (current) => current + 1,
            );
          }}
          className="
            h-full
            w-full
            object-cover
            object-top
            transition-transform
            duration-300
            ease-out
            group-hover:scale-[1.015]
            motion-reduce:transform-none
          "
        />
      ) : (
        /* ===============================================
           NO SCREENSHOT AVAILABLE
        =============================================== */

        <div
          className={`
            flex
            h-full
            w-full
            flex-col
            ${
              isDark
                ? "bg-[#1c1c1c]"
                : "bg-[#f8fafc]"
            }
          `}
        >
          {/* Browser toolbar */}

          <div
            className={`
              flex
              h-8
              shrink-0
              items-center
              gap-1.5
              border-b
              px-3
              ${
                isDark
                  ? "border-[#333333] bg-[#222222]"
                  : "border-slate-200 bg-white"
              }
            `}
          >
            <span className="h-2 w-2 rounded-full bg-[#ef6464]" />

            <span className="h-2 w-2 rounded-full bg-[#eab54f]" />

            <span className="h-2 w-2 rounded-full bg-[#45c780]" />

            <div
              className={`
                mx-auto
                flex
                h-4
                w-[48%]
                items-center
                justify-center
                gap-1.5
                rounded-md
                text-[8px]
                ${
                  isDark
                    ? "bg-[#303030] text-[#999999]"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              <Globe2 size={9} />
              Project preview
            </div>
          </div>

          {/* Empty preview content */}

          <div
            className="
              flex
              min-h-0
              flex-1
              flex-col
              items-center
              justify-center
              gap-2
              px-4
              text-center
            "
          >
            <div
              className={`
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                ${
                  isDark
                    ? "border-[#3b3b3b] bg-[#292929]"
                    : "border-slate-200 bg-white"
                }
              `}
            >
              <ImageOff
                size={21}
                strokeWidth={1.5}
                className={
                  isDark
                    ? "text-[#949494]"
                    : "text-slate-400"
                }
              />
            </div>

            <span
              className={`
                max-w-full
                truncate
                text-[13px]
                font-medium
                ${
                  isDark
                    ? "text-[#dedede]"
                    : "text-slate-700"
                }
              `}
            >
              {name}
            </span>

            <span
              className={`
                text-[11px]
                ${
                  isDark
                    ? "text-[#929292]"
                    : "text-slate-500"
                }
              `}
            >
              Screenshot not available yet
            </span>
          </div>
        </div>
      )}

      {/* ===============================================
          OPEN PROJECT HOVER ACTION
      =============================================== */}

      <span
        className="
          absolute
          bottom-3
          right-3
          flex
          translate-y-1
          items-center
          gap-1.5
          rounded-lg
          border
          border-white/15
          bg-[#171717]
          px-3
          py-2
          text-[11px]
          font-medium
          text-white
          opacity-0
          shadow-lg
          transition-all
          duration-200
          group-hover:translate-y-0
          group-hover:opacity-100
          group-focus-visible:translate-y-0
          group-focus-visible:opacity-100
          motion-reduce:transition-none
        "
      >
        Open project

        <ArrowUpRight
          size={13}
          strokeWidth={1.8}
        />
      </span>
    </button>
  );
};

/* =========================================================
   SEARCH PREVIEW PANEL
========================================================= */

const SearchPreviewPanel: React.FC<Props> = ({
  project,
  isDark,
  onOpen,
}) => {
  const user = useAuthStore(
    (state) => state.user,
  );

  const details = project as ProjectWithPreview;

  /* =======================================================
     SHARED PROJECT PHOTO

     Reads the same user + project scoped thumbnail that is
     uploaded through the Projects page. The hook subscribes
     to same-tab and cross-tab image updates automatically.
  ======================================================= */

  const sharedThumbnail = useProjectThumbnail(
    project,
    user?.id,
  );

  /* =======================================================
     PROJECT OWNER
  ======================================================= */

  const currentUserName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "You";

  const ownerName =
    details.owner_name ||
    (
      user?.id && project.user_id === user.id
        ? currentUserName
        : "—"
    );

  /* =======================================================
     SCREENSHOT SOURCES
  ======================================================= */

  const previewSources = Array.from(
    new Set(
      [
        // Highest priority: uploaded project image from /projects.
        sharedThumbnail,
        details.preview_image_url,
        details.thumbnail_url,
        details.screenshot_url,
        // Intentionally omit preview_url: it may link to a website,
        // not a screenshot image.
      ].filter(
        (source): source is string =>
          typeof source === "string" &&
          source.trim().length > 0,
      ),
    ),
  );

  /* =======================================================
     PROJECT METADATA
  ======================================================= */

  const status = formatStatus(
    details.visibility ||
      details.status,
  );

  const lastOpened =
    details.last_opened_at ||
    details.last_opened;

  const description =
    project.description?.trim() ||
    project.prompt?.trim() ||
    "";

  const mutedClass = isDark
    ? "text-[#a3a3a3]"
    : "text-slate-500";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <aside
      aria-label="Project details"
      className={`
        hidden
        min-h-0
        min-w-0
        flex-col
        border-l
        md:flex
        md:flex-[0_0_50%]
        ${
          isDark
            ? "border-white/[0.09] bg-[#252525]"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div
        key={project.id}
        className="
          icogon-search-scroll
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          overscroll-contain
          p-4
          lg:p-5
        "
      >
        {/* ===============================================
            WEBSITE SCREENSHOT
        =============================================== */}

        <ProjectImage
          key={`${project.id}-${JSON.stringify(previewSources)}`}
          name={project.name}
          sources={previewSources}
          isDark={isDark}
          onOpen={onOpen}
        />

        {/* ===============================================
            PROJECT NAME
        =============================================== */}

        <h2
          className={`
            mt-5
            break-words
            text-[21px]
            font-semibold
            leading-tight
            tracking-[-0.04em]
            lg:text-[24px]
            ${
              isDark
                ? "text-[#f5f5f5]"
                : "text-slate-900"
            }
          `}
        >
          {project.name}
        </h2>

        {/* ===============================================
            PROJECT DETAILS
        =============================================== */}

        <dl
          className="
            mt-5
            grid
            grid-cols-2
            gap-x-5
            gap-y-5
          "
        >
          <MetaItem
            label="Owner"
            value={ownerName}
            isDark={isDark}
          />

          <MetaItem
            label="Status"
            value={status}
            isDark={isDark}
          />

          <MetaItem
            label="Created"
            value={formatRelativeDate(
              project.created_at,
            )}
            title={formatDate(
              project.created_at,
            )}
            isDark={isDark}
          />

          <MetaItem
            label="Last edited"
            value={formatRelativeDate(
              project.updated_at,
            )}
            title={formatDate(
              project.updated_at,
            )}
            isDark={isDark}
          />

          <MetaItem
            label="Last opened"
            value={formatRelativeDate(
              lastOpened,
            )}
            title={formatDate(
              lastOpened,
            )}
            isDark={isDark}
          />
        </dl>

        {/* ===============================================
            PROJECT DESCRIPTION
        =============================================== */}

        {description && (
          <section
            className={`
              mt-6
              border-t
              pt-4
              ${
                isDark
                  ? "border-white/[0.08]"
                  : "border-slate-200"
              }
            `}
          >
            <h3
              className={`
                mb-2
                text-[12px]
                font-medium
                ${mutedClass}
              `}
            >
              About this project
            </h3>

            <p
              className={`
                whitespace-pre-wrap
                break-words
                text-[13px]
                leading-[1.65]
                ${
                  isDark
                    ? "text-[#c4c4c4]"
                    : "text-slate-600"
                }
              `}
            >
              {description}
            </p>
          </section>
        )}
      </div>
    </aside>
  );
};

export default SearchPreviewPanel;

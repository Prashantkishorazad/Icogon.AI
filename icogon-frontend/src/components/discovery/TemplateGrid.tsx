
import {
  useMemo,
  type FC,
  type ReactNode,
} from "react";

import {
  LayoutTemplate,
} from "lucide-react";

import TemplateCard from "./TemplateCard";

import {
  TEMPLATE_CATEGORIES,
} from "../../data/templateData";

import type {
  TemplateGridProps,
  TemplateCategoryFilter,
} from "./types";

/* =========================================================
   TYPES
========================================================= */

interface ExtendedTemplateGridProps
  extends TemplateGridProps {
  category?: TemplateCategoryFilter;

  onCategoryChange?: (
    category: TemplateCategoryFilter,
  ) => void;

  showFilters?: boolean;

  showHeader?: boolean;

  prioritizeFeatured?: boolean;

  emptyState?: ReactNode;

  className?: string;
}

/* =========================================================
   CATEGORY FILTER PROPS
========================================================= */

interface CategoryFiltersProps {
  category: TemplateCategoryFilter;

  isDark: boolean;

  onCategoryChange: (
    category: TemplateCategoryFilter,
  ) => void;
}

/* =========================================================
   CATEGORY FILTERS
========================================================= */

const CategoryFilters: FC<
  CategoryFiltersProps
> = ({
  category,
  isDark,
  onCategoryChange,
}) => {
  const colors = isDark
    ? {
        active: `
          border-[#4a4a4a]
          bg-[#414141]
          text-white
        `,

        inactive: `
          border-white/[0.07]
          bg-transparent
          text-[#a3a3a3]
          hover:border-white/15
          hover:bg-white/[0.05]
          hover:text-[#ededed]
        `,
      }
    : {
        active: `
          border-slate-300
          bg-slate-200
          text-slate-900
        `,

        inactive: `
          border-slate-200
          bg-transparent
          text-slate-500
          hover:bg-slate-100
          hover:text-slate-900
        `,
      };

  return (
    <div
      role="group"
      aria-label="Template categories"
      className="
        flex
        w-full
        min-w-0
        items-center
        gap-2
        overflow-x-auto

        pb-2
        pt-1

        scrollbar-width:none
        [&::-webkit-scrollbar]:hidden
      "
    >
      {TEMPLATE_CATEGORIES.map(
        (item) => {
          const selected =
            category === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                onCategoryChange(item.id);
              }}
              className={`
                inline-flex
                h-8
                shrink-0
                cursor-pointer
                select-none
                items-center
                justify-center

                whitespace-nowrap
                rounded-full
                border
                px-3

                text-[12px]
                font-medium
                leading-none
                tracking-[-0.01em]

                outline-none
                transition-colors
                duration-200

                focus-visible:ring-2
                focus-visible:ring-inset
                focus-visible:ring-[#3978ff]

                motion-reduce:transition-none

                ${
                  selected
                    ? colors.active
                    : colors.inactive
                }
              `}
            >
              {item.label}
            </button>
          );
        },
      )}
    </div>
  );
};

/* =========================================================
   DEFAULT EMPTY STATE

   The parent can replace this with DiscoveryEmptyState.
========================================================= */

const TemplateGridEmpty: FC<{
  isDark: boolean;
  onReset?: () => void;
}> = ({
  isDark,
  onReset,
}) => {
  return (
    <div
      className="
        flex
        min-h-220px   
        w-full
        flex-col
        items-center
        justify-center

        px-5
        py-10
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
          rounded-[14px]
          border

          ${
            isDark
              ? `
                border-white/0.08
                bg-white/0.04
                text-[#a3a3a3]
              `
              : `
                border-slate-200
                bg-slate-100
                text-slate-500
              `
          }
        `}
      >
        <LayoutTemplate
          size={23}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      <h3
        className={`
          mt-4
          text-[15px]
          font-medium

          ${
            isDark
              ? "text-[#ededed]"
              : "text-slate-900"
          }
        `}
      >
        No templates found
      </h3>

      <p
        className={`
          mt-2
          max-w-280px
          text-[13px]
          leading-relaxed

          ${
            isDark
              ? "text-[#a3a3a3]"
              : "text-slate-500"
          }
        `}
      >
        Try another category or adjust your
        search to discover more templates.
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className={`
            mt-4
            cursor-pointer
            rounded-lg
            border
            px-4
            py-2

            text-[12px]
            font-medium

            outline-none
            transition-colors
            duration-200

            focus-visible:ring-2
            focus-visible:ring-[#3978ff]

            ${
              isDark
                ? `
                  border-white/10
                  bg-[#303030]
                  text-[#ededed]
                  hover:bg-[#414141]
                `
                : `
                  border-slate-200
                  bg-white
                  text-slate-700
                  hover:bg-slate-100
                `
            }
          `}
        >
          Show all categories
        </button>
      )}
    </div>
  );
};

/* =========================================================
   MAIN TEMPLATE GRID
========================================================= */

const TemplateGrid: FC<
  ExtendedTemplateGridProps
> = ({
  templates,
  isDark,

  onSelectTemplate,

  category = "all",
  onCategoryChange,

  showFilters = true,
  showHeader = true,

  prioritizeFeatured = true,

  emptyState,

  className = "",
}) => {
  /* =======================================================
     TEMPLATE NORMALIZATION AND FILTERING
  ======================================================= */

  const visibleTemplates = useMemo(() => {
    const uniqueTemplates = new Map<
      string,
      (typeof templates)[number]
    >();

    for (const template of templates) {
      if (
        category !== "all" &&
        template.category !== category
      ) {
        continue;
      }

      if (!uniqueTemplates.has(template.id)) {
        uniqueTemplates.set(
          template.id,
          template,
        );
      }
    }

    const items = Array.from(
      uniqueTemplates.values(),
    );

    if (!prioritizeFeatured) {
      return items;
    }

    // Featured templates appear first without changing
    // the original catalog or duplicating its entries.
    return [
      ...items.filter(
        (template) => template.featured,
      ),

      ...items.filter(
        (template) => !template.featured,
      ),
    ];
  }, [
    templates,
    category,
    prioritizeFeatured,
  ]);

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        heading: "text-[#ededed]",
        muted: "text-[#a3a3a3]",
      }
    : {
        heading: "text-slate-900",
        muted: "text-slate-500",
      };

  const templateCount =
    visibleTemplates.length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-label="Icogon template gallery"
      className={`
        w-full
        min-w-0

        ${className}
      `}
      style={{
        containerType: "inline-size",
        containerName: "icogon-templates",
      }}
    >
      {/* ===============================================
          CONTAINER-RESPONSIVE GRID
      =============================================== */}

      <style>{`
        .icogon-discovery-template-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          align-items: stretch;
          gap: 28px 20px;
        }

        @container icogon-templates (min-width: 520px) {
          .icogon-discovery-template-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @container icogon-templates (min-width: 850px) {
          .icogon-discovery-template-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>

      {/* ===============================================
          GALLERY HEADER
      =============================================== */}

      {showHeader && (
        <div
          className="
            mb-4
            flex
            min-w-0
            flex-wrap
            items-center
            justify-between
            gap-2
          "
        >
          <div className="min-w-0">
            <h2
              className={`
                text-[17px]
                font-semibold
                tracking--0.025em

                ${colors.heading}
              `}
            >
              Explore templates
            </h2>

            <p
              className={`
                mt-1
                text-[12px]
                leading-relaxed

                ${colors.muted}
              `}
            >
              Start with an idea. Make it yours.
            </p>
          </div>

          <span
            role="status"
            aria-live="polite"
            className={`
              shrink-0
              whitespace-nowrap
              text-[12px]
              tabular-nums

              ${colors.muted}
            `}
          >
            {templateCount}{" "}
            {templateCount === 1
              ? "template"
              : "templates"}
          </span>
        </div>
      )}

      {/* ===============================================
          CATEGORY FILTER NAVIGATION
      =============================================== */}

      {showFilters && onCategoryChange && (
        <div className="mb-5">
          <CategoryFilters
            category={category}
            isDark={isDark}
            onCategoryChange={
              onCategoryChange
            }
          />
        </div>
      )}

      {/* ===============================================
          TEMPLATE GALLERY
      =============================================== */}

      {templateCount > 0 ? (
        <div
          className="
            icogon-discovery-template-grid
            w-full
            min-w-0
          "
        >
          {visibleTemplates.map(
            (template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isDark={isDark}
                onSelect={
                  onSelectTemplate
                }
              />
            ),
          )}
        </div>
      ) : (
        emptyState ?? (
          <TemplateGridEmpty
            isDark={isDark}
            onReset={
              category !== "all" &&
              onCategoryChange
                ? () => {
                    onCategoryChange("all");
                  }
                : undefined
            }
          />
        )
      )}
    </section>
  );
};

export default TemplateGrid;

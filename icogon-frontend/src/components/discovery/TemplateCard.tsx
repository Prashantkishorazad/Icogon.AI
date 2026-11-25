
import {
  useState,
  type FC,
} from "react";

import {
  ArrowUpRight,
} from "lucide-react";

import {
  TEMPLATE_CATEGORY_LABELS,
} from "../../data/templateData";

import type {
  DiscoveryTemplate,
  TemplateCategory,
  TemplateCardProps,
} from "./types";

/* =========================================================
   PREVIEW TYPES
========================================================= */

type PreviewLayout =
  | "landing"
  | "dashboard"
  | "chat"
  | "store"
  | "board"
  | "portfolio";

interface PreviewTheme {
  background: string;
  surface: string;
  accent: string;
  text: string;
  muted: string;
  layout: PreviewLayout;
}

/* =========================================================
   TEMPLATE DESIGN SYSTEM
========================================================= */

const PREVIEW_THEMES: Record<
  string,
  PreviewTheme
> = {
  saas: {
    background: "#0d1424",
    surface: "#1c293e",
    accent: "#60a5fa",
    text: "#ffffff",
    muted: "#94a3b8",
    layout: "landing",
  },

  "ai-app": {
    background: "#111b18",
    surface: "#20352e",
    accent: "#34d399",
    text: "#ecfdf5",
    muted: "#8ca69c",
    layout: "chat",
  },

  dashboard: {
    background: "#e8edf5",
    surface: "#ffffff",
    accent: "#2563eb",
    text: "#172033",
    muted: "#64748b",
    layout: "dashboard",
  },

  ecommerce: {
    background: "#eee7dc",
    surface: "#faf7f2",
    accent: "#926b46",
    text: "#30251d",
    muted: "#9b887a",
    layout: "store",
  },

  portfolio: {
    background: "#271e36",
    surface: "#3b2b50",
    accent: "#d8b4fe",
    text: "#ffffff",
    muted: "#b8a4c8",
    layout: "portfolio",
  },

  business: {
    background: "#171717",
    surface: "#292929",
    accent: "#e5e5e5",
    text: "#ffffff",
    muted: "#a3a3a3",
    layout: "landing",
  },

  crm: {
    background: "#eeedf7",
    surface: "#ffffff",
    accent: "#7c3aed",
    text: "#31264e",
    muted: "#8b83a1",
    layout: "board",
  },

  productivity: {
    background: "#172333",
    surface: "#25354a",
    accent: "#93c5fd",
    text: "#f1f5f9",
    muted: "#94a3b8",
    layout: "board",
  },

  "landing-page": {
    background: "#181932",
    surface: "#2b2c4d",
    accent: "#a78bfa",
    text: "#ffffff",
    muted: "#a5a5c8",
    layout: "landing",
  },

  "internal-tool": {
    background: "#1c232d",
    surface: "#2c3643",
    accent: "#38bdf8",
    text: "#ffffff",
    muted: "#94a3b8",
    layout: "dashboard",
  },

  finance: {
    background: "#12251e",
    surface: "#203d30",
    accent: "#4ade80",
    text: "#ecfdf5",
    muted: "#91aa9d",
    layout: "dashboard",
  },

  education: {
    background: "#f2e9dd",
    surface: "#ffffff",
    accent: "#b77942",
    text: "#392b20",
    muted: "#9b8878",
    layout: "store",
  },
};

/* =========================================================
   DEFAULT TEMPLATE PALETTE
========================================================= */

const DEFAULT_THEME: PreviewTheme = {
  background: "#172033",
  surface: "#25334c",
  accent: "#60a5fa",
  text: "#ffffff",
  muted: "#94a3b8",
  layout: "landing",
};

const getPreviewTheme = (
  category: TemplateCategory,
): PreviewTheme => {
  return (
    PREVIEW_THEMES[category] ||
    DEFAULT_THEME
  );
};

/* =========================================================
   LANDING PAGE PREVIEW
========================================================= */

const LandingPreview: FC<{
  theme: PreviewTheme;
  name: string;
}> = ({ theme, name }) => (
  <>
    <circle
      cx="160"
      cy="75"
      r="76"
      fill={theme.accent}
      opacity="0.045"
    />

    <text
      x="160"
      y="62"
      fill={theme.text}
      fontSize="18"
      fontWeight="700"
      textAnchor="middle"
      letterSpacing="-0.6"
    >
      {name}
    </text>

    <rect
      x="82"
      y="75"
      width="156"
      height="4"
      rx="2"
      fill={theme.muted}
      opacity="0.6"
    />

    <rect
      x="110"
      y="85"
      width="100"
      height="3"
      rx="1.5"
      fill={theme.muted}
      opacity="0.35"
    />

    <rect
      x="120"
      y="100"
      width="80"
      height="18"
      rx="5"
      fill={theme.accent}
    />

    {[16, 114, 212].map((x) => (
      <g key={x}>
        <rect
          x={x}
          y="132"
          width="92"
          height="35"
          rx="5"
          fill={theme.surface}
        />

        <rect
          x={x + 9}
          y="141"
          width="23"
          height="4"
          rx="2"
          fill={theme.accent}
        />

        <rect
          x={x + 9}
          y="152"
          width="67"
          height="3"
          rx="1.5"
          fill={theme.muted}
          opacity="0.5"
        />
      </g>
    ))}
  </>
);

/* =========================================================
   DASHBOARD PREVIEW
========================================================= */

const DashboardPreview: FC<{
  theme: PreviewTheme;
}> = ({ theme }) => (
  <>
    <rect
      x="10"
      y="35"
      width="48"
      height="133"
      rx="6"
      fill={theme.surface}
    />

    {[46, 61, 76, 91, 106].map((y) => (
      <rect
        key={y}
        x="18"
        y={y}
        width="31"
        height="4"
        rx="2"
        fill={theme.muted}
        opacity="0.45"
      />
    ))}

    {[67, 149, 231].map((x) => (
      <g key={x}>
        <rect
          x={x}
          y="35"
          width="78"
          height="36"
          rx="5"
          fill={theme.surface}
        />

        <rect
          x={x + 8}
          y="44"
          width="30"
          height="4"
          rx="2"
          fill={theme.muted}
        />

        <rect
          x={x + 8}
          y="55"
          width="39"
          height="7"
          rx="3"
          fill={theme.accent}
        />
      </g>
    ))}

    <rect
      x="67"
      y="80"
      width="151"
      height="88"
      rx="6"
      fill={theme.surface}
    />

    {[99, 119, 139, 159].map((y) => (
      <path
        key={y}
        d={`M76 ${y} H209`}
        stroke={theme.muted}
        strokeOpacity="0.12"
      />
    ))}

    <polyline
      points="77,149 98,134 119,141 140,111 160,124 181,97 207,105"
      fill="none"
      stroke={theme.accent}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <rect
      x="226"
      y="80"
      width="83"
      height="88"
      rx="6"
      fill={theme.surface}
    />

    {[24, 43, 32, 58, 46].map((height, index) => (
      <rect
        key={index}
        x={237 + index * 12}
        y={158 - height}
        width="8"
        height={height}
        rx="2"
        fill={theme.accent}
        opacity={0.55 + index * 0.1}
      />
    ))}
  </>
);

/* =========================================================
   AI CHAT PREVIEW
========================================================= */

const ChatPreview: FC<{
  theme: PreviewTheme;
}> = ({ theme }) => (
  <>
    <rect
      x="10"
      y="34"
      width="75"
      height="134"
      rx="6"
      fill={theme.surface}
    />

    <rect
      x="18"
      y="44"
      width="59"
      height="16"
      rx="4"
      fill={theme.accent}
      opacity="0.2"
    />

    {[73, 87, 101, 115].map((y) => (
      <rect
        key={y}
        x="19"
        y={y}
        width="48"
        height="4"
        rx="2"
        fill={theme.muted}
        opacity="0.5"
      />
    ))}

    <rect
      x="173"
      y="45"
      width="126"
      height="23"
      rx="8"
      fill={theme.surface}
    />

    <rect
      x="184"
      y="54"
      width="103"
      height="4"
      rx="2"
      fill={theme.muted}
      opacity="0.6"
    />

    <circle
      cx="106"
      cy="86"
      r="9"
      fill={theme.accent}
      opacity="0.9"
    />

    {[80, 90, 100, 110].map((y, index) => (
      <rect
        key={y}
        x="124"
        y={y}
        width={index === 3 ? 97 : 165}
        height="4"
        rx="2"
        fill={theme.muted}
        opacity="0.55"
      />
    ))}

    <rect
      x="97"
      y="141"
      width="212"
      height="26"
      rx="8"
      fill={theme.surface}
      stroke={theme.accent}
      strokeOpacity="0.3"
    />

    <rect
      x="107"
      y="152"
      width="102"
      height="4"
      rx="2"
      fill={theme.muted}
      opacity="0.5"
    />

    <circle
      cx="295"
      cy="154"
      r="8"
      fill={theme.accent}
    />
  </>
);

/* =========================================================
   STORE AND COURSE GALLERY PREVIEW
========================================================= */

const StorePreview: FC<{
  theme: PreviewTheme;
}> = ({ theme }) => (
  <>
    <rect
      x="16"
      y="35"
      width="288"
      height="36"
      rx="6"
      fill={theme.surface}
    />

    <rect
      x="28"
      y="46"
      width="118"
      height="8"
      rx="3"
      fill={theme.text}
      opacity="0.8"
    />

    <rect
      x="28"
      y="59"
      width="81"
      height="4"
      rx="2"
      fill={theme.muted}
      opacity="0.7"
    />

    <circle
      cx="262"
      cy="53"
      r="15"
      fill={theme.accent}
      opacity="0.3"
    />

    {[16, 114, 212].map((x, index) => (
      <g key={x}>
        <rect
          x={x}
          y="80"
          width="92"
          height="87"
          rx="5"
          fill={theme.surface}
        />

        <rect
          x={x + 6}
          y="86"
          width="80"
          height="52"
          rx="4"
          fill={theme.accent}
          opacity={0.1 + index * 0.07}
        />

        <circle
          cx={x + 46}
          cy="112"
          r={14 + index * 2}
          fill={theme.accent}
          opacity="0.4"
        />

        <rect
          x={x + 9}
          y="146"
          width="47"
          height="4"
          rx="2"
          fill={theme.text}
          opacity="0.7"
        />

        <rect
          x={x + 9}
          y="156"
          width="29"
          height="3"
          rx="1.5"
          fill={theme.muted}
        />
      </g>
    ))}
  </>
);

/* =========================================================
   KANBAN BOARD PREVIEW
========================================================= */

const BoardPreview: FC<{
  theme: PreviewTheme;
}> = ({ theme }) => (
  <>
    {[12, 112, 212].map((x, index) => (
      <g key={x}>
        <rect
          x={x}
          y="35"
          width="96"
          height="133"
          rx="6"
          fill={theme.surface}
        />

        <circle
          cx={x + 12}
          cy="47"
          r="4"
          fill={theme.accent}
          opacity={0.55 + index * 0.2}
        />

        <rect
          x={x + 21}
          y="45"
          width="46"
          height="4"
          rx="2"
          fill={theme.text}
          opacity="0.65"
        />

        {[59, 94, 129].map((y) => (
          <g key={y}>
            <rect
              x={x + 7}
              y={y}
              width="82"
              height="29"
              rx="4"
              fill={theme.accent}
              opacity="0.12"
            />

            <rect
              x={x + 14}
              y={y + 7}
              width="48"
              height="4"
              rx="2"
              fill={theme.text}
              opacity="0.65"
            />

            <rect
              x={x + 14}
              y={y + 17}
              width="30"
              height="5"
              rx="2"
              fill={theme.accent}
              opacity="0.6"
            />
          </g>
        ))}
      </g>
    ))}
  </>
);

/* =========================================================
   CREATIVE PORTFOLIO PREVIEW
========================================================= */

const PortfolioPreview: FC<{
  theme: PreviewTheme;
}> = ({ theme }) => (
  <>
    <text
      x="20"
      y="68"
      fontSize="23"
      fontWeight="700"
      letterSpacing="-1"
      fill={theme.text}
    >
      Creative
    </text>

    <text
      x="20"
      y="92"
      fontSize="23"
      fontWeight="700"
      letterSpacing="-1"
      fill={theme.accent}
    >
      by design.
    </text>

    <rect
      x="21"
      y="104"
      width="115"
      height="4"
      rx="2"
      fill={theme.muted}
    />

    <circle
      cx="247"
      cy="77"
      r="41"
      fill={theme.accent}
      opacity="0.17"
    />

    <circle
      cx="247"
      cy="77"
      r="26"
      fill={theme.accent}
      opacity="0.55"
    />

    <rect
      x="232"
      y="62"
      width="30"
      height="30"
      rx="6"
      fill={theme.accent}
      transform="rotate(25 247 77)"
    />

    {[20, 118, 216].map((x, index) => (
      <rect
        key={x}
        x={x}
        y="130"
        width="84"
        height="36"
        rx="5"
        fill={theme.accent}
        opacity={0.12 + index * 0.1}
      />
    ))}
  </>
);

/* =========================================================
   GENERATED DESIGN CONCEPT

   This is a visual representation of a template's
   design direction, not an actual website screenshot.
========================================================= */

const TemplateArtwork: FC<{
  template: DiscoveryTemplate;
}> = ({ template }) => {
  const theme = getPreviewTheme(
    template.category,
  );

  const name =
    template.name.length > 25
      ? `${template.name.slice(0, 24)}…`
      : template.name;

  return (
    <svg
      viewBox="0 0 320 180"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}

      <rect
        width="320"
        height="180"
        fill={theme.background}
      />

      {/* Miniature application navigation */}

      <circle
        cx="18"
        cy="18"
        r="5"
        fill={theme.accent}
      />

      <text
        x="29"
        y="21"
        fill={theme.text}
        fontSize="9"
        fontWeight="600"
      >
        {name}
      </text>

      <rect
        x="223"
        y="16"
        width="23"
        height="3"
        rx="1.5"
        fill={theme.muted}
        opacity="0.55"
      />

      <rect
        x="258"
        y="11"
        width="49"
        height="13"
        rx="4"
        fill={theme.accent}
      />

      {/* Category-specific design */}

      {theme.layout === "landing" && (
        <LandingPreview
          theme={theme}
          name={name}
        />
      )}

      {theme.layout === "dashboard" && (
        <DashboardPreview theme={theme} />
      )}

      {theme.layout === "chat" && (
        <ChatPreview theme={theme} />
      )}

      {theme.layout === "store" && (
        <StorePreview theme={theme} />
      )}

      {theme.layout === "board" && (
        <BoardPreview theme={theme} />
      )}

      {theme.layout === "portfolio" && (
        <PortfolioPreview theme={theme} />
      )}
    </svg>
  );
};

/* =========================================================
   TEMPLATE THUMBNAIL

   Prefer a real thumbnail when available.
   Automatically fall back to an original design concept.
========================================================= */

const TemplateThumbnail: FC<{
  template: DiscoveryTemplate;
}> = ({ template }) => {
  const [failed, setFailed] =
    useState(false);

  const source = template.thumbnail?.trim();

  const hasImage =
    Boolean(source) && !failed;

  return (
    <>
      {hasImage && source ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => {
            setFailed(true);
          }}
          className="
            h-full
            w-full
            object-cover
            object-top
          "
        />
      ) : (
        <TemplateArtwork
          template={template}
        />
      )}

      {!hasImage && (
        <span
          className="
            pointer-events-none
            absolute
            bottom-2
            left-2
            rounded-md
            bg-black/75
            px-2
            py-1
            text-[9px]
            font-medium
            text-white
          "
        >
          Design concept
        </span>
      )}
    </>
  );
};

/* =========================================================
   MAIN TEMPLATE CARD
========================================================= */

const TemplateCard: FC<
  TemplateCardProps
> = ({
  template,
  isDark,
  onSelect,
}) => {
  /* =======================================================
     TEMPLATE METADATA
  ======================================================= */

  const categoryLabel =
    TEMPLATE_CATEGORY_LABELS[
      template.category
    ];

  const difficulty =
    template.difficulty
      ? template.difficulty.charAt(0).toUpperCase() +
        template.difficulty.slice(1)
      : null;

  /* =======================================================
     THEME COLORS
  ======================================================= */

  const colors = isDark
    ? {
        border: "border-white/[0.09]",

        title: "text-[#f0f0f0]",

        muted: "text-[#a3a3a3]",

        description: "text-[#b5b5b5]",

        surface: "bg-[#242424]",

        action: "text-[#dedede]",

        hover: "group-hover:text-white",

        actionHover:
          "group-hover:bg-[#2455e6] group-hover:text-white",
      }
    : {
        border: "border-slate-200",

        title: "text-slate-900",

        muted: "text-slate-500",

        description: "text-slate-600",

        surface: "bg-white",

        action: "text-slate-700",

        hover: "group-hover:text-slate-950",

        actionHover:
          "group-hover:bg-[#2455e6] group-hover:text-white",
      };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article className="h-full min-w-0">
      <button
        type="button"
        aria-label={`Use ${template.name} template`}
        onClick={() => {
          onSelect(template);
        }}
        className="
          group
          flex
          h-full
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
            TEMPLATE VISUAL PREVIEW
        =============================================== */}

        <span
          className={`
            relative
            isolate
            block
            aspect-video
            w-full
            overflow-hidden
            rounded-12px
            border

            transition-shadow
            duration-300
            group-hover:shadow-lg
            motion-reduce:transition-none

            ${colors.border}
            ${colors.surface}
          `}
        >
          <span
            className="
              block
              h-full
              w-full

              transition-transform
              duration-300
              ease-out

              group-hover:scale-[1.025]

              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          >
            <TemplateThumbnail
              key={`${template.id}:${template.thumbnail || ""}`}
              template={template}
            />
          </span>

          {/* FEATURED TEMPLATE */}

          {template.featured && (
            <span
              className="
                absolute
                left-2.5
                top-2.5
                rounded-md
                border
                border-white/15
                bg-[#171717]
                px-2
                py-1
                text-[10px]
                font-medium
                text-white
              "
            >
              Featured
            </span>
          )}

          {/* OPEN ACTION ICON */}

          <span
            aria-hidden="true"
            className="
              absolute
              right-2.5
              top-2.5

              flex
              h-8
              w-8
              translate-y-1
              items-center
              justify-center

              rounded-lg
              border
              border-white/15
              bg-[#171717]
              text-white

              opacity-0
              transition-all
              duration-200

              group-hover:translate-y-0
              group-hover:opacity-100

              group-focus-visible:translate-y-0
              group-focus-visible:opacity-100

              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          >
            <ArrowUpRight
              size={15}
              strokeWidth={1.8}
            />
          </span>
        </span>

        {/* ===============================================
            TEMPLATE INFORMATION
        =============================================== */}

        <span
          className="
            flex
            w-full
            min-w-0
            flex-1
            flex-col

            px-1
            pb-1
            pt-3
          "
        >
          {/* TEMPLATE NAME */}

          <span
            title={template.name}
            className={`
              block
              truncate
              text-[14px]
              font-semibold
              leading-5
              tracking-[-0.02em]

              sm:text-[15px]

              ${colors.title}
              ${colors.hover}
            `}
          >
            {template.name}
          </span>

          {/* CATEGORY AND DIFFICULTY */}

          <span
            className={`
              mt-1
              flex
              flex-wrap
              items-center
              gap-1.5
              text-[11px]
              leading-4

              ${colors.muted}
            `}
          >
            <span>{categoryLabel}</span>

            {difficulty && (
              <>
                <span aria-hidden="true">
                  ·
                </span>

                <span>{difficulty}</span>
              </>
            )}
          </span>

          {/* TEMPLATE DESCRIPTION */}

          <span
            className={`
              mt-2
              line-clamp-2
              text-[12px]
              leading-[1.65]

              ${colors.description}
            `}
          >
            {template.description}
          </span>

          {/* TECHNOLOGY STACK */}

          {Boolean(template.technologies?.length) && (
            <span
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-1.5
              "
            >
              {template.technologies
                ?.slice(0, 3)
                .map((technology) => (
                  <span
                    key={technology}
                    className={`
                      rounded-md
                      border
                      px-2
                      py-1

                      text-[10px]
                      font-medium

                      ${colors.border}
                      ${colors.muted}
                    `}
                  >
                    {technology}
                  </span>
                ))}
            </span>
          )}

          {/* PUSH ACTION TO CARD BOTTOM */}

          <span className="flex-1" />

          {/* =============================================
              USE TEMPLATE ACTION
          ============================================= */}

          <span
            className={`
              mt-4
              flex
              h-9
              w-full
              items-center
              justify-center
              gap-2

              rounded-8px
              border
              px-3

              text-[12px]
              font-medium

              transition-colors
              duration-200

              group-focus-visible:bg-[#2455e6]
              group-focus-visible:text-white

              motion-reduce:transition-none

              ${colors.border}
              ${colors.surface}
              ${colors.action}
              ${colors.actionHover}
            `}
          >
            Use template

            <ArrowUpRight
              size={14}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>
        </span>
      </button>
    </article>
  );
};

export default TemplateCard;

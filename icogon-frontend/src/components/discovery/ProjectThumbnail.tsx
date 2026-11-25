import {

  useState,

  type FC,

} from "react";



import {

  ArrowUpRight,

} from "lucide-react";



import type {

  ProjectThumbnailProps,

} from "./types";

import { useAuthStore } from "../../store/authStore";

import { useProjectThumbnail } from "../../utils/projectThumbnails";




/* =========================================================

   THUMBNAIL TYPES

========================================================= */



interface ThumbnailImageProps {

  projectName: string;

  sources: string[];

  isDark: boolean;

  palette: ThumbnailPalette;

}



interface ThumbnailPalette {

  background: string;

  accent: string;

  glow: string;

  tile: string;

  border: string;

}



/* =========================================================

   DARK THUMBNAIL PALETTES

========================================================= */



const DARK_PALETTES: ThumbnailPalette[] = [

  {

    background: "#151f30",

    accent: "#93c5fd",

    glow: "#2563eb",

    tile: "#233753",

    border: "#38577e",

  },

  {

    background: "#211a2e",

    accent: "#c4b5fd",

    glow: "#7c3aed",

    tile: "#36294a",

    border: "#57416d",

  },

  {

    background: "#122622",

    accent: "#6ee7b7",

    glow: "#059669",

    tile: "#1b3b32",

    border: "#315c4c",

  },

  {

    background: "#2b211a",

    accent: "#fdba74",

    glow: "#ea580c",

    tile: "#423024",

    border: "#684630",

  },

  {

    background: "#15272c",

    accent: "#67e8f9",

    glow: "#0891b2",

    tile: "#203b43",

    border: "#355760",

  },

];



/* =========================================================

   LIGHT THUMBNAIL PALETTES

========================================================= */



const LIGHT_PALETTES: ThumbnailPalette[] = [

  {

    background: "#eff6ff",

    accent: "#2563eb",

    glow: "#93c5fd",

    tile: "#dbeafe",

    border: "#bfdbfe",

  },

  {

    background: "#f5f3ff",

    accent: "#7c3aed",

    glow: "#c4b5fd",

    tile: "#ede9fe",

    border: "#ddd6fe",

  },

  {

    background: "#ecfdf5",

    accent: "#059669",

    glow: "#6ee7b7",

    tile: "#d1fae5",

    border: "#a7f3d0",

  },

  {

    background: "#fff7ed",

    accent: "#c2410c",

    glow: "#fdba74",

    tile: "#ffedd5",

    border: "#fed7aa",

  },

  {

    background: "#ecfeff",

    accent: "#0891b2",

    glow: "#67e8f9",

    tile: "#cffafe",

    border: "#a5f3fc",

  },

];



/* =========================================================

   DETERMINISTIC PROJECT COLOR



   Every project receives a consistent color based on

   its ID. Colors remain stable across browser refreshes.

========================================================= */



const getPalette = (

  projectId: string,

  isDark: boolean,

): ThumbnailPalette => {

  let hash = 0;



  for (

    let index = 0;

    index < projectId.length;

    index += 1

  ) {

    hash =

      (hash * 31 +

        projectId.charCodeAt(index)) >>> 0;

  }



  const palettes = isDark

    ? DARK_PALETTES

    : LIGHT_PALETTES;



  return palettes[hash % palettes.length]!;

};



/* =========================================================

   IMAGE SOURCE VALIDATION

========================================================= */



const isSupportedImageSource = (

  source: unknown,

): source is string => {

  if (

    typeof source !== "string" ||

    !source.trim()

  ) {

    return false;

  }



  const value = source.trim();



  // Remote screenshots.

  if (/^https?:\/\//i.test(value)) {

    return true;

  }



  // Local application assets.

  if (

    value.startsWith("/") &&

    !value.startsWith("//")

  ) {

    return true;

  }



  // Browser-generated screenshot.

  if (value.startsWith("blob:")) {

    return true;

  }



  // Embedded raster images.

  return /^data:image\/(?:png|jpe?g|webp|gif|avif);base64,/i.test(

    value,

  );

};



/* =========================================================

   PROJECT INITIAL

========================================================= */



const getProjectInitial = (

  name: string,

): string => {

  return (

    Array.from(name.trim())[0]?.toUpperCase() ||

    "I"

  );

};



/* =========================================================

   FALLBACK THUMBNAIL

========================================================= */



const FallbackThumbnail: FC<{

  projectName: string;

  isDark: boolean;

  palette: ThumbnailPalette;

}> = ({

  projectName,

  isDark,

  palette,

}) => {

  return (

    <div

      className="

        relative

        flex

        h-full

        w-full

        items-center

        justify-center

        overflow-hidden

      "

      style={{

        background: palette.background,

      }}

    >

      {/* ===============================================

          AMBIENT PROJECT GLOW

      =============================================== */}



      <div

        aria-hidden="true"

        className="

          pointer-events-none

          absolute

          inset-0

        "

        style={{

          background: `

            radial-gradient(

              ellipse at 50% 90%,

              ${palette.glow}35,

              transparent 70%

            )

          `,

        }}

      />



      {/* ===============================================

          SUBTLE GRID TEXTURE

      =============================================== */}



      <div

        aria-hidden="true"

        className="

          pointer-events-none

          absolute

          inset-0

        "

        style={{

          backgroundImage: `

            linear-gradient(

              ${palette.accent}0b 1px,

              transparent 1px

            ),

            linear-gradient(

              90deg,

              ${palette.accent}0b 1px,

              transparent 1px

            )

          `,

          backgroundSize: "24px 24px",

        }}

      />



      {/* ===============================================

          PROJECT IDENTITY

      =============================================== */}



      <div

        className="

          relative

          z-10

          flex

          min-w-0

          max-w-full

          flex-col

          items-center

          justify-center

          px-5

          text-center

        "

      >

        <div

          aria-hidden="true"

          className="

            flex

            h-12

            w-12

            shrink-0

            items-center

            justify-center

            rounded-[14px]

            border

            text-[24px]

            font-semibold

            tracking-tight

            shadow-sm



            transition-transform

            duration-300

            ease-out



            group-hover:scale-105



            motion-reduce:transform-none



            sm:h-14

            sm:w-14

            sm:text-[28px]

          "

          style={{

            background: palette.tile,

            color: palette.accent,

            borderColor: palette.border,

          }}

        >

          {getProjectInitial(projectName)}

        </div>



        <p

          className={`

            mt-3

            max-w-full

            truncate

            text-[13px]

            font-medium

            tracking-[-0.02em]



            ${

              isDark

                ? "text-[#ededed]"

                : "text-slate-800"

            }

          `}

        >

          {projectName}

        </p>



        <p

          className={`

            mt-1

            text-[11px]



            ${

              isDark

                ? "text-slate-400"

                : "text-slate-500"

            }

          `}

        >

          Preview not available

        </p>

      </div>

    </div>

  );

};



/* =========================================================

   SCREENSHOT LOADING STATE

========================================================= */



const ThumbnailSkeleton: FC<{

  isDark: boolean;

}> = ({ isDark }) => (

  <div

    role="status"

    aria-label="Loading project preview"

    className={`

      absolute

      inset-0

      z-10

      flex

      items-center

      justify-center



      ${

        isDark

          ? "bg-[#222222]"

          : "bg-slate-100"

      }

    `}

  >

    <div

      className="

        flex

        w-[65%]

        flex-col

        items-center

        gap-3

        motion-safe:animate-pulse

      "

    >

      <div

        className={`

          h-11

          w-11

          rounded-xl



          ${

            isDark

              ? "bg-white/[0.07]"

              : "bg-slate-200"

          }

        `}

      />



      <div

        className={`

          h-2.5

          w-2/3

          rounded-full



          ${

            isDark

              ? "bg-white/[0.07]"

              : "bg-slate-200"

          }

        `}

      />



      <div

        className={`

          h-2

          w-1/2

          rounded-full



          ${

            isDark

              ? "bg-white/0.05"

              : "bg-slate-200/70"

          }

        `}

      />

    </div>

  </div>

);



/* =========================================================

   INDIVIDUAL IMAGE



   Remounting this component whenever the source changes

   automatically resets its loading state.

========================================================= */



const ScreenshotImage: FC<{

  source: string;

  projectName: string;

  isDark: boolean;

  onError: () => void;

}> = ({

  source,

  projectName,

  isDark,

  onError,

}) => {

  const [loaded, setLoaded] =

    useState(false);



  return (

    <>

      {!loaded && (

        <ThumbnailSkeleton

          isDark={isDark}

        />

      )}



      <img

        src={source}

        alt={`${projectName} website preview`}

        loading="lazy"

        decoding="async"

        draggable={false}

        onLoad={() => {

          setLoaded(true);

        }}

        onError={onError}

        className={`

          h-full

          w-full

          object-cover

          object-top



          transition-[opacity,transform]

          duration-300

          ease-out



          group-hover:scale-[1.025]



          motion-reduce:transform-none

          motion-reduce:transition-none



          ${loaded ? "opacity-100" : "opacity-0"}

        `}

      />

    </>

  );

};



/* =========================================================

   IMAGE SOURCE FALLBACK ENGINE

========================================================= */



const ThumbnailImage: FC<

  ThumbnailImageProps

> = ({

  projectName,

  sources,

  isDark,

  palette,

}) => {

  const [sourceIndex, setSourceIndex] =

    useState(0);



  const currentSource =

    sources[sourceIndex];



  /* =======================================================

     NO SCREENSHOT AVAILABLE

  ======================================================= */



  if (!currentSource) {

    return (

      <FallbackThumbnail

        projectName={projectName}

        isDark={isDark}

        palette={palette}

      />

    );

  }



  /* =======================================================

     DISPLAY SCREENSHOT

  ======================================================= */



  return (

    <ScreenshotImage

      key={currentSource}

      source={currentSource}

      projectName={projectName}

      isDark={isDark}

      onError={() => {

        setSourceIndex((current) =>

          current === sourceIndex

            ? current + 1

            : current,

        );

      }}

    />

  );

};



/* =========================================================

   MAIN PROJECT THUMBNAIL COMPONENT

========================================================= */



const ProjectThumbnail: FC<

  ProjectThumbnailProps

> = ({

  project,

  isDark,

  className = "",

}) => {

  /* =======================================================
     SHARED THUMBNAIL FROM PROJECTS PAGE

     Uses the existing per-user + per-project storage key.
     The shared hook updates images across mounted pages and
     other browser tabs without copying image data into state.
  ======================================================= */

  const currentUserId = useAuthStore(

    (state) => state.user?.id,

  );

  const sharedThumbnail = useProjectThumbnail(

    project,

    currentUserId,

  );

  const palette = getPalette(

    project.id,

    isDark,

  );



  /* =======================================================

     SCREENSHOT SOURCE PRIORITY

  ======================================================= */



  const sources = Array.from(

    new Set(

      [

        // User-uploaded photo always wins over backend screenshots.
        sharedThumbnail,

        project.preview_image_url,

        project.thumbnail_url,

        project.screenshot_url,

      ]

        .filter(isSupportedImageSource)

        .map((source) => source.trim()),

    ),

  );



  /* =======================================================

     RENDER

  ======================================================= */



  return (

    <div

      className={`

        group



        relative

        isolate



        aspect-video

        w-full

        min-w-0



        overflow-hidden

        rounded-[12px]

        border



        transition-colors

        duration-200



        motion-reduce:transition-none



        ${

          isDark

            ? `

              border-white/[0.08]

              bg-[#202020]

              group-hover:border-white/20

              hover:border-white/20

            `

            : `

              border-slate-200

              bg-slate-100

              group-hover:border-slate-300

              hover:border-slate-300

            `

        }



        ${className}

      `}

    >

      {/* ===============================================

          WEBSITE SCREENSHOT OR FALLBACK

      =============================================== */}



      <ThumbnailImage

        key={`${project.id}:${JSON.stringify(sources)}`}

        projectName={project.name}

        sources={sources}

        isDark={isDark}

        palette={palette}

      />



      {/* ===============================================

          PROJECT OPEN INDICATOR



          The parent ProjectCard controls navigation.

      =============================================== */}



      <span

        aria-hidden="true"

        className={`

          pointer-events-none



          absolute

          right-2.5

          top-2.5

          z-20



          flex

          h-8

          w-8

          items-center

          justify-center



          translate-y-1

          rounded-lg

          border



          opacity-0

          shadow-sm



          transition-all

          duration-200

          ease-out



          group-hover:translate-y-0

          group-hover:opacity-100



          group-focus-within:translate-y-0

          group-focus-within:opacity-100



          motion-reduce:transform-none

          motion-reduce:transition-none



          ${

            isDark

              ? `

                border-white/15

                bg-[#171717]

                text-white

              `

              : `

                border-slate-200

                bg-white

                text-slate-700

              `

          }

        `}

      >

        <ArrowUpRight

          size={16}

          strokeWidth={1.8}

        />

      </span>

    </div>

  );

};



export default ProjectThumbnail;

import React from "react";

import {
  ArrowRight,
  Clock3,
  MoreHorizontal,
} from "lucide-react";

import type {
  ProjectResponse,
} from "../../api/projectApi";


interface ProjectCardProps {
  project: ProjectResponse;
  onOpen: (projectId: string) => void;
}


const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
}) => {

  const formattedDate = project.updated_at
    ? new Date(
        project.updated_at
      ).toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      )
    : project.created_at
      ? new Date(
          project.created_at
        ).toLocaleDateString(
          undefined,
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        )
      : "Recently";


  return (

    <div
      className="
        group

        relative

        overflow-hidden

        rounded-2xl

        border
        border-white/[0.07]

        bg-[#0a0a0a]

        p-5

        transition-all
        duration-200

        hover:-translate-y-1
        hover:border-cyan-500/20
        hover:bg-[#0d0d0d]
      "
    >

      {/* TOP */}

      <div
        className="
          flex
          items-start
          justify-between
        "
      >

        {/* PROJECT ICON */}

        <div
          className="
            flex
            h-11
            w-11

            items-center
            justify-center

            rounded-xl

            border
            border-cyan-500/10

            bg-cyan-500/[0.06]

            text-sm
            font-semibold

            text-cyan-400
          "
        >
          {project.name
            ?.charAt(0)
            ?.toUpperCase() || "P"}
        </div>


        {/* MENU */}

        <button
          type="button"
          className="
            rounded-lg

            p-1.5

            text-slate-600

            transition

            hover:bg-white/[0.04]
            hover:text-slate-400
          "
        >
          <MoreHorizontal size={17} />
        </button>

      </div>


      {/* PROJECT NAME */}

      <h3
        className="
          mt-5

          truncate

          text-sm
          font-semibold

          text-white
        "
      >
        {project.name}
      </h3>


      {/* DESCRIPTION */}

      <p
        className="
          mt-2

          min-h-[40px]

          line-clamp-2

          text-xs
          leading-5

          text-slate-600
        "
      >
        {project.description ||
          "No project description"}
      </p>


      {/* FOOTER */}

      <div
        className="
          mt-5

          flex
          items-center
          justify-between

          border-t
          border-white/[0.05]

          pt-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-1.5

            text-[11px]

            text-slate-700
          "
        >
          <Clock3 size={12} />

          {formattedDate}
        </div>


        <button
          type="button"
          onClick={() => onOpen(project.id)}
          className="
            flex
            items-center
            gap-1

            text-xs
            font-medium

            text-slate-500

            transition

            group-hover:text-cyan-400
          "
        >
          Open

          <ArrowRight
            size={13}
            className="
              transition

              group-hover:translate-x-0.5
            "
          />

        </button>

      </div>

    </div>

  );
};


export default ProjectCard;
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ResourceItem } from "../../data/resourcesData";

interface ResourceCardProps {
  resource: ResourceItem;
}

const ResourceCard = ({
  resource,
}: ResourceCardProps) => {
  const Icon = resource.icon;

  return (
    <Link
      to={resource.path}
      className="
        group
        block
        rounded-xl
        px-1
        py-3
        transition-all
        duration-200
        hover:bg-slate-50
      "
    >
      <div className="flex items-start gap-2.5">

        <Icon
          size={16}
          strokeWidth={1.7}
          className="
            mt-[2px]
            shrink-0
            text-slate-500
            transition-colors
            group-hover:text-slate-900
          "
        />

        <div className="min-w-0">

          <div className="flex items-center gap-1.5">

            <h3
              className="
                text-[16px]
                font-semibold
                leading-tight
                tracking-tight
                text-slate-950
              "
            >
              {resource.title}
            </h3>

            <ArrowUpRight
              size={13}
              className="
                text-slate-300
                opacity-0
                transition-all
                duration-200
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
                group-hover:text-slate-700
                group-hover:opacity-100
              "
            />

          </div>

          <p
            className="
              mt-1
              text-[13px]
              leading-[1.35]
              text-slate-500
            "
          >
            {resource.description}
          </p>

        </div>

      </div>
    </Link>
  );
};

export default ResourceCard;
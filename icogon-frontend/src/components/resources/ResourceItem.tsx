import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { ResourceItem as ResourceItemType } from "../../data/resourcesData";

interface ResourceItemProps {
  resource: ResourceItemType;
  onClose?: () => void;
}

const ResourceItem = ({
  resource,
  onClose,
}: ResourceItemProps) => {
  const Icon = resource.icon;

  return (
    <Link
      to={resource.path}
      onClick={onClose}
      className="
        group
        flex
        items-start
        gap-3.5
        rounded-2xl
        px-3
        py-3
        transition-all
        duration-200
        hover:bg-slate-100/80
      "
    >
      {/* ICON */}
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-700
          shadow-sm
          transition-all
          duration-200
          group-hover:border-slate-300
          group-hover:shadow
        "
      >
        <Icon
          size={18}
          strokeWidth={1.7}
        />
      </div>

      {/* TEXT */}
      <div className="min-w-0 flex-1 pt-[1px]">
        <div className="flex items-center gap-1.5">
          <h3
            className="
              text-[14px]
              font-semibold
              tracking-[-0.01em]
              text-slate-900
            "
          >
            {resource.title}
          </h3>

          <ArrowUpRight
            size={14}
            strokeWidth={1.8}
            className="
              translate-x-[-3px]
              translate-y-[2px]
              opacity-0
              text-slate-500
              transition-all
              duration-200
              group-hover:translate-x-0
              group-hover:opacity-100
            "
          />
        </div>

        <p
          className="
            mt-1
            text-[12px]
            leading-[1.45]
            text-slate-500
          "
        >
          {resource.description}
        </p>
      </div>
    </Link>
  );
};

export default ResourceItem;
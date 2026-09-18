import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { announcementData } from "../../data/resourcesData";

const AnnouncementCard = () => {
  return (
    <aside
      className="
        bg-[#f7f4ee]
        px-6
        py-7
      "
    >

      {/* LABEL */}

      <div
        className="
          mb-5
          text-[13px]
          font-medium
          text-slate-600
        "
      >
        {announcementData.label}
      </div>


      {/* IMAGE */}

      <Link
        to={announcementData.path}
        className="
          group
          block
          overflow-hidden
          rounded-xl
        "
      >

        <img
          src={announcementData.image}
          alt={announcementData.title}
          className="
            aspect-[16/9]
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.025]
          "
        />

      </Link>


      {/* TITLE */}

      <h2
        className="
          mt-5
          text-[17px]
          font-semibold
          leading-[1.25]
          tracking-tight
          text-slate-950
        "
      >
        {announcementData.title}
      </h2>


      {/* ACTION */}

      <Link
        to={announcementData.path}
        className="
          group
          mt-4
          inline-flex
          items-center
          gap-2
          text-[14px]
          font-medium
          text-slate-500
          transition-colors
          hover:text-slate-950
        "
      >
        {announcementData.action}

        <ArrowRight
          size={15}
          className="
            transition-transform
            duration-200
            group-hover:translate-x-1
          "
        />

      </Link>

    </aside>
  );
};

export default AnnouncementCard;
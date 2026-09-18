import { motion } from "framer-motion";

import ResourceItem from "./ResourceItem";
import AnnouncementCard from "./AnnouncementCard";
import { resourcesData } from "../../data/resourcesData";

interface ResourcesMegaMenuProps {
  onClose: () => void;
}

const ResourcesMegaMenu = ({
  onClose,
}: ResourcesMegaMenuProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -8,
        scale: 0.985,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className="
        absolute
        left-1/2
        top-[72px]
        z-[60]
        w-[min(1100px,calc(100vw-32px))]
        -translate-x-1/2
      "
    >
      <div
        className="
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200
          bg-white
          shadow-[0_24px_70px_rgba(15,23,42,0.16)]
        "
      >
        <div className="grid grid-cols-[1.7fr_0.9fr]">

          {/* =====================================================
              LEFT — RESOURCES
          ===================================================== */}

          <div className="px-7 py-7">

            <div className="mb-4 px-3">
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                Resources
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {resourcesData.map((resource) => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  onClose={onClose}
                />
              ))}
            </div>

          </div>

          {/* =====================================================
              RIGHT — ANNOUNCEMENT
          ===================================================== */}

          <AnnouncementCard />

        </div>
      </div>
    </motion.div>
  );
};

export default ResourcesMegaMenu;
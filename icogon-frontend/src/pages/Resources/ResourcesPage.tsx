import { resourcesData } from "../../data/resourcesData";
import ResourceCard from "../../components/resources/ResourceCard";
import AnnouncementCard from "../../components/resources/AnnouncementCard";

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-950">

      {/* =====================================================
          RESOURCES CONTAINER
      ===================================================== */}

      <main className="flex min-h-screen items-start justify-center px-4 pt-[58px]">

        <section
          className="
            w-full
            max-w-[860px]
            overflow-hidden
            rounded-[22px]
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              grid
              grid-cols-[1.9fr_0.9fr]
            "
          >

            {/* =================================================
                RESOURCES
            ================================================= */}

            <div
              className="
                px-8
                py-7
              "
            >

              <div
                className="
                  mb-5
                  text-[13px]
                  font-medium
                  text-slate-600
                "
              >
                Resources
              </div>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-x-7
                  gap-y-1
                "
              >

                {resourcesData.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                  />
                ))}

              </div>

            </div>


            {/* =================================================
                ANNOUNCEMENT
            ================================================= */}

            <AnnouncementCard />

          </div>

        </section>

      </main>

    </div>
  );
};

export default ResourcesPage;
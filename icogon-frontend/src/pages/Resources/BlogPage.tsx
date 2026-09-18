import { ArrowRight, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const BlogPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-950">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        onLogin={() => navigate("/login")}
        onSignup={() => navigate("/signup")}
      />

      {/* Navbar fixed hai, isliye content ke liye space */}
      <div className="h-[72px]" />

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>
        <section className="mx-auto max-w-[1200px] px-6 pb-16 pt-20 lg:px-10">
          <div className="max-w-[760px]">
            {/* BLOG LABEL */}

            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-3.5
                py-2
                text-[12px]
                font-medium
                text-slate-600
                shadow-sm
              "
            >
              <BookOpen
                size={15}
                strokeWidth={1.8}
              />

              ICOGON Blog
            </div>

            {/* HEADING */}

            <h1
              className="
                text-[48px]
                font-semibold
                leading-[1.05]
                tracking-[-0.045em]
                text-slate-950
                sm:text-[58px]
                lg:text-[68px]
              "
            >
              Ideas, insights,
              <br />
              and stories.
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-6
                max-w-[650px]
                text-[17px]
                leading-7
                text-slate-500
              "
            >
              Explore the latest from ICOGON AI — product updates,
              AI development, practical guides, and stories from
              teams building with AI.
            </p>
          </div>
        </section>

        {/* =====================================================
            FEATURED ARTICLE
        ===================================================== */}

        <section className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <Link
            to="#"
            className="
              group
              grid
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200
              bg-white
              shadow-[0_12px_40px_rgba(15,23,42,0.06)]
              lg:grid-cols-[1.25fr_0.75fr]
            "
          >
            {/* IMAGE */}

            <div className="min-h-[320px] overflow-hidden bg-slate-100">
              <div
                className="
                  h-full
                  min-h-[320px]
                  bg-[linear-gradient(135deg,#e8e5df_0%,#f5f3ef_45%,#d9d6cf_100%)]
                  transition-transform
                  duration-500
                  group-hover:scale-[1.015]
                "
              />
            </div>

            {/* CONTENT */}

            <div className="flex flex-col justify-center px-8 py-10 lg:px-10">
              <span
                className="
                  text-[12px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                Featured
              </span>

              <h2
                className="
                  mt-4
                  text-[28px]
                  font-semibold
                  leading-[1.15]
                  tracking-[-0.025em]
                  text-slate-950
                "
              >
                Building the future with
                AI-powered development
              </h2>

              <p
                className="
                  mt-4
                  text-[14px]
                  leading-6
                  text-slate-500
                "
              >
                Discover how AI is changing the way modern
                teams design, build, and launch software.
              </p>

              <div
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  text-[14px]
                  font-medium
                  text-slate-700
                "
              >
                Read article

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </div>
            </div>
          </Link>
        </section>

        {/* =====================================================
            LATEST ARTICLES
        ===================================================== */}

        <section
          className="
            mx-auto
            max-w-[1200px]
            px-6
            pb-24
            pt-20
            lg:px-10
          "
        >
          <div>
            <p
              className="
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.1em]
                text-slate-400
              "
            >
              Latest
            </p>

            <h2
              className="
                mt-2
                text-[30px]
                font-semibold
                tracking-[-0.03em]
              "
            >
              From the ICOGON team
            </h2>
          </div>

          {/* ARTICLE GRID */}

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "What is AI-powered web development?",
                description:
                  "A practical look at building websites and applications with AI.",
                category: "AI",
              },
              {
                title: "From idea to application with ICOGON",
                description:
                  "How a simple idea can become a working product faster.",
                category: "Product",
              },
              {
                title: "Building better products with AI",
                description:
                  "Practical principles for teams adopting AI into their workflow.",
                category: "Insights",
              },
            ].map((article) => (
              <Link
                key={article.title}
                to="#"
                className="
                  group
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-slate-200
                  bg-white
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)]
                "
              >
                {/* ARTICLE IMAGE */}

                <div
                  className="
                    aspect-[16/9]
                    bg-[linear-gradient(135deg,#eeece7,#faf9f6)]
                  "
                />

                {/* ARTICLE CONTENT */}

                <div className="p-6">
                  <span
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-slate-400
                    "
                  >
                    {article.category}
                  </span>

                  <h3
                    className="
                      mt-3
                      text-[18px]
                      font-semibold
                      leading-[1.25]
                      tracking-[-0.015em]
                      text-slate-900
                    "
                  >
                    {article.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-[13px]
                      leading-5
                      text-slate-500
                    "
                  >
                    {article.description}
                  </p>

                  <div
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      text-[13px]
                      font-medium
                      text-slate-600
                    "
                  >
                    Read more

                    <ArrowRight
                      size={14}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogPage;
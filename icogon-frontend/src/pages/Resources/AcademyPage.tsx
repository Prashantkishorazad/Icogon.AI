import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Layers3,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

interface LearningPath {
  icon: typeof Sparkles;
  level: string;
  title: string;
  description: string;
  lessons: string;
}

const learningPaths: LearningPath[] = [
  {
    icon: Sparkles,
    level: "Beginner",
    title: "Getting Started",
    description:
      "Learn the basics of ICOGON and build your first AI-powered project.",
    lessons: "6 lessons",
  },
  {
    icon: Code2,
    level: "Beginner",
    title: "AI App Building",
    description:
      "Turn ideas into functional websites and applications using AI.",
    lessons: "8 lessons",
  },
  {
    icon: Layers3,
    level: "Intermediate",
    title: "Web Development",
    description:
      "Learn how to build, customize, and improve production-ready web experiences.",
    lessons: "10 lessons",
  },
  {
    icon: Zap,
    level: "Intermediate",
    title: "AI Automation",
    description:
      "Connect tools, automate workflows, and create smarter business systems.",
    lessons: "7 lessons",
  },
];

const featuredCourses = [
  {
    category: "START HERE",
    title: "Build your first project with ICOGON",
    description:
      "Go from a simple idea to your first AI-generated application.",
    duration: "25 min",
  },
  {
    category: "AI DEVELOPMENT",
    title: "Build better applications with AI",
    description:
      "Learn practical techniques for getting better results from AI-powered development.",
    duration: "40 min",
  },
  {
    category: "PRODUCT",
    title: "From prototype to production",
    description:
      "Understand the workflow for taking an AI-generated project further.",
    duration: "35 min",
  },
];

const AcademyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-slate-950">
      {/* NAVBAR */}
      <Navbar
        onLogin={() => navigate("/login")}
        onSignup={() => navigate("/signup")}
      />

      <div className="h-[72px]" />

      {/* HERO */}
      <main>
        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 lg:px-10 lg:pt-28">
          <div className="mx-auto max-w-[850px] text-center">
            {/* LABEL */}
            <div
              className="
                mx-auto mb-6 inline-flex items-center gap-2
                rounded-full border border-slate-200 bg-white
                px-4 py-2 text-[12px] font-medium text-slate-600 shadow-sm
              "
            >
              <GraduationCap size={15} strokeWidth={1.8} />
              ICOGON Academy
            </div>

            {/* HEADING */}
            <h1
              className="
                text-[48px] font-semibold leading-[1.02]
                tracking-[-0.05em] text-slate-950
                sm:text-[62px] lg:text-[76px]
              "
            >
              Learn.
              <br />
              Build. Master AI.
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mx-auto mt-7 max-w-[680px]
                text-[17px] leading-7 text-slate-500 sm:text-[18px]
              "
            >
              Learn how to build with ICOGON AI through practical lessons,
              guided learning paths, and hands-on tutorials.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#learning-paths"
                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-[#20242f] px-6 py-3.5 text-[14px] font-medium
                  text-white shadow-lg shadow-slate-900/15
                  transition-all hover:-translate-y-[1px] hover:bg-[#111827]
                "
              >
                Start learning
                <ArrowRight size={17} />
              </a>

              <Link
                to="/builder"
                className="
                  inline-flex items-center gap-2 rounded-xl
                  border border-slate-200 bg-white px-6 py-3.5
                  text-[14px] font-medium text-slate-700 shadow-sm
                  transition-all hover:bg-slate-50
                "
              >
                Start building
                <Sparkles size={16} />
              </Link>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div
            className="
              mt-20 overflow-hidden rounded-[30px]
              border border-slate-200 bg-white
              shadow-[0_20px_60px_rgba(15,23,42,0.08)]
            "
          >
            <div
              className="
                relative min-h-[360px] overflow-hidden
                bg-[linear-gradient(135deg,#e9e6df_0%,#faf9f6_48%,#ddd9d0_100%)]
                sm:min-h-[460px]
              "
            >
              {/* LEFT DECORATIVE CARD */}
              <div
                className="
                  absolute left-[7%] top-[18%] hidden w-[230px]
                  rotate-[-7deg] rounded-2xl border border-white/80
                  bg-white/65 p-5 shadow-xl backdrop-blur-xl sm:block
                "
              >
                <div className="h-2 w-20 rounded bg-slate-300" />

                <div className="mt-5 space-y-3">
                  <div className="h-2 w-full rounded bg-slate-200" />
                  <div className="h-2 w-[75%] rounded bg-slate-200" />
                  <div className="h-2 w-[90%] rounded bg-slate-200" />
                </div>
              </div>

              {/* RIGHT DECORATIVE CARD */}
              <div
                className="
                  absolute right-[7%] top-[17%] hidden w-[230px]
                  rotate-[7deg] rounded-2xl border border-white/80
                  bg-white/65 p-5 shadow-xl backdrop-blur-xl sm:block
                "
              >
                <div className="h-2 w-16 rounded bg-slate-300" />

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="h-16 rounded-lg bg-slate-200/80" />
                  <div className="h-16 rounded-lg bg-slate-100" />
                  <div className="h-16 rounded-lg bg-slate-100" />
                  <div className="h-16 rounded-lg bg-slate-200/80" />
                </div>
              </div>

              {/* CENTER LEARNING CARD */}
              <div
                className="
                  absolute left-1/2 top-1/2 w-[82%] max-w-[520px]
                  -translate-x-1/2 -translate-y-1/2 rounded-[24px]
                  border border-white bg-white/85 p-6
                  shadow-[0_25px_60px_rgba(15,23,42,0.15)]
                  backdrop-blur-xl sm:p-8
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0 items-center justify-center
                      rounded-xl bg-slate-900 text-white
                    "
                  >
                    <Play size={19} fill="currentColor" />
                  </div>

                  <div>
                    <p
                      className="
                        text-[11px] font-semibold uppercase
                        tracking-[0.08em] text-slate-400
                      "
                    >
                      Featured lesson
                    </p>

                    <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em]">
                      Build your first AI application
                    </h2>
                  </div>
                </div>

                <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[58%] rounded-full bg-slate-900" />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Lesson 4 of 7</span>
                  <span>58% complete</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LEARNING PATHS */}
        <section
          id="learning-paths"
          className="border-y border-slate-200/80 bg-white"
        >
          <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
            <div className="max-w-[680px]">
              <p
                className="
                  text-[12px] font-semibold uppercase
                  tracking-[0.1em] text-slate-400
                "
              >
                Learning paths
              </p>

              <h2
                className="
                  mt-3 text-[34px] font-semibold leading-tight
                  tracking-[-0.035em] sm:text-[42px]
                "
              >
                Learn at your own pace.
              </h2>

              <p className="mt-5 text-[16px] leading-7 text-slate-500">
                Follow a structured path or jump directly into the topic you
                want to learn.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {learningPaths.map((path) => {
                const Icon = path.icon;

                return (
                  <article
                    key={path.title}
                    className="
                      group rounded-[24px] border border-slate-200
                      bg-[#fbfaf8] p-7 transition-all duration-200
                      hover:-translate-y-1
                      hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)]
                    "
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div
                        className="
                          flex h-11 w-11 items-center justify-center
                          rounded-xl border border-slate-200
                          bg-white shadow-sm
                        "
                      >
                        <Icon size={20} strokeWidth={1.7} />
                      </div>

                      <span
                        className="
                          rounded-full border border-slate-200 bg-white
                          px-3 py-1.5 text-[10px] font-semibold
                          uppercase tracking-[0.08em] text-slate-400
                        "
                      >
                        {path.level}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-7 text-[20px] font-semibold
                        tracking-[-0.025em]
                      "
                    >
                      {path.title}
                    </h3>

                    <p className="mt-3 max-w-[500px] text-[14px] leading-6 text-slate-500">
                      {path.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[12px] font-medium text-slate-400">
                        {path.lessons}
                      </span>

                      <Link
                        to="/academy"
                        className="
                          inline-flex items-center gap-2
                          text-[13px] font-semibold text-slate-700
                        "
                      >
                        Explore
                        <ArrowRight
                          size={15}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED COURSES */}
        <section className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10">
          <div>
            <p
              className="
                text-[12px] font-semibold uppercase
                tracking-[0.1em] text-slate-400
              "
            >
              Featured courses
            </p>

            <h2
              className="
                mt-3 text-[34px] font-semibold
                tracking-[-0.035em] sm:text-[42px]
              "
            >
              Practical lessons.
              <br />
              Real projects.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {featuredCourses.map((course) => (
              <article
                key={course.title}
                className="
                  group rounded-[24px] border border-slate-200
                  bg-white p-7 transition-all duration-200
                  hover:-translate-y-1
                  hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)]
                "
              >
                <div className="flex items-center justify-between">
                  <span
                    className="
                      text-[10px] font-semibold uppercase
                      tracking-[0.1em] text-slate-400
                    "
                  >
                    {course.category}
                  </span>

                  <BookOpen size={18} className="text-slate-400" />
                </div>

                <h3
                  className="
                    mt-7 text-[20px] font-semibold
                    leading-tight tracking-[-0.025em]
                  "
                >
                  {course.title}
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-slate-500">
                  {course.description}
                </p>

                <div className="mt-7 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-slate-400">
                    {course.duration}
                  </span>

                  <Link
                    to="/academy"
                    className="
                      inline-flex items-center gap-2
                      text-[13px] font-semibold text-slate-700
                    "
                  >
                    Start lesson
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[900px] px-6 py-24 text-center">
            <div
              className="
                mx-auto flex h-12 w-12 items-center justify-center
                rounded-xl bg-slate-900 text-white
              "
            >
              <CheckCircle2 size={22} />
            </div>

            <h2
              className="
                mt-6 text-[34px] font-semibold
                tracking-[-0.04em] sm:text-[46px]
              "
            >
              Ready to build with AI?
            </h2>

            <p className="mx-auto mt-5 max-w-[600px] text-[16px] leading-7 text-slate-500">
              Learn the fundamentals, build real projects, and turn your ideas
              into products with ICOGON AI.
            </p>

            <Link
              to="/builder"
              className="
                mt-8 inline-flex items-center gap-2 rounded-xl
                bg-[#20242f] px-6 py-3.5 text-[14px] font-medium
                text-white shadow-lg transition-all
                hover:-translate-y-[1px] hover:bg-[#111827]
              "
            >
              Start building
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AcademyPage;
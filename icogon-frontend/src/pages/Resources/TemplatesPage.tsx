import {
  ArrowRight,
  Check,
  ExternalLink,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  imageClass: string;
}

const templates: Template[] = [
  {
    id: "saas",
    title: "SaaS Dashboard",
    description:
      "A modern dashboard for SaaS products, analytics, and customer management.",
    category: "SaaS",
    imageClass:
      "bg-[linear-gradient(135deg,#dfe5ef_0%,#f8f9fb_50%,#cbd5e1_100%)]",
  },
  {
    id: "startup",
    title: "Startup Landing Page",
    description:
      "A conversion-focused landing page for modern startups and products.",
    category: "Landing Pages",
    imageClass:
      "bg-[linear-gradient(135deg,#e8e4dc_0%,#faf9f6_50%,#ddd8ce_100%)]",
  },
  {
    id: "agency",
    title: "Creative Agency",
    description:
      "A clean portfolio experience for creative studios and digital agencies.",
    category: "Websites",
    imageClass:
      "bg-[linear-gradient(135deg,#e2e7e4_0%,#f7f9f8_50%,#cdd6d0_100%)]",
  },
  {
    id: "ecommerce",
    title: "E-commerce Store",
    description:
      "A polished storefront for products, collections, and online shopping.",
    category: "E-commerce",
    imageClass:
      "bg-[linear-gradient(135deg,#eee4dc_0%,#faf7f4_50%,#ddd0c6_100%)]",
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description:
      "A powerful analytics interface for metrics, reports, and business insights.",
    category: "Dashboards",
    imageClass:
      "bg-[linear-gradient(135deg,#e0e4eb_0%,#f7f8fa_50%,#cfd5df_100%)]",
  },
  {
    id: "portfolio",
    title: "Personal Portfolio",
    description:
      "A minimal portfolio for showcasing your work, experience, and skills.",
    category: "Websites",
    imageClass:
      "bg-[linear-gradient(135deg,#e8e6e1_0%,#faf9f6_50%,#d8d5cd_100%)]",
  },
];

const categories = [
  "All",
  "Websites",
  "SaaS",
  "Dashboards",
  "Landing Pages",
  "E-commerce",
];

const TemplatesPage = () => {
  const navigate = useNavigate();

  const handleUseTemplate = (template: Template) => {
    navigate(`/builder?template=${template.id}`);
  };

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
        <section className="mx-auto max-w-[1200px] px-6 pb-14 pt-20 lg:px-10 lg:pt-24">
          <div className="max-w-[800px]">
            {/* LABEL */}
            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-[12px]
                font-medium
                text-slate-600
                shadow-sm
              "
            >
              <LayoutTemplate size={15} strokeWidth={1.8} />
              ICOGON Templates
            </div>

            {/* HEADING */}
            <h1
              className="
                text-[48px]
                font-semibold
                leading-[1.02]
                tracking-[-0.05em]
                text-slate-950
                sm:text-[60px]
                lg:text-[72px]
              "
            >
              Start with a template.
              <br />
              Make it yours.
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-6
                max-w-[680px]
                text-[17px]
                leading-7
                text-slate-500
                sm:text-[18px]
              "
            >
              Start building faster with professionally designed starting
              points. Choose a template, customize it with AI, and turn your
              idea into a working product.
            </p>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <section className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <div
            className="
              flex
              gap-2
              overflow-x-auto
              pb-3
              scrollbar-none
            "
          >
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`
                  shrink-0
                  rounded-full
                  border
                  px-4
                  py-2
                  text-[13px]
                  font-medium
                  transition-all
                  ${
                    index === 0
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* TEMPLATE GRID */}
        <section
          className="
            mx-auto
            max-w-[1200px]
            px-6
            pb-24
            pt-8
            lg:px-10
          "
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <article
                key={template.id}
                className="
                  group
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-slate-200
                  bg-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_16px_45px_rgba(15,23,42,0.09)]
                "
              >
                {/* TEMPLATE PREVIEW */}
                <div
                  className={`
                    relative
                    aspect-[16/10]
                    overflow-hidden
                    ${template.imageClass}
                  `}
                >
                  {/* Browser frame */}
                  <div
                    className="
                      absolute
                      left-[8%]
                      right-[8%]
                      top-[9%]
                      bottom-[-12%]
                      overflow-hidden
                      rounded-t-[12px]
                      border
                      border-white/70
                      bg-white/90
                      shadow-[0_15px_40px_rgba(15,23,42,0.12)]
                    "
                  >
                    {/* Browser top bar */}
                    <div
                      className="
                        flex
                        h-8
                        items-center
                        gap-1.5
                        border-b
                        border-slate-200
                        bg-white
                        px-3
                      "
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      <span className="h-2 w-2 rounded-full bg-slate-300" />

                      <div className="ml-3 h-3 flex-1 rounded-full bg-slate-100" />
                    </div>

                    {/* Fake website preview */}
                    <div className="p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-20 rounded bg-slate-300" />

                        <div className="flex gap-2">
                          <div className="h-2 w-10 rounded bg-slate-200" />
                          <div className="h-2 w-10 rounded bg-slate-200" />
                          <div className="h-2 w-10 rounded bg-slate-200" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 rounded-lg bg-slate-100 p-4">
                          <div className="mb-3 h-4 w-32 rounded bg-slate-300" />
                          <div className="mb-2 h-2 w-full rounded bg-slate-200" />
                          <div className="h-2 w-3/4 rounded bg-slate-200" />

                          <div className="mt-5 h-20 rounded-lg bg-slate-200/80" />
                        </div>

                        <div className="rounded-lg bg-slate-100 p-3">
                          <div className="mb-3 h-3 w-12 rounded bg-slate-300" />
                          <div className="mb-2 h-10 rounded bg-slate-200" />
                          <div className="h-2 w-16 rounded bg-slate-200" />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="h-12 rounded-lg bg-slate-100" />
                        <div className="h-12 rounded-lg bg-slate-100" />
                        <div className="h-12 rounded-lg bg-slate-100" />
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-slate-950/0
                      opacity-0
                      transition-all
                      duration-300
                      group-hover:bg-slate-950/10
                      group-hover:opacity-100
                    "
                  >
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-white
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-900
                        shadow-lg
                        transition-transform
                        hover:scale-105
                      "
                    >
                      Use template
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-600
                      "
                    >
                      {template.category}
                    </span>

                    <Sparkles
                      size={16}
                      strokeWidth={1.8}
                      className="text-slate-400"
                    />
                  </div>

                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    {template.title}
                  </h2>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {template.description}
                  </p>

                  {/* FEATURES */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Check size={14} className="text-slate-700" />
                      AI customization ready
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Check size={14} className="text-slate-700" />
                      Responsive design
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      className="
                        inline-flex
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-slate-950
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition-all
                        hover:bg-slate-800
                      "
                    >
                      Use template
                      <ArrowRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      aria-label={`Open ${template.title}`}
                      className="
                        inline-flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-slate-600
                        transition-all
                        hover:border-slate-300
                        hover:text-slate-950
                      "
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TemplatesPage;
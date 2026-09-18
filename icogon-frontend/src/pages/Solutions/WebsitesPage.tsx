import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Globe2,
  LayoutTemplate,
  Search,
  Sparkles,
  // Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const WebsitesPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const buildWebsite = () => {
    navigate("/builder");
  };

  const websiteTypes = [
    {
      title: "Business websites",
      description:
        "Professional websites that help businesses establish their presence online.",
      icon: Globe2,
    },
    {
      title: "Marketing sites",
      description:
        "Beautiful marketing experiences designed to communicate your product clearly.",
      icon: Sparkles,
    },
    {
      title: "SaaS websites",
      description:
        "Product pages, pricing, dashboards and customer experiences built together.",
      icon: Code2,
    },
    {
      title: "Landing pages",
      description:
        "Focused pages for campaigns, launches, products and new ideas.",
      icon: LayoutTemplate,
    },
  ];

  const faqs = [
    {
      question: "Can I build a complete website with ICOGON?",
      answer:
        "Yes. Start with a description of what you want to build and use ICOGON to create the initial structure, interface and website experience.",
    },
    {
      question: "Do I need to know how to code?",
      answer:
        "You can start by describing your idea in natural language. Technical knowledge can be useful for advanced customization and development.",
    },
    {
      question: "Can I customize the generated website?",
      answer:
        "Yes. You can continue refining the website, changing its content, structure, visual style and functionality as your idea evolves.",
    },
    {
      question: "Can I make responsive websites?",
      answer:
        "ICOGON is designed around modern web experiences that can adapt across desktop, tablet and mobile screen sizes.",
    },
    {
      question: "What kind of websites can I create?",
      answer:
        "You can create business websites, landing pages, marketing sites, SaaS experiences, portfolios, internal tools and many other web applications.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf6] text-[#171717]">
      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden">
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute left-[-160px] top-[90px] h-[390px] w-[390px] rounded-full bg-[#ff008c]/75 blur-[75px]" />

        <div className="pointer-events-none absolute left-[18%] top-[210px] h-[250px] w-[250px] rounded-full bg-[#7047ff]/65 blur-[65px]" />

        <div className="pointer-events-none absolute right-[-120px] top-[500px] h-[350px] w-[350px] rounded-full bg-[#438cff]/70 blur-[80px]" />

        <div className="relative mx-auto max-w-[1180px] px-6 pb-24 pt-20 sm:px-8 lg:px-10 lg:pt-28">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <h1 className="max-w-[650px] text-[52px] font-semibold leading-[0.94] tracking-[-0.065em] sm:text-[68px] lg:text-[78px]">
                From first draft
                <br />
                to live site in
                <br />
                one conversation
              </h1>
            </div>

            <div className="pt-3 lg:pt-8">
              <p className="max-w-[360px] text-[14px] leading-6 text-neutral-600">
                Describe your idea and turn it into a real website with
                AI-powered building, editing and iteration.
              </p>

              <button
                onClick={buildWebsite}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-[12px] font-medium text-white transition hover:bg-black"
              >
                Start building
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Fake partner / ecosystem row */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[10px] font-semibold text-neutral-500 sm:justify-start sm:pl-8">
            <span>ICOGON</span>
            <span>stripe</span>
            <span>supabase</span>
            <span>vercel</span>
            <span>github</span>
            <span>openai</span>
          </div>

          {/* Main website mockup */}
          <div className="relative mx-auto mt-7 max-w-[1040px]">
            <div className="absolute -bottom-10 left-1/2 h-16 w-[85%] -translate-x-1/2 bg-gradient-to-r from-[#ff40bd] via-[#ff5a12] to-[#438cff] opacity-90 blur-xl" />

            <div className="relative overflow-hidden rounded-[10px] border border-neutral-300 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.16)]">
              {/* Browser */}
              <div className="flex h-8 items-center gap-1.5 border-b border-neutral-200 bg-[#f8f8f7] px-3">
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
                <span className="h-2 w-2 rounded-full bg-neutral-300" />

                <div className="mx-auto h-4 w-[38%] rounded bg-white" />
              </div>

              <div className="grid min-h-[300px] grid-cols-[0.85fr_1.15fr]">
                {/* Code/editor */}
                <div className="border-r border-neutral-200 bg-white p-4">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="h-2 w-20 rounded bg-neutral-800" />
                    <div className="h-5 w-5 rounded bg-neutral-100" />
                  </div>

                  <div className="space-y-2 font-mono text-[7px] text-neutral-400">
                    <p>
                      <span className="text-neutral-800">const</span>{" "}
                      website = {"{"}
                    </p>
                    <p className="pl-3">title: "Creative Studio",</p>
                    <p className="pl-3">hero: true,</p>
                    <p className="pl-3">responsive: true,</p>
                    <p className="pl-3">theme: "minimal"</p>
                    <p>{"}"}</p>

                    <div className="my-4 h-px bg-neutral-100" />

                    <p>
                      <span className="text-neutral-800">function</span>{" "}
                      Hero() {"{"}
                    </p>
                    <p className="pl-3">return (</p>
                    <p className="pl-6">&lt;section&gt;</p>
                    <p className="pl-6">Build something beautiful.</p>
                    <p className="pl-6">&lt;/section&gt;</p>
                    <p className="pl-3">)</p>
                    <p>{"}"}</p>
                  </div>

                  <div className="mt-8 h-6 w-24 rounded bg-neutral-900" />
                </div>

                {/* Website */}
                <div className="bg-[#f4f3ef] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md bg-neutral-900" />
                      <div className="h-2 w-16 rounded bg-neutral-800" />
                    </div>

                    <div className="flex gap-3">
                      <div className="h-2 w-8 rounded bg-neutral-300" />
                      <div className="h-2 w-8 rounded bg-neutral-300" />
                      <div className="h-2 w-8 rounded bg-neutral-300" />
                    </div>
                  </div>

                  <div className="mt-12">
                    <div className="h-5 w-[75%] rounded bg-neutral-900" />
                    <div className="mt-2 h-5 w-[55%] rounded bg-neutral-900" />

                    <div className="mt-4 h-2 w-[65%] rounded bg-neutral-300" />
                    <div className="mt-2 h-2 w-[48%] rounded bg-neutral-300" />

                    <div className="mt-5 h-7 w-20 rounded bg-neutral-900" />
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-2">
                    <div className="h-20 rounded bg-white" />
                    <div className="h-20 rounded bg-white" />
                    <div className="h-20 rounded bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          REAL WEBSITES
      ========================================================= */}
      <section className="relative border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <h2 className="max-w-[440px] text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[48px]">
                Real websites
                <br />
                without a
                <br />
                CMS compromise
              </h2>

              <p className="mt-6 max-w-[390px] text-[13px] leading-6 text-neutral-600">
                Build exactly what you need instead of forcing your idea into
                a rigid template. Start from a blank page or generate a
                complete experience with AI.
              </p>
            </div>

            <div className="pt-3">
              <div className="border-l border-neutral-300 pl-7">
                <p className="text-[12px] leading-6 text-neutral-600">
                  Create custom layouts, pages, components and interactions
                  while keeping your website flexible as your business grows.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5">
                  {[
                    "Custom layouts",
                    "Responsive design",
                    "Reusable components",
                    "AI-generated sections",
                    "Fast iteration",
                    "Production-ready code",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-[11px] text-neutral-600"
                    >
                      <Check size={12} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mx-auto mt-28 grid max-w-[850px] grid-cols-[100px_1fr] gap-8 border-t border-neutral-200 pt-12">
            <div className="flex items-start justify-center">
              <div className="h-10 w-10 rounded-full border border-neutral-300 bg-gradient-to-br from-neutral-200 to-neutral-400" />
            </div>

            <div>
              <p className="max-w-[700px] text-[14px] font-medium leading-6 text-neutral-800">
                “The difference is being able to start with an idea and
                actually see the experience take shape. We can build, change
                and improve the website without constantly starting over.”
              </p>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                ICOGON customer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PREMIUM DESIGN
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="mb-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Design
            </p>

            <h2 className="mt-4 text-[35px] font-semibold leading-[0.98] tracking-[-0.055em]">
              Premium design,
              <br />
              no designer required
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Start anywhere
              </p>

              <h3 className="mt-3 text-[16px] font-semibold">
                Start with a simple prompt
              </h3>

              <p className="mt-3 text-[12px] leading-5 text-neutral-500">
                Explain your vision in plain language and let AI create the
                first version.
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Iterate visually
              </p>

              <h3 className="mt-3 text-[16px] font-semibold">
                Keep improving the details
              </h3>

              <p className="mt-3 text-[12px] leading-5 text-neutral-500">
                Change sections, spacing, content, colors and structure as
                your idea develops.
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Build consistently
              </p>

              <h3 className="mt-3 text-[16px] font-semibold">
                Turn the design into a system
              </h3>

              <p className="mt-3 text-[12px] leading-5 text-neutral-500">
                Create reusable components and pages that work together as
                one product.
              </p>
            </div>
          </div>

          {/* Dark product card */}
          <div className="relative mt-16 overflow-hidden rounded-[9px] bg-[#171717] text-white">
            <div className="absolute right-[-70px] top-[-100px] h-[300px] w-[300px] rounded-full border border-white/10" />
            <div className="absolute right-[-20px] top-[-45px] h-[190px] w-[190px] rotate-12 rounded-[30px] border border-white/10" />

            <div className="relative p-7 sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    Build with your team
                  </p>

                  <h3 className="mt-4 max-w-[340px] text-[30px] font-semibold leading-[0.98] tracking-[-0.045em]">
                    Bug tracking for teams that ship fast
                  </h3>

                  <p className="mt-4 max-w-[330px] text-[11px] leading-5 text-white/50">
                    Create internal tools, dashboards and workflows alongside
                    your public website.
                  </p>

                  <button
                    onClick={buildWebsite}
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-[10px] font-semibold text-neutral-900"
                  >
                    Build yours
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="overflow-hidden rounded-md border border-white/10 bg-[#222]">
                  <div className="flex h-7 items-center gap-1 border-b border-white/10 px-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  </div>

                  <div className="grid grid-cols-[0.5fr_1fr]">
                    <div className="border-r border-white/10 p-3">
                      <div className="h-2 w-16 rounded bg-white/10" />

                      <div className="mt-7 space-y-3">
                        <div className="h-5 rounded bg-white/5" />
                        <div className="h-5 rounded bg-white/5" />
                        <div className="h-5 rounded bg-white/5" />
                        <div className="h-5 rounded bg-white/5" />
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-24 rounded bg-white/15" />
                        <div className="h-5 w-14 rounded bg-white/10" />
                      </div>

                      <div className="mt-5 space-y-2">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="grid grid-cols-[1fr_70px_50px] items-center gap-3 rounded bg-white/[0.035] p-2"
                          >
                            <div className="h-2 rounded bg-white/10" />
                            <div className="h-2 rounded bg-white/5" />
                            <div className="h-2 rounded bg-white/10" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-3 bg-gradient-to-r from-[#ff32bb] via-[#ff5d16] to-[#428cff]" />
          </div>
        </div>
      </section>

      {/* =========================================================
          MORE THAN A WEBSITE
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="max-w-[420px]">
            <h2 className="text-[34px] font-semibold leading-[1] tracking-[-0.05em]">
              More than a website
            </h2>

            <p className="mt-4 text-[12px] leading-5 text-neutral-500">
              Your website can become the front door to an entire product,
              business workflow or customer experience.
            </p>
          </div>

          <div className="mt-10 grid gap-2 sm:grid-cols-2">
            {/* Card 1 */}
            <div className="min-h-[260px] rounded-[4px] border border-neutral-200 bg-[#f5f4ef] p-5">
              <div className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="h-2 w-20 rounded bg-neutral-800" />
                  <div className="h-5 w-12 rounded bg-neutral-100" />
                </div>

                <div className="mt-6 grid grid-cols-[0.7fr_1fr] gap-4">
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded bg-neutral-100" />
                    <div className="h-2 w-[80%] rounded bg-neutral-100" />
                    <div className="h-2 w-[60%] rounded bg-neutral-100" />
                  </div>

                  <div className="rounded bg-neutral-50 p-3">
                    <div className="h-16 rounded bg-neutral-100" />
                  </div>
                </div>
              </div>

              <h3 className="mt-7 text-[14px] font-semibold">
                Connect your tools
              </h3>

              <p className="mt-2 text-[10px] leading-4 text-neutral-500">
                Create experiences that work with the services your business
                already uses.
              </p>
            </div>

            {/* Card 2 */}
            <div className="min-h-[260px] rounded-[4px] border border-neutral-200 bg-[#f5f4ef] p-5">
              <div className="flex h-[145px] items-center justify-center gap-8">
                <span className="text-[25px] font-bold text-[#635bff]">
                  stripe
                </span>

                <span className="text-[22px] font-semibold text-neutral-500">
                  paddle
                </span>
              </div>

              <h3 className="mt-7 text-[14px] font-semibold">
                Payments and products
              </h3>

              <p className="mt-2 text-[10px] leading-4 text-neutral-500">
                Build customer-facing experiences around your product and
                business.
              </p>
            </div>

            {/* Card 3 */}
            <div className="min-h-[260px] rounded-[4px] border border-neutral-200 bg-[#f5f4ef] p-5">
              <div className="grid grid-cols-5 gap-2 opacity-60">
                {Array.from({ length: 15 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex h-9 items-center justify-center rounded-md bg-white shadow-sm"
                  >
                    <span className="h-3 w-3 rounded bg-neutral-200" />
                  </div>
                ))}
              </div>

              <h3 className="mt-7 text-[14px] font-semibold">
                Integrations
              </h3>

              <p className="mt-2 text-[10px] leading-4 text-neutral-500">
                Bring your favorite tools into the workflow.
              </p>
            </div>

            {/* Card 4 */}
            <div className="min-h-[260px] rounded-[4px] border border-neutral-200 bg-[#f5f4ef] p-5">
              <div className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="h-2 w-20 rounded bg-neutral-800" />

                <div className="mt-5 space-y-2">
                  <div className="h-7 rounded bg-neutral-50" />
                  <div className="h-7 rounded bg-neutral-50" />
                  <div className="h-7 rounded bg-neutral-50" />
                </div>
              </div>

              <h3 className="mt-7 text-[14px] font-semibold">
                Internal workflows
              </h3>

              <p className="mt-2 text-[10px] leading-4 text-neutral-500">
                Turn repetitive processes into simple tools your team can
                actually use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SEARCH READY
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="text-[34px] font-semibold leading-[0.98] tracking-[-0.05em]">
                Search-ready
                <br />
                from day one
              </h2>

              <div className="mt-10 space-y-4 border-t border-neutral-200 pt-6">
                {[
                  "Clear page structure",
                  "Readable content",
                  "Useful navigation",
                  "Responsive experiences",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-[12px] text-neutral-600"
                  >
                    <Check size={13} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="max-w-[440px] text-[13px] leading-6 text-neutral-600">
                Build websites with clear information architecture and useful
                content from the beginning. Create pages that make sense for
                people and search engines.
              </p>

              <button
                onClick={buildWebsite}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#171717] px-5 py-2.5 text-[11px] font-medium text-white"
              >
                Start building
                <ArrowRight size={13} />
              </button>

              <div className="mt-12 overflow-hidden rounded-[5px] border border-neutral-200 bg-[#f4f3ef] p-7">
                <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Search size={13} className="text-neutral-400" />

                    <div className="h-2 w-32 rounded bg-neutral-200" />
                  </div>

                  <div className="mt-6 rounded-lg border border-neutral-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                        <Globe2 size={12} />
                      </div>

                      <div>
                        <div className="h-2 w-36 rounded bg-neutral-700" />
                        <div className="mt-2 h-1.5 w-52 rounded bg-neutral-100" />
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="h-2 w-full rounded bg-neutral-100" />
                      <div className="h-2 w-[90%] rounded bg-neutral-100" />
                      <div className="h-2 w-[75%] rounded bg-neutral-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHAT PEOPLE BUILD
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[620px] text-center">
            <h2 className="text-[34px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[42px]">
              What kind of websites
              <br />
              people build with ICOGON
            </h2>

            <p className="mt-5 text-[12px] leading-5 text-neutral-500">
              From simple business sites to full digital products, start with
              a prompt and shape the result into something your own.
            </p>
          </div>

          <div className="relative mt-14">
            {/* Gradient glow */}
            <div className="absolute left-1/2 top-[30%] h-[180px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff1fa2] via-[#8c6aff] to-[#2e9cff] opacity-70 blur-[55px]" />

            <div className="relative grid gap-8 md:grid-cols-3">
              <div className="pt-12">
                <h3 className="text-[13px] font-semibold">
                  Business websites
                </h3>

                <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                  Services, company pages, portfolios and customer-facing
                  experiences.
                </p>

                <div className="mt-7 space-y-2 text-[9px] text-neutral-500">
                  <p>→ About pages</p>
                  <p>→ Service pages</p>
                  <p>→ Contact experiences</p>
                  <p>→ Customer portals</p>
                </div>
              </div>

              {/* Center prompt card */}
              <div className="relative mx-auto w-full max-w-[330px] rounded-[12px] border border-white/80 bg-white p-4 shadow-[0_20px_70px_rgba(0,0,0,0.16)]">
                <div className="rounded-lg bg-[#f6f5f1] p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={13}
                      className="text-neutral-500"
                    />

                    <span className="text-[9px] font-medium text-neutral-500">
                      Build with ICOGON
                    </span>
                  </div>

                  <p className="mt-5 text-[12px] leading-5 text-neutral-700">
                    Build a modern website for a creative technology company
                    with a clean editorial design, case studies, pricing and
                    contact page.
                  </p>

                  <button
                    onClick={buildWebsite}
                    className="mt-5 flex h-8 w-full items-center justify-center rounded-md bg-[#171717] text-[9px] font-medium text-white"
                  >
                    Generate website
                  </button>
                </div>
              </div>

              <div className="pt-12">
                <h3 className="text-[13px] font-semibold">
                  Product experiences
                </h3>

                <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                  SaaS products, dashboards, customer tools and experiences
                  that go beyond marketing pages.
                </p>

                <div className="mt-7 space-y-2 text-[9px] text-neutral-500">
                  <p>→ SaaS landing pages</p>
                  <p>→ Product dashboards</p>
                  <p>→ Admin panels</p>
                  <p>→ AI applications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WEBSITE TYPES
      ========================================================= */}
      <section className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-[1120px] px-6 pb-24 sm:px-8 lg:px-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {websiteTypes.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="border-t border-neutral-300 pt-5"
                >
                  <Icon
                    size={17}
                    strokeWidth={1.5}
                    className="text-neutral-500"
                  />

                  <h3 className="mt-5 text-[14px] font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section className="border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="mx-auto max-w-[900px] px-6 py-24 sm:px-8 lg:py-28">
          <div className="grid gap-14 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                FAQ
              </p>

              <h2 className="mt-4 text-[32px] font-semibold leading-[1] tracking-[-0.05em]">
                Frequently
                <br />
                asked questions
              </h2>
            </div>

            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    >
                      <span className="text-[12px] font-medium text-neutral-800">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={14}
                        className={`shrink-0 text-neutral-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-5 pr-8">
                        <p className="text-[11px] leading-5 text-neutral-500">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="pointer-events-none absolute bottom-[-120px] left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#438cff] via-[#ff37bd] to-[#ff6b1a] opacity-60 blur-[80px]" />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-32">
          <h2 className="text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[50px]">
            Ready to bring your
            <br />
            idea to life?
          </h2>

          <p className="mx-auto mt-5 max-w-[430px] text-[12px] leading-5 text-neutral-500">
            Start with a simple conversation. Describe your website and see
            what you can build with ICOGON.
          </p>

          {/* Prompt box */}
          <button
            onClick={buildWebsite}
            className="group relative mx-auto mt-9 flex w-full max-w-[520px] items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition hover:border-neutral-300 hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
          >
            <span className="text-[11px] text-neutral-400">
              Build a website for my business...
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-white transition group-hover:translate-x-0.5">
              <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="relative overflow-hidden border-t border-neutral-200 bg-[#fbfaf6]">
        <div className="pointer-events-none absolute bottom-[-160px] left-1/2 h-[300px] w-[850px] -translate-x-1/2 bg-gradient-to-r from-[#438cff] via-[#ff37bd] to-[#ff6b1a] opacity-70 blur-[80px]" />

        <div className="relative mx-auto max-w-[1180px] px-6 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#171717] text-white">
                  <Sparkles size={13} />
                </div>

                <span className="text-[14px] font-semibold tracking-[-0.03em]">
                  ICOGON
                </span>
              </div>

              <p className="mt-5 max-w-[230px] text-[10px] leading-5 text-neutral-500">
                Build websites, applications and digital products with
                AI-powered development.
              </p>

              <button
                onClick={buildWebsite}
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-neutral-800"
              >
                Start building
                <ArrowRight size={12} />
              </button>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Product
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-neutral-500">
                <button
                  onClick={buildWebsite}
                  className="block hover:text-neutral-900"
                >
                  Builder
                </button>

                <button
                  onClick={() => navigate("/templates")}
                  className="block hover:text-neutral-900"
                >
                  Templates
                </button>

                <button
                  onClick={() => navigate("/connectors")}
                  className="block hover:text-neutral-900"
                >
                  Connectors
                </button>

                <button
                  onClick={() => navigate("/docs")}
                  className="block hover:text-neutral-900"
                >
                  Docs
                </button>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Solutions
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-neutral-500">
                <button
                  onClick={() => navigate("/solutions/founders")}
                  className="block hover:text-neutral-900"
                >
                  Founders
                </button>

                <button
                  onClick={() => navigate("/solutions/designers")}
                  className="block hover:text-neutral-900"
                >
                  Designers
                </button>

                <button
                  onClick={() => navigate("/solutions/marketers")}
                  className="block hover:text-neutral-900"
                >
                  Marketers
                </button>

                <button
                  onClick={() => navigate("/solutions/websites")}
                  className="block hover:text-neutral-900"
                >
                  Websites
                </button>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400">
                Resources
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-neutral-500">
                <button
                  onClick={() => navigate("/blog")}
                  className="block hover:text-neutral-900"
                >
                  Blog
                </button>

                <button
                  onClick={() => navigate("/academy")}
                  className="block hover:text-neutral-900"
                >
                  Academy
                </button>

                <button
                  onClick={() => navigate("/guides")}
                  className="block hover:text-neutral-900"
                >
                  Guides
                </button>

                <button
                  onClick={() => navigate("/customer-stories")}
                  className="block hover:text-neutral-900"
                >
                  Customer stories
                </button>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-[9px] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} ICOGON. All rights reserved.</p>

            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsitesPage;
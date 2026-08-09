import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Plus,
  Folder,
  History,
  Settings,
  LogOut,
  Sparkles,
  ArrowRight,
  Code2,
  Globe,
  Smartphone,
  Bot,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/authApi";

const DashboardPage = () => {
  // const navigate = useNavigate();

  const { user, logoutUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    console.log("AI Builder Prompt:", prompt);

    // Next step:
    // connect this with your AI planner/backend
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white">

      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64
          flex-col border-r border-white/10
          bg-[#0B101B]
          transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Logo */}

        <div className="flex h-20 items-center border-b border-white/10 px-6">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">

              <Sparkles
                size={21}
                className="text-white"
              />

            </div>

            <div>
              <h1 className="font-bold text-white">
                ICOGON AI
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Build with AI
              </p>
            </div>

          </Link>

          {/* Mobile close */}

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-slate-400 lg:hidden"
          >
            <X size={20} />
          </button>

        </div>


        {/* Navigation */}

        <nav className="flex-1 space-y-2 px-4 py-6">

          <button
            className="flex w-full items-center gap-3 rounded-xl bg-blue-600/15 px-4 py-3 text-sm font-medium text-blue-400"
          >
            <Home size={19} />
            Home
          </button>


          <button
            onClick={() => setPrompt("")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Plus size={19} />
            New Project
          </button>


          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Folder size={19} />
            Projects
          </button>


          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <History size={19} />
            History
          </button>

        </nav>


        {/* Bottom */}

        <div className="border-t border-white/10 p-4">

          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Settings size={19} />
            Settings
          </button>


          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="min-h-screen lg:ml-64">

        {/* Header */}

        <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 lg:px-10">

          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-300 lg:hidden"
          >
            <Menu size={23} />
          </button>


          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">
              AI Website Builder
            </p>
          </div>


          {/* User */}

          <div className="ml-auto flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-white">
                {user?.full_name || "User"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email || ""}
              </p>

            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
              {(
                user?.full_name ||
                user?.email ||
                "U"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>


        {/* Content */}

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">


          {/* Welcome */}

          <div className="mb-10">

            <p className="mb-2 text-sm text-cyan-400">
              Welcome back 👋
            </p>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              What do you want to build?
            </h1>

            <p className="mt-3 max-w-2xl text-slate-500">
              Describe your idea and ICOGON AI will
              turn it into a complete application.
            </p>

          </div>


          {/* ================= AI PROMPT ================= */}

          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0D1421] p-6 shadow-2xl md:p-8">

            {/* Glow */}

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />


            <div className="relative">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">

                  <Sparkles size={19} />

                </div>

                <div>

                  <h2 className="font-semibold">
                    Build with AI
                  </h2>

                  <p className="text-xs text-slate-500">
                    Describe your application
                  </p>

                </div>

              </div>


              {/* Prompt */}

              <textarea
                value={prompt}
                onChange={(e) =>
                  setPrompt(e.target.value)
                }
                placeholder="Example: Build a modern restaurant website with online table booking, menu, customer reviews and an admin dashboard..."
                className="min-h-[180px] w-full resize-none rounded-2xl border border-white/10 bg-[#080D16] p-5 text-sm leading-7 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500/50"
              />


              {/* Bottom */}

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() =>
                      setPrompt(
                        "Build a modern ecommerce website with products, cart, checkout and admin dashboard."
                      )
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-blue-500/40 hover:text-white"
                  >
                    Ecommerce
                  </button>

                  <button
                    onClick={() =>
                      setPrompt(
                        "Build a modern SaaS landing page with pricing, authentication and dashboard."
                      )
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-blue-500/40 hover:text-white"
                  >
                    SaaS
                  </button>

                  <button
                    onClick={() =>
                      setPrompt(
                        "Build a portfolio website for a software developer with projects, skills and contact form."
                      )
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-blue-500/40 hover:text-white"
                  >
                    Portfolio
                  </button>

                </div>


                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Generate

                  <ArrowRight size={18} />

                </button>

              </div>

            </div>

          </section>


          {/* ================= BUILD TYPES ================= */}

          <section className="mt-12">

            <div className="mb-5">

              <h2 className="text-xl font-semibold">
                What can ICOGON build?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Start with any type of application.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Website */}

              <div className="rounded-2xl border border-white/10 bg-[#0D1421] p-5 transition hover:-translate-y-1 hover:border-blue-500/30">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Globe size={21} />
                </div>

                <h3 className="font-medium">
                  Websites
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Landing pages, business websites,
                  portfolios and SaaS applications.
                </p>

              </div>


              {/* Apps */}

              <div className="rounded-2xl border border-white/10 bg-[#0D1421] p-5 transition hover:-translate-y-1 hover:border-cyan-500/30">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Smartphone size={21} />
                </div>

                <h3 className="font-medium">
                  Apps
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Generate responsive application
                  interfaces and mobile experiences.
                </p>

              </div>


              {/* Backend */}

              <div className="rounded-2xl border border-white/10 bg-[#0D1421] p-5 transition hover:-translate-y-1 hover:border-violet-500/30">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Code2 size={21} />
                </div>

                <h3 className="font-medium">
                  Full Stack
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Frontend, backend, APIs, database
                  and authentication.
                </p>

              </div>


              {/* AI */}

              <div className="rounded-2xl border border-white/10 bg-[#0D1421] p-5 transition hover:-translate-y-1 hover:border-pink-500/30">

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                  <Bot size={21} />
                </div>

                <h3 className="font-medium">
                  AI Agents
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Build AI-powered workflows and
                  intelligent agents.
                </p>

              </div>

            </div>

          </section>


          {/* ================= RECENT PROJECTS ================= */}

          <section className="mt-12">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Recent Projects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest AI-generated projects.
                </p>
              </div>

              <button className="text-sm text-blue-400 hover:text-blue-300">
                View all
              </button>

            </div>


            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B101B] p-10 text-center">

              <Folder
                size={32}
                className="mx-auto text-slate-600"
              />

              <h3 className="mt-4 font-medium text-slate-300">
                No projects yet
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Your generated projects will appear here.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default DashboardPage;
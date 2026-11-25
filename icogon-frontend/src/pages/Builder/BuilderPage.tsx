
import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  WandSparkles,
  XCircle,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { createProjectApi } from "../../api/projectApi";
import { useTheme } from "../../components/context/ThemeContext";

const EXAMPLE_PROMPTS = [
  {
    title: "SaaS Dashboard",
    description:
      "Build a modern SaaS analytics dashboard with revenue charts, user management, subscription tracking, and a responsive sidebar.",
  },
  {
    title: "E-commerce Store",
    description:
      "Build a premium e-commerce website with product listings, product details, shopping cart, checkout, customer accounts, and an admin dashboard.",
  },
  {
    title: "Restaurant Management",
    description:
      "Build a restaurant management platform with orders, menu management, employee attendance, customer CRM, analytics, and an admin panel.",
  },
];

const MAX_DESCRIPTION_LENGTH = 10000;

const createSuggestedName = (prompt: string) => {
  const cleaned = prompt
    .replace(/^(build|create|make|develop|design)\s+/i, "")
    .replace(/[.!?].*$/, "")
    .trim();

  if (!cleaned) return "";

  const words = cleaned.split(/\s+/).slice(0, 5);

  return words
    .map((word) =>
      word.length
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");
};

const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const dashboardPrompt = searchParams.get("prompt");

  const [name, setName] = useState(() =>
    dashboardPrompt ? createSuggestedName(dashboardPrompt) : "",
  );
  const [description, setDescription] = useState(() => dashboardPrompt ?? "");
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setError("");

    if (!nameManuallyEdited && value.trim()) {
      setName(createSuggestedName(value));
    }
  };

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loading) return;

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      setError("Please enter a project name.");
      return;
    }

    if (!cleanDescription) {
      setError("Describe what you want to build before continuing.");
      return;
    }

    if (cleanDescription.length > MAX_DESCRIPTION_LENGTH) {
      setError(
        `Your description is too long. Please keep it under ${MAX_DESCRIPTION_LENGTH.toLocaleString()} characters.`,
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const project = await createProjectApi({
        name: cleanName,
        description: cleanDescription,
      });

      if (!project?.id) {
        throw new Error(
          "The project was created, but the server did not return a project ID.",
        );
      }

      navigate(`/builder/${encodeURIComponent(project.id)}`);
    } catch (cause: unknown) {
      setError(
        getProjectApiErrorMessage(
          cause,
          "Unable to create your project. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const applyExample = (prompt: string) => {
    handleDescriptionChange(prompt);

    if (!nameManuallyEdited) {
      setName(createSuggestedName(prompt));
    }
  };

  const surface = isDark
    ? "border-[#292929] bg-[#101010]"
    : "border-slate-200 bg-white shadow-sm";

  const mutedText = isDark ? "text-[#777]" : "text-slate-500";

  const fieldClass = isDark
    ? "border-[#292929] bg-[#0b0b0b] text-white placeholder:text-[#555] focus:border-[#555]"
    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:bg-white";

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-200 ${
        isDark
          ? "bg-[#080808] text-white"
          : "bg-[#fafafa] text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 h-14.5 border-b backdrop-blur-xl ${
          isDark
            ? "border-[#242424] bg-[#080808]/90"
            : "border-slate-200 bg-white/90"
        }`}
      >
        <div className="mx-auto flex h-full max-w-300 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
              aria-label="Back to dashboard"
              className={`grid h-8 w-8 place-items-center rounded-lg transition disabled:opacity-40 ${
                isDark
                  ? "text-[#777] hover:bg-[#1d1d1d] hover:text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <ArrowLeft size={16} />
            </button>

            <div
              className={`h-5 w-px ${
                isDark ? "bg-[#292929]" : "bg-slate-200"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-lg ${
                  isDark
                    ? "bg-white text-black"
                    : "bg-slate-900 text-white"
                }`}
              >
                <Sparkles size={15} />
              </div>

              <span className="text-xs font-semibold tracking-wide">
                ICOGON AI
              </span>
            </div>
          </div>

          <span className={`text-[10px] ${mutedText}`}>
            New project
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative min-h-[calc(100vh-58px)] overflow-hidden">
        <div
          className={`pointer-events-none absolute left-1/2 -top-45 h-105 w-162.5 -translate-x-1/2 rounded-full blur-[120px] ${
            isDark ? "bg-cyan-500/[0.035]" : "bg-cyan-400/5.5"
          }`}
        />

        <div
          className={`pointer-events-none absolute -right-45 top-[40%] h-87.5 w-87.5 rounded-full blur-[120px] ${
            isDark ? "bg-purple-500/2.5" : "bg-cyan-400/5.5"
          }`}
        />

        <div className="relative z-10 mx-auto max-w-225 px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          {/* Introduction */}
          <section className="mx-auto max-w-2xl text-center">
            <div
              className={`mx-auto grid h-11 w-11 place-items-center rounded-xl ${
                isDark
                  ? "bg-[#171717] text-[#aaa]"
                  : "bg-white text-violet-600 shadow-sm"
              }`}
            >
              <WandSparkles size={20} />
            </div>

            <h1
              className={`mt-5 text-2xl font-semibold tracking-tight sm:text-3xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              What do you want to build?
            </h1>

            <p className={`mx-auto mt-3 max-w-lg text-sm leading-6 ${mutedText}`}>
              Start with an idea. Describe your application, and ICOGON AI
              will use your requirements to create a new project workspace.
            </p>
          </section>

          {/* Form */}
          <form
            onSubmit={handleCreateProject}
            className="mx-auto mt-9 max-w-760"
          >
            <div className={`overflow-hidden rounded-2xl border ${surface}`}>
              {/* Project name */}
              <div
                className={`border-b p-4 sm:p-5 ${
                  isDark ? "border-[#242424]" : "border-slate-100"
                }`}
              >
                <label
                  htmlFor="project-name"
                  className={`flex items-center gap-2 text-xs font-medium ${
                    isDark ? "text-[#ccc]" : "text-slate-700"
                  }`}
                >
                  <FileText
                    size={14}
                    className={mutedText}
                  />
                  Project name
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameManuallyEdited(true);
                    setError("");
                  }}
                  placeholder="My SaaS Application"
                  maxLength={100}
                  autoComplete="off"
                  disabled={loading}
                  required
                  className={`mt-2.5 h-11 w-full rounded-lg border px-3 text-sm outline-none transition disabled:opacity-60 ${fieldClass}`}
                />

                <p className={`mt-2 text-[10px] ${mutedText}`}>
                  You can change this name later if your project settings
                  support renaming.
                </p>
              </div>

              {/* Description */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label
                      htmlFor="project-description"
                      className={`flex items-center gap-2 text-xs font-medium ${
                        isDark ? "text-[#ccc]" : "text-slate-700"
                      }`}
                    >
                      <Sparkles
                        size={14}
                        className="text-violet-500"
                      />
                      Describe your application
                    </label>

                    <p className={`mt-1 text-[10px] ${mutedText}`}>
                      Include the features, pages, users, and workflows
                      you need.
                    </p>
                  </div>

                  <span className={`hidden text-[10px] sm:block ${mutedText}`}>
                    {description.length.toLocaleString()} /{" "}
                    {MAX_DESCRIPTION_LENGTH.toLocaleString()}
                  </span>
                </div>

                <textarea
                  id="project-description"
                  value={description}
                  onChange={(event) =>
                    handleDescriptionChange(event.target.value)
                  }
                  placeholder={`Example:

Build a modern project management platform with:
- User authentication and team workspaces
- Project and task management
- Kanban boards and activity tracking
- Analytics dashboard
- Responsive design for desktop and mobile`}
                  rows={9}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  disabled={loading}
                  required
                  className={`mt-4 min-h-220px w-full resize-y rounded-xl border px-4 py-4 text-sm leading-6 outline-none transition disabled:opacity-60 ${fieldClass}`}
                />

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className={`flex items-center gap-1.5 text-[10px] ${mutedText}`}>
                    <Lightbulb size={12} />
                    Specific requirements help produce better results.
                  </span>

                  <span className={`text-[10px] sm:hidden ${mutedText}`}>
                    {description.length.toLocaleString()} /{" "}
                    {MAX_DESCRIPTION_LENGTH.toLocaleString()}
                  </span>
                </div>

                {/* Example prompts */}
                <div className="mt-5">
                  <p
                    className={`mb-2.5 text-[10px] font-semibold uppercase tracking-wider ${
                      isDark ? "text-[#777]" : "text-slate-400"
                    }`}
                  >
                    Need inspiration?
                  </p>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {EXAMPLE_PROMPTS.map((example) => (
                      <button
                        key={example.title}
                        type="button"
                        disabled={loading}
                        onClick={() => applyExample(example.description)}
                        className={`rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                          isDark
                            ? "border-[#292929] bg-[#0c0c0c] hover:border-[#555] hover:bg-[#151515]"
                            : "border-slate-200 bg-slate-50 hover:border-violet-200 hover:bg-violet-50/50"
                        }`}
                      >
                        <span
                          className={`block text-xs font-semibold ${
                            isDark ? "text-[#ddd]" : "text-slate-700"
                          }`}
                        >
                          {example.title}
                        </span>

                        <span
                          className={`mt-1.5 block text-[10px] leading-4 ${
                            isDark ? "text-[#777]" : "text-slate-400"
                          }`}
                        >
                          Use this as a starting point
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className={`mt-4 flex items-start gap-2.5 rounded-lg border px-3 py-3 text-xs ${
                      isDark
                        ? "border-red-500/20 bg-red-500/0.06 text-red-400"
                        : "border-red-200 bg-red-50 text-red-600"
                    }`}
                  >
                    <XCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    disabled={loading}
                    className={`rounded-lg px-4 py-2.5 text-xs font-medium transition disabled:opacity-40 ${
                      isDark
                        ? "text-[#777] hover:bg-[#181818] hover:text-white"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !name.trim() ||
                      !description.trim()
                    }
                    className={`group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark
                        ? "bg-white text-black hover:bg-[#ddd]"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Creating project...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Create project
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <div
              className={`mt-5 flex items-center justify-center gap-1.5 text-center text-[10px] ${mutedText}`}
            >
              <CheckCircle2 size={12} />
              Your project will be saved to your ICOGON workspace.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BuilderPage;
function getProjectApiErrorMessage(
  cause: unknown,
  fallbackMessage: string,
): React.SetStateAction<string> {
  if (cause instanceof Error) {
    const message = cause.message.trim();
    if (message) return message;
  }

  if (cause && typeof cause === "object") {
    const error = cause as {
      message?: unknown;
      error?: unknown;
      detail?: unknown;
      data?: unknown;
      response?: { data?: unknown };
    };

    const getMessage = (value: unknown): string | undefined => {
      if (typeof value === "string") {
        const message = value.trim();
        return message || undefined;
      }

      if (value && typeof value === "object") {
        const data = value as {
          message?: unknown;
          error?: unknown;
          detail?: unknown;
        };

        for (const candidate of [data.message, data.error, data.detail]) {
          if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
          }
        }
      }

      return undefined;
    };

    for (const candidate of [
      error.response?.data,
      error.data,
      error.message,
      error.error,
      error.detail,
    ]) {
      const message = getMessage(candidate);
      if (message) return message;
    }
  }

  if (typeof cause === "string" && cause.trim()) {
    return cause.trim();
  }

  return fallbackMessage;
}


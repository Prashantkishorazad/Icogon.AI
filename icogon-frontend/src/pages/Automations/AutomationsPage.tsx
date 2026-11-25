import { CalendarClock, Clock3, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/context/ThemeContext";

/**
 * Automations landing page. This starts a scheduling conversation;
 * it does not create an automation until the scheduling backend exists.
 * The sidebar, header and page background belong to DashboardLayout.
 */
const SCHEDULE_PROMPT =
  "Let's set up a scheduled check-in. Tell me what kinds of things ICOGON can check for me, then suggest two or three concrete check-ins for my workspace, including what to check and how often. I'll choose or adjust one before scheduling.";

export default function AutomationsPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const startScheduling = () => {
    navigate("/dashboard", {
      state: {
        intent: "schedule_automation",
        initialPrompt: SCHEDULE_PROMPT,
        initialMode: "Chat",
      },
    });
  };

  const buttonClasses = `inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
    isDark
      ? "border-[#494949] bg-[#1d1d1d] text-white hover:bg-[#303030] focus-visible:ring-offset-[#202020]"
      : "border-[#d5d8df] bg-white text-[#171717] hover:bg-[#f2f4f7] focus-visible:ring-offset-white"
  }`;

  return (
    <section
      aria-label="Automations"
      className={`flex min-h-[calc(100dvh-108px)] w-full min-w-0 flex-col px-4 pb-10 pt-5 sm:px-7 sm:pt-7 lg:px-10 ${
        isDark ? "text-[#f5f5f5]" : "text-[#171717]"
      }`}
    >
      <div
        className={`flex min-h-[min(680px,calc(100dvh-155px))] w-full flex-1 flex-col rounded-[20px] border shadow-sm ${
          isDark
            ? "border-[#3a3a3a] bg-[#1b1b1b]"
            : "border-[#e2e5e9] bg-white"
        }`}
      >
        <header className="mx-auto flex w-full max-w-5xl flex-wrap items-start justify-between gap-4 px-5 pb-6 pt-7 sm:px-8 sm:pt-9">
          <div className="min-w-0">
            <h1 className="text-[25px] font-semibold tracking-[-0.03em]">Automations</h1>
            <p className={`mt-1 text-sm ${isDark ? "text-[#aaa]" : "text-[#687383]"}`}>
              Scheduled check-ins for your workspace
            </p>
          </div>
          <button type="button" onClick={startScheduling} className={buttonClasses}>
            <Plus size={17} aria-hidden="true" />
            Schedule a task
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-14 pt-7 text-center sm:pb-20">
          <Clock3
            size={34}
            strokeWidth={1.5}
            className={`mb-5 ${isDark ? "text-[#929292]" : "text-[#8a94a4]"}`}
            aria-hidden="true"
          />
          <h2 className="text-[19px] font-semibold tracking-[-0.02em]">
            No automations yet
          </h2>
          <p className={`mt-2 max-w-410px text-sm leading-6 ${isDark ? "text-[#aaa]" : "text-[#687383]"}`}>
            Ask ICOGON to schedule a task and it will appear here once scheduling is enabled.
          </p>
          <button type="button" onClick={startScheduling} className={`${buttonClasses} mt-5`}>
            <CalendarClock size={17} aria-hidden="true" />
            Schedule a task
          </button>
        </div>
      </div>
    </section>
  );
}

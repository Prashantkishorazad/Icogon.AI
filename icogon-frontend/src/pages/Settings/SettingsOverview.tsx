import { ArrowRight, Plug, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";

const overviewCards = [
  {
    title: "Workspace & access",
    description: "Manage workspace details, members and who can access your projects.",
    path: "/settings/workspace",
    icon: Users,
    label: "Workspace",
  },
  {
    title: "Connectors",
    description: "Configure connected apps, integrations and workspace connector policies.",
    path: "/settings/connector-settings",
    icon: Plug,
    label: "Integrations",
  },
  {
    title: "Privacy & security",
    description: "Review privacy controls and the security configuration for your workspace.",
    path: "/settings/privacy-security",
    icon: ShieldCheck,
    label: "Security",
  },
];

const SettingsOverview = () => (
  <div className="mx-auto max-w-[1050px]">
    <div className="mb-8">
      <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[#929292]">
        ICOGON workspace
      </p>
      <h1 className="text-[27px] font-semibold tracking-[-0.035em] text-[#171717] sm:text-[32px]">
        Settings
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#777]">
        Manage your workspace, connected tools, access and security from one place.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {overviewCards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            to={card.path}
            className="group rounded-2xl border border-[#e7e7e7] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d0d0d0] hover:shadow-[0_8px_28px_rgba(0,0,0,0.045)]"
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#ededed] bg-[#fafafa] text-[#555]">
              <Icon size={19} strokeWidth={1.8} />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#999]">
              {card.label}
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#222]">{card.title}</h2>
              <ArrowRight size={16} className="shrink-0 text-[#aaa] transition group-hover:translate-x-1 group-hover:text-[#333]" />
            </div>
            <p className="mt-2 text-[12px] leading-5 text-[#818181]">{card.description}</p>
          </Link>
        );
      })}
    </div>

    <section className="mt-8 rounded-2xl border border-[#e7e7e7] bg-white p-5 sm:p-6">
      <h2 className="text-[14px] font-semibold text-[#222]">Settings foundation</h2>
      <p className="mt-1 text-[12px] leading-5 text-[#858585]">
        Navigation and page routing are now centralized. Workspace persistence, role-based access,
        connector administration and the remaining settings actions will be connected in the next implementation stages.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Centralized navigation", "Responsive layout", "Protected routes"].map((label) => (
          <span key={label} className="rounded-full border border-[#e9e9e9] bg-[#fafafa] px-3 py-1.5 text-[11px] text-[#666]">
            {label}
          </span>
        ))}
      </div>
    </section>
  </div>
);

export default SettingsOverview;

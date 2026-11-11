import { ArrowRight, Database, Plug, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const connectorAreas = [
  {
    title: "App connectors",
    description: "Manage user-authorized connections such as Gmail, Slack, Google Drive and GitHub.",
    detail: "OAuth connections",
    icon: Plug,
    path: "/connectors",
  },
  {
    title: "Workspace security",
    description: "Define workspace-wide connector availability and authorization policies.",
    detail: "Admin controls",
    icon: ShieldCheck,
    path: "/settings/privacy-security",
  },
  {
    title: "MCP registries",
    description: "Browse MCP registries and prepare server connections for the ICOGON agent runtime.",
    detail: "MCP infrastructure",
    icon: Database,
    path: "/settings/mcp-server",
  },
];

const ConnectorSettingsPage = () => (
  <div className="mx-auto max-w-[1050px]">
    <div className="mb-8">
      <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[#929292]">
        Customization
      </p>
      <h1 className="text-[27px] font-semibold tracking-[-0.035em] text-[#171717] sm:text-[32px]">
        Connector settings
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#777]">
        Configure how apps, workspace integrations and MCP tools become available to ICOGON.
      </p>
    </div>

    <div className="space-y-4">
      {connectorAreas.map((area) => {
        const Icon = area.icon;
        return (
          <Link
            key={area.title}
            to={area.path}
            className="group flex flex-col gap-4 rounded-2xl border border-[#e7e7e7] bg-white p-5 transition hover:border-[#d2d2d2] hover:shadow-[0_8px_28px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ededed] bg-[#fafafa] text-[#555]">
              <Icon size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14px] font-semibold text-[#222]">{area.title}</h2>
                <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] text-[#777]">{area.detail}</span>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-[#818181]">{area.description}</p>
            </div>
            <ArrowRight size={17} className="shrink-0 text-[#aaa] transition group-hover:translate-x-1 group-hover:text-[#333]" />
          </Link>
        );
      })}
    </div>

    <div className="mt-7 rounded-2xl border border-[#e7e7e7] bg-white p-5">
      <h2 className="text-[13px] font-semibold text-[#292929]">Connector lifecycle</h2>
      <p className="mt-1 text-[12px] leading-5 text-[#858585]">
        The next connector milestone will unify provider discovery, OAuth callbacks, encrypted credential
        storage, connection health, permissions and disconnect behavior behind one backend contract.
        Existing Gmail functionality remains available through the Connectors page.
      </p>
    </div>
  </div>
);

export default ConnectorSettingsPage;

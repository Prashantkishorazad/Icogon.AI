import { ArrowLeft, ArrowUpRight, Construction } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findSettingsItem } from "../../data/settingsNavigation";

const SettingsSectionPage = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const item = sectionId ? findSettingsItem(sectionId) : undefined;

  if (!item) return <Navigate to="/settings" replace />;

  const Icon = item.icon;

  return (
    <div className="mx-auto max-w-[920px]">
      <Link
        to="/settings"
        className="mb-6 inline-flex items-center gap-2 text-[12px] text-[#888] transition hover:text-[#222]"
      >
        <ArrowLeft size={14} />
        All settings
      </Link>

      <div className="border-b border-[#e8e8e8] pb-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e8e8] bg-white text-[#555]">
          <Icon size={19} />
        </div>
        <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-[#171717]">
          {item.label}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#777]">
          {item.description}
        </p>
      </div>

      <section className="mt-7 rounded-2xl border border-[#e8e8e8] bg-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f3f3] text-[#666]">
            <Construction size={17} />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[#252525]">
              Settings page foundation is ready
            </h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#818181]">
              This page is registered in the settings navigation and routing system. Its data model,
              backend endpoints and interactive controls will be implemented in the corresponding feature stage.
              No settings are being silently saved or simulated yet.
            </p>
            <span className="mt-4 inline-flex rounded-full border border-[#e9e9e9] bg-[#fafafa] px-2.5 py-1 text-[10px] font-medium text-[#777]">
              Foundation only · Backend integration pending
            </span>
          </div>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-white px-4 py-3">
        <div>
          <p className="text-[12px] font-medium text-[#333]">Need to configure an integration?</p>
          <p className="mt-0.5 text-[11px] text-[#888]">Open connector administration.</p>
        </div>
        <Link
          to="/settings/connector-settings"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#333] hover:text-black"
        >
          Connectors <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default SettingsSectionPage;

import React from "react";
import { ExternalLink, Globe2 } from "lucide-react";
import type { ProjectResponse } from "../../api/projectApi";

type ProjectWithPreview = ProjectResponse & {
  preview_url?: string | null;
  preview_image_url?: string | null;
  thumbnail_url?: string | null;
  screenshot_url?: string | null;
  visibility?: string | null;
  status?: string | null;
  last_opened_at?: string | null;
  last_opened?: string | null;
};

interface Props {
  project: ProjectResponse;
  isDark: boolean;
  onOpen: () => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const MetaItem: React.FC<{ label: string; value: string; isDark: boolean }> = ({
  label, value, isDark,
}) => (
  <div className="min-w-0">
    <p className={`text-[10px] ${isDark ? "text-[#777]" : "text-slate-400"}`}>{label}</p>
    <p className={`mt-1 truncate text-[12px] font-medium ${isDark ? "text-[#dedede]" : "text-slate-700"}`}>
      {value}
    </p>
  </div>
);

const SearchPreviewPanel: React.FC<Props> = ({ project, isDark, onOpen }) => {
  const details = project as ProjectWithPreview;
  const previewImage =
    details.preview_image_url ||
    details.thumbnail_url ||
    details.screenshot_url ||
    details.preview_url ||
    undefined;

  return (
    <aside className={`hidden min-w-0 flex-[1_1_50%] flex-col border-l md:flex ${
      isDark ? "border-[#292929] bg-[#101010]" : "border-slate-200 bg-[#fcfcfd]"
    }`}>
      <header className={`flex h-[62px] shrink-0 items-center border-b px-5 ${
        isDark ? "border-[#292929]" : "border-slate-200"
      }`}>
        <span className={`text-[11px] font-medium ${isDark ? "text-[#858585]" : "text-slate-400"}`}>
          Preview
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        <div className={`relative mb-4 aspect-video w-full overflow-hidden rounded-lg border ${
          isDark ? "border-[#303030] bg-[#181818]" : "border-slate-200 bg-slate-100"
        }`}>
          {previewImage ? (
            <img
              src={previewImage}
              alt={`${project.name} website preview`}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className={`flex h-full w-full flex-col ${isDark ? "bg-[#171717]" : "bg-white"}`}>
              <div className={`flex h-6 shrink-0 items-center gap-1.5 border-b px-2 ${
                isDark ? "border-[#303030] bg-[#202020]" : "border-slate-200 bg-slate-50"
              }`}>
                <i className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />
                <i className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]" />
                <i className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                <span className={`ml-1 flex-1 truncate rounded px-2 py-0.5 text-[7px] ${
                  isDark ? "bg-[#151515] text-[#777]" : "bg-white text-slate-400"
                }`}>Website preview</span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-3">
                <Globe2 size={20} className={isDark ? "text-[#555]" : "text-slate-300"} />
                <span className={`max-w-full truncate text-[10px] font-semibold ${
                  isDark ? "text-[#999]" : "text-slate-500"
                }`}>{project.name}</span>
              </div>
            </div>
          )}
        </div>

        <h2 className={`truncate text-[18px] font-semibold tracking-tight ${
          isDark ? "text-white" : "text-slate-900"
        }`}>{project.name}</h2>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4">
          <MetaItem label="Owner" value="You" isDark={isDark} />
          <MetaItem label="Status" value={details.visibility || details.status || "—"} isDark={isDark} />
          <MetaItem label="Created" value={formatDate(project.created_at)} isDark={isDark} />
          <MetaItem label="Last edited" value={formatDate(project.updated_at)} isDark={isDark} />
          <MetaItem
            label="Last opened"
            value={formatDate(details.last_opened_at || details.last_opened)}
            isDark={isDark}
          />
        </div>

        <button
          type="button"
          onClick={onOpen}
          className={`mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-medium transition ${
            isDark ? "bg-white text-black hover:bg-[#e5e5e5]" : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          Open project <ExternalLink size={13} />
        </button>
      </div>
    </aside>
  );
};

export default SearchPreviewPanel;


import {
  Check,
  Copy,
  ExternalLink,
  FolderCog,
  Globe,
  Info,
  LockKeyhole,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

type Props = {
  projectName: string;
  projectId?: string;
  onRename?: () => void;
  onOpenProject?: () => void;
};

export default function ProjectSettings({
  projectName,
  projectId,
  onRename,
  onOpenProject,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyProjectId = async () => {
    if (!projectId || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(projectId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-7 p-5 text-slate-800 sm:p-7">
      {/* Page heading */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">
          <FolderCog size={13} />
          Workspace configuration
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Project settings
        </h2>

        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Manage project information and review the configuration
          available for this workspace.
        </p>
      </header>

      {/* General settings */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <FolderCog size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              General
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Basic information about your project.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-xs font-medium text-slate-600"
            >
              Project name
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="project-name"
                type="text"
                readOnly
                value={projectName || ""}
                placeholder="Untitled project"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none"
              />

              <button
                type="button"
                disabled={!onRename}
                onClick={onRename}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Pencil size={13} />
                Rename project
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              Your project name is displayed throughout the workspace.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-600">
                  Project ID
                </p>

                <p className="mt-1 break-all font-mono text-[11px] text-slate-400">
                  {projectId || "Project ID unavailable"}
                </p>
              </div>

              {projectId && (
                <button
                  type="button"
                  onClick={() => void handleCopyProjectId()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {copied ? (
                    <Check
                      size={12}
                      className="text-emerald-600"
                    />
                  ) : (
                    <Copy size={12} />
                  )}

                  {copied ? "Copied" : "Copy ID"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <Globe size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Deployment
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Publishing and hosting configuration.
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <Info
              size={16}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-xs font-semibold text-amber-900">
                Deployment provider not configured
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800/80">
                This project settings panel does not currently have a
                connected deployment provider. Hosting, custom domains,
                and deployment status cannot be managed here yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Security
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Project protection and verification.
            </p>
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-start gap-3">
            <LockKeyhole
              size={16}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div>
              <p className="text-xs font-medium text-slate-700">
                Security verification
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Security scan results are not currently available through
                this settings component. No security verification is
                being claimed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project details */}
      {onOpenProject && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              More project information
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Open the project's detailed information.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenProject}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            Open project details
            <ExternalLink size={13} />
          </button>
        </div>
      )}
    </section>
  );
}

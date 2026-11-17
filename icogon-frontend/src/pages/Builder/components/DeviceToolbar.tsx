
import {
  // Check,
  Maximize2,
  Minimize2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";

export type DeviceMode = "desktop" | "tablet" | "mobile";

type Props = {
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  fullscreen?: boolean;
  refreshing?: boolean;
  refreshDisabled?: boolean;
};

const DEVICE_MODES = [
  {
    id: "desktop",
    label: "Desktop",
    description: "Full-width desktop preview",
    Icon: Monitor,
  },
  {
    id: "tablet",
    label: "Tablet",
    description: "Tablet-sized preview",
    Icon: Tablet,
  },
  {
    id: "mobile",
    label: "Mobile",
    description: "Mobile-sized preview",
    Icon: Smartphone,
  },
] as const;

export default function DeviceToolbar({
  device,
  onDeviceChange,
  onRefresh,
  onFullscreen,
  fullscreen = false,
  refreshing = false,
  refreshDisabled = false,
}: Props) {
  const canRefresh =
    Boolean(onRefresh) && !refreshDisabled && !refreshing;

  return (
    <div
      className="flex items-center gap-2"
      role="toolbar"
      aria-label="Preview controls"
    >
      {/* Responsive device selector */}
      <div
        className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-1"
        role="group"
        aria-label="Preview device size"
      >
        {DEVICE_MODES.map(({ id, label, description, Icon }) => {
          const selected = device === id;

          return (
            <button
              key={id}
              type="button"
              title={`${label}: ${description}`}
              aria-label={`${label} preview`}
              aria-pressed={selected}
              onClick={() => onDeviceChange(id)}
              className={`group relative grid h-8 w-8 place-items-center rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 ${
                selected
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-400 hover:bg-white/70 hover:text-slate-700"
              }`}
            >
              <Icon size={15} strokeWidth={selected ? 2.2 : 1.8} />

              {selected && (
                <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>

      <span
        className="hidden h-5 w-px bg-slate-200 sm:block"
        aria-hidden="true"
      />

      {/* Refresh */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={!canRefresh}
        aria-label={
          refreshing ? "Refreshing preview" : "Refresh preview"
        }
        title={
          refreshing
            ? "Refreshing preview..."
            : refreshDisabled
              ? "Preview refresh unavailable"
              : "Refresh preview"
        }
        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <RefreshCw
          size={15}
          className={refreshing ? "animate-spin" : ""}
        />
      </button>

      {/* Fullscreen */}
      <button
        type="button"
        onClick={onFullscreen}
        disabled={!onFullscreen}
        aria-label={
          fullscreen ? "Exit fullscreen" : "Maximize preview"
        }
        title={
          fullscreen ? "Exit fullscreen" : "Maximize preview"
        }
        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {fullscreen ? (
          <Minimize2 size={15} />
        ) : (
          <Maximize2 size={15} />
        )}
      </button>

      <span className="sr-only" aria-live="polite">
        {refreshing
          ? "Preview is refreshing"
          : `${device} preview selected`}
      </span>
    </div>
  );
}

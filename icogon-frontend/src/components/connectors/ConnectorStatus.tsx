import {
  CheckCircle2,
  Circle,
} from "lucide-react";

interface ConnectorStatusProps {
  connected: boolean;
  email?: string | null;
}

const ConnectorStatus = ({
  connected,
  email,
}: ConnectorStatusProps) => {
  if (connected) {
    return (
      <div
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-emerald-200
          bg-emerald-50
          px-3
          py-1.5
        "
      >
        <CheckCircle2
          size={14}
          className="text-emerald-600"
        />

        <span
          className="
            text-xs
            font-medium
            text-emerald-700
          "
        >
          Connected
        </span>

        {email && (
          <span
            className="
              max-w-[180px]
              truncate
              text-xs
              text-emerald-600
            "
          >
            {email}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-slate-200
        bg-slate-50
        px-3
        py-1.5
      "
    >
      <Circle
        size={12}
        className="text-slate-400"
      />

      <span
        className="
          text-xs
          font-medium
          text-slate-500
        "
      >
        Not connected
      </span>
    </div>
  );
};

export default ConnectorStatus;
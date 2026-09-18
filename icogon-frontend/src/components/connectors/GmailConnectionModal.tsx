import {
  X,
  Mail,
  ShieldCheck,
} from "lucide-react";

import GmailConnectButton from "./GmailConnectButton";

interface GmailConnectionModalProps {
  open: boolean;
  onClose: () => void;
}

const GmailConnectionModal = ({
  open,
  onClose,
}: GmailConnectionModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[1000]

        flex
        items-center
        justify-center

        bg-slate-950/30
        px-4

        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          w-full
          max-w-md

          rounded-2xl
          border
          border-slate-200

          bg-white

          p-6

          shadow-2xl
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4

            flex
            h-8
            w-8
            items-center
            justify-center

            rounded-lg

            text-slate-400

            transition

            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          <X size={17} />
        </button>

        {/* ICON */}

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center

            rounded-xl

            bg-red-50
          "
        >
          <Mail
            size={23}
            className="text-red-500"
          />
        </div>

        {/* TITLE */}

        <h2
          className="
            mt-5
            text-xl
            font-semibold
            text-slate-900
          "
        >
          Connect Gmail
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Connect your Gmail account to
          use Gmail with ICOGON AI.
        </p>

        {/* SECURITY */}

        <div
          className="
            mt-5
            flex
            gap-3

            rounded-xl
            border
            border-slate-200
            bg-slate-50

            p-4
          "
        >
          <ShieldCheck
            size={18}
            className="
              mt-0.5
              shrink-0
              text-emerald-600
            "
          />

          <div>
            <p
              className="
                text-sm
                font-medium
                text-slate-800
              "
            >
              Secure Google connection
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500
              "
            >
              You'll be redirected to
              Google to authorize access.
            </p>
          </div>
        </div>

        {/* BUTTON */}

        <div
          className="
            mt-6
            flex
            justify-end
          "
        >
          <GmailConnectButton />
        </div>
      </div>
    </div>
  );
};

export default GmailConnectionModal;
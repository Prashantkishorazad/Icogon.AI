import {
  Mail,
  ExternalLink,
} from "lucide-react";

import GmailConnectButton from "./GmailConnectButton";
import ConnectorStatus from "./ConnectorStatus";

interface ConnectorCardProps {
  connected: boolean;
  email?: string | null;
  onConnect?: () => void;
  onOpen?: () => void;
}

const ConnectorCard = ({
  connected,
  email,
  onConnect,
  onOpen,
}: ConnectorCardProps) => {
  return (
    <div
      className="
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm

        transition
        hover:shadow-md
      "
    >
      {/* ====================================================
          TOP
      ==================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {/* Gmail icon */}

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center

              rounded-xl

              border
              border-slate-200

              bg-slate-50
            "
          >
            <Mail
              size={24}
              className="text-red-500"
            />
          </div>

          <div>
            <h3
              className="
                text-base
                font-semibold
                text-slate-900
              "
            >
              Gmail
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Connect your Gmail account
            </p>
          </div>
        </div>

        <ConnectorStatus
          connected={connected}
          email={email}
        />
      </div>

      {/* ====================================================
          DESCRIPTION
      ==================================================== */}

      <p
        className="
          mt-5
          max-w-[620px]
          text-sm
          leading-6
          text-slate-500
        "
      >
        Connect Gmail with ICOGON AI to
        securely access your email data
        and use Gmail inside your
        AI-powered workflows.
      </p>

      {/* ====================================================
          CONNECTED ACCOUNT
      ==================================================== */}

      {connected && email && (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-emerald-100
            bg-emerald-50/60
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              text-emerald-600
            "
          >
            Connected account
          </p>

          <p
            className="
              mt-1
              truncate
              text-sm
              font-medium
              text-emerald-800
            "
          >
            {email}
          </p>
        </div>
      )}

      {/* ====================================================
          ACTION
      ==================================================== */}

      <div
        className="
          mt-6
          flex
          flex-wrap
          items-center
          gap-3
        "
      >
        {!connected ? (
          <GmailConnectButton
            onConnectedStart={onConnect}
          />
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="
              inline-flex
              items-center
              gap-2

              rounded-lg

              border
              border-slate-200

              bg-slate-900

              px-4
              py-2.5

              text-sm
              font-medium
              text-white

              transition

              hover:bg-slate-800
            "
          >
            Open Gmail
            <ExternalLink size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectorCard;
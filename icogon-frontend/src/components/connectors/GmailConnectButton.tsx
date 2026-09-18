import { useState } from "react";

import {
  Loader2,
  Mail,
} from "lucide-react";

import {
  connectGmail,
} from "../../api/connectorsApi";


// ==========================================================
// TYPES
// ==========================================================

interface GmailConnectButtonProps {
  onConnectedStart?: () => void;
}


// ==========================================================
// COMPONENT
// ==========================================================

const GmailConnectButton = ({
  onConnectedStart,
}: GmailConnectButtonProps) => {

  // ========================================================
  // STATE
  // ========================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ========================================================
  // CONNECT GMAIL
  // ========================================================

  const handleConnect =
    async (): Promise<void> => {

      try {
        setLoading(true);
        setError("");

        onConnectedStart?.();

        await connectGmail();

      } catch (err: unknown) {

        console.error(
          "GMAIL CONNECT ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect Gmail."
        );

        setLoading(false);
      }
    };


  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div>

      <button
        type="button"
        onClick={() => {
          void handleConnect();
        }}
        disabled={loading}
        className="
          inline-flex
          items-center
          justify-center
          gap-2

          rounded-lg

          border
          border-slate-200

          bg-white

          px-4
          py-2.5

          text-sm
          font-medium
          text-slate-700

          shadow-sm

          transition

          hover:bg-slate-50
          hover:border-slate-300

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >

        {loading ? (
          <Loader2
            size={16}
            className="animate-spin"
          />
        ) : (
          <Mail size={16} />
        )}

        {loading
          ? "Connecting..."
          : "Connect Gmail"}

      </button>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <p
          className="
            mt-2
            max-w-[280px]
            text-xs
            leading-5
            text-red-500
          "
        >
          {error}
        </p>
      )}

    </div>
  );
};


// ==========================================================
// EXPORT
// ==========================================================

export default GmailConnectButton;
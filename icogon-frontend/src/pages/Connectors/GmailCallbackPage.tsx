import {
  useEffect,
} from "react";

import {
  Loader2,
  Mail,
} from "lucide-react";

const GmailCallbackPage = () => {
  useEffect(() => {
    // Backend handles the actual Google OAuth callback.
    // This page is kept available for future OAuth flows.
  }, []);

  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#faf9f6]
        px-6
      "
    >
      <div
        className="
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-red-50
          "
        >
          <Mail
            size={24}
            className="text-red-500"
          />
        </div>

        <Loader2
          size={20}
          className="
            mx-auto
            mt-5
            animate-spin
            text-slate-400
          "
        />

        <h1
          className="
            mt-4
            text-lg
            font-semibold
            text-slate-800
          "
        >
          Connecting Gmail...
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Please wait.
        </p>
      </div>
    </div>
  );
};

export default GmailCallbackPage;
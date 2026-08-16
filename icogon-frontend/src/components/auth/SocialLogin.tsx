import { signInWithGoogle } from "./supabaseAuth";

interface SocialLoginProps {
  onGithub?: () => void;
  onApple?: () => void;
}

const SocialLogin = ({
  onGithub,
  onApple,
}: SocialLoginProps) => {

  const handleGoogleLogin = async () => {
    try {
      console.log("Google login clicked");

      await signInWithGoogle();

    } catch (error) {
      console.error("Google login failed:", error);

      alert("Google login failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">

      {/* Google */}

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-slate-300
          bg-white
          px-5
          py-3.5
          font-medium
          text-slate-900
          transition-all
          duration-300
          hover:scale-[1.02]
          hover:shadow-xl
        "
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="h-6 w-6"
        />

        Continue with Google
      </button>

      {/* GitHub */}

      <button
        type="button"
        onClick={onGithub}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-slate-700
          bg-[#111827]
          px-5
          py-3.5
          font-medium
          text-white
          transition-all
          duration-300
          hover:border-cyan-400
          hover:scale-[1.02]
        "
      >
        <span className="text-xl">GitHub</span>

        Continue with GitHub
      </button>

      {/* Apple */}

      <button
        type="button"
        onClick={onApple}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-slate-700
          bg-black
          px-5
          py-3.5
          font-medium
          text-white
          transition-all
          duration-300
          hover:border-cyan-400
          hover:scale-[1.02]
        "
      >
        <img
          src="https://cdn.simpleicons.org/apple/ffffff"
          alt="Apple"
          className="h-6 w-6"
        />

        Continue with Apple
      </button>

      {/* Divider */}

      <div className="flex items-center gap-4 py-2">

        <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />

        <span className="text-sm text-slate-500">
          OR
        </span>

        <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />

      </div>

    </div>
  );
};

export default SocialLogin;
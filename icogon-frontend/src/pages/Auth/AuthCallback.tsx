import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

/** Landing point registered for all Supabase OAuth providers. */
const AuthCallback = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const completeSignIn = async () => {
      // Supabase detectSessionInUrl processes the provider's OAuth response.
      const url = new URL(window.location.href);
      const queryError = url.searchParams.get("error_description") || url.searchParams.get("error");
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const hashError = hash.get("error_description") || hash.get("error");
      if (queryError || hashError) {
        if (active) setError(queryError || hashError);
        return;
      }

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) throw new Error("No session was returned by the provider. Verify your OAuth redirect URLs and retry.");
        if (!active) return;
        setSession(data.session);
        if (url.searchParams.get("popup") === "1" || sessionStorage.getItem("icogon:oauth-popup") === "1") {
          sessionStorage.removeItem("icogon:oauth-popup");
          window.close();
        }
        // If the browser refuses to close the popup, it remains usable.
        navigate("/dashboard", { replace: true });
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to complete sign-in.");
      }
    };

    void completeSignIn();
    return () => { active = false; };
  }, [navigate, setSession]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#f7f8fb] px-5 text-[#222]">
      <section className="w-full max-w-[420px] rounded-[24px] border border-[#e3e5eb] bg-white p-9 text-center shadow-[0_28px_90px_rgba(16,24,40,0.09)]" aria-live="polite">
        {error ? (
          <>
            <AlertCircle className="mx-auto text-red-600" size={32} aria-hidden="true" />
            <h1 className="mt-4 text-[21px] font-semibold">Sign-in wasn't completed</h1>
            <p role="alert" className="mt-3 break-words text-[13px] leading-6 text-[#667085]">{error}</p>
            <Link className="mt-6 inline-flex rounded-full bg-[#2458ec] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#1947cb]" to="/login">Back to login</Link>
          </>
        ) : (
          <>
            <LoaderCircle className="mx-auto animate-spin text-[#2458ec] motion-reduce:animate-none" size={30} aria-hidden="true" />
            <h1 className="mt-5 text-[20px] font-semibold">Signing you in...</h1>
            <p className="mt-2 text-[13px] text-[#667085]">Completing your secure authentication.</p>
          </>
        )}
      </section>
    </main>
  );
};

export default AuthCallback;

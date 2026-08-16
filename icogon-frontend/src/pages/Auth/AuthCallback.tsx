import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        // Supabase automatically detects the OAuth
        // tokens from the URL and restores the session.
        const { data, error } =
          await supabase.auth.getSession();

        if (error) {
          console.error(
            "Auth callback error:",
            error
          );

          if (mounted) {
            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        if (data.session) {
          console.log(
            "Google authentication successful"
          );

          if (mounted) {
            navigate("/dashboard", {
              replace: true,
            });
          }
        } else {
          console.error(
            "No Supabase session found"
          );

          if (mounted) {
            navigate("/login", {
              replace: true,
            });
          }
        }
      } catch (error) {
        console.error(
          "OAuth callback failed:",
          error
        );

        if (mounted) {
          navigate("/login", {
            replace: true,
          });
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1115]">
      <div className="text-center">

        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

        <h2 className="text-xl font-semibold text-white">
          Signing you in...
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while we complete Google authentication.
        </p>

      </div>
    </div>
  );
};

export default AuthCallback;
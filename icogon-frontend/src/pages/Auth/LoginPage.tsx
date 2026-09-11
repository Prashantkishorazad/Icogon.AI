import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  X,
  // Github,
  Apple,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";

// Google Authentication
import { signInWithGoogle } from "../../services/supabaseAuth";

const LoginPage = () => {
  const navigate = useNavigate();

  const { loginUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ==========================================
  // CLOSE LOGIN POPUP
  // ==========================================

  const handleClose = () => {
    navigate("/");
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      await signInWithGoogle();

    } catch (error) {
      console.error("Google login error:", error);

      alert(
        "Google login failed. Please try again."
      );

      setGoogleLoading(false);
    }
  };

  // ==========================================
  // EMAIL / PASSWORD LOGIN
  // ==========================================

  const onSubmit = async (
    data: LoginFormData
  ) => {
    try {
      const result = await loginUser(
        data.email,
        data.password
      );

      if (!result.success) {
        alert(
          result.error || "Invalid Credentials"
        );
      }

    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">

      {/* ==========================================
          LOGIN MODAL
      ========================================== */}

      <div
        className="
          relative
          w-full
          max-w-[620px]
          rounded-[32px]
          border
          border-white/10
          bg-[#111318]
          px-6
          py-7
          shadow-2xl
          shadow-black/50
          sm:px-10
          sm:py-9
        "
      >

        {/* ==========================================
            CLOSE BUTTON
        ========================================== */}

        <button
          type="button"
          onClick={handleClose}
          className="
            absolute
            right-5
            top-5
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            text-slate-400
            transition
            hover:bg-white/10
            hover:text-white
          "
          aria-label="Close login"
        >
          <X size={24} />
        </button>


        {/* ==========================================
            LOGO
        ========================================== */}

        <div
          className="
            mb-7
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-blue-500
            via-cyan-400
            to-purple-500
            shadow-lg
            shadow-blue-500/20
          "
        >
          <span className="text-lg font-black text-white">
            I
          </span>
        </div>


        {/* ==========================================
            HEADING
        ========================================== */}

        <div className="mb-7">

          <p className="text-3xl font-bold text-slate-400 sm:text-4xl">
            Start building.
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Log in to your account
          </h1>

        </div>


        {/* ==========================================
            GOOGLE LOGIN
        ========================================== */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="
            flex
            h-14
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-white/15
            bg-white
            text-base
            font-medium
            text-black
            transition
            hover:bg-slate-100
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >

          <span className="text-xl font-bold text-[#4285F4]">
            G
          </span>

          {googleLoading
            ? "Connecting to Google..."
            : "Continue with Google"}

        </button>


        {/* ==========================================
            OTHER SOCIAL LOGINS
        ========================================== */}

        <div className="mt-3 grid grid-cols-2 gap-3">

          {/* GitHub */}

          <button
            type="button"
            className="
              flex
              h-13
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              font-medium
              text-white
              transition
              hover:bg-white/[0.08]
            "
          >
            {/*<Github size={20} />*/}

            GitHub
          </button>


          {/* Apple */}

          <button
            type="button"
            className="
              flex
              h-13
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              font-medium
              text-white
              transition
              hover:bg-white/[0.08]
            "
          >
            <Apple size={20} />

            Apple
          </button>

        </div>


        {/* ==========================================
            OR DIVIDER
        ========================================== */}

        <div className="my-6 flex items-center gap-4">

          <div className="h-px flex-1 bg-white/10" />

          <span className="text-sm font-medium text-slate-500">
            OR
          </span>

          <div className="h-px flex-1 bg-white/10" />

        </div>


        {/* ==========================================
            LOGIN FORM
        ========================================== */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          {/* EMAIL */}

          <div>

            <div className="relative">

              <Mail
                size={19}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                type="email"
                placeholder="Email address"
                {...register("email")}
                className={`
                  h-14
                  w-full
                  rounded-2xl
                  border
                  bg-white/[0.03]
                  pl-12
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-500
                  ${
                    errors.email
                      ? "border-red-500"
                      : "border-white/10 focus:border-blue-500"
                  }
                `}
              />

            </div>

            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}

          </div>


          {/* PASSWORD */}

          <div>

            <div className="relative">

              <Lock
                size={19}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                {...register("password")}
                className={`
                  h-14
                  w-full
                  rounded-2xl
                  border
                  bg-white/[0.03]
                  pl-12
                  pr-12
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-500
                  ${
                    errors.password
                      ? "border-red-500"
                      : "border-white/10 focus:border-blue-500"
                  }
                `}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                  transition
                  hover:text-white
                "
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}

          </div>


          {/* ==========================================
              FORGOT PASSWORD
          ========================================== */}

          <div className="flex justify-end">

            <Link
              to="/forgot-password"
              className="
                text-sm
                text-slate-400
                transition
                hover:text-cyan-400
              "
            >
              Forgot password?
            </Link>

          </div>


          {/* ==========================================
              LOGIN BUTTON
          ========================================== */}

          <button
            type="submit"
            disabled={isLoading}
            className="
              h-14
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              via-blue-500
              to-cyan-500
              font-semibold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition
              hover:scale-[1.01]
              hover:shadow-blue-500/30
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isLoading
              ? "Please Wait..."
              : "Continue"}
          </button>

        </form>


        {/* ==========================================
            SIGNUP
        ========================================== */}

        <div className="mt-6 text-center">

          <p className="text-sm text-slate-400">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="
                font-semibold
                text-white
                transition
                hover:text-cyan-400
              "
            >
              Create account
            </Link>

          </p>


          {/* MOBILE LOGIN */}

          <Link
            to="/phone-login"
            className="
              mt-5
              flex
              h-13
              w-full
              items-center
              justify-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              text-sm
              font-medium
              text-slate-300
              transition
              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            <Phone size={18} />

            Continue with Mobile
          </Link>

        </div>


        {/* ==========================================
            TERMS
        ========================================== */}

        <p className="mt-6 text-center text-xs text-slate-600">
          By continuing, you agree to our{" "}

          <span className="underline">
            Terms of Service
          </span>

          {" "}and{" "}

          <span className="underline">
            Privacy Policy
          </span>

        </p>

      </div>

    </div>
  );
};

export default LoginPage;
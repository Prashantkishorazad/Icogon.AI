import { useState } from "react";

import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupSchema,
  type SignupFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";
import { signInWithGoogle } from "../../services/supabaseAuth";

import { supabase } from "../../lib/supabase";

import logo from "../../assets/logo.png";

interface SignupModalProps {
  onClose: () => void;
  onLogin: () => void;
}

const SignupModal = ({
  onClose,
  onLogin,
}: SignupModalProps) => {
  const { signupUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [githubLoading, setGithubLoading] =
    useState(false);

  const [appleLoading, setAppleLoading] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // ============================================================
  // GOOGLE
  // ============================================================

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);

      await signInWithGoogle();
    } catch (error) {
      console.error(
        "Google signup error:",
        error
      );

      alert(
        "Google signup failed. Please try again."
      );

      setGoogleLoading(false);
    }
  };

  // ============================================================
  // GITHUB
  // ============================================================

  const handleGithubSignup = async () => {
    try {
      setGithubLoading(true);

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "GitHub signup error:",
        error
      );

      alert(
        "GitHub signup failed. Please try again."
      );

      setGithubLoading(false);
    }
  };

  // ============================================================
  // APPLE
  // ============================================================

  const handleAppleSignup = async () => {
    try {
      setAppleLoading(true);

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Apple signup error:",
        error
      );

      alert(
        "Apple signup failed. Please try again."
      );

      setAppleLoading(false);
    }
  };

  // ============================================================
  // EMAIL SIGNUP
  // ============================================================

  const onSubmit = async (
    data: SignupFormData
  ) => {
    try {
      const result = await signupUser(
        data.full_name,
        data.email,
        data.password
      );

      if (!result.success) {
        alert(
          result.error ||
            "Signup failed. Please try again."
        );
      }
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      alert(
        "Something went wrong while creating your account."
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="
          fixed
          inset-0
          z-[999]
          flex
          items-center
          justify-center
          bg-slate-950/30
          px-4
          py-3
          backdrop-blur-[3px]
        "
      >
        {/* ======================================================
            COMPACT MODAL
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.97,
            y: 8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.97,
            y: 8,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          onClick={(event) =>
            event.stopPropagation()
          }
          className="
            relative
            w-full
            max-w-[400px]
            overflow-hidden
            rounded-[25px]
            border
            border-[#e5e2dc]
            bg-[#FCFBF8]
            px-6
            py-5
            shadow-[0_25px_70px_rgba(15,23,42,0.20)]
            sm:px-7
            sm:py-5
          "
        >
          {/* ==================================================
              CLOSE
          ================================================== */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close signup"
            className="
              absolute
              right-4
              top-4
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-slate-500
              transition
              hover:bg-[#efede8]
              hover:text-slate-900
              active:scale-95
            "
          >
            <X
              size={18}
              strokeWidth={1.8}
            />
          </button>

          {/* ==================================================
              LOGO
          ================================================== */}

          <div className="mb-3">
            <img
              src={logo}
              alt="ICOGON AI"
              className="
                h-8
                w-auto
                object-contain
                object-left
              "
            />
          </div>

          {/* ==================================================
              TITLE
          ================================================== */}

          <div className="mb-4 pr-7">
            <p
              className="
                text-[11px]
                font-medium
                leading-4
                text-slate-400
              "
            >
              Start building.
            </p>

            <h1
              className="
                mt-[1px]
                text-[25px]
                font-semibold
                leading-[1.05]
                tracking-[-0.045em]
                text-slate-950
              "
            >
              Create free account
            </h1>

            <p
              className="
                mt-1.5
                text-[10.5px]
                leading-4
                text-slate-500
              "
            >
              Start building websites, apps and
              AI agents with ICOGON AI.
            </p>
          </div>

          {/* ==================================================
              SOCIAL BUTTONS
          ================================================== */}

          <div className="space-y-1.5">
            {/* GOOGLE */}

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={
                googleLoading ||
                githubLoading ||
                appleLoading
              }
              className="
                flex
                h-[40px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[10px]
                border
                border-[#7898ff]
                bg-white
                text-[12px]
                font-medium
                text-slate-900
                transition
                hover:bg-[#fffefa]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <span
                className="
                  text-[16px]
                  font-semibold
                  text-[#4285F4]
                "
              >
                G
              </span>

              {googleLoading
                ? "Connecting..."
                : "Continue with Google"}
            </button>

            {/* GITHUB */}

            <button
              type="button"
              onClick={handleGithubSignup}
              disabled={
                googleLoading ||
                githubLoading ||
                appleLoading
              }
              className="
                flex
                h-[40px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[10px]
                border
                border-[#d9d6d0]
                bg-white
                text-[12px]
                font-medium
                text-slate-900
                transition
                hover:bg-[#fffefa]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .7a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .7Z" />
              </svg>

              {githubLoading
                ? "Connecting..."
                : "Continue with GitHub"}
            </button>

            {/* APPLE */}

            <button
              type="button"
              onClick={handleAppleSignup}
              disabled={
                googleLoading ||
                githubLoading ||
                appleLoading
              }
              className="
                flex
                h-[40px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[10px]
                border
                border-[#d9d6d0]
                bg-white
                text-[12px]
                font-medium
                text-slate-900
                transition
                hover:bg-[#fffefa]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.09.8 1.2-.24 2.35-.93 3.63-.84 1.54.12 2.7.73 3.46 1.8-3.18 1.9-2.43 6.07.49 7.23-.58 1.53-1.35 3.04-2.67 3.98ZM12.03 7.25C11.88 4.97 13.73 3.1 15.86 2.95c.3 2.63-2.38 4.59-3.83 4.3Z" />
              </svg>

              {appleLoading
                ? "Connecting..."
                : "Continue with Apple"}
            </button>
          </div>

          {/* ==================================================
              OR
          ================================================== */}

          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#dedbd5]" />

            <span
              className="
                text-[9px]
                font-medium
                text-slate-400
              "
            >
              OR
            </span>

            <div className="h-px flex-1 bg-[#dedbd5]" />
          </div>

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-1.5"
          >
            {/* NAME */}

            <div>
              <div className="relative">
                <User
                  size={15}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  {...register("full_name")}
                  className="
                    h-[40px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#d9d6d0]
                    bg-white
                    pl-9
                    pr-3
                    text-[11.5px]
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    transition
                    hover:border-[#c7c3bc]
                    focus:border-slate-500
                    focus:ring-3
                    focus:ring-slate-900/[0.04]
                  "
                />
              </div>

              {errors.full_name && (
                <p className="mt-0.5 text-[9px] text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* EMAIL */}

            <div>
              <div className="relative">
                <Mail
                  size={15}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  {...register("email")}
                  className="
                    h-[40px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#d9d6d0]
                    bg-white
                    pl-9
                    pr-3
                    text-[11.5px]
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    transition
                    hover:border-[#c7c3bc]
                    focus:border-slate-500
                    focus:ring-3
                    focus:ring-slate-900/[0.04]
                  "
                />
              </div>

              {errors.email && (
                <p className="mt-0.5 text-[9px] text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div>
              <div className="relative">
                <Lock
                  size={15}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="
                    h-[40px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#d9d6d0]
                    bg-white
                    pl-9
                    pr-9
                    text-[11.5px]
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    transition
                    hover:border-[#c7c3bc]
                    focus:border-slate-500
                    focus:ring-3
                    focus:ring-slate-900/[0.04]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    transition
                    hover:text-slate-700
                  "
                >
                  {showPassword ? (
                    <EyeOff
                      size={15}
                      strokeWidth={1.7}
                    />
                  ) : (
                    <Eye
                      size={15}
                      strokeWidth={1.7}
                    />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-0.5 text-[9px] text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              disabled={
                isLoading ||
                googleLoading ||
                githubLoading ||
                appleLoading
              }
              className="
                mt-1
                h-[40px]
                w-full
                rounded-[10px]
                bg-[#18181b]
                text-[12px]
                font-medium
                text-white
                shadow-[0_5px_14px_rgba(24,24,27,0.14)]
                transition
                hover:-translate-y-[1px]
                hover:bg-[#09090b]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isLoading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          {/* ==================================================
              TERMS
          ================================================== */}

          <p
            className="
              mt-2.5
              text-[8.5px]
              leading-[1.45]
              text-slate-400
            "
          >
            By continuing, you agree to the{" "}
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/terms")
              }
              className="
                text-slate-600
                underline
                underline-offset-2
                hover:text-slate-950
              "
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/privacy")
              }
              className="
                text-slate-600
                underline
                underline-offset-2
                hover:text-slate-950
              "
            >
              Privacy Policy
            </button>
            .
          </p>

          {/* ==================================================
              LOGIN
          ================================================== */}

          <p
            className="
              mt-2.5
              text-center
              text-[10.5px]
              text-slate-500
            "
          >
            Already have an account?{" "}

            <button
              type="button"
              onClick={onLogin}
              className="
                font-semibold
                text-slate-900
                underline-offset-4
                hover:underline
              "
            >
              Sign in
            </button>
          </p>

          {/* ==================================================
              SECURITY / SSO
          ================================================== */}

          <div
            className="
              mt-3
              flex
              items-center
              justify-center
              gap-1.5
              border-t
              border-[#e5e2dc]
              pt-2.5
            "
          >
            <Lock
              size={11}
              strokeWidth={1.7}
              className="text-slate-400"
            />

            <span
              className="
                text-[8.5px]
                text-slate-400
              "
            >
              Secure authentication powered
              by ICOGON
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupModal;
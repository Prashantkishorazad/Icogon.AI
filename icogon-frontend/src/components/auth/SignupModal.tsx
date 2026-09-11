import { useState } from "react";

import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupSchema,
  type SignupFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";
import { signInWithGoogle } from "../../services/supabaseAuth";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // GOOGLE SIGNUP
  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);

      await signInWithGoogle();

    } catch (error) {
      console.error(error);

      alert("Google signup failed.");

      setGoogleLoading(false);
    }
  };

  // EMAIL SIGNUP
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
        alert("Signup failed.");
      }

    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while creating your account."
      );
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        px-4
        py-6
      "
    >

      {/* BACKGROUND - LANDING PAGE VISIBLE */}
      <div
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-slate-950/30
          backdrop-blur-[3px]
        "
      />

      {/* MODAL */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-[510px]
          rounded-[28px]
          border
          border-white/10
          bg-[#111214]
          p-7
          shadow-2xl
          shadow-black/40
          sm:p-10
        "
      >

        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-6
            top-6
            text-slate-400
            transition
            hover:text-white
          "
        >
          <X size={24} />
        </button>

        {/* ICOGON LOGO */}
        <div className="mb-7">

          <img
            src={logo}
            alt="ICOGON AI"
            className="
              h-12
              w-auto
              object-contain
              object-left
            "
          />

        </div>

        {/* TITLE */}
        <div className="mb-7">

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Start building websites, apps and AI agents with ICOGON AI.
          </p>

        </div>

        {/* GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="
            flex
            h-14
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            bg-white
            font-medium
            text-slate-800
            transition
            hover:bg-slate-100
            disabled:opacity-60
          "
        >
          <span className="text-lg font-bold text-[#4285F4]">
            G
          </span>

          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        {/* SOCIAL */}
        <div className="mt-3 grid grid-cols-2 gap-3">

          <button
            type="button"
            className="
              h-12
              rounded-xl
              border
              border-white/10
              bg-[#1d1e20]
              font-semibold
              text-white
              transition
              hover:bg-[#292a2d]
            "
          >
            GitHub
          </button>

          <button
            type="button"
            className="
              h-12
              rounded-xl
              border
              border-white/10
              bg-[#1d1e20]
              font-semibold
              text-white
              transition
              hover:bg-[#292a2d]
            "
          >
             Apple
          </button>

        </div>

        {/* OR */}
        <div className="my-6 flex items-center gap-4">

          <div className="h-px flex-1 bg-white/10" />

          <span className="text-xs text-slate-500">
            OR
          </span>

          <div className="h-px flex-1 bg-white/10" />

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          {/* NAME */}
          <div>

            <div className="relative">

              <User
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
                type="text"
                placeholder="Full name"
                {...register("full_name")}
                className="
                  h-14
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-[#191a1c]
                  pl-12
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  focus:border-cyan-500
                "
              />

            </div>

            {errors.full_name && (
              <p className="mt-1 text-xs text-red-400">
                {errors.full_name.message}
              </p>
            )}

          </div>

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
                className="
                  h-14
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-[#191a1c]
                  pl-12
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  focus:border-cyan-500
                "
              />

            </div>

            {errors.email && (
              <p className="mt-1 text-xs text-red-400">
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
                placeholder="Create password"
                {...register("password")}
                className="
                  h-14
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-[#191a1c]
                  pl-12
                  pr-12
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  focus:border-cyan-500
                "
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
                  hover:text-white
                "
              >
                {showPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />
                }
              </button>

            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              h-14
              w-full
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              font-semibold
              text-white
              transition
              hover:scale-[1.01]
              disabled:opacity-60
            "
          >
            {isLoading
              ? "Creating account..."
              : "Create account"}
          </button>

        </form>

        {/* LOGIN */}
        <p className="mt-6 text-center text-sm text-slate-400">

          Already have an account?{" "}

          <button
            type="button"
            onClick={onLogin}
            className="
              font-medium
              text-white
              transition
              hover:text-cyan-400
            "
          >
            Sign in
          </button>

        </p>

      </div>

    </div>
  );
};

export default SignupModal;
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "../../components/auth/AuthLayout";

import {
  signupSchema,
  type SignupFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";

const SignupPage = () => {
  const { signupUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await signupUser(
        data.full_name,
        data.email,
        data.password
      );

      if (!result.success) {
        alert("Signup failed. Please try again.");
      }

    } catch (error) {
      console.error("Signup error:", error);

      alert(
        "Something went wrong while creating your account."
      );
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building websites, apps and AI agents with ICOGON."
    >

      {/* Google */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 font-medium text-black transition hover:bg-slate-100"
      >
        <span className="text-lg font-bold text-[#4285F4]">
          G
        </span>

        Continue with Google
      </button>

      {/* Social */}
      <div className="mt-4 grid grid-cols-3 gap-3">

        <button
          type="button"
          className="flex h-12 items-center justify-center rounded-xl bg-[#1d1e20] text-sm font-semibold text-white transition hover:bg-[#292a2d]"
        >
          GitHub
        </button>

        <button
          type="button"
          className="flex h-12 items-center justify-center rounded-xl bg-[#1d1e20] text-sm font-semibold text-white transition hover:bg-[#292a2d]"
        >
          Apple
        </button>

        <button
          type="button"
          className="flex h-12 items-center justify-center rounded-xl bg-[#1d1e20] text-sm font-semibold text-blue-400 transition hover:bg-[#292a2d]"
        >
          Facebook
        </button>

      </div>

      {/* OR */}
      <div className="my-7 flex items-center gap-4">

        <div className="h-px flex-1 bg-slate-800" />

        <span className="text-xs font-medium text-slate-600">
          OR
        </span>

        <div className="h-px flex-1 bg-slate-800" />

      </div>

      {/* Signup form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >

        {/* Full Name */}
        <div>

          <div className="relative">

            <User
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Full name"
              {...register("full_name")}
              className={`h-14 w-full rounded-xl border bg-[#191a1c] pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 ${
                errors.full_name
                  ? "border-red-500"
                  : "border-slate-800 focus:border-blue-500"
              }`}
            />

          </div>

          {errors.full_name && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.full_name.message}
            </p>
          )}

        </div>

        {/* Email */}
        <div>

          <div className="relative">

            <Mail
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="email"
              placeholder="Email address"
              {...register("email")}
              className={`h-14 w-full rounded-xl border bg-[#191a1c] pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 ${
                errors.email
                  ? "border-red-500"
                  : "border-slate-800 focus:border-blue-500"
              }`}
            />

          </div>

          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.email.message}
            </p>
          )}

        </div>

        {/* Password */}
        <div>

          <div className="relative">

            <Lock
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              {...register("password")}
              className={`h-14 w-full rounded-xl border bg-[#191a1c] pl-12 pr-12 text-sm text-white outline-none placeholder:text-slate-600 ${
                errors.password
                  ? "border-red-500"
                  : "border-slate-800 focus:border-blue-500"
              }`}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
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

        {/* Create Account */}
        <button
          type="submit"
          disabled={isLoading}
          className="h-14 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading
            ? "Creating account..."
            : "Create account"}
        </button>

      </form>

      {/* Login */}
      <p className="mt-7 text-center text-sm text-slate-500">

        Already have an account?{" "}

        <Link
          to="/login"
          className="font-medium text-white hover:text-cyan-400"
        >
          Sign in
        </Link>

      </p>

    </AuthLayout>
  );
};

export default SignupPage;
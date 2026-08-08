import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { loginUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await loginUser(
      data.email,
      data.password
    );

    if (!result.success) {
      alert("Invalid Credentials");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Email */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Email Address
        </label>

        <div className="relative">

          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={20}
          />

          <input
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              py-3
              pl-12
              pr-4
              text-white
              outline-none
              transition
              focus:border-cyan-400
            "
          />

        </div>

        <p className="mt-2 text-sm text-red-400">
          {errors.email?.message}
        </p>

      </div>

      {/* Password */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Password
        </label>

        <div className="relative">

          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={20}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              py-3
              pl-12
              pr-14
              text-white
              outline-none
              transition
              focus:border-cyan-400
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>

        </div>

        <p className="mt-2 text-sm text-red-400">
          {errors.password?.message}
        </p>

      </div>

      {/* Remember */}

      <div className="flex items-center justify-between">

        <label className="flex items-center gap-2 text-sm text-slate-400">

          <input
            type="checkbox"
            className="accent-cyan-500"
          />

          Remember me

        </label>

        <Link
          to="/forgot-password"
          className="text-sm text-cyan-400 hover:underline"
        >
          Forgot Password?
        </Link>

      </div>

      {/* Login */}

      <button
        disabled={isLoading}
        className="
          w-full
          rounded-xl
          bg-gradient-to-r
          from-cyan-500
          to-blue-600
          py-3.5
          font-semibold
          text-white
          transition
          hover:scale-[1.02]
          disabled:opacity-50
        "
      >
        {isLoading ? "Signing In..." : "Login"}
      </button>

      {/* Signup */}

      <p className="text-center text-sm text-slate-400">

        Don't have an account?

        <Link
          to="/signup"
          className="ml-2 font-medium text-cyan-400 hover:underline"
        >
          Create Account
        </Link>

      </p>

    </form>
  );
};

export default LoginForm;
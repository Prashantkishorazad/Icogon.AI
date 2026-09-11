import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupSchema,
  type SignupFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";
import { signInWithGoogle } from "../../services/supabaseAuth";

import logo from "../../assets/logo1.png";

const SignupPage = () => {
  const navigate = useNavigate();

  const { signupUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // =========================
  // GOOGLE SIGNUP
  // =========================
  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);

      await signInWithGoogle();
    } catch (error) {
      console.error("Google signup error:", error);

      alert("Google signup failed. Please try again.");

      setGoogleLoading(false);
    }
  };

  // =========================
  // EMAIL SIGNUP
  // =========================
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

      alert("Something went wrong while creating your account.");
    }
  };

  return (
    <>
      {/* =========================
          LANDING PAGE BACKGROUND
      ========================= */}

      <div className="min-h-screen">
        {/* Your landing page remains visible behind */}
      </div>

      {/* =========================
          BLUR OVERLAY
      ========================= */}

      <div
        className="
          fixed
          inset-0
          z-[999]
          flex
          items-center
          justify-center
          bg-slate-950/45
          px-4
          py-6
          backdrop-blur-md
        "
      >

        {/* =========================
            SIGNUP POPUP
        ========================= */}

        <div
          className="
            relative
            w-full
            max-w-[400px]
            rounded-[26px]
            border
            border-white/10
            bg-[#15171b]
            p-6
            text-white
            shadow-2xl
            shadow-black/50
            sm:p-7
          "
        >

          {/* ================= CLOSE ================= */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              absolute
              right-5
              top-5
              text-slate-400
              transition
              hover:text-white
            "
            aria-label="Close signup"
          >
            <X size={20} />
          </button>


          {/* ================= LOGO ================= */}

          <img
            src={logo}
            alt="ICOGON AI"
            className="
              mb-5
              h-11
              w-11
              object-contain
            "
          />


          {/* ================= HEADING ================= */}

          <div className="mb-5">

            <p className="text-lg font-semibold text-slate-300">
              Start building.
            </p>

            <h1 className="text-[25px] font-bold tracking-tight text-white">
              Create free account
            </h1>

          </div>


          {/* ================= GOOGLE ================= */}

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="
              flex
              h-[48px]
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-slate-300
              bg-white
              text-sm
              font-medium
              text-slate-800
              transition
              hover:bg-slate-100
              disabled:opacity-60
            "
          >

            <span className="text-base font-bold text-[#4285F4]">
              G
            </span>

            {googleLoading
              ? "Connecting..."
              : "Continue with Google"}

          </button>


          {/* ================= GITHUB ================= */}

          <button
            type="button"
            className="
              mt-3
              flex
              h-[48px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-[#202226]
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[#292c31]
            "
          >
            <span className="text-base">◉</span>

            Continue with GitHub

          </button>


          {/* ================= APPLE ================= */}

          <button
            type="button"
            className="
              mt-3
              flex
              h-[48px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-[#202226]
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[#292c31]
            "
          >
            <span className="text-base">●</span>

            Continue with Apple

          </button>


          {/* ================= OR ================= */}

          <div className="my-5 flex items-center gap-3">

            <div className="h-px flex-1 bg-slate-700" />

            <span className="text-xs text-slate-500">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-700" />

          </div>


          {/* ================= FORM ================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
          >

            {/* FULL NAME */}

            <div>

              <div className="relative">

                <User
                  size={17}
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
                  className={`
                    h-[48px]
                    w-full
                    rounded-xl
                    border
                    bg-[#202226]
                    pl-11
                    pr-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-slate-500
                    ${
                      errors.full_name
                        ? "border-red-500"
                        : "border-slate-700 focus:border-blue-500"
                    }
                  `}
                />

              </div>

            </div>


            {/* EMAIL */}

            <div>

              <div className="relative">

                <Mail
                  size={17}
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
                  placeholder="Email"
                  {...register("email")}
                  className={`
                    h-[48px]
                    w-full
                    rounded-xl
                    border
                    bg-[#202226]
                    pl-11
                    pr-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-slate-500
                    ${
                      errors.email
                        ? "border-red-500"
                        : "border-slate-700 focus:border-blue-500"
                    }
                  `}
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <div className="relative">

                <Lock
                  size={17}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                  "
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className={`
                    h-[48px]
                    w-full
                    rounded-xl
                    border
                    bg-[#202226]
                    pl-11
                    pr-11
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-slate-500
                    ${
                      errors.password
                        ? "border-red-500"
                        : "border-slate-700 focus:border-blue-500"
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
                    hover:text-white
                  "
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>


            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              disabled={isLoading}
              className="
                mt-1
                flex
                h-[48px]
                w-full
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                text-sm
                font-semibold
                text-white
                transition
                hover:opacity-90
                disabled:opacity-60
              "
            >
              {isLoading
                ? "Creating account..."
                : "Create account"}

            </button>

          </form>


          {/* ================= LOGIN ================= */}

          <p className="mt-5 text-center text-sm text-slate-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="
                font-medium
                text-white
                hover:text-cyan-400
              "
            >
              Sign in
            </Link>

          </p>

        </div>

      </div>
    </>
  );
};

export default SignupPage;
import { useState } from "react";

import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupSchema,
  type SignupFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";

import { getPasswordStrength } from "../../utils/passwordStrength";


const SignupForm = () => {

  const {
    signupUser,
    isLoading,
  } = useAuth();


  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),

    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });


  const password =
    watch("password") || "";


  const {
    score,
    label,
    color,
  } = getPasswordStrength(password);


  const onSubmit = async (
    data: SignupFormData
  ) => {

    try {

      if (!acceptedTerms) {

        alert(
          "Please accept Terms & Conditions."
        );

        return;
      }


      if (
        data.password !==
        data.confirmPassword
      ) {

        alert(
          "Passwords do not match."
        );

        return;
      }


      const result =
        await signupUser(
          data.full_name,
          data.email,
          data.password
        );


      if (result.success) {

        reset();

        setAcceptedTerms(false);

        alert(
          "Account Created Successfully 🎉"
        );

      } else {

        alert(
          "Signup Failed. Please try again."
        );

      }

    } catch (error) {

      console.error(
        "Signup Error:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );

    }

  };


  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >

      {/* FULL NAME */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Full Name
        </label>

        <div className="relative">

          <User
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={20}
          />

          <input
            {...register("full_name")}
            placeholder="John Doe"
            className={`w-full rounded-xl border bg-slate-900 py-3 pl-12 pr-4 text-white outline-none transition-all duration-300 ${
              errors.full_name
                ? "border-red-500"
                : "border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            }`}
          />

        </div>

        {errors.full_name && (
          <p className="mt-2 text-sm text-red-400">
            {errors.full_name.message}
          </p>
        )}

      </div>


      {/* EMAIL */}

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
            {...register("email")}
            placeholder="you@example.com"
            className={`w-full rounded-xl border bg-slate-900 py-3 pl-12 pr-4 text-white outline-none ${
              errors.email
                ? "border-red-500"
                : "border-slate-700 focus:border-cyan-400"
            }`}
          />

        </div>

        {errors.email && (
          <p className="mt-2 text-sm text-red-400">
            {errors.email.message}
          </p>
        )}

      </div>


      {/* PHONE */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Phone Number
        </label>

        <div className="relative">

          <Phone
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={20}
          />

          <input
            type="tel"
            {...register("phone")}
            placeholder="+91 9876543210"
            className={`w-full rounded-xl border bg-slate-900 py-3 pl-12 pr-4 text-white outline-none ${
              errors.phone
                ? "border-red-500"
                : "border-slate-700 focus:border-cyan-400"
            }`}
          />

        </div>

        {errors.phone && (
          <p className="mt-2 text-sm text-red-400">
            {errors.phone.message}
          </p>
        )}

      </div>


      {/* PASSWORD */}

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
            type={
              showPassword
                ? "text"
                : "password"
            }
            {...register("password")}
            placeholder="Create Password"
            className={`w-full rounded-xl border bg-slate-900 py-3 pl-12 pr-14 text-white outline-none ${
              errors.password
                ? "border-red-500"
                : "border-slate-700 focus:border-cyan-400"
            }`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >

            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}

          </button>

        </div>

        {errors.password && (
          <p className="mt-2 text-sm text-red-400">
            {errors.password.message}
          </p>
        )}


        {/* PASSWORD STRENGTH */}

        <div className="mt-3">

          <div className="mb-2 flex justify-between">

            <span className="text-sm text-slate-400">
              Password Strength
            </span>

            <span
              className={`text-sm font-medium ${
                score <= 1
                  ? "text-red-400"
                  : score === 2
                  ? "text-orange-400"
                  : score === 3
                  ? "text-yellow-400"
                  : score === 4
                  ? "text-blue-400"
                  : "text-green-400"
              }`}
            >
              {label}
            </span>

          </div>


          <div className="space-y-2 text-sm">

            <p
              className={
                password.length >= 8
                  ? "text-green-400"
                  : "text-slate-500"
              }
            >
              ✓ Minimum 8 Characters
            </p>

            <p
              className={
                /[A-Z]/.test(password)
                  ? "text-green-400"
                  : "text-slate-500"
              }
            >
              ✓ One Uppercase Letter
            </p>

            <p
              className={
                /[0-9]/.test(password)
                  ? "text-green-400"
                  : "text-slate-500"
              }
            >
              ✓ One Number
            </p>

            <p
              className={
                /[^A-Za-z0-9]/.test(
                  password
                )
                  ? "text-green-400"
                  : "text-slate-500"
              }
            >
              ✓ One Special Character
            </p>

          </div>


          <div className="mt-4 flex gap-2">

            {[1, 2, 3, 4, 5].map(
              (item) => (

                <div
                  key={item}
                  className={`h-2 flex-1 rounded-full ${
                    score >= item
                      ? color
                      : "bg-slate-700"
                  }`}
                />

              )
            )}

          </div>

        </div>

      </div>


      {/* CONFIRM PASSWORD */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Confirm Password
        </label>

        <div className="relative">

          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={20}
          />

          <input
            type={
              showConfirm
                ? "text"
                : "password"
            }
            {...register(
              "confirmPassword"
            )}
            placeholder="Confirm Password"
            className={`w-full rounded-xl border bg-slate-900 py-3 pl-12 pr-14 text-white outline-none ${
              errors.confirmPassword
                ? "border-red-500"
                : "border-slate-700 focus:border-cyan-400"
            }`}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirm(
                !showConfirm
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >

            {showConfirm ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}

          </button>

        </div>

        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-400">
            {
              errors.confirmPassword
                .message
            }
          </p>
        )}

      </div>


      {/* TERMS */}

      <div className="flex items-start gap-3">

        <input
          id="terms"
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) =>
            setAcceptedTerms(
              e.target.checked
            )
          }
          className="mt-1 h-4 w-4 rounded border-slate-600 accent-cyan-500"
        />

        <label
          htmlFor="terms"
          className="text-sm leading-6 text-slate-400"
        >

          I agree to the{" "}

          <Link
            to="/terms"
            className="text-cyan-400 hover:underline"
          >
            Terms of Service
          </Link>

          {" "}and{" "}

          <Link
            to="/privacy"
            className="text-cyan-400 hover:underline"
          >
            Privacy Policy
          </Link>

        </label>

      </div>


      {/* CREATE ACCOUNT */}

      <button
        type="submit"
        disabled={
          !acceptedTerms ||
          isLoading
        }
        className="group relative mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
      >

        {isLoading ? (

          <div className="flex items-center gap-3">

            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

            Creating Account...

          </div>

        ) : (

          <div className="flex items-center gap-2">

            Create Account

            <ArrowRight
              className="transition-transform duration-300 group-hover:translate-x-1"
              size={20}
            />

          </div>

        )}

      </button>


      {/* LOGIN */}

      <p className="text-center text-sm text-slate-400">

        Already have an account?

        <Link
          to="/login"
          className="ml-2 font-medium text-cyan-400 hover:underline"
        >
          Login
        </Link>

      </p>

    </form>

  );
};


export default SignupForm;
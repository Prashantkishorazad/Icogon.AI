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

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { signupSchema } from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";

import { getPasswordStrength } from "../../utils/passwordStrength";

type SignupFormData = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const SignupForm = () => {
  const { signupUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
  register,
  handleSubmit,
  watch,

  formState: { errors },
} = useForm<SignupFormData>({
  resolver: zodResolver(signupSchema),
});

  const {
  score,
  label,
  color,
} = getPasswordStrength(
  watch("password") || ""
);

  const onSubmit = async (data: SignupFormData) => {

  if (!acceptedTerms) {
    alert("Please accept Terms & Conditions.");
    return;
  }

  if (data.password !== data.confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const result = await signupUser(
    data.full_name,
    data.email,
    data.password
  );

  if (result.success) {

    reset();

    setAcceptedTerms(false);

    alert("Account Created Successfully 🎉");

  } else {

    alert("Signup Failed");

  }

};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Full Name */}

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
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-500/20
              transition-all
              duration-300
            "
          />

        </div>

        <p className="mt-2 text-sm text-red-400">
          {errors.full_name?.message}
        </p>

      </div>

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
            {...register("email")}
            placeholder="you@example.com"
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
              focus:border-cyan-400
            "
          />

        </div>

        <p className="mt-2 text-sm text-red-400">
          {errors.email?.message}
        </p>

      </div>

      {/* Phone */}

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
            {...register("phone")}
            placeholder="+91 9876543210"
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
              focus:border-cyan-400
            "
          />

        </div>

        <p className="mt-2 text-sm text-red-400">
          {errors.phone?.message}
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
            {...register("password")}
            placeholder="Create Password"
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
              focus:border-cyan-400
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
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
            <div className="mt-4 space-y-2 text-sm">

  <p
    className={
      watch("password")?.length >= 8
        ? "text-green-400"
        : "text-slate-500"
    }
  >
    ✓ Minimum 8 Characters
  </p>

  <p
    className={
      /[A-Z]/.test(watch("password") || "")
        ? "text-green-400"
        : "text-slate-500"
    }
  >
    ✓ One Uppercase Letter
  </p>

  <p
    className={
      /[0-9]/.test(watch("password") || "")
        ? "text-green-400"
        : "text-slate-500"
    }
  >
    ✓ One Number
  </p>

  <p
    className={
      /[^A-Za-z0-9]/.test(watch("password") || "")
        ? "text-green-400"
        : "text-slate-500"
    }
  >
    ✓ One Special Character
  </p>

</div>

  <div className="flex gap-2">

    {[1, 2, 3, 4, 5].map((item) => (

      <div
        key={item}
        className={`h-2 flex-1 rounded-full ${
          score >= item
            ? color
            : "bg-slate-700"
        }`}
      />

    ))}

  </div>

</div>

      {/* Confirm Password */}

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
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="Confirm Password"
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
              focus:border-cyan-400
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirm(!showConfirm)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showConfirm ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>

        </div>

        <p className="mt-2 text-sm text-red-400">
          {errors.confirmPassword?.message}
        </p>

      </div>
        {/* Terms */}

<div className="flex items-start gap-3">

  <input
    id="terms"
    type="checkbox"
    checked={acceptedTerms}
    onChange={(e) =>
      setAcceptedTerms(e.target.checked)
    }
    className="
      mt-1
      h-4
      w-4
      rounded
      border-slate-600
      accent-cyan-500
    "
  />

  <label
    htmlFor="terms"
    className="text-sm leading-6 text-slate-400"
  >
    I agree to the{" "}

    <a
      href="/terms"
      className="text-cyan-400 hover:underline"
    >
      Terms of Service
    </a>

    {" "}and{" "}

    <a
      href="/privacy"
      className="text-cyan-400 hover:underline"
    >
      Privacy Policy
    </a>

  </label>

</div>

        <button
  type="submit"
  disabled={!acceptedTerms || isLoading}
  className="
    group
    relative
    mt-4
    flex
    w-full
    items-center
    justify-center
    rounded-xl
    bg-gradient-to-r
    from-cyan-500
    via-blue-600
    to-indigo-600
    py-4
    text-lg
    font-semibold
    text-white
    transition-all
    duration-300
    hover:scale-[1.02]
    hover:shadow-2xl
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
>
  {isLoading ? (
    <div className="flex items-center gap-3">

      <div
        className="
          h-5
          w-5
          animate-spin
          rounded-full
          border-2
          border-white
          border-t-transparent
        "
      />

      Creating Account...

    </div>
  ) : (
    <div className="flex items-center gap-2">

      Create Account

      <ArrowRight
        className="
          transition-transform
          duration-300
          group-hover:translate-x-1
        "
        size={20}
      />

    </div>
  )}
</button>

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
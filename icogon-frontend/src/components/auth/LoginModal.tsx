import { useState } from "react";
import logo from "../../assets/logo.png";

import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Apple,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";
import {signInWithGithub, signInWithGoogle} from "../../services/supabaseAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({
  isOpen,
  onClose,
}: LoginModalProps) => {
  const { loginUser, isLoading } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [githubLoading, setGithubLoading] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

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

  // ============================================================
  // GITHUB LOGIN
  // ============================================================

  const handleGithubLogin = async () => {
  try {
    setGithubLoading(true);

    await signInWithGithub();
  } catch (error) {
    console.error("GitHub login error:", error);
    alert("GitHub login failed. Please try again.");
  } finally {
    setGithubLoading(false);
  }
};

  // ============================================================
  // APPLE LOGIN
  // ============================================================

  const handleAppleLogin = () => {
    console.log("Apple login clicked");

    alert(
      "Apple authentication needs to be connected in Supabase."
    );
  };

  // ============================================================
  // EMAIL LOGIN
  // ============================================================

  const onSubmit = async (
    data: LoginFormData
  ) => {
    const result = await loginUser(
      data.email,
      data.password
    );

    if (!result.success) {
      alert(
        result.error ||
          "Invalid credentials"
      );
    }
  };

  // ============================================================
  // GITHUB ICON
  // ============================================================

  const GithubIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483
        0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466
        -.908-.621.069-.608.069-.608 1.004.071 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831
        .091-.646.349-1.087.635-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683
        -.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.57 9.57
        0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699
        1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852
        0 1.337-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.003 10.003 0 0 0 22 12
        C22 6.477 17.523 2 12 2Z"
      />
    </svg>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/55
            px-4
            py-6
            backdrop-blur-[2px]
          "
        >
          {/* ==================================================
              MODAL
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: 10,
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
              max-h-[92vh]
              overflow-y-auto
              rounded-[24px]
              border
              border-[#e4e1dc]
              bg-[#FCFBF8]
              px-6
              py-6
              shadow-[0_25px_70px_rgba(15,23,42,0.22)]
            "
          >
            {/* ==================================================
                CLOSE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close login"
              className="
                absolute
                right-4
                top-4
                z-10
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                text-[#555555]
                transition
                hover:bg-[#efede8]
                hover:text-black
                active:scale-95
              "
            >
              <X
                size={16}
                strokeWidth={1.7}
              />
            </button>

            {/* ==================================================
                LOGO
                SMALL SIZE
            ================================================== */}

            <div
              className="
                mb-5
                flex
                h-[30px]
                w-[30px]
                items-center
                justify-start
                overflow-hidden
              "
            >
              <img
                src={logo}
                alt="ICOGON AI"
                width={30}
                height={30}
                className="
                  block
                  h-[30px]
                  w-[30px]
                  max-h-[30px]
                  max-w-[30px]
                  object-contain
                "
                style={{
                  width: "30px",
                  height: "30px",
                  maxWidth: "30px",
                  maxHeight: "30px",
                }}
              />
            </div>

            {/* ==================================================
                HEADING
            ================================================== */}

            <div className="mb-5 pr-5">
              <p
                className="
                  text-[12px]
                  font-medium
                  leading-[16px]
                  text-[#a8a8a8]
                "
              >
                Start building.
              </p>

              <h2
                className="
                  mt-[2px]
                  text-[24px]
                  font-semibold
                  leading-[27px]
                  tracking-[-0.04em]
                  text-[#111111]
                "
              >
                Log in to your account
              </h2>

              <p
                className="
                  mt-[7px]
                  text-[12px]
                  leading-[17px]
                  text-[#777777]
                "
              >
                Continue building with ICOGON AI.
              </p>
            </div>

            {/* ==================================================
                SOCIAL LOGIN
            ================================================== */}

            <div className="space-y-2">

              {/* GOOGLE */}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="
                  flex
                  h-[34px]
                  w-full
                  items-center
                  justify-center
                  gap-[7px]
                  rounded-[8px]
                  border
                  border-[#d9d6d0]
                  bg-white
                  text-[13px]
                  font-medium
                  text-[#171717]
                  transition-all
                  duration-200
                  hover:border-[#c8c5bf]
                  hover:bg-[#fdfcf9]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <span
                  className="
                    text-[16px]
                    font-semibold
                    leading-none
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
                onClick={handleGithubLogin}
                disabled={githubLoading}
                className="
                  flex
                  h-[34px]
                  w-full
                  items-center
                  justify-center
                  gap-[7px]
                  rounded-[8px]
                  border
                  border-[#d9d6d0]
                  bg-white
                  text-[13px]
                  font-medium
                  text-[#171717]
                  transition-all
                  duration-200
                  hover:border-[#c8c5bf]
                  hover:bg-[#fdfcf9]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <GithubIcon />

                {githubLoading
                  ? "Connecting..."
                  : "Continue with GitHub"}
              </button>

              {/* APPLE */}

              <button
                type="button"
                onClick={handleAppleLogin}
                className="
                  flex
                  h-[34px]
                  w-full
                  items-center
                  justify-center
                  gap-[7px]
                  rounded-[8px]
                  border
                  border-[#d9d6d0]
                  bg-white
                  text-[13px]
                  font-medium
                  text-[#171717]
                  transition-all
                  duration-200
                  hover:border-[#c8c5bf]
                  hover:bg-[#fdfcf9]
                  active:scale-[0.99]
                "
              >
                <Apple
                  size={16}
                  strokeWidth={1.9}
                  fill="currentColor"
                />

                Continue with Apple
              </button>
            </div>

            {/* ==================================================
                OR
            ================================================== */}

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#dedbd5]" />

              <span
                className="
                  text-[11px]
                  font-medium
                  text-[#999999]
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
              className="space-y-2.5"
            >
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
                      text-[#999999]
                    "
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    {...register("email")}
                    className="
                      h-[34px]
                      w-full
                      rounded-[8px]
                      border
                      border-[#d9d6d0]
                      bg-white
                      pl-9
                      pr-3
                      text-[13px]
                      text-[#171717]
                      outline-none
                      placeholder:text-[#777777]
                      transition-all
                      duration-200
                      hover:border-[#c7c3bc]
                      focus:border-[#888888]
                      focus:ring-2
                      focus:ring-black/[0.04]
                    "
                  />
                </div>

                {errors.email && (
                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-medium
                      text-red-500
                    "
                  >
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
                      text-[#999999]
                    "
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Password"
                    autoComplete="current-password"
                    {...register("password")}
                    className="
                      h-[34px]
                      w-full
                      rounded-[8px]
                      border
                      border-[#d9d6d0]
                      bg-white
                      pl-9
                      pr-10
                      text-[13px]
                      text-[#171717]
                      outline-none
                      placeholder:text-[#777777]
                      transition-all
                      duration-200
                      hover:border-[#c7c3bc]
                      focus:border-[#888888]
                      focus:ring-2
                      focus:ring-black/[0.04]
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
                      text-[#999999]
                      transition
                      hover:text-[#333333]
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
                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-medium
                      text-red-500
                    "
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* FORGOT PASSWORD */}

              <div className="flex justify-end">
                <button
                  type="button"
                  className="
                    text-[11px]
                    font-medium
                    text-[#707070]
                    transition
                    hover:text-[#111111]
                  "
                >
                  Forgot password?
                </button>
              </div>

              {/* CONTINUE */}

              <button
                type="submit"
                disabled={isLoading}
                className="
                  h-[34px]
                  w-full
                  rounded-[8px]
                  bg-[#18181b]
                  text-[13px]
                  font-medium
                  text-white
                  shadow-[0_5px_12px_rgba(24,24,27,0.12)]
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#09090b]
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isLoading
                  ? "Please wait..."
                  : "Continue"}
              </button>
            </form>

            {/* ==================================================
                SIGN UP
            ================================================== */}

            <p
              className="
                mt-4
                text-center
                text-[11px]
                leading-[16px]
                text-[#777777]
              "
            >
              Don't have an account?{" "}

              <button
                type="button"
                className="
                  font-semibold
                  text-[#333333]
                  underline-offset-2
                  transition
                  hover:underline
                "
              >
                Create account
              </button>
            </p>

            {/* ==================================================
                SECURITY NOTE
            ================================================== */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-center
                gap-1.5
                border-t
                border-[#e5e2dc]
                pt-4
                text-center
              "
            >
              <Lock
                size={12}
                strokeWidth={1.7}
                className="shrink-0 text-[#999999]"
              />

              <span
                className="
                  text-[10px]
                  leading-[14px]
                  text-[#8a8a8a]
                "
              >
                Secure authentication powered by ICOGON
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
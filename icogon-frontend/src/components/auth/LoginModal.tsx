import { useState } from "react";
import logo from "../../assets/logo.png";
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../../utils/validators/authSchema";

import { useAuth } from "../../hooks/authApi";
import { signInWithGoogle } from "../../services/supabaseAuth";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      await signInWithGoogle();

    } catch (error) {

      console.error(
        "Google login error:",
        error
      );

      alert(
        "Google login failed. Please try again."
      );

      setGoogleLoading(false);
    }
  };


  // ==========================================
  // EMAIL LOGIN
  // ==========================================

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


  return (

    <AnimatePresence>

      {isOpen && (

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onClick={onClose}
          className="
  fixed
  inset-0
  z-[999]
  flex
  items-center
  justify-center
  bg-slate-950/25
  p-4
"
        >

          {/* =====================================
              MODAL
          ===================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.25,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              relative
              w-full
              max-w-[520px]
              overflow-y-auto
              rounded-[28px]
              border
              border-white/10
              bg-[#111318]
              p-7
              shadow-2xl
              shadow-black/40
              sm:p-9
              max-h-[90vh]
            "
          >

            {/* =====================================
                CLOSE BUTTON
            ===================================== */}

            <button
              type="button"
              onClick={onClose}
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
            >
              <X size={24} />
            </button>


            {/* =====================================
                LOGO
            ===================================== */}

            <div className="mb-7 flex items-center">

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


            {/* =====================================
                HEADING
            ===================================== */}

            <div className="mb-7">

              <h2
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Log in to continue building with
                ICOGON AI.
              </p>

            </div>


            {/* =====================================
                GOOGLE
            ===================================== */}

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
                rounded-xl
                bg-white
                text-sm
                font-semibold
                text-slate-900
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


            {/* =====================================
                GITHUB + APPLE
            ===================================== */}

            <div className="mt-3 grid grid-cols-2 gap-3">

              <button
                type="button"
                className="
                  h-12
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-white/10
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
                  bg-white/5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                Apple
              </button>

            </div>


            {/* =====================================
                OR
            ===================================== */}

            <div className="my-6 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs font-medium text-slate-500">
                OR
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>


            {/* =====================================
                LOGIN FORM
            ===================================== */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >

              {/* EMAIL */}

              <div>

                <div className="relative">

                  <Mail
                    size={18}
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
                      border-white/10
                      bg-white/5
                      pl-12
                      pr-4
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-slate-500
                      transition
                      focus:border-cyan-400
                    "
                  />

                </div>

                {errors.email && (

                  <p className="mt-2 text-xs text-red-400">
                    {errors.email.message}
                  </p>

                )}

              </div>


              {/* PASSWORD */}

              <div>

                <div className="relative">

                  <Lock
                    size={18}
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
                    className="
                      h-14
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      pl-12
                      pr-12
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-slate-500
                      transition
                      focus:border-cyan-400
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
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
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>


                {errors.password && (

                  <p className="mt-2 text-xs text-red-400">
                    {errors.password.message}
                  </p>

                )}

              </div>


              {/* FORGOT PASSWORD */}

              <div className="flex justify-end">

                <button
                  type="button"
                  className="
                    text-sm
                    text-slate-400
                    transition
                    hover:text-cyan-400
                  "
                >
                  Forgot password?
                </button>

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
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-500/20
                  transition
                  hover:scale-[1.01]
                  disabled:opacity-60
                "
              >

                {isLoading
                  ? "Please wait..."
                  : "Continue"}

              </button>

            </form>


            {/* =====================================
                SIGNUP
            ===================================== */}

            <p className="mt-6 text-center text-sm text-slate-400">

              Don't have an account?{" "}

              <button
                type="button"
                className="
                  font-semibold
                  text-white
                  hover:text-cyan-400
                "
              >
                Create account
              </button>

            </p>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

  );
};

export default LoginModal;
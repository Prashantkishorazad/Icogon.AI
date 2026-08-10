import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OTP_LENGTH = 6;
const RESEND_TIME = 30;

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const phone =
    location.state?.phone || "+91 XXXXX XXXXX";

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [timeLeft, setTimeLeft] =
    useState(RESEND_TIME);

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [isAnimating, setIsAnimating] =
    useState(false);

  const [verified, setVerified] =
    useState(false);

  const [error, setError] =
    useState("");

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);

  // ==========================================
  // COUNTDOWN
  // ==========================================

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ==========================================
  // OTP INPUT
  // ==========================================

  const handleChange = (
    index: number,
    value: string
  ) => {
    if (isAnimating || verified) return;

    setError("");

    const digit = value.replace(/\D/g, "");

    if (!digit) {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    const updated = [...otp];

    updated[index] = digit.slice(-1);

    setOtp(updated);

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ==========================================
  // BACKSPACE
  // ==========================================

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (isAnimating || verified) return;

    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // PASTE
  // ==========================================

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    if (isAnimating || verified) return;

    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const updated =
      Array(OTP_LENGTH).fill("");

    pasted.split("").forEach(
      (digit, index) => {
        updated[index] = digit;
      }
    );

    setOtp(updated);

    const nextIndex = Math.min(
      pasted.length,
      OTP_LENGTH - 1
    );

    inputRefs.current[nextIndex]?.focus();
  };

  // ==========================================
  // VERIFY
  // ==========================================

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== OTP_LENGTH) {
      setError(
        "Please enter the complete 6-digit OTP."
      );
      return;
    }

    try {
      setError("");
      setIsVerifying(true);

      /*
       * =========================================
       * REAL BACKEND OTP API WILL GO HERE
       * =========================================
       *
       * const response = await verifyOtpApi({
       *   phone,
       *   otp: otpCode,
       * });
       *
       * if (!response.data.access_token) {
       *   throw new Error("Invalid OTP");
       * }
       */

      // Temporary demo delay
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setIsVerifying(false);

      // START ANIMATION
      setIsAnimating(true);

      // Animation duration
      setTimeout(() => {
        setVerified(true);
        setIsAnimating(false);
      }, 2600);

      // Go dashboard after success
      setTimeout(() => {
        navigate("/dashboard");
      }, 4200);

    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setIsVerifying(false);

      setError(
        "Invalid OTP. Please try again."
      );
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResend = async () => {
    if (timeLeft > 0 || isAnimating) return;

    try {
      setError("");

      /*
       * REAL BACKEND:
       *
       * await sendOtpApi({
       *   phone,
       * });
       */

      setOtp(
        Array(OTP_LENGTH).fill("")
      );

      setVerified(false);

      setTimeLeft(RESEND_TIME);

      inputRefs.current[0]?.focus();

    } catch (error) {
      console.error(error);

      setError(
        "Unable to resend OTP."
      );
    }
  };

  const otpComplete = otp.every(
    (digit) => digit !== ""
  );

  // ==========================================
  // CIRCULAR OTP POSITIONS
  // ==========================================

  const circlePositions = [
    { x: 0, y: -70 },
    { x: 70, y: -20 },
    { x: 70, y: 50 },
    { x: 0, y: 80 },
    { x: -70, y: 50 },
    { x: -70, y: -20 },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-white">

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[130px]" />

      </div>


      {/* MAIN */}

      <div className="relative flex min-h-screen items-center justify-center px-5 py-10">

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="w-full max-w-md"
        >

          {/* BACK */}

          <Link
            to="/phone-login"
            className="mb-8 flex w-fit items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </Link>


          {/* CARD */}

          <div className="rounded-3xl border border-white/10 bg-[#0D1421]/95 p-7 shadow-2xl backdrop-blur-xl md:p-10">


            {/* ICON */}

            <motion.div
              animate={
                verified
                  ? {
                      scale: [1, 1.15, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
              }}
              className={`
                mx-auto flex h-16 w-16
                items-center justify-center
                rounded-2xl
                transition-all duration-500
                ${
                  verified
                    ? "bg-emerald-500/20"
                    : "bg-gradient-to-br from-blue-600 to-cyan-500"
                }
              `}
            >

              {verified ? (
                <Check
                  size={30}
                  className="text-emerald-400"
                />
              ) : (
                <ShieldCheck
                  size={30}
                  className="text-white"
                />
              )}

            </motion.div>


            {/* TITLE */}

            <AnimatePresence mode="wait">

              {!verified ? (
                <motion.div
                  key="verify"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className="mt-7 text-center"
                >

                  <h1 className="text-3xl font-bold">
                    Verify your number
                  </h1>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    We sent a 6-digit verification
                    code to
                  </p>

                  <p className="mt-1 font-medium text-slate-300">
                    {phone}
                  </p>

                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-7 text-center"
                >

                  <h1 className="text-3xl font-bold text-emerald-400">
                    Verified successfully
                  </h1>

                  <p className="mt-3 text-sm text-slate-500">
                    Your mobile number has been
                    verified.
                  </p>

                </motion.div>
              )}

            </AnimatePresence>


            {/* ======================================
                NORMAL OTP BOXES
            ====================================== */}

            <AnimatePresence>

              {!isAnimating && !verified && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  className="mt-9 flex justify-center gap-2 sm:gap-3"
                >

                  {otp.map(
                    (digit, index) => (
                      <motion.input
                        key={index}
                        ref={(element) => {
                          inputRefs.current[
                            index
                          ] = element;
                        }}
                        value={digit}
                        maxLength={1}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        onChange={(e) =>
                          handleChange(
                            index,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(
                            index,
                            e
                          )
                        }
                        onPaste={
                          handlePaste
                        }
                        animate={
                          digit
                            ? {
                                scale: [
                                  1,
                                  1.08,
                                  1,
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.2,
                        }}
                        className="
                          h-14 w-11
                          rounded-xl
                          border
                          border-white/10
                          bg-[#080D16]
                          text-center
                          text-xl
                          font-bold
                          text-white
                          outline-none
                          transition-all
                          focus:border-cyan-400
                          focus:ring-2
                          focus:ring-cyan-400/10
                          sm:h-16
                          sm:w-14
                        "
                      />
                    )
                  )}

                </motion.div>
              )}

            </AnimatePresence>


            {/* ======================================
                CIRCULAR ANIMATION
            ====================================== */}

            <AnimatePresence>

              {isAnimating && !verified && (

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.4,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  className="relative mx-auto mt-8 flex h-[190px] w-[190px] items-center justify-center"
                >

                  {/* CENTER GLOW */}

                  <motion.div
                    animate={{
                      scale: [
                        0.8,
                        1.2,
                        0.8,
                      ],
                      opacity: [
                        0.2,
                        0.5,
                        0.2,
                      ],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                    }}
                    className="absolute h-20 w-20 rounded-full bg-blue-500/20 blur-2xl"
                  />


                  {/* ORBIT RING */}

                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2.4,
                      ease: "easeInOut",
                    }}
                    className="absolute h-[170px] w-[170px] rounded-full border border-blue-400/20"
                  />


                  {/* OTP BOXES */}

                  <motion.div
                    initial={{
                      rotate: 0,
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2.4,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0"
                  >

                    {otp.map(
                      (digit, index) => {

                        const position =
                          circlePositions[
                            index
                          ];

                        return (
                          <motion.div
                            key={index}
                            initial={{
                              x: 0,
                              y: 0,
                              scale: 0.6,
                            }}
                            animate={{
                              x: position.x,
                              y: position.y,
                              scale: 1,
                            }}
                            transition={{
                              duration: 1.2,
                              delay:
                                index * 0.06,
                              ease:
                                [0.22, 1, 0.36, 1],
                            }}
                            className="
                              absolute
                              left-1/2
                              top-1/2
                              flex
                              h-12
                              w-12
                              -translate-x-1/2
                              -translate-y-1/2
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-blue-400/40
                              bg-[#101A2A]
                              text-lg
                              font-bold
                              text-white
                              shadow-lg
                              shadow-blue-500/20
                            "
                          >
                            {digit}
                          </motion.div>
                        );
                      }
                    )}

                  </motion.div>

                </motion.div>
              )}

            </AnimatePresence>


            {/* ======================================
                SUCCESS ANIMATION
            ====================================== */}

            <AnimatePresence>

              {verified && (

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.4,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 15,
                  }}
                  className="relative mx-auto mt-8 flex h-[190px] w-[190px] items-center justify-center"
                >

                  {/* PARTICLES */}

                  {Array.from({
                    length: 12,
                  }).map((_, index) => {

                    const angle =
                      (index / 12) *
                      Math.PI *
                      2;

                    const x =
                      Math.cos(angle) * 75;

                    const y =
                      Math.sin(angle) * 75;

                    return (
                      <motion.span
                        key={index}
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 0,
                        }}
                        animate={{
                          x,
                          y,
                          opacity: [
                            0,
                            1,
                            0,
                          ],
                          scale: [
                            0.5,
                            1,
                            0,
                          ],
                        }}
                        transition={{
                          duration: 1.2,
                          delay:
                            index * 0.04,
                        }}
                        className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400"
                      />
                    );
                  })}


                  {/* SUCCESS RING */}

                  <motion.div
                    initial={{
                      scale: 0.4,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    className="absolute h-24 w-24 rounded-2xl border border-emerald-400/40 bg-emerald-400/10"
                  />


                  {/* CHECK */}

                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -45,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 250,
                    }}
                    className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/20"
                  >

                    <Check
                      size={35}
                      className="text-emerald-400"
                    />

                  </motion.div>

                </motion.div>
              )}

            </AnimatePresence>


            {/* ERROR */}

            <AnimatePresence>

              {error && !isAnimating && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="mt-4 text-center text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}

            </AnimatePresence>


            {/* ======================================
                VERIFY BUTTON
            ====================================== */}

            {!isAnimating && !verified && (
              <motion.button
                type="button"
                onClick={handleVerify}
                disabled={
                  !otpComplete ||
                  isVerifying
                }
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mt-8
                  h-14
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-500/10
                  transition
                  hover:scale-[1.01]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                {isVerifying
                  ? "Verifying..."
                  : "Verify OTP"}

              </motion.button>
            )}


            {/* ======================================
                RESEND
            ====================================== */}

            {!isAnimating && !verified && (
              <div className="mt-7 text-center">

                {timeLeft > 0 ? (
                  <p className="text-sm text-slate-600">
                    Resend code in{" "}
                    <span className="font-medium text-slate-400">
                      {timeLeft}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleResend
                    }
                    className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <RefreshCw size={15} />
                    Resend OTP
                  </button>
                )}

              </div>
            )}


            {/* SUCCESS CONTINUE */}

            {verified && (
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.7,
                }}
                className="mt-7 text-center text-xs text-slate-500"
              >
                Redirecting to ICOGON AI...
              </motion.p>
            )}

          </div>


          {/* FOOTER */}

          <p className="mt-6 text-center text-xs text-slate-600">
            Your verification code is private.
            Never share it with anyone.
          </p>

        </motion.div>

      </div>
    </div>
  );
};

export default OTPVerificationPage;
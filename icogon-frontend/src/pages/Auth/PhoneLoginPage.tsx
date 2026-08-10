import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const PhoneLoginPage = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    try {
      setIsSending(true);
      setError("");

      /*
       * Connect FastAPI here:
       *
       * await sendOtpApi({
       *   phone: `+91${cleanPhone}`
       * });
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      navigate("/verify-otp", {
        state: {
          phone: `+91 ${cleanPhone}`,
        },
      });

    } catch (error) {
      console.error(error);

      setError(
        "Unable to send OTP. Please try again."
      );

    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white">

      <div className="flex min-h-screen items-center justify-center px-5">

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-md"
        >

          <Link
            to="/login"
            className="mb-8 flex w-fit items-center gap-2 text-sm text-slate-500 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </Link>


          <div className="rounded-3xl border border-white/10 bg-[#0D1421] p-8 shadow-2xl md:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <Phone size={28} />
            </div>


            <h1 className="mt-7 text-center text-3xl font-bold">
              Login with mobile
            </h1>

            <p className="mt-3 text-center text-sm leading-6 text-slate-500">
              Enter your mobile number and we'll
              send you a 6-digit verification code.
            </p>


            <div className="mt-8">

              <label className="mb-2 block text-sm text-slate-400">
                Mobile number
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#080D16] focus-within:border-blue-500">

                <div className="flex items-center border-r border-white/10 px-4 text-sm text-slate-400">
                  +91
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="9876543210"
                  className="h-14 w-full bg-transparent px-4 text-white outline-none placeholder:text-slate-700"
                />

              </div>

              {error && (
                <p className="mt-2 text-xs text-red-400">
                  {error}
                </p>
              )}

            </div>


            <button
              type="button"
              onClick={handleSendOTP}
              disabled={
                phone.length !== 10 ||
                isSending
              }
              className="mt-6 h-14 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending
                ? "Sending OTP..."
                : "Send OTP"}
            </button>


            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-600">
              <ShieldCheck size={14} />
              Secure OTP verification
            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
};

export default PhoneLoginPage;
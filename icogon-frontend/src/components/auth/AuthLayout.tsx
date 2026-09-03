import type {ReactNode} from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/logo1.png";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showBack?: boolean;
}

const AuthLayout = ({
  children,
  title,
  subtitle,
  showBack = true,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#111214] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-200px] top-[-200px] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[150px]" />

        <div className="absolute bottom-[-200px] right-[-200px] h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      <div className="relative flex min-h-screen">

        {/* ================= LEFT AUTH SECTION ================= */}
        <section className="relative flex w-full flex-col px-6 py-8 lg:w-[46%] lg:px-16 xl:px-24">

          {/* Logo */}
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="ICOGON AI"
                className="h-10 w-10 object-contain"
              />

              <div>
                <div className="text-lg font-bold tracking-tight text-white">
                  ICOGON
                </div>

                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  AI
                </div>
              </div>
            </Link>
          </div>

          {/* Main content */}
          <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center">

            {showBack && (
              <Link
                to="/"
                className="mb-8 flex w-fit items-center gap-2 text-sm text-slate-500 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to ICOGON
              </Link>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {subtitle}
              </p>
            </div>

            {children}
          </div>

          {/* Footer */}
          <div className="pt-8 text-center text-xs text-slate-600">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="text-slate-400 underline underline-offset-4 hover:text-white"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-slate-400 underline underline-offset-4 hover:text-white"
            >
              Privacy Policy
            </Link>
          </div>
        </section>

        {/* ================= RIGHT PREVIEW ================= */}
        <section className="relative hidden overflow-hidden lg:flex lg:w-[54%]">

          <div className="absolute inset-5 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#dce5dc] via-[#2389d0] to-[#0646b8]">

            {/* Glow */}
            <div className="absolute left-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-cyan-300/50 blur-[100px]" />

            <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-cyan-300/50 blur-[100px]" />

            {/* Badge */}
            <div className="absolute right-5 top-5 z-20 rounded-xl bg-blue-600/80 px-4 py-2 text-sm font-medium backdrop-blur-md">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-xs font-bold">
                I
              </span>
              ICOGON AI
            </div>

            {/* Preview content */}
            <div className="relative z-10 flex h-full flex-col items-center px-8 pt-20 text-center">

              {/* Logo symbol */}
              <div className="mb-5 text-6xl font-bold text-white/90">
                ✦
              </div>

              <h2 className="max-w-xl text-4xl font-bold leading-tight text-white xl:text-5xl">
                Build your ideas
                <br />
                with AI
              </h2>

              <p className="mt-5 max-w-lg text-lg leading-8 text-white/80">
                Generate websites, apps and complete software
                applications in minutes.
              </p>

              {/* Product preview */}
              <div className="relative mt-12 w-full max-w-[700px]">

                {/* Phone */}
                <div className="absolute -left-10 bottom-[-20px] hidden w-[170px] overflow-hidden rounded-[30px] border-[7px] border-black bg-white shadow-2xl xl:block">
                  <div className="h-[360px] bg-gradient-to-b from-blue-100 to-white p-4">

                    <div className="mb-5 h-3 w-16 rounded-full bg-slate-300" />

                    <div className="rounded-xl bg-white p-3 shadow">
                      <div className="h-2 w-14 rounded bg-slate-200" />
                      <div className="mt-2 h-2 w-20 rounded bg-slate-200" />
                    </div>

                    <div className="mt-4 rounded-xl bg-blue-500 p-4">
                      <div className="h-2 w-16 rounded bg-white/60" />
                      <div className="mt-2 h-2 w-20 rounded bg-white/40" />
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="h-16 rounded-xl bg-slate-100" />
                      <div className="h-16 rounded-xl bg-slate-100" />
                      <div className="h-16 rounded-xl bg-slate-100" />
                    </div>
                  </div>
                </div>

                {/* Browser */}
                <div className="relative ml-auto w-full overflow-hidden rounded-2xl border-[5px] border-[#111] bg-black shadow-2xl xl:w-[650px]">

                  {/* Browser bar */}
                  <div className="flex h-9 items-center gap-2 bg-[#161616] px-4">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

                    <div className="ml-6 h-5 flex-1 rounded-md bg-[#242424]" />
                  </div>

                  {/* Website */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#090909]">

                    <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                      <div className="text-sm font-bold">
                        ICOGON AI
                      </div>

                      <div className="flex gap-5 text-[8px] text-slate-400">
                        <span>PRODUCT</span>
                        <span>FEATURES</span>
                        <span>PRICING</span>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-black tracking-tight text-white md:text-6xl">
                          BUILD
                        </div>

                        <div className="mt-1 text-3xl font-black text-cyan-400 md:text-5xl">
                          WITH AI
                        </div>

                        <div className="mx-auto mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-5 right-5 flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div
                          key={item}
                          className="h-6 flex-1 rounded-full border border-white/10 bg-white/5"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black"
                >
                  ←
                </button>

                <span className="h-2 w-8 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white/40" />
                <span className="h-2 w-2 rounded-full bg-white/40" />

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black"
                >
                  →
                </button>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
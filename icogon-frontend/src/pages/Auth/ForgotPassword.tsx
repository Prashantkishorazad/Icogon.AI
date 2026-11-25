import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { supabase } from "../../lib/supabase";

/**
 * Password reset request and recovery completion share a small, standalone layout.
 * Add both /forgot-password and /auth/reset-password to App.tsx.
 */
const ForgotPassword = () => {
  const location = useLocation();
  const isReset = location.pathname === "/auth/reset-password";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isReset) {
        if (password.length < 8) throw new Error("Use at least 8 characters for your new password.");
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (resetError) throw resetError;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#f7f8fb] px-4 py-10 text-[#171923]">
      <section className="w-full max-w-[420px] rounded-[24px] border border-[#e3e5eb] bg-white px-7 py-8 shadow-[0_28px_90px_rgba(16,24,40,0.09)]">
        <Link to="/login" className="inline-flex items-center gap-2 text-[12px] text-[#667085] hover:text-[#171923]"><ArrowLeft size={15} /> Back to login</Link>
        <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#315fe5]">{isReset ? <LockKeyhole size={21} /> : <Mail size={21} />}</div>
        <h1 className="mt-5 text-[25px] font-semibold tracking-tight">{isReset ? "Set new password" : "Reset your password"}</h1>
        <p className="mt-2 text-[13px] leading-6 text-[#667085]">{isReset ? "Choose a strong password for your ICOGON account." : "Enter the email address linked to your ICOGON account."}</p>

        {done ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-[13px] leading-6 text-green-800" role="status">
            {isReset ? "Your password was updated." : "If that account exists, a reset link has been sent to your email."}
            <div><Link to="/login" className="mt-3 inline-block font-semibold underline">Return to login</Link></div>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            {isReset ? (
              <div>
                <label htmlFor="reset-password" className="mb-1.5 block text-[12px] font-semibold">New password</label>
                <input id="reset-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required className="h-11 w-full rounded-[10px] border border-[#dfe2e8] px-3 text-[13px] outline-none focus:border-[#3978ff]" />
              </div>
            ) : (
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-[12px] font-semibold">Email</label>
                <input id="reset-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="h-11 w-full rounded-[10px] border border-[#dfe2e8] px-3 text-[13px] outline-none focus:border-[#3978ff]" />
              </div>
            )}
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}
            <button type="submit" disabled={busy || (isReset ? password.length < 8 : !email.trim())} className="h-11 w-full rounded-[10px] bg-[#17191f] text-[13px] font-semibold text-white disabled:opacity-50">{busy ? "Working..." : isReset ? "Save new password" : "Send reset link"}</button>
          </form>
        )}
      </section>
    </main>
  );
};

export default ForgotPassword;

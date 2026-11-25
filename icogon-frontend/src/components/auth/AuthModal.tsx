import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Apple, Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import type { Provider } from "@supabase/supabase-js";
import logo from "../../assets/logo.png";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

interface Props { mode: "login" | "signup"; onClose?: () => void }
const field = "h-10 w-full rounded-[10px] border border-[#d8d4cf] bg-white pl-10 pr-10 text-sm text-[#171717] outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const providerButton = "flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[#d8d4cf] bg-white text-sm text-[#171717] hover:bg-[#f3f3f3] focus-visible:outline-blue-500 disabled:opacity-50";

export default function AuthModal({ mode, onClose }: Props) {
  const signup = mode === "signup";
  const navigate = useNavigate();
  const authenticated = useAuthStore(state => state.isAuthenticated);
  const initializing = useAuthStore(state => state.isLoading);
  const setSession = useAuthStore(state => state.setSession);
  const dialog = useRef<HTMLDialogElement>(null);
  const popupRef = useRef<Window | null>(null);
  const timer = useRef<number | null>(null);
  const alive = useRef(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function close() { if (onClose) onClose(); else navigate("/", { replace: true }); }
  useEffect(() => {
    alive.current = true;
    const element = dialog.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      alive.current = false;
      element?.close();
      document.body.style.overflow = previous;
      if (timer.current !== null) window.clearInterval(timer.current);
      // Do not close a provider window during a successful auth-state transition.
    };
  }, []);
  useEffect(() => {
    if (!initializing && authenticated) navigate("/dashboard", { replace: true });
  }, [authenticated, initializing, navigate]);

  async function oauth(provider: Provider) {
    if (pending) return;
    setPending(provider); setError(""); setNotice("");
    // Open synchronously from the click, before awaiting Supabase, to avoid blockers.
    const width = 500, height = 680;
    const left = Math.round(window.screenX + Math.max(0, (window.outerWidth - width) / 2));
    const top = Math.round(window.screenY + Math.max(0, (window.outerHeight - height) / 2));
    const popup = window.open("about:blank", "_blank", `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
    popupRef.current = popup;
    try {
      if (popup) { popup.opener = null; popup.sessionStorage.setItem("icogon:oauth-popup", "1"); popup.document.title = "Connecting to ICOGON"; popup.document.body.textContent = "Connecting securely…"; }
      const { data, error: failure } = await supabase.auth.signInWithOAuth({ provider, options: {
        redirectTo: `${window.location.origin}/auth/callback${popup ? "?popup=1" : ""}`,
        skipBrowserRedirect: true,
        ...(provider === "google" ? { queryParams: { prompt: "select_account" } } : {}),
      }});
      if (failure) throw failure;
      if (!data.url) throw new Error("Provider did not return a sign-in URL.");
      if (!alive.current || (popup && popup.closed)) { popup?.close(); if (alive.current) setPending(null); return; }
      if (!popup) { window.location.assign(data.url); return; }
      popup.location.replace(data.url);
      // Supabase synchronizes auth state across same-origin tabs. Also verify
      // the persisted session when the user closes the provider window.
      timer.current = window.setInterval(() => {
        if (!popup.closed) return;
        if (timer.current !== null) window.clearInterval(timer.current);
        timer.current = null;
        void supabase.auth.getSession().then(({ data: result, error: sessionError }) => {
          if (!alive.current) return;
          if (result.session && !sessionError) setSession(result.session);
          else { setPending(null); setError("Sign-in window closed before authentication completed. Try again."); }
        }).catch(() => { if (alive.current) { setPending(null); setError("Unable to verify sign-in. Try again."); } });
      }, 500);
    } catch (err) {
      popup?.close();
      if (alive.current) { setPending(null); setError(err instanceof Error ? err.message : "Unable to start sign-in."); }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending("email"); setError(""); setNotice("");
    try {
      if (signup && !name.trim()) throw new Error("Enter your full name.");
      if (signup && password.length < 8) throw new Error("Use at least 8 characters for your password.");
      const result = signup ? await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` } }) : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (result.data.session) { setSession(result.data.session); navigate("/dashboard", { replace: true }); }
      else if (signup) setNotice("Check your email for a confirmation link to finish creating your account.");
      else throw new Error("No session was returned. Try again.");
    } catch (err) { setError(err instanceof Error ? err.message : "Authentication failed."); }
    finally { if (alive.current) setPending(null); }
  }

  const disabled = pending !== null || initializing;
  return (
    <dialog ref={dialog} aria-labelledby="icogon-auth-heading" onCancel={event => { event.preventDefault(); if (!pending) close(); }} onClick={event => { if (event.target === event.currentTarget && !pending) close(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-24px)] w-[calc(100%_-_32px)] max-w-[440px] overflow-y-auto rounded-[24px] border border-[#e6e2dc] bg-[#faf9f6] p-0 text-[#151923] shadow-2xl backdrop:bg-black/35 backdrop:backdrop-blur-[4px]">
      <section className="relative px-7 py-6" onClick={event => event.stopPropagation()}>
        <button type="button" disabled={!!pending} aria-label="Close authentication" onClick={close} className="absolute right-5 top-5 rounded-md p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-50"><X size={18} /></button>
        <img src={logo} alt="ICOGON" className="mb-4 h-8 w-8 object-contain" />
        <p className="text-[11px] font-semibold text-slate-400">Start building.</p>
        <h1 id="icogon-auth-heading" className="mt-1 text-[25px] font-semibold tracking-[-0.04em]">{signup ? "Create free account" : "Log in to your account"}</h1>
        <p className="mb-4 mt-1 text-xs text-slate-500">{signup ? "Start building websites, apps and AI agents with ICOGON AI." : "Continue building with ICOGON AI."}</p>
        <div className="grid gap-1.5">
          <button className={providerButton} disabled={disabled} onClick={() => void oauth("google")}><span className="font-bold text-[#4285f4]">G</span>{pending === "google" ? "Connecting…" : "Continue with Google"}</button>
          <button className={providerButton} disabled={disabled} onClick={() => void oauth("github")}><FaGithub size={17} />{pending === "github" ? "Connecting…" : "Continue with GitHub"}</button>
          <button className={providerButton} disabled={disabled} onClick={() => void oauth("apple")}><Apple size={17} />{pending === "apple" ? "Connecting…" : "Continue with Apple"}</button>
        </div>
        {pending && pending !== "email" && <button type="button" className="mt-2 text-xs text-blue-600 underline" onClick={() => { popupRef.current?.close(); }}>Cancel provider sign-in</button>}
        <div className="my-3.5 flex items-center gap-3 text-[10px] text-slate-400"><span className="h-px flex-1 bg-[#dedbd6]" />OR<span className="h-px flex-1 bg-[#dedbd6]" /></div>
        <form onSubmit={event => void submit(event)} className="grid gap-2">
          {signup && <label className="relative"><User size={15} className="absolute left-3 top-3 text-slate-400" /><input className={field} aria-label="Full name" autoComplete="name" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required disabled={disabled} /></label>}
          <label className="relative"><Mail size={15} className="absolute left-3 top-3 text-slate-400" /><input className={field} aria-label="Email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={disabled} /></label>
          <div className="relative"><Lock size={15} className="absolute left-3 top-3 text-slate-400" /><input className={field} aria-label="Password" type={showPassword ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Create password" : "Password"} value={password} onChange={e => setPassword(e.target.value)} required disabled={disabled} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-3 text-slate-400" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
          {!signup && <Link to="/forgot-password" className="text-right text-xs text-slate-500 hover:underline">Forgot password?</Link>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-lg bg-blue-50 p-2 text-xs text-blue-800">{notice}</p>}
          <button type="submit" disabled={disabled || !email.trim() || !password || (signup && !name.trim())} className="h-10 rounded-[10px] bg-[#18181b] text-sm font-medium text-white shadow-md disabled:opacity-50">{pending === "email" ? "Please wait…" : signup ? "Create account" : "Continue"}</button>
        </form>
        <p className="mt-3 text-[10px] text-slate-500">By continuing, you agree to the <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
        <p className="mt-3 text-center text-xs text-slate-500">{signup ? "Already have an account?" : "Don't have an account?"} <Link to={signup ? "/login" : "/signup"} className="font-medium text-[#171717] hover:underline">{signup ? "Sign in" : "Create account"}</Link></p>
        <p className="mt-3 flex items-center justify-center gap-1.5 border-t border-[#dedbd6] pt-3 text-[10px] text-slate-400"><Lock size={11} />Secure authentication powered by ICOGON</p>
      </section>
    </dialog>
  );
}

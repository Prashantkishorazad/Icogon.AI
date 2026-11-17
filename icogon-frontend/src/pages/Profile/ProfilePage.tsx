import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Folder,
  Globe,
  ImagePlus,
  Settings,
  Share2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  provider: string;
}

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

const makeUsername = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30) || "user";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverError, setCoverError] = useState("");
  const [copied, setCopied] = useState(false);
  const [openMenu, setOpenMenu] = useState<"solutions" | "resources" | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const menuCloseTimer = useRef<number | null>(null);

  const cancelMenuClose = () => {
    if (menuCloseTimer.current !== null) {
      window.clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
  };

  const scheduleMenuClose = () => {
    cancelMenuClose();
    menuCloseTimer.current = window.setTimeout(() => {
      setOpenMenu(null);
      menuCloseTimer.current = null;
    }, 220);
  };

  const isOwnProfile = !routeUsername || routeUsername === profile?.username;
  const profileUrl = useMemo(
    () => profile ? `${window.location.origin}/@${profile.username}` : "",
    [profile]
  );

  useEffect(() => {
    return () => {
      if (menuCloseTimer.current !== null) window.clearTimeout(menuCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        const metadata = user.user_metadata || {};
        const name =
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "User";
        const username = makeUsername(metadata.username || name);
        const requestedUsername = routeUsername
          ? makeUsername(routeUsername)
          : username;

        if (requestedUsername !== username) {
          // Public profile lookup requires a public `profiles` table or RPC.
          // Do not expose auth.users or guess another user's private metadata.
          throw new Error(
            "This public profile is not available yet. Public profile lookup needs the profiles table to be enabled."
          );
        }

        if (!active) return;
        setProfile({
          id: user.id,
          name,
          email: user.email || "",
          username,
          avatarUrl: metadata.avatar_url || metadata.picture || "",
          coverUrl: metadata.cover_url || "",
          provider: user.app_metadata?.provider || "email",
        });
      } catch (err: unknown) {
        if (!active) return;
        console.error("PROFILE LOAD ERROR:", err);
        setError(err instanceof Error ? err.message : "Unable to load profile.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => { active = false; };
  }, [navigate, routeUsername]);

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setCoverError("");

    if (!file.type.startsWith("image/")) {
      setCoverError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCoverError("Cover images must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsUploadingCover(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
      const storagePath = `${profile.id}/cover-${Date.now()}.${safeExtension}`;

      // The `profile-covers` bucket must exist and allow authenticated uploads.
      const { error: uploadError } = await supabase.storage
        .from("profile-covers")
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("profile-covers")
        .getPublicUrl(storagePath);

      const permanentCoverUrl = publicUrlData.publicUrl;
      if (!permanentCoverUrl) {
        throw new Error("The uploaded cover image URL could not be created.");
      }

      // Store the URL in Supabase Auth user metadata so it is restored on login.
      const { data: updatedUser, error: metadataError } = await supabase.auth.updateUser({
        data: { cover_url: permanentCoverUrl },
      });

      if (metadataError) {
        await supabase.storage.from("profile-covers").remove([storagePath]);
        throw metadataError;
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              coverUrl:
                updatedUser.user?.user_metadata?.cover_url || permanentCoverUrl,
            }
          : current
      );
    } catch (err: unknown) {
      console.error("PROFILE COVER UPLOAD ERROR:", err);
      setCoverError(
        err instanceof Error
          ? err.message
          : "Unable to save your cover photo. Please try again."
      );
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
  };

  const copyProfileLink = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy the profile link. Please copy it from your browser address bar.");
    }
  };

  // const goTo = (path: string) => navigate(path);

  const pageBg = isDark ? "bg-[#1c1c1c] text-white" : "bg-[#fafafa] text-slate-900";
  const border = isDark ? "border-white/[0.09]" : "border-slate-200";
  const muted = isDark ? "text-[#858585]" : "text-slate-500";
  const subtle = isDark ? "text-[#c2c2c2]" : "text-slate-600";
  const card = isDark ? "border-white/[0.07] bg-[#242424]" : "border-slate-200 bg-white";
  const softHover = isDark ? "hover:bg-white/[0.06]" : "hover:bg-slate-100";

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${pageBg}`}>
        <div className="text-center">
          <div className={`mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 ${isDark ? "border-white/10 border-t-white" : "border-slate-200 border-t-slate-700"}`} />
          <p className={`text-xs ${muted}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-5 ${pageBg}`}>
        <div className={`w-full max-w-md rounded-2xl border p-7 text-center ${card}`}>
          <h1 className="text-lg font-semibold">Profile unavailable</h1>
          <p className={`mt-2 text-sm leading-6 ${muted}`}>{error || "This profile could not be found."}</p>
          <button onClick={() => navigate("/dashboard")} className={`mt-5 rounded-full border px-4 py-2 text-sm ${border} ${softHover}`}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className={`fixed inset-0 z-[100] h-screen w-screen overflow-x-hidden overflow-y-auto font-sans ${pageBg}`}>
      <style>{`@keyframes icogonMenuIn { from { opacity: 0; translate: 0 -6px; } to { opacity: 1; translate: 0 0; } } .icogon-mega-menu { animation: icogonMenuIn 180ms ease-out both; will-change: opacity, translate; } @media (prefers-reduced-motion: reduce) { .icogon-mega-menu { animation: none; } }`}</style>
      {/* Public profile navigation */}
      <header
        className={`sticky top-0 z-50 h-[72px] border-b backdrop-blur-2xl supports-[backdrop-filter]:backdrop-saturate-150 transition-colors duration-300 ease-out ${
          isDark
            ? "border-white/[0.09] bg-[#171717]/45 supports-[backdrop-filter]:bg-[#171717]/35"
            : "border-slate-200/40 bg-white/55 supports-[backdrop-filter]:bg-white/40"
        }`}
        onMouseLeave={scheduleMenuClose}
      >
        <div className="relative mx-auto flex h-full w-[min(88%,1610px)] items-center justify-between gap-5">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            aria-label="Open ICOGON dashboard"
            className="flex shrink-0 cursor-pointer items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
          >
            <img src="/logo.png" alt="ICOGON" className="h-[30px] w-[30px] object-contain sm:h-[34px] sm:w-[34px]" />
            <span className="text-[18px] font-semibold tracking-[-0.045em]">ICOGON</span>
          </button>

          <nav aria-label="Main navigation" className={`hidden h-full items-center gap-1.5 text-[14px] font-semibold lg:flex xl:gap-2 ${subtle}`}>
            <div className="relative flex h-full items-center">
              <button
                type="button"
                aria-expanded={openMenu === "solutions"}
                onMouseEnter={() => { cancelMenuClose(); setOpenMenu("solutions"); }}
                onFocus={() => setOpenMenu("solutions")}
                onClick={() => setOpenMenu(openMenu === "solutions" ? null : "solutions")}
                className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3.5 transition-all duration-200 ease-out ${
                  openMenu === "solutions" ? (isDark ? "bg-white/[0.09] text-white" : "bg-slate-100 text-slate-950") : `${softHover} ${isDark ? "hover:bg-white/[0.08] hover:text-white" : "hover:bg-slate-100 hover:text-slate-950"}`
                }`}
              >
                Solutions <span className="text-[11px]">⌄</span>
              </button>
            </div>
            <div className="relative flex h-full items-center">
              <button
                type="button"
                aria-expanded={openMenu === "resources"}
                onMouseEnter={() => { cancelMenuClose(); setOpenMenu("resources"); }}
                onFocus={() => setOpenMenu("resources")}
                onClick={() => setOpenMenu(openMenu === "resources" ? null : "resources")}
                className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3.5 transition-all duration-200 ease-out ${
                  openMenu === "resources" ? (isDark ? "bg-white/[0.09] text-white" : "bg-slate-100 text-slate-950") : `${softHover} ${isDark ? "hover:bg-white/[0.08] hover:text-white" : "hover:bg-slate-100 hover:text-slate-950"}`
                }`}
              >
                Resources <span className="text-[11px]">⌄</span>
              </button>
            </div>
            <button onClick={() => navigate("/community")} className="h-10 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">Community</button>
            <button onClick={() => navigate("/enterprise")} className="h-10 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">Enterprise</button>
            <button onClick={() => navigate("/pricing")} className="h-10 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">Pricing</button>
            <button onClick={() => navigate("/security")} className="h-10 cursor-pointer rounded-full px-3.5 text-[14px] font-semibold transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">Security</button>
          </nav>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="shrink-0 cursor-pointer rounded-full border border-white bg-white px-[22px] py-[10px] text-[14px] font-medium tracking-[-0.01em] text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-zinc-100 hover:bg-zinc-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]" 
          >
            Open ICOGON
          </button>

          {openMenu && (
            <div
              onMouseEnter={() => setOpenMenu(openMenu)}
              onMouseLeave={scheduleMenuClose}
              style={{
                position: "fixed",
                left: "50%",
                top: "72px",
                transform: "translateX(-50%)",
                width: "min(1040px, calc(100vw - 32px))",
                maxHeight: "calc(100vh - 88px)",
              }}
              className={`icogon-mega-menu z-[60] overflow-x-hidden overflow-y-auto rounded-[24px] border shadow-[0_30px_100px_rgba(0,0,0,0.55)] ${
                isDark ? "border-white/[0.12] bg-[#151515] text-white" : "border-slate-200 bg-white text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.20)]"
              }`}
            >
              {openMenu === "solutions" ? (
                <div className="grid md:grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)]">
                  <div className="p-7 sm:p-9">
                    <p className={`mb-7 text-[14px] font-semibold ${muted}`}>Who is it for?</p>
                    <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                      {[
                        ["For work", "Run on what you build.", "/enterprise"],
                        ["For small businesses", "More customers, less busywork.", "/solutions"],
                        ["Founders", "Ship before you pitch.", "/solutions"],
                        ["Product managers", "Prototype, don't spec.", "/solutions"],
                        ["Designers", "Your designs, built.", "/solutions"],
                        ["Marketers", "Launch pages in minutes.", "/solutions"],
                        ["Sales", "Build the demo live.", "/solutions"],
                        ["Ops", "Tools that fit your workflow.", "/solutions"],
                        ["People", "HR tools your team loves.", "/solutions"],
                      ].map(([label, description, path]) => (
                        <button key={label} type="button" onClick={() => { setOpenMenu(null); navigate(path); }} className={`group cursor-pointer text-left ${isDark ? "text-white" : "text-slate-950"}`}>
                          <span className="block text-[16px] font-semibold tracking-tight transition-all duration-200 ease-out group-hover:text-sky-400">{label}</span>
                          <span className={`mt-1 block text-[14px] leading-5 ${muted}`}>{description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`p-7 sm:p-9 ${isDark ? "bg-[#101010]" : "bg-slate-50"}`}>
                    <p className={`mb-7 text-[14px] font-semibold ${muted}`}>Use cases</p>
                    <div className="space-y-7">
                      {[
                        ["Websites", "From idea to live site.", "/builder"],
                        ["AI-powered apps", "Apps that talk, create, and act.", "/builder"],
                        ["Prototyping", "Proof of concept in hours.", "/prototyping"],
                        ["Internal tools", "Built for your team.", "/dashboard"],
                      ].map(([label, description, path]) => (
                        <button key={label} type="button" onClick={() => { setOpenMenu(null); navigate(path); }} className={`group block cursor-pointer text-left ${isDark ? "text-white" : "text-slate-950"}`}>
                          <span className="block text-[16px] font-semibold transition-all duration-200 ease-out group-hover:text-sky-400">{label}</span>
                          <span className={`mt-1 block text-[14px] leading-5 ${muted}`}>{description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)]">
                  <div className="p-7 sm:p-9">
                    <p className={`mb-7 text-[14px] font-semibold ${muted}`}>Explore resources</p>
                    <div className="grid gap-x-12 gap-y-7 sm:grid-cols-2">
                      {[
                        ["Documentation", "Guides and product documentation.", "/docs"],
                        ["Templates", "Start faster with reusable templates.", "/templates"],
                        ["Connectors", "Connect the tools you already use.", "/connectors"],
                        ["Blog", "Product updates, ideas, and stories.", "/blog"],
                        ["Guides", "Learn as you build.", "/guides"],
                        ["Support", "Get help when you need it.", "/support"],
                      ].map(([label, description, path]) => (
                        <button key={label} type="button" onClick={() => { setOpenMenu(null); navigate(path); }} className={`group cursor-pointer text-left ${isDark ? "text-white" : "text-slate-950"}`}>
                          <span className="block text-[16px] font-semibold tracking-tight transition-all duration-200 ease-out group-hover:text-sky-400">{label}</span>
                          <span className={`mt-1 block text-[14px] leading-5 ${muted}`}>{description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`p-7 sm:p-9 ${isDark ? "bg-[#101010]" : "bg-slate-50"}`}>
                    <p className={`text-[14px] font-semibold ${muted}`}>ICOGON</p>
                    <div className="mt-6 flex h-[150px] items-center justify-center rounded-[16px] bg-gradient-to-br from-[#477eb8] via-[#a34c98] to-[#c64b20] shadow-inner">
                      <span className="text-[30px] font-bold tracking-tight text-white">Create more.</span>
                    </div>
                    <p className={`mt-6 text-[20px] font-semibold leading-7 ${isDark ? "text-white" : "text-slate-900"}`}>From first idea to finished product.</p>
                    <button onClick={() => { setOpenMenu(null); navigate("/dashboard"); }} className={`mt-4 cursor-pointer text-[14px] font-semibold transition-all duration-200 ease-out ${isDark ? "text-zinc-300 hover:text-white" : "text-slate-600 hover:text-slate-950"}`}>
                      Explore ICOGON <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-[88%] max-w-[1536px] pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pt-[76px]">
        {/* Cover */}
        <section>
          <div className="relative h-[clamp(210px,21.4vw,380px)] overflow-visible rounded-[18px] sm:rounded-[22px] bg-[linear-gradient(112deg,#477fba_0%,#8e62a7_34%,#b52d70_68%,#c34a20_100%)]">
            {profile.coverUrl ? (
              <img src={profile.coverUrl} alt="Profile cover" className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center" />
            ) : null}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/[0.05] via-transparent to-black/[0.05]" />
            {isOwnProfile && (
              <>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelection} />
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={isUploadingCover} className="absolute right-3 top-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-[10px] font-medium text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/60 hover:shadow-xl disabled:cursor-wait disabled:opacity-70 sm:px-3.5 sm:py-2 sm:text-[11px]">
                  <ImagePlus size={14} /> {isUploadingCover ? "Saving cover..." : profile.coverUrl ? "Change cover" : "Edit cover"}
                </button>
                {coverError && <p role="alert" className="absolute bottom-3 right-3 max-w-[min(90%,420px)] rounded-lg bg-red-950/90 px-3 py-2 text-[10px] text-white shadow-lg">{coverError}</p>}
              </>
            )}
            <div className="absolute -bottom-[72px] left-[clamp(28px,2.8vw,50px)] z-10 flex h-[clamp(104px,9.1vw,168px)] w-[clamp(104px,9.1vw,168px)] items-center justify-center overflow-hidden rounded-full border-[4px] border-[#1c1c1c] bg-[#c5360b] text-[clamp(46px,4.3vw,80px)] font-normal text-white shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
              <span aria-label={`${initial} profile avatar`}>{initial}</span>
            </div>
          </div>

          <div className="mt-[132px] flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.04em] sm:text-[34px] md:text-[40px]">{profile.name}</h1>
              <div className={`mt-3 flex flex-wrap items-center gap-3 text-[14px] sm:text-[16px] ${subtle}`}>
                <span>@{profile.username}</span><span>·</span><span>0 followers</span><span>0 following</span>
              </div>
              </div>
            <div className="flex flex-wrap items-center gap-2">
              {isOwnProfile && (
                <button type="button" onClick={() => navigate("/profile?tab=edit")} className={`cursor-pointer rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${border} ${softHover} ${subtle}`}>
                  Edit profile
                </button>
              )}
              <button type="button" onClick={copyProfileLink} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${border} ${softHover} ${subtle}`}>
                {copied ? <Check size={12} /> : <Share2 size={12} />}
                {copied ? "Copied" : "Share profile"}
              </button>
              {isOwnProfile && (
                <button type="button" onClick={() => navigate("/profile?tab=settings")} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${border} ${softHover} ${subtle}`}>
                  Account settings <Settings size={12} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Published projects */}
        <section className={`mt-10 flex min-h-[250px] flex-col items-center justify-center rounded-[18px] border px-6 text-center sm:min-h-[285px] ${card}`}>
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${isDark ? "bg-white/[0.05] text-zinc-500" : "bg-slate-100 text-slate-400"}`}>
            <Folder size={25} strokeWidth={1.6} />
          </div>
          <h2 className={`text-[16px] font-semibold ${isDark ? "text-zinc-200" : "text-slate-700"}`}>No published projects yet</h2>
          <p className={`mt-2 text-[14px] leading-6 ${muted}`}>Projects published to this profile will appear here</p>
        </section>

        {/* Activity — Lovable-style contribution graph and summary */}
        <section className="mt-14 sm:mt-16">
          <div className={`mb-4 flex flex-wrap items-center gap-2 text-[17px] font-semibold tracking-[-0.02em] ${isDark ? "text-zinc-100" : "text-slate-900"}`}>
            <span>0 edits on</span>
            <img
              src="/logo.png"
              alt="ICOGON"
              className="h-[17px] w-[17px] object-contain"
            />
            <span>ICOGON in the last year</span>
            <CalendarDays size={15} className={`ml-0.5 ${isDark ? "text-zinc-400" : "text-slate-500"}`} />
          </div>

          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] lg:gap-10">
            {/* Contribution graph */}
            <div className={`min-w-0 rounded-[16px] border p-3.5 sm:p-4 ${
              isDark
                ? "border-[#3a3a3a] bg-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
                : "border-slate-300 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            }`}>
              <div className="overflow-x-auto pb-0.5">
                <div className="min-w-[760px]">
                  <div className={`mb-[7px] grid grid-cols-12 px-[2px] text-center text-[13px] font-medium leading-5 ${
                    isDark ? "text-zinc-300" : "text-slate-600"
                  }`}>
                    {MONTHS.map((month) => (
                      <span key={month}>{month}</span>
                    ))}
                  </div>

                  <div
                    className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-[5px]"
                    aria-label="Contribution activity over the last year"
                  >
                    {Array.from({ length: 371 }, (_, index) => (
                      <div
                        key={index}
                        title="No activity"
                        className={`aspect-square min-w-0 rounded-[4px] transition-colors duration-150 ${
                          isDark
                            ? "bg-[#292929] hover:bg-[#3a3a3a]"
                            : "bg-[#e5e7eb] hover:bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity statistics */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-8 px-1 pt-0.5 sm:gap-x-12 sm:gap-y-10 lg:gap-x-10 lg:gap-y-12 lg:pt-0">
              <Stat label="Daily average" value="0.0 edits" isDark={isDark} />
              <Stat label="Days active" value="0 days" detail="0% of year" isDark={isDark} />
              <Stat label="Current streak" value="0 days" isDark={isDark} />
              <Stat label="Total edits" value="0" isDark={isDark} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={`relative mt-16 min-h-[620px] overflow-visible rounded-[22px] border px-7 py-12 font-sans transition-all duration-300 sm:px-10 sm:py-14 lg:px-12 lg:py-14 ${
            isDark
              ? "border-white/[0.12] bg-gradient-to-br from-[#303030] via-[#262626] to-[#202020] shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]"
              : "border-slate-200 bg-gradient-to-br from-white via-[#fafafa] to-[#eef1f5] shadow-[0_24px_65px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] hover:-translate-y-1 hover:shadow-[0_30px_75px_rgba(15,23,42,0.16)]"
          }`}
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.05fr_1fr_1.35fr_1fr_1.25fr_1fr] lg:gap-x-9">
            <div className="flex min-h-[300px] flex-col items-start justify-between">
              <div
                aria-label="ICOGON"
                className="relative h-[58px] w-[58px] drop-shadow-[0_8px_16px_rgba(36,170,255,0.32)]"
              >
                <span className="absolute left-1 top-0 h-9 w-9 rotate-[30deg] rounded-[10px] bg-gradient-to-br from-[#168cff] via-[#24b7f5] to-[#42d9e6]" />
                <span className="absolute bottom-0 right-0 h-9 w-9 rotate-[30deg] rounded-[10px] bg-gradient-to-br from-[#168cff] via-[#20b8ee] to-[#43d5df]" />
              </div>
              <button
                type="button"
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[14px] font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                  isDark
                    ? "border-white/[0.14] bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                }`}
              >
                <Globe size={15} /> EN <span>⌄</span>
              </button>
            </div>
            <FooterColumn title="Company" isDark={isDark} links={["Careers", "Press & media", "Enterprise", "Security", "Trust center", "Partnerships"]} />
            <FooterColumn title="Product" isDark={isDark} links={["Pricing", "Student discount", "For work", "Small businesses", "Founders", "Product Managers", "Designers", "Marketers", "Sales", "Ops", "People", "App builder", "Website builder", "AI-powered apps", "Prototyping", "Internal Tools", "Download apps", "Connections", "Changelog", "Status"]} />
            <FooterColumn title="Resources" isDark={isDark} links={["Learn", "Templates", "Guides", "Connectors", "MCP server", "Videos", "Blog", "Support", "Reviews", "Sitemap"]} />
            <FooterColumn title="Legal" isDark={isDark} links={["Privacy policy", "Do not sell or share my personal information", "Cookie settings", "Enterprise terms", "General terms", "Desktop app terms", "Domain registration terms", "DMCA copyright policy", "Accessibility", "Platform rules", "Report abuse", "Report security concerns", "DPA"]} />
            <FooterColumn title="Community" isDark={isDark} links={["Become a partner", "Hire a Lovable partner", "Affiliates", "Code of conduct", "Discord", "Reddit", "X / Twitter", "YouTube", "LinkedIn"]} />
          </div>
        </footer>
      </main>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; detail?: string; isDark: boolean }> = ({ label, value, detail, isDark }) => (
  <div className="min-w-0">
    <p className={`text-[15px] leading-5 ${isDark ? "text-zinc-300" : "text-slate-600"}`}>{label}</p>
    <p className={`mt-1.5 text-[19px] font-semibold leading-6 tracking-[-0.02em] ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
    {detail && <p className={`mt-1 text-[13px] leading-5 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>{detail}</p>}
  </div>
);

const FooterColumn: React.FC<{ title: string; isDark: boolean; links: string[] }> = ({ title, isDark, links }) => (
  <div className="min-w-0 font-sans">
    <p className={`mb-6 text-[16px] font-semibold tracking-[-0.01em] ${isDark ? "text-zinc-100" : "text-slate-900"}`}>{title}</p>
    <div className={`space-y-4 text-[14px] leading-[1.7] ${isDark ? "text-zinc-300" : "text-slate-600"}`}>
      {links.map((label) => (
        <button
          key={label}
          type="button"
          className={`block cursor-pointer text-left transition-all duration-200 hover:translate-x-1 hover:underline underline-offset-4 ${
            isDark ? "hover:text-white" : "hover:text-slate-950"
          } focus-visible:outline-none focus-visible:underline`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default ProfilePage;

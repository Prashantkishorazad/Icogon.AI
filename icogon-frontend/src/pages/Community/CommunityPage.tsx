
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Globe2,
  Heart,
  MessageCircle,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const CommunityPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const startBuilding = () => {
    navigate("/builder");
  };

  const faqs = [
    {
      question: "What is the ICOGON community?",
      answer:
        "The ICOGON community is a place for builders, creators, founders, designers and developers to connect, share ideas, learn from each other and showcase what they are building.",
    },
    {
      question: "Who can join the community?",
      answer:
        "Anyone interested in building with AI, creating digital products, experimenting with new ideas or learning from other builders can join.",
    },
    {
      question: "Can I share my project?",
      answer:
        "Yes. Community members can share projects, experiments, workflows and ideas with other builders.",
    },
    {
      question: "Are there community events?",
      answer:
        "The community can host online sessions, workshops, builder meetups and other events focused on learning and building.",
    },
    {
      question: "How can I get started?",
      answer:
        "Join the community, explore what other builders are creating and start building your own idea with ICOGON.",
    },
  ];

  const events = [
    {
      date: "18",
      month: "SEP",
      title: "Build with AI",
      type: "Online workshop",
      time: "6:00 PM IST",
    },
    {
      date: "24",
      month: "SEP",
      title: "Community Build Night",
      type: "Live community",
      time: "8:00 PM IST",
    },
    {
      date: "02",
      month: "OCT",
      title: "From Idea to Product",
      type: "Builder session",
      time: "7:00 PM IST",
    },
  ];

  const communityCards = [
    {
      icon: MessageCircle,
      title: "Ask & learn",
      description:
        "Get help, exchange ideas and learn from people building with AI.",
    },
    {
      icon: Heart,
      title: "Share your work",
      description:
        "Show what you're building and get feedback from the community.",
    },
    {
      icon: Users,
      title: "Meet builders",
      description:
        "Connect with creators, developers, founders and curious minds.",
    },
    {
      icon: Zap,
      title: "Build together",
      description:
        "Turn ideas into working products alongside people who are building too.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf5] text-[#17213d]">
      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#f5f8ff]">
        {/* Soft background glow */}
        <div className="pointer-events-none absolute left-1/2 top-[120px] h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#c7e4ff] via-[#e3d9ff] to-[#ffd9ef] opacity-80 blur-[85px]" />

        <div className="pointer-events-none absolute left-[-120px] top-[180px] h-[260px] w-[260px] rounded-full bg-[#8fc8ff]/40 blur-[80px]" />

        <div className="pointer-events-none absolute right-[-100px] top-[250px] h-[280px] w-[280px] rounded-full bg-[#b9a5ff]/35 blur-[85px]" />

        <div className="relative mx-auto max-w-[1180px] px-6 pb-16 pt-14 sm:px-8 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-[720px] text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dbe4f2] bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur">
              <Users
                size={13}
                strokeWidth={1.7}
                className="text-[#5c7194]"
              />

              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                ICOGON Community
              </span>
            </div>

            <h1 className="text-[45px] font-semibold leading-[0.94] tracking-[-0.065em] text-[#17213d] sm:text-[60px] lg:text-[70px]">
              Welcome to the
              <br />
              ICOGON community
            </h1>

            <p className="mx-auto mt-5 max-w-[530px] text-[11px] leading-5 text-[#64748b] sm:text-[12px]">
              A place for builders, creators, founders and curious minds to
              learn, share, connect and build the future together.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                onClick={handleSignup}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#17213d] px-5 py-2.5 text-[10px] font-medium text-white shadow-sm transition hover:bg-[#0f172a]"
              >
                Join community
                <ArrowRight size={12} />
              </button>

              <button
                onClick={startBuilding}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d7dfec] bg-white px-5 py-2.5 text-[10px] font-medium text-[#42516e] transition hover:bg-[#f8fafc]"
              >
                Start building
              </button>
            </div>
          </div>

          {/* =====================================================
              COMMUNITY PHOTO COLLAGE
          ===================================================== */}
          <div className="relative mx-auto mt-14 h-[300px] max-w-[900px] sm:h-[360px]">
            {/* Card 1 */}
            <div className="absolute left-[4%] top-[35px] w-[180px] rotate-[-5deg] overflow-hidden rounded-lg border-[5px] border-white bg-white shadow-[0_18px_45px_rgba(46,65,100,0.16)] sm:w-[220px]">
              <div className="h-[120px] bg-gradient-to-br from-[#b8d8ff] via-[#e9efff] to-[#d7f3ef] p-4 sm:h-[145px]">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-10 rounded bg-white/70" />
                  <div className="h-10 rounded bg-white/50" />
                  <div className="h-10 rounded bg-white/70" />
                  <div className="col-span-2 h-12 rounded bg-white/60" />
                  <div className="h-12 rounded bg-[#8bbdff]/50" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="absolute left-[27%] top-[85px] z-20 w-[210px] rotate-[2deg] overflow-hidden rounded-lg border-[5px] border-white bg-white shadow-[0_22px_50px_rgba(46,65,100,0.2)] sm:w-[260px]">
              <div className="h-[145px] bg-gradient-to-br from-[#ffe4d1] via-[#f4e6dc] to-[#c9ddff] p-4 sm:h-[175px]">
                <div className="flex h-full items-end justify-center gap-2">
                  <div className="h-[70%] w-[22%] rounded-t-full bg-[#8faed1]" />
                  <div className="h-[90%] w-[25%] rounded-t-full bg-[#f1b99e]" />
                  <div className="h-[78%] w-[23%] rounded-t-full bg-[#6d86aa]" />
                  <div className="h-[95%] w-[24%] rounded-t-full bg-[#d4a17c]" />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="absolute right-[5%] top-[38px] w-[190px] rotate-[5deg] overflow-hidden rounded-lg border-[5px] border-white bg-white shadow-[0_18px_45px_rgba(46,65,100,0.16)] sm:w-[230px]">
              <div className="h-[125px] bg-gradient-to-br from-[#b9d7ff] via-[#e3edff] to-[#d2d7ff] p-4 sm:h-[150px]">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div
                      key={item}
                      className="h-8 rounded-full bg-white/60"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="absolute bottom-[10px] right-[17%] z-30 w-[205px] rotate-[-4deg] overflow-hidden rounded-lg border-[5px] border-white bg-white shadow-[0_25px_55px_rgba(46,65,100,0.22)] sm:w-[250px]">
              <div className="h-[130px] bg-gradient-to-br from-[#dbeaff] via-[#e8dcff] to-[#ffd9ee] p-4 sm:h-[155px]">
                <div className="flex items-end justify-center gap-2">
                  <div className="h-20 w-10 rounded-t-full bg-[#7ea7d9]" />
                  <div className="h-28 w-12 rounded-t-full bg-[#d79f89]" />
                  <div className="h-24 w-11 rounded-t-full bg-[#8e8bc5]" />
                  <div className="h-32 w-12 rounded-t-full bg-[#e9b89c]" />
                </div>
              </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute left-[46%] top-[10px] h-3 w-3 rounded-full bg-[#ff69b4]" />
            <div className="absolute right-[32%] bottom-[50px] h-4 w-4 rounded-full bg-[#70a9ff]" />
          </div>
        </div>
      </section>

      {/* =========================================================
          CONNECT SECTION
      ========================================================= */}
      <section className="bg-[#fbfaf5]">
        <div className="mx-auto max-w-[1000px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="text-[29px] font-semibold leading-[1] tracking-[-0.05em] sm:text-[37px]">
                Connect with
                <br />
                builders everywhere.
              </h2>

              <p className="mt-5 max-w-[390px] text-[12px] leading-5 text-[#64748b]">
                Get real-time help, share what you're building, discover new
                ideas and grow alongside people who are experimenting with
                the same possibilities.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <button
                  onClick={handleSignup}
                  className="rounded-md bg-[#17213d] px-4 py-2 text-[9px] font-medium text-white"
                >
                  Join online
                </button>

                <button
                  onClick={handleSignup}
                  className="rounded-md border border-[#d8e0ec] bg-white px-4 py-2 text-[9px] font-medium text-[#52627e]"
                >
                  Join ICOGON
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#9bd2ff] via-[#d8ccff] to-[#ffd2e8] opacity-70 blur-[65px]" />

              <div className="relative rounded-[10px] border border-[#dce5f1] bg-white p-4 shadow-[0_20px_60px_rgba(54,75,110,0.1)]">
                <div className="flex items-center justify-between border-b border-[#edf1f6] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef5ff] text-[#6685b5]">
                      <Users size={13} />
                    </div>

                    <div>
                      <div className="h-2 w-20 rounded bg-[#334155]" />
                      <div className="mt-1.5 h-1.5 w-28 rounded bg-[#e2e8f0]" />
                    </div>
                  </div>

                  <div className="h-6 w-14 rounded-md bg-[#17213d]" />
                </div>

                <div className="mt-4 grid grid-cols-[0.38fr_1fr] gap-3">
                  <div className="rounded-lg bg-[#f7f9fc] p-3">
                    <div className="h-2 w-14 rounded bg-[#64748b]" />

                    <div className="mt-5 space-y-2">
                      {["General", "Build help", "Showcase", "Events"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={`rounded px-2 py-2 text-[7px] ${
                              index === 0
                                ? "bg-white text-[#475569] shadow-sm"
                                : "text-[#94a3b8]"
                            }`}
                          >
                            {item}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#edf1f6] p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#a9cfff] to-[#ffd2e8]" />

                      <div>
                        <div className="h-1.5 w-20 rounded bg-[#64748b]" />
                        <div className="mt-1 h-1 w-14 rounded bg-[#e2e8f0]" />
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-[#f7f9fc] p-3">
                      <div className="h-2 w-[85%] rounded bg-[#cbd5e1]" />
                      <div className="mt-2 h-2 w-[65%] rounded bg-[#e2e8f0]" />
                      <div className="mt-2 h-2 w-[75%] rounded bg-[#e2e8f0]" />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <div className="h-5 w-12 rounded bg-[#eef5ff]" />
                      <div className="h-5 w-14 rounded bg-[#fdf0f7]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          COMMUNITY STATS
      ========================================================= */}
      <section className="border-y border-[#e2e8f0] bg-[#f5f8ff]">
        <div className="mx-auto max-w-[950px] px-6 py-16 sm:px-8">
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
            {[
              ["32K+", "Community members"],
              ["93+", "Community events"],
              ["304+", "Projects shared"],
              ["12+", "Active channels"],
            ].map(([number, label]) => (
              <div
                key={label}
                className="text-center md:border-r md:border-[#dce5f0] last:md:border-r-0"
              >
                <div className="text-[29px] font-semibold tracking-[-0.05em] text-[#17213d]">
                  {number}
                </div>

                <div className="mt-2 text-[9px] text-[#94a3b8]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          COMMUNITY BENEFITS
      ========================================================= */}
      <section className="bg-[#fbfaf5]">
        <div className="mx-auto max-w-[1050px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-[560px] text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
              Build together
            </p>

            <h2 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[43px]">
              More than a community.
              <br />
              A place to build.
            </h2>
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {communityCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-[0_8px_30px_rgba(50,70,100,0.04)]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f6ff] text-[#6385b8]">
                    <Icon
                      size={16}
                      strokeWidth={1.6}
                    />
                  </div>

                  <h3 className="mt-5 text-[13px] font-semibold text-[#24324d]">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-[10px] leading-5 text-[#7b879c]">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          EVENTS
      ========================================================= */}
      <section className="border-t border-[#e2e8f0] bg-[#f5f8ff]">
        <div className="mx-auto max-w-[1050px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                Community events
              </p>

              <h2 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[43px]">
                Meet, learn
                <br />
                and build together.
              </h2>

              <p className="mt-5 max-w-[370px] text-[11px] leading-5 text-[#64748b]">
                Join workshops, live sessions and community events designed
                to help you learn something new and meet other builders.
              </p>

              <button
                onClick={handleSignup}
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#17213d] px-5 py-2.5 text-[10px] font-medium text-white"
              >
                Explore community
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="rounded-[10px] border border-[#dce5f1] bg-white p-4 shadow-[0_18px_50px_rgba(45,65,100,0.08)]">
              <div className="flex items-center justify-between border-b border-[#edf1f6] pb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-[#6b82a5]" />

                  <span className="text-[10px] font-semibold text-[#334155]">
                    Upcoming events
                  </span>
                </div>

                <span className="text-[8px] text-[#94a3b8]">
                  Community
                </span>
              </div>

              <div className="divide-y divide-[#edf1f6]">
                {events.map((event) => (
                  <div
                    key={event.title}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#f0f6ff]">
                      <span className="text-[13px] font-semibold text-[#405576]">
                        {event.date}
                      </span>

                      <span className="text-[6px] font-semibold tracking-[0.1em] text-[#94a3b8]">
                        {event.month}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] font-semibold text-[#334155]">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-[8px] text-[#94a3b8]">
                        {event.type} · {event.time}
                      </p>
                    </div>

                    <button
                      onClick={handleSignup}
                      className="hidden rounded-md border border-[#dce5f1] px-3 py-1.5 text-[8px] font-medium text-[#60708b] sm:block"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BUILDER STORIES
      ========================================================= */}
      <section className="bg-[#fbfaf5]">
        <div className="mx-auto max-w-[1050px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-[560px] text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
              Builder stories
            </p>

            <h2 className="mt-4 text-[32px] font-semibold leading-[1] tracking-[-0.05em] sm:text-[42px]">
              Real builders.
              <br />
              Real things being built.
            </h2>
          </div>

          <div className="relative mx-auto mt-14 max-w-[850px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[190px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#a7d7ff] via-[#d9ccff] to-[#ffd2e8] opacity-75 blur-[70px]" />

            <div className="relative grid gap-3 md:grid-cols-3">
              {[
                {
                  name: "Product builder",
                  role: "Founder",
                  color: "from-[#a9d3ff] to-[#d9c8ff]",
                },
                {
                  name: "Creative builder",
                  role: "Designer",
                  color: "from-[#ffd0e8] to-[#c8dfff]",
                },
                {
                  name: "AI builder",
                  role: "Developer",
                  color: "from-[#c9dfff] to-[#e7d2ff]",
                },
              ].map((person) => (
                <div
                  key={person.name}
                  className="rounded-lg border border-[#e1e7ef] bg-white p-5 text-center shadow-[0_12px_35px_rgba(50,70,100,0.06)]"
                >
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${person.color}`}
                  >
                    <Users
                      size={22}
                      className="text-white/80"
                    />
                  </div>

                  <h3 className="mt-5 text-[11px] font-semibold text-[#334155]">
                    {person.name}
                  </h3>

                  <p className="mt-1 text-[8px] text-[#94a3b8]">
                    {person.role}
                  </p>

                  <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#edf1f6]" />
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-[700px] rounded-lg border border-[#e2e8f0] bg-white px-6 py-7 text-center shadow-sm">
            <MessageCircle
              size={17}
              className="mx-auto text-[#7d91b2]"
            />

            <p className="mx-auto mt-4 max-w-[560px] text-[11px] leading-5 text-[#66748a]">
              “The best part of building with a community is realizing that
              someone else has already faced the problem you're trying to
              solve — and is willing to help.”
            </p>

            <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#a0aaba]">
              ICOGON Community Builder
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          JOIN COMMUNITY
      ========================================================= */}
      <section className="border-t border-[#e2e8f0] bg-white">
        <div className="mx-auto max-w-[1000px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[#e1e8f2] bg-[#f5f8ff] p-6">
              <Globe2
                size={17}
                className="text-[#6685b2]"
              />

              <h3 className="mt-5 text-[13px] font-semibold">
                Join online
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-[#7c899d]">
                Meet builders from anywhere and join conversations around
                building with AI.
              </p>

              <button
                onClick={handleSignup}
                className="mt-6 inline-flex items-center gap-1 text-[9px] font-semibold text-[#4c6385]"
              >
                Join now
                <ArrowRight size={11} />
              </button>
            </div>

            <div className="rounded-lg border border-[#e1e8f2] bg-[#fbfaf5] p-6">
              <Video
                size={17}
                className="text-[#6685b2]"
              />

              <h3 className="mt-5 text-[13px] font-semibold">
                Attend events
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-[#7c899d]">
                Learn through workshops, sessions and live builder events.
              </p>

              <button
                onClick={handleSignup}
                className="mt-6 inline-flex items-center gap-1 text-[9px] font-semibold text-[#4c6385]"
              >
                View events
                <ArrowRight size={11} />
              </button>
            </div>

            <div className="rounded-lg border border-[#e1e8f2] bg-[#f5f8ff] p-6">
              <Sparkles
                size={17}
                className="text-[#6685b2]"
              />

              <h3 className="mt-5 text-[13px] font-semibold">
                Share your build
              </h3>

              <p className="mt-3 text-[10px] leading-5 text-[#7c899d]">
                Show the community what you've created and inspire other
                builders.
              </p>

              <button
                onClick={startBuilding}
                className="mt-6 inline-flex items-center gap-1 text-[9px] font-semibold text-[#4c6385]"
              >
                Start building
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section className="border-t border-[#e2e8f0] bg-[#f5f8ff]">
        <div className="mx-auto max-w-[900px] px-6 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                FAQ
              </p>

              <h2 className="mt-4 text-[31px] font-semibold leading-[1] tracking-[-0.05em]">
                Frequently
                <br />
                asked questions
              </h2>
            </div>

            <div className="divide-y divide-[#dce4ef] border-y border-[#dce4ef]">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    >
                      <span className="text-[11px] font-medium text-[#334155]">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={14}
                        className={`shrink-0 text-[#94a3b8] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-5 pr-8">
                        <p className="text-[10px] leading-5 text-[#718096]">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#fbfaf5]">
        <div className="pointer-events-none absolute bottom-[-150px] left-1/2 h-[300px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#86c7ff] via-[#d3c2ff] to-[#ffafd8] opacity-80 blur-[80px]" />

        <div className="relative mx-auto max-w-[850px] px-6 py-24 text-center sm:px-8 lg:py-32">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Sparkles
              size={15}
              className="text-[#657fa7]"
            />
          </div>

          <h2 className="mt-7 text-[37px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#17213d] sm:text-[49px]">
            Ready to build
            <br />
            something together?
          </h2>

          <p className="mx-auto mt-5 max-w-[440px] text-[11px] leading-5 text-[#718096]">
            Join the ICOGON community, meet other builders and turn your next
            idea into something real.
          </p>

          <div className="mx-auto mt-8 flex max-w-[500px] flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={handleSignup}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#17213d] px-6 py-3 text-[10px] font-medium text-white shadow-sm"
            >
              Join community
              <ArrowRight size={12} />
            </button>

            <button
              onClick={startBuilding}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d8e0ec] bg-white px-6 py-3 text-[10px] font-medium text-[#52627e]"
            >
              Start building
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="relative overflow-hidden border-t border-[#dfe6ef] bg-[#fbfaf5]">
        <div className="pointer-events-none absolute bottom-[-160px] left-1/2 h-[280px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#8bc9ff] via-[#d5c5ff] to-[#ffb4dc] opacity-60 blur-[80px]" />

        <div className="relative mx-auto max-w-[1180px] px-6 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#17213d] text-white">
                  <Sparkles size={13} />
                </div>

                <span className="text-[14px] font-semibold tracking-[-0.03em] text-[#17213d]">
                  ICOGON
                </span>
              </div>

              <p className="mt-5 max-w-[250px] text-[10px] leading-5 text-[#7b8799]">
                A community for builders creating websites, applications and
                AI-powered products.
              </p>

              <button
                onClick={startBuilding}
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-[#425474]"
              >
                Start building
                <ArrowRight size={12} />
              </button>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#94a3b8]">
                Community
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-[#718096]">
                <button
                  onClick={handleSignup}
                  className="block hover:text-[#17213d]"
                >
                  Join community
                </button>

                <button
                  onClick={handleSignup}
                  className="block hover:text-[#17213d]"
                >
                  Events
                </button>

                <button
                  onClick={handleSignup}
                  className="block hover:text-[#17213d]"
                >
                  Builder stories
                </button>

                <button
                  onClick={handleSignup}
                  className="block hover:text-[#17213d]"
                >
                  Showcase
                </button>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#94a3b8]">
                Solutions
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-[#718096]">
                <button
                  onClick={() => navigate("/solutions/founders")}
                  className="block hover:text-[#17213d]"
                >
                  Founders
                </button>

                <button
                  onClick={() => navigate("/solutions/websites")}
                  className="block hover:text-[#17213d]"
                >
                  Websites
                </button>

                <button
                  onClick={() => navigate("/solutions/ai-apps")}
                  className="block hover:text-[#17213d]"
                >
                  AI Apps
                </button>

                <button
                  onClick={() => navigate("/solutions/internal-tools")}
                  className="block hover:text-[#17213d]"
                >
                  Internal Tools
                </button>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#94a3b8]">
                Resources
              </p>

              <div className="mt-5 space-y-3 text-[10px] text-[#718096]">
                <button
                  onClick={() => navigate("/blog")}
                  className="block hover:text-[#17213d]"
                >
                  Blog
                </button>

                <button
                  onClick={() => navigate("/academy")}
                  className="block hover:text-[#17213d]"
                >
                  Academy
                </button>

                <button
                  onClick={() => navigate("/guides")}
                  className="block hover:text-[#17213d]"
                >
                  Guides
                </button>

                <button
                  onClick={() => navigate("/templates")}
                  className="block hover:text-[#17213d]"
                >
                  Templates
                </button>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-[#dfe6ef] pt-6 text-[9px] text-[#a0aaba] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} ICOGON. All rights reserved.
            </p>

            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommunityPage;

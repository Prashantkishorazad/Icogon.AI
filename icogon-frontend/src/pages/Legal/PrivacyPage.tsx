import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const PrivacyPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What information does ICOGON collect?",
      answer:
        "Depending on how you use ICOGON, information may include account details, information you provide while using the platform, project and workspace data, technical information, and communications you send to us.",
    },
    {
      question: "Does ICOGON use my prompts or project data?",
      answer:
        "ICOGON may process information that you submit to the platform in order to provide and operate its services. The exact handling of prompts, project content, generated code, and related data depends on the services and integrations you use and should be reviewed against the applicable service terms.",
    },
    {
      question: "Does ICOGON use cookies?",
      answer:
        "ICOGON may use cookies or similar technologies for functionality, authentication, preferences, security, analytics, and improving the user experience. The specific technologies used should be reflected in ICOGON's production configuration.",
    },
    {
      question: "Can I request deletion of my information?",
      answer:
        "You may contact ICOGON regarding requests to access, correct, or delete personal information, subject to applicable law and any legitimate reasons the information may need to be retained.",
    },
    {
      question: "Does ICOGON share personal information?",
      answer:
        "Information may be processed by service providers or technology partners when necessary to operate ICOGON. Any actual providers and categories should be kept consistent with ICOGON's production infrastructure and applicable agreements.",
    },
  ];

  const sections = [
    {
      number: "01",
      title: "Information we collect",
      paragraphs: [
        "When you use ICOGON, we may receive information that you provide directly, information generated through your use of the platform, and technical information required to operate the service.",
        "Depending on the features you use, this may include account information, project information, prompts, generated content, communications, device information, browser information, IP-related technical data, and usage information.",
      ],
      bullets: [
        "Account and profile information",
        "Project, workspace, prompt, and generated content",
        "Usage and interaction information",
        "Device, browser, and technical information",
        "Information you provide when contacting us",
      ],
    },
    {
      number: "02",
      title: "How we use information",
      paragraphs: [
        "Information may be used to provide, maintain, secure, and improve ICOGON and its features.",
        "We may also use information to communicate with users, troubleshoot problems, understand product usage, prevent abuse, and comply with applicable legal obligations.",
      ],
      bullets: [
        "Provide and operate ICOGON services",
        "Authenticate accounts and maintain sessions",
        "Improve reliability and user experience",
        "Provide support and respond to requests",
        "Protect the platform against misuse and security threats",
      ],
    },
    {
      number: "03",
      title: "AI, prompts, and generated content",
      paragraphs: [
        "ICOGON is an AI-powered application-building platform. To provide AI functionality, information submitted through relevant features may need to be processed by ICOGON and, depending on the feature, by third-party AI or infrastructure providers.",
        "Users should avoid submitting passwords, payment credentials, government identification numbers, or other highly sensitive information into prompts or project content unless the relevant feature specifically requires it and appropriate safeguards are in place.",
      ],
      bullets: [
        "Prompts may be processed to generate requested outputs",
        "Generated code and project content may be stored as part of the product experience",
        "Third-party AI providers may be involved in selected workflows",
        "Users remain responsible for reviewing generated output before deployment",
      ],
    },
    {
      number: "04",
      title: "Cookies and similar technologies",
      paragraphs: [
        "ICOGON may use cookies, local storage, pixels, or similar technologies to keep users signed in, remember preferences, maintain security, understand product usage, and improve the service.",
        "The technologies actually enabled on the production website should be documented and kept consistent with this policy.",
      ],
    },
    {
      number: "05",
      title: "Third-party services and integrations",
      paragraphs: [
        "ICOGON may connect with third-party services to provide authentication, hosting, databases, AI processing, analytics, payments, communications, integrations, or other functionality.",
        "When a third-party service processes information on behalf of ICOGON, its own terms and privacy practices may also apply.",
      ],
    },
    {
      number: "06",
      title: "Data retention",
      paragraphs: [
        "We may retain information for as long as reasonably necessary to provide the service, maintain accounts and projects, meet operational requirements, resolve disputes, enforce agreements, and comply with applicable law.",
        "Retention periods can vary depending on the type of information and the reason it was collected.",
      ],
    },
    {
      number: "07",
      title: "Security",
      paragraphs: [
        "ICOGON is designed with security-conscious engineering practices intended to protect information against unauthorized access, loss, misuse, or alteration.",
        "No internet-based service can guarantee absolute security. Users should also protect their account credentials and avoid sharing sensitive information unnecessarily.",
      ],
    },
    {
      number: "08",
      title: "Your choices and rights",
      paragraphs: [
        "Depending on your location and applicable law, you may have rights relating to your personal information. These may include rights to access, correction, deletion, restriction, objection, or obtaining a copy of certain information.",
        "Requests can be submitted to ICOGON using the contact details provided below. We may need to verify a request before processing it.",
      ],
    },
    {
      number: "09",
      title: "Children's privacy",
      paragraphs: [
        "ICOGON is not intended to be used in violation of applicable age restrictions or child privacy laws. We do not knowingly seek to collect personal information from children where doing so is prohibited by applicable law.",
        "If you believe a child has provided personal information to ICOGON in a manner that violates applicable requirements, please contact us.",
      ],
    },
    {
      number: "10",
      title: "International processing",
      paragraphs: [
        "Depending on the infrastructure and third-party services used by ICOGON, information may be processed or stored in countries other than the country where you live.",
        "Where required, appropriate safeguards for international transfers should be implemented in accordance with applicable law.",
      ],
    },
    {
      number: "11",
      title: "Changes to this Privacy Policy",
      paragraphs: [
        "ICOGON may update this Privacy Policy when its services, practices, legal requirements, or security processes change.",
        "When material changes are made, ICOGON may provide additional notice where appropriate. The date shown at the top of this page indicates when this version was last updated.",
      ],
    },
  ];

  const principles = [
    {
      icon: ShieldCheck,
      title: "Privacy by design",
      description:
        "Privacy considerations should be part of how ICOGON features and workflows are designed.",
    },
    {
      icon: LockKeyhole,
      title: "Security-conscious",
      description:
        "We aim to use appropriate technical and organizational safeguards for the information handled by the platform.",
    },
    {
      icon: Check,
      title: "Transparency",
      description:
        "We aim to explain what information is handled and why it may be needed to provide the service.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <Navbar
        onLogin={() => navigate("/login")}
        onSignup={() => navigate("/signup")}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-[#eef8ff] via-[#f8fbff] to-[#fffdf8]">
        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft size={13} />
            Back to ICOGON
          </Link>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 shadow-sm">
              <ShieldCheck size={13} className="text-sky-600" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                Privacy
              </span>
            </div>

            <h1 className="text-[46px] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-[64px]">
              Your privacy matters.
            </h1>

            <p className="mt-6 max-w-2xl text-[14px] leading-[1.7] text-slate-600 sm:text-[16px]">
              This Privacy Policy explains how information may be collected,
              used, processed, and protected when you use ICOGON and its
              services.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-medium text-slate-600 shadow-sm">
                Last updated: September 17, 2026
              </span>

              <span className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2 text-[11px] font-medium text-amber-700">
                Draft — review before publishing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-18">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">
              Our approach
            </p>

            <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[36px]">
              Clear information. Responsible handling.
            </h2>

            <p className="mt-5 max-w-2xl text-[13px] leading-[1.75] text-slate-600 sm:text-[14px]">
              ICOGON is built to help people turn ideas into working digital
              products. Because the platform can process account information,
              prompts, project content, and technical data, understanding how
              information is handled is an important part of using the
              service.
            </p>

            <p className="mt-4 max-w-2xl text-[13px] leading-[1.75] text-slate-600 sm:text-[14px]">
              This page is intended as a product-facing privacy policy draft.
              Before publishing it as ICOGON's official legal policy, the
              actual data flows, vendors, retention periods, jurisdictions,
              consent mechanisms, and legal requirements should be reviewed
              and finalized.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-600 shadow-sm">
              <LockKeyhole size={19} />
            </div>

            <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-slate-950">
              A privacy-conscious product
            </h3>

            <p className="mt-3 text-[12px] leading-[1.7] text-slate-600">
              Privacy should be considered throughout the product lifecycle —
              from account creation and AI interactions to project storage and
              integrations.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-[#fffdf8]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">
              Principles
            </p>

            <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[36px]">
              What privacy means at ICOGON.
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                    <Icon size={17} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-[11px] leading-[1.65] text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Policy Sections */}
    {/* Policy Sections */}
<section className="bg-white">
  <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
    <div className="mb-12 max-w-2xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">
        Privacy policy
      </p>

      <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.045em] text-slate-950 sm:text-[40px]">
        How information may be handled.
      </h2>

      <p className="mt-5 text-[13px] leading-[1.75] text-slate-600 sm:text-[14px]">
        The sections below provide a clear overview of the categories of
        information and privacy practices relevant to an AI-powered
        application-building platform.
      </p>
    </div>

    <div className="space-y-0">
      {sections.map((section) => (
        <article
          key={section.number}
          className="border-t border-slate-200 py-9 sm:py-11"
        >
          <div className="grid gap-6 sm:grid-cols-[80px_1fr]">
            <div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-slate-500">
                {section.number}
              </span>
            </div>

            <div>
              <h3 className="text-[21px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[25px]">
                {section.title}
              </h3>

              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[12px] leading-[1.8] text-slate-600 sm:text-[13px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.bullets && (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {section.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3"
                    >
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-sky-600"
                      />

                      <span className="text-[11px] leading-[1.5] text-slate-600">
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>

      {/* FAQ */}
      <section className="border-y border-slate-200 bg-[#f8fbff]">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">
              Questions
            </p>

            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.045em] text-slate-950 sm:text-[40px]">
              Privacy questions.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-[13px] leading-[1.7] text-slate-600 sm:text-[14px]">
              A few common questions about information and privacy when using
              ICOGON.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6">
                      <p className="text-[11px] leading-[1.7] text-slate-500 sm:text-[12px]">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gradient-to-b from-[#fffdf8] to-[#eef8ff]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-600 shadow-sm">
            <Mail size={19} />
          </div>

          <h2 className="mt-6 text-[30px] font-semibold tracking-[-0.045em] text-slate-950 sm:text-[40px]">
            Have a privacy question?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[13px] leading-[1.7] text-slate-600 sm:text-[14px]">
            Contact ICOGON if you have questions about this policy, your
            information, or a privacy-related request.
          </p>

          <a
            href="mailto:info@icogon.com?subject=Privacy%20Question"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#20242f] px-5 py-3 text-[11px] font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#111827]"
          >
            Contact ICOGON
            <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link
                to="/"
                className="text-[20px] font-semibold tracking-[-0.05em] text-slate-950"
              >
                ICOGON
              </Link>

              <p className="mt-4 max-w-xs text-[10px] leading-[1.7] text-slate-500">
                Build websites, applications, and AI-powered digital
                experiences with ICOGON.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Product
              </p>

              <div className="mt-4 space-y-2.5">
                <Link
                  to="/builder"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Builder
                </Link>

                <Link
                  to="/templates"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Templates
                </Link>

                <Link
                  to="/pricing"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Resources
              </p>

              <div className="mt-4 space-y-2.5">
                <Link
                  to="/blog"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Blog
                </Link>

                <Link
                  to="/academy"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Academy
                </Link>

                <Link
                  to="/docs"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Docs
                </Link>

                <Link
                  to="/guides"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Guides
                </Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Legal
              </p>

              <div className="mt-4 space-y-2.5">
                <Link
                  to="/privacy"
                  className="block text-[11px] font-medium text-slate-900"
                >
                  Privacy
                </Link>

                <Link
                  to="/security"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Security
                </Link>

                <Link
                  to="/terms"
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} ICOGON. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/security"
                className="text-[10px] text-slate-400 transition hover:text-slate-700"
              >
                Security
              </Link>

              <Link
                to="/terms"
                className="text-[10px] text-slate-400 transition hover:text-slate-700"
              >
                Terms
              </Link>

              <Link
                to="/privacy"
                className="text-[10px] font-medium text-slate-600"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
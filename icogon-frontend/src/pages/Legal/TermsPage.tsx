import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/landing/Navbar";

const TermsPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sections = [
    {
      number: "01",
      title: "Acceptance of these Terms",
      paragraphs: [
        "These Terms of Service govern your access to and use of ICOGON and its related services. By accessing or using ICOGON, you agree to comply with these Terms and any applicable laws and regulations.",
        "If you do not agree with these Terms, you should not use the service.",
      ],
    },
    {
      number: "02",
      title: "Using ICOGON",
      paragraphs: [
        "ICOGON provides tools that can help users create websites, applications, interfaces, workflows, and other digital experiences using AI-assisted technology.",
        "You are responsible for providing accurate information when creating an account and for using the service in accordance with these Terms.",
      ],
      bullets: [
        "Use the service only for lawful purposes",
        "Keep your account credentials secure",
        "Provide accurate information where required",
        "Review generated content before using or deploying it",
        "Follow applicable laws and third-party terms",
      ],
    },
    {
      number: "03",
      title: "Accounts and access",
      paragraphs: [
        "Some ICOGON features may require an account. You are responsible for activity that occurs through your account and for maintaining the confidentiality of your login credentials.",
        "If you believe your account has been accessed without authorization, you should contact ICOGON as soon as reasonably possible.",
      ],
    },
    {
      number: "04",
      title: "AI-generated content",
      paragraphs: [
        "ICOGON uses AI-assisted functionality to generate or transform content based on user instructions. AI output can contain mistakes, omissions, unexpected results, or inaccurate information.",
        "You are responsible for reviewing, testing, and validating generated code, content, designs, configurations, and other outputs before relying on them.",
      ],
      bullets: [
        "AI output should be reviewed before production use",
        "Generated code may require security and performance testing",
        "You are responsible for checking third-party licenses where applicable",
        "ICOGON does not guarantee that generated output is error-free",
      ],
    },
    {
      number: "05",
      title: "Your content",
      paragraphs: [
        "You may provide prompts, project information, code, text, images, files, or other content while using ICOGON. You are responsible for ensuring that you have the necessary rights and permissions to submit that content.",
        "You should not submit content that you are prohibited from sharing or that violates applicable law or the rights of another person or organization.",
      ],
    },
    {
      number: "06",
      title: "Prohibited activities",
      paragraphs: [
        "You may not use ICOGON to violate applicable laws, interfere with the service, abuse other users, or attempt to gain unauthorized access to systems or data.",
      ],
      bullets: [
        "Attempting unauthorized access to systems or accounts",
        "Distributing malware or malicious code",
        "Abusing, disrupting, or overloading the service",
        "Using the service for unlawful activities",
        "Infringing intellectual property or privacy rights",
        "Attempting to bypass security or usage restrictions",
      ],
    },
    {
      number: "07",
      title: "Third-party services",
      paragraphs: [
        "ICOGON may integrate with or rely on third-party services for functionality such as authentication, hosting, databases, AI processing, payments, analytics, communications, or other integrations.",
        "Third-party services may have their own terms, privacy policies, limitations, and requirements. Your use of those services may therefore be subject to their respective agreements.",
      ],
    },
    {
      number: "08",
      title: "Plans, payments, and subscriptions",
      paragraphs: [
        "Certain ICOGON features may be offered through paid plans or subscriptions. Pricing, billing intervals, usage limits, included features, and applicable taxes should be presented at the time of purchase.",
        "Where recurring billing is offered, the applicable subscription terms and cancellation conditions will be presented during the relevant purchase flow.",
      ],
    },
    {
      number: "09",
      title: "Intellectual property",
      paragraphs: [
        "ICOGON's software, branding, interface, documentation, visual identity, and other platform materials may be protected by intellectual property laws and remain subject to the rights of their respective owners.",
        "Your rights in content you submit and outputs generated through the platform may depend on the applicable product terms, third-party services, licenses, and the nature of that content.",
      ],
    },
    {
      number: "10",
      title: "Availability and changes",
      paragraphs: [
        "ICOGON may change, improve, suspend, or discontinue features from time to time. Features may also be unavailable because of maintenance, technical problems, infrastructure issues, or circumstances outside ICOGON's reasonable control.",
        "The platform is provided as a continuously evolving service, and features or limits may change over time.",
      ],
    },
    {
      number: "11",
      title: "Disclaimers",
      paragraphs: [
        "To the extent permitted by applicable law, ICOGON does not guarantee that the service or AI-generated output will always be uninterrupted, accurate, complete, secure, or free from errors.",
        "You should independently evaluate important outputs and test applications before using them in production or for consequential purposes.",
      ],
    },
    {
      number: "12",
      title: "Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by applicable law, any limitations of liability applicable to ICOGON should be interpreted in accordance with the final contractual terms governing the service.",
        "Nothing in these Terms is intended to exclude or limit liability where doing so would not be permitted under applicable law.",
      ],
    },
    {
      number: "13",
      title: "Termination",
      paragraphs: [
        "You may stop using ICOGON at any time. ICOGON may restrict or suspend access where reasonably necessary to protect the service, users, systems, or comply with applicable legal obligations.",
        "Any provisions that by their nature should continue after termination may remain applicable.",
      ],
    },
    {
      number: "14",
      title: "Changes to these Terms",
      paragraphs: [
        "ICOGON may update these Terms as the service develops or as legal and operational requirements change.",
        "When appropriate, material changes may be communicated through the website, application, email, or other reasonable means. Continued use of the service after an effective update may be subject to the revised Terms.",
      ],
    },
  ];

  const principles = [
    {
      title: "Build responsibly",
      description:
        "Use ICOGON to create useful products while respecting applicable laws, users, and third-party rights.",
    },
    {
      title: "Review AI output",
      description:
        "AI-assisted output should be checked, tested, and validated before being used in important environments.",
    },
    {
      title: "Protect your account",
      description:
        "Keep your credentials secure and notify ICOGON if you suspect unauthorized access.",
    },
  ];

  const faqs = [
    {
      question: "Do I need an account to use ICOGON?",
      answer:
        "Some parts of ICOGON may be publicly accessible, while product features such as the builder may require an account.",
    },
    {
      question: "Can I use AI-generated code commercially?",
      answer:
        "Commercial use depends on the applicable ICOGON terms, the source material involved, and any third-party licenses or services used to generate the output. Review generated code and its dependencies before commercial deployment.",
    },
    {
      question: "Is AI-generated output guaranteed to be correct?",
      answer:
        "No. AI systems can produce inaccurate, incomplete, or unexpected results. Generated applications and code should be reviewed and tested before deployment.",
    },
    {
      question: "Can ICOGON change its features?",
      answer:
        "Yes. As the platform evolves, features, limits, integrations, and availability may change. Material contractual changes should be handled according to the applicable terms.",
    },
    {
      question: "How can I contact ICOGON?",
      answer:
        "For questions regarding these Terms, you can contact ICOGON through the contact information provided on the website.",
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
              <FileText size={13} className="text-sky-600" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                Terms of Service
              </span>
            </div>

            <h1 className="text-[46px] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-[64px]">
              Terms for building with ICOGON.
            </h1>

            <p className="mt-6 max-w-2xl text-[14px] leading-[1.7] text-slate-600 sm:text-[16px]">
              These Terms describe the rules and responsibilities that apply
              when you access or use ICOGON and its AI-powered application
              building services.
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
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-18">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">
              Agreement
            </p>

            <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[36px]">
              Simple rules for building responsibly.
            </h2>

            <p className="mt-5 max-w-2xl text-[13px] leading-[1.75] text-slate-600 sm:text-[14px]">
              ICOGON gives users AI-assisted tools for creating digital
              products. These Terms establish the basic rules around account
              access, user content, AI-generated output, acceptable use,
              payments, intellectual property, and use of the platform.
            </p>

            <p className="mt-4 max-w-2xl text-[13px] leading-[1.75] text-slate-600 sm:text-[14px]">
              This page is a product-facing Terms of Service draft. Before
              publishing it as ICOGON's official legal agreement, the final
              company details, governing law, payment terms, liability
              provisions, refund rules, and other jurisdiction-specific
              requirements should be reviewed by appropriate legal counsel.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-600 shadow-sm">
              <ShieldCheck size={19} />
            </div>

            <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-slate-950">
              Build with responsibility
            </h3>

            <p className="mt-3 text-[12px] leading-[1.7] text-slate-600">
              AI can accelerate development, but users remain responsible for
              reviewing what they build, respecting rights, and complying with
              applicable laws.
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
              A few things to keep in mind.
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <Check size={16} className="text-sky-600" />
                </div>

                <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 text-[11px] leading-[1.65] text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-12 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-600">
              Terms
            </p>

            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.045em] text-slate-950 sm:text-[40px]">
              Using ICOGON.
            </h2>

            <p className="mt-5 text-[13px] leading-[1.75] text-slate-600 sm:text-[14px]">
              The following sections outline the principal terms that apply to
              use of the platform.
            </p>
          </div>

          <div>
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
              Common questions.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-[13px] leading-[1.7] text-slate-600 sm:text-[14px]">
              A few practical answers about using ICOGON and AI-generated
              output.
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

      {/* CTA */}
      <section className="bg-gradient-to-b from-[#fffdf8] to-[#eef8ff]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <h2 className="text-[30px] font-semibold tracking-[-0.045em] text-slate-950 sm:text-[40px]">
            Ready to build?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[13px] leading-[1.7] text-slate-600 sm:text-[14px]">
            Explore ICOGON and turn your next idea into a working digital
            experience.
          </p>

          <Link
            to="/builder"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#20242f] px-5 py-3 text-[11px] font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#111827]"
          >
            Start building
            <ArrowUpRight size={14} />
          </Link>
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
                  className="block text-[11px] text-slate-500 hover:text-slate-900"
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
                  className="block text-[11px] font-medium text-slate-900"
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
                to="/privacy"
                className="text-[10px] text-slate-400 transition hover:text-slate-700"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="text-[10px] font-medium text-slate-600"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
import { useState } from "react";

import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import Workflow from "../../components/landing/Workflow";
import Stats from "../../components/landing/Stats";
import AuthSection from "../../components/landing/AuthSection";
import Footer from "../../components/landing/Footer";

import LoginModal from "../../components/auth/LoginModal";
import SignupModal from "../../components/auth/SignupModal";

const LandingPage = () => {
  const [authModal, setAuthModal] = useState<
    "login" | "signup" | null
  >(null);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fc] text-[#1f2937]">
      {/* NAVBAR */}
      <Navbar
        onLogin={() => setAuthModal("login")}
        onSignup={() => setAuthModal("signup")}
      />

      {/* LANDING PAGE */}
      <Hero />
      <Features />
      <Workflow />
      <Stats />
      <AuthSection />
      <Footer />

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={authModal === "login"}
        onClose={() => setAuthModal(null)}
      />

      {/* SIGNUP MODAL */}
      {authModal === "signup" && (
        <SignupModal
          onClose={() => setAuthModal(null)}
          onLogin={() => setAuthModal("login")}
        />
      )}
    </main>
  );
};

export default LandingPage;
import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import Workflow from "../../components/landing/Workflow";
import Stats from "../../components/landing/Stats";
import AuthSection from "../../components/landing/AuthSection";
import Footer from "../../components/landing/Footer";

const LandingPage = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-500 dark:bg-[#070B14] dark:text-white">

      <Navbar />

      <Hero />

      <Features />

      <Workflow />

      <Stats />

      <AuthSection />

      <Footer />

    </main>
  );
};

export default LandingPage;
import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import AuthSection from "../../components/landing/AuthSection";

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-[#070B14]">
      <Navbar />
      <Hero />
      <AuthSection />
    </main>
  );
};

export default LandingPage;
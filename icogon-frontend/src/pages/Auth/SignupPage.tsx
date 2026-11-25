import LandingPage from "../Landing/LandingPage";
import AuthModal from "../../components/auth/AuthModal";

// Route-backed modal: the landing page stays visible behind authentication.
export default function SignupPage() {
  return <><LandingPage /><AuthModal mode="signup" /></>;
}

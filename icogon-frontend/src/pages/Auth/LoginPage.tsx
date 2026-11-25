import LandingPage from "../Landing/LandingPage";
import AuthModal from "../../components/auth/AuthModal";

// Route-backed modal: the landing page stays visible behind authentication.
export default function LoginPage() {
  return <><LandingPage /><AuthModal mode="login" /></>;
}

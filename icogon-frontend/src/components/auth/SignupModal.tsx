import AuthModal from "./AuthModal";

// Legacy entry point delegates to the shared authentication dialog.
export default function SignupModal({ onClose }: { onClose: () => void; onLogin?: () => void; onSignup?: () => void }) {
  return <AuthModal mode="signup" onClose={onClose} />;
}

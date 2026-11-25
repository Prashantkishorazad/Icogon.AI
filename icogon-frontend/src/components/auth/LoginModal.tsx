import AuthModal from "./AuthModal";

// Legacy entry point delegates to the shared authentication dialog.
export default function LoginModal({ onClose }: { onClose: () => void; onLogin?: () => void; onSignup?: () => void }) {
  return <AuthModal mode="login" onClose={onClose} />;
}

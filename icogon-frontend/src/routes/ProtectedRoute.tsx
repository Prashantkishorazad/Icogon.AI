import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
  const loading = useAuthStore(state => state.isLoading);
  const authenticated = useAuthStore(state => state.isAuthenticated);
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#070B14] text-white">Checking authentication...</div>;
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

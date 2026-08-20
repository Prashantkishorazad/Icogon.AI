import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const LogoutButton = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
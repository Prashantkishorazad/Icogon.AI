import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import OTPVerificationPage from "./pages/Auth/OTPVerificationPage";
import PhoneLoginPage from "./pages/Auth/PhoneLoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/signup"
          element={<SignupPage />}
        />

        {/* Mobile Authentication */}
        <Route
          path="/phone-login"
          element={<PhoneLoginPage />}
        />

        <Route
          path="/verify-otp"
          element={<OTPVerificationPage />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
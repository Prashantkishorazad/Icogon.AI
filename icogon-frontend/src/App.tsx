import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
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
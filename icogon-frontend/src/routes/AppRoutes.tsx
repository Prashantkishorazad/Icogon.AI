import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Public Pages
import LandingPage from "../pages/Landing/LandingPage";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";

// Private Pages
import Dashboard from "../pages/Dashboard/DashboardPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import ProjectsPage from "../pages/Projects/ProjectsPage";

// Builder
import BuilderPage from "../pages/Builder/BuilderPage";
import BuilderWorkspacePage from "../pages/Builder/BuilderWorkspacePage";

// Route Guards
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";


const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================================
            PUBLIC ROUTES
        ========================================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route element={<PublicRoute />}>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

        </Route>


        {/* =========================================
            PRIVATE ROUTES
        ========================================= */}

        <Route element={<PrivateRoute />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* Projects */}
          <Route
            path="/projects"
            element={<ProjectsPage />}
          />


          {/* Profile */}
          <Route
            path="/profile"
            element={<ProfilePage />}
          />


          {/* =====================================
              BUILDER - CREATE NEW PROJECT

              URL:
              /builder

              Example:
              http://localhost:5173/builder
          ===================================== */}

          <Route
            path="/builder"
            element={<BuilderPage />}
          />


          {/* =====================================
              BUILDER WORKSPACE

              URL:
              /builder/:projectId

              Example:
              /builder/b7a56003-1592-44ac-a038-c93717bcdb9d
          ===================================== */}

          <Route
            path="/builder/:projectId"
            element={<BuilderWorkspacePage />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;
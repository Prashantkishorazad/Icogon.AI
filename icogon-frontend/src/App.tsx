import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/authStore";

// =====================================================
// PAGES
// =====================================================

import LandingPage from "./pages/Landing/LandingPage";

import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import AuthCallback from "./pages/Auth/AuthCallback";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProjectsPage from "./pages/Projects/ProjectsPage";
import ProfilePage from "./pages/Profile/ProfilePage";

import BuilderPage from "./pages/Builder/BuilderPage";
import BuilderWorkspacePage from "./pages/Builder/BuilderWorkspacePage";

// =====================================================
// ROUTE GUARD
// =====================================================

import ProtectedRoute from "./components/auth/ProtectedRoute";


function App() {

  // ===================================================
  // AUTH STORE
  // ===================================================

  const setSession = useAuthStore(
    (state) => state.setSession
  );

  const setLoading = useAuthStore(
    (state) => state.setLoading
  );


  // ===================================================
  // INITIALIZE SUPABASE AUTH
  // ===================================================

  useEffect(() => {

    let mounted = true;


    const initializeAuth = async () => {

      try {

        setLoading(true);


        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();


        if (error) {

          throw error;

        }


        if (mounted) {

          setSession(session);

        }


      } catch (error) {

        console.error(
          "AUTH INITIALIZATION ERROR:",
          error
        );


        if (mounted) {

          setSession(null);

        }


      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    };


    initializeAuth();


    // =================================================
    // AUTH STATE LISTENER
    // =================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        if (!mounted) {
          return;
        }

        setSession(session);

      }
    );


    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, [
    setSession,
    setLoading,
  ]);


  // ===================================================
  // ROUTES
  // ===================================================

  return (

    <BrowserRouter>

      <Routes>


        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />


        <Route
          path="/login"
          element={<LoginPage />}
        />


        <Route
          path="/signup"
          element={<SignupPage />}
        />


        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />


        {/* =================================================
            PROTECTED ROUTES

            User must be authenticated.
        ================================================= */}

        <Route
          element={<ProtectedRoute />}
        >


          {/* ===============================================
              DASHBOARD

              URL:
              /dashboard
          =============================================== */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />


          {/* ===============================================
              PROJECTS

              URL:
              /projects
          =============================================== */}

          <Route
            path="/projects"
            element={<ProjectsPage />}
          />


          {/* ===============================================
              PROFILE

              URL:
              /profile
          =============================================== */}

          <Route
            path="/profile"
            element={<ProfilePage />}
          />


          {/* ===============================================
              CREATE NEW PROJECT

              URL:
              /builder

              This page is ONLY for creating a new project.

              Example:

              Project Name
              My Restaurant CRM

              Description
              Build a restaurant management system...

              ↓

              POST /projects

              ↓

              project.id

              ↓

              navigate(
                `/builder/${project.id}`
              )
          =============================================== */}

          <Route
            path="/builder"
            element={<BuilderPage />}
          />


          {/* ===============================================
              PROJECT WORKSPACE

              URL:
              /builder/:projectId

              Example:

              /builder/b7a56003-1592-44ac-a038-c93717bcdb9d

              This page should NOT show the
              "Create New Project" form.

              It should show:

              ┌──────────────────────────────────────┐
              │ ICOGON AI        Project Workspace   │
              ├──────────────┬───────────────────────┤
              │ AI Chat      │ Preview / Code        │
              │              │                       │
              │              │                       │
              │ Prompt       │ Generated Website     │
              │              │                       │
              └──────────────┴───────────────────────┘
          =============================================== */}

          <Route
            path="/builder/:projectId"
            element={<BuilderWorkspacePage />}
          />


        </Route>


        {/* =================================================
            OPTIONAL 404
        ================================================= */}

        <Route
          path="*"
          element={<LandingPage />}
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;
import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/authStore";


// =====================================================
// LANDING
// =====================================================

import LandingPage from "./pages/Landing/LandingPage";


// =====================================================
// AUTH
// =====================================================

import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import AuthCallback from "./pages/Auth/AuthCallback";


// =====================================================
// RESOURCES
// =====================================================

import AcademyPage from "./pages/Resources/AcademyPage";
import ResourcesPage from "./pages/Resources/ResourcesPage";
import BlogPage from "./pages/Resources/BlogPage";
import PartnersPage from "./pages/Resources/PartnersPage";
import TemplatesPage from "./pages/Resources/TemplatesPage";
import GuidesPage from "./pages/Resources/GuidesPage";
import DocsPage from "./pages/Resources/DocsPage";
import CustomerStoriesPage from "./pages/Resources/CustomerStoriesPage";

// Public resources connectors page.
// Kept separately from the authenticated connectors page.
import ResourcesConnectorsPage from "./pages/Resources/ConnectorsPage";


// =====================================================
// COMMUNITY
// =====================================================

import CommunityPage from "./pages/Community/CommunityPage";


// =====================================================
// DASHBOARD / APP
// =====================================================

import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProjectsPage from "./pages/Projects/ProjectsPage";
import ProfilePage from "./pages/Profile/ProfilePage";


// =====================================================
// CONNECTORS
// =====================================================

// Authenticated Gmail / app connectors page.
import ConnectorsPage from "./pages/Connectors/ConnectorsPage";


// =====================================================
// BUILDER
// =====================================================

import BuilderPage from "./pages/Builder/BuilderPage";
import BuilderWorkspacePage from "./pages/Builder/BuilderWorkspacePage";


// =====================================================
// SOLUTIONS
// =====================================================

import FoundersPage from "./pages/Solutions/FoundersPage";
import ProductManagersPage from "./pages/Solutions/ProductManagersPage";
import DesignersPage from "./pages/Solutions/DesignersPage";
import MarketersPage from "./pages/Solutions/MarketersPage";
import SalesPage from "./pages/Solutions/SalesPage";
import PeoplePage from "./pages/Solutions/PeoplePage";
import OpsPage from "./pages/Solutions/OperationsPage";
import WebsitesPage from "./pages/Solutions/WebsitesPage";
import PrototypingPage from "./pages/Solutions/PrototypingPage";
import DashboardsPage from "./pages/Solutions/DashboardsPage";
import InternalToolsPage from "./pages/Solutions/InternalToolsPage";
import AIAppsPage from "./pages/Solutions/AIAppsPage";


// =====================================================
// ENTERPRISE
// =====================================================

import EnterprisePage from "./pages/Enterprise/EnterprisePage";


// =====================================================
// PRICING
// =====================================================

import PricingPage from "./pages/Pricing/PricingPage";


// =====================================================
// SECURITY / LEGAL
// =====================================================

import ProtectedRoute from "./components/auth/ProtectedRoute";

import SecurityPage from "./pages/Security/SecurityPage";
import PrivacyPage from "./pages/Legal/PrivacyPage";
import TermsPage from "./pages/Legal/TermsPage";


// =====================================================
// APP
// =====================================================

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


    const initializeAuth =
      async (): Promise<void> => {

        setLoading(true);

        try {

          const {
            data: {
              session,
            },
            error,
          } =
            await supabase.auth.getSession();


          if (error) {

            console.error(
              "AUTH INITIALIZATION ERROR:",
              error
            );

            if (mounted) {
              setSession(null);
            }

            return;
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


    // Explicitly handle Promise.
    void initializeAuth();


    // =================================================
    // AUTH STATE LISTENER
    // =================================================

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
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
            LANDING
        ================================================= */}

        <Route
          path="/"
          element={
            <LandingPage />
          }
        />


        {/* =================================================
            AUTH
        ================================================= */}

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/signup"
          element={
            <SignupPage />
          }
        />

        <Route
          path="/auth/callback"
          element={
            <AuthCallback />
          }
        />


        {/* =================================================
            RESOURCES
        ================================================= */}

        <Route
          path="/resources"
          element={
            <ResourcesPage />
          }
        />

        <Route
          path="/partners"
          element={
            <PartnersPage />
          }
        />

        <Route
          path="/templates"
          element={
            <TemplatesPage />
          }
        />

        <Route
          path="/docs"
          element={
            <DocsPage />
          }
        />

        <Route
          path="/guides"
          element={
            <GuidesPage />
          }
        />

        <Route
          path="/academy"
          element={
            <AcademyPage />
          }
        />

        <Route
          path="/blog"
          element={
            <BlogPage />
          }
        />

        <Route
          path="/customer-stories"
          element={
            <CustomerStoriesPage />
          }
        />


        {/* =================================================
            PUBLIC RESOURCES CONNECTORS
        ================================================= */}

        {/*
          This is the marketing/public connector catalog.

          URL:
          /resources/connectors

          It is NOT the authenticated Gmail connector page.
        */}

        <Route
          path="/resources/connectors"
          element={
            <ResourcesConnectorsPage />
          }
        />


        {/* =================================================
            COMMUNITY
        ================================================= */}

        <Route
          path="/community"
          element={
            <CommunityPage />
          }
        />


        {/* =================================================
            PRICING
        ================================================= */}

        <Route
          path="/pricing"
          element={
            <PricingPage />
          }
        />


        {/* =================================================
            ENTERPRISE
        ================================================= */}

        <Route
          path="/enterprise"
          element={
            <EnterprisePage />
          }
        />


        {/* =================================================
            SOLUTIONS
        ================================================= */}

        <Route
          path="/solutions/founders"
          element={
            <FoundersPage />
          }
        />

        <Route
          path="/solutions/product-managers"
          element={
            <ProductManagersPage />
          }
        />

        <Route
          path="/solutions/designers"
          element={
            <DesignersPage />
          }
        />

        <Route
          path="/solutions/marketers"
          element={
            <MarketersPage />
          }
        />

        <Route
          path="/solutions/sales"
          element={
            <SalesPage />
          }
        />

        <Route
          path="/solutions/people"
          element={
            <PeoplePage />
          }
        />

        <Route
          path="/solutions/operations"
          element={
            <OpsPage />
          }
        />

        <Route
          path="/solutions/websites"
          element={
            <WebsitesPage />
          }
        />

        <Route
          path="/solutions/prototyping"
          element={
            <PrototypingPage />
          }
        />

        <Route
          path="/solutions/dashboards"
          element={
            <DashboardsPage />
          }
        />


        {/* =================================================
            SECURITY
        ================================================= */}

        <Route
          path="/security"
          element={
            <SecurityPage />
          }
        />


        {/* =================================================
            LEGAL
        ================================================= */}

        <Route
          path="/terms"
          element={
            <TermsPage />
          }
        />

        <Route
          path="/privacy"
          element={
            <PrivacyPage />
          }
        />


        {/* =================================================
            INTERNAL TOOLS
        ================================================= */}

        <Route
          path="/solutions/internal-tools"
          element={
            <InternalToolsPage />
          }
        />


        {/* OLD URL ALIAS */}

        <Route
          path="/solutions/internalToolsPage"
          element={
            <InternalToolsPage />
          }
        />


        {/* =================================================
            AI APPS
        ================================================= */}

        <Route
          path="/solutions/ai-apps"
          element={
            <AIAppsPage />
          }
        />


        {/* =================================================
            PROTECTED ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute />
          }
        >

          {/* =================================================
              CONNECTORS
          ================================================= */}

          {/*
            IMPORTANT:

            Sidebar Connectors
            ↓
            /connectors
            ↓
            ProtectedRoute
            ↓
            Gmail ConnectorsPage
          */}

          <Route
            path="/connectors"
            element={
              <ConnectorsPage />
            }
          />


          {/* =================================================
              OLD CONNECTORS URL
          ================================================= */}

          {/*
            Keep the old URL working so existing links
            do not break.
          */}

          <Route
            path="/ConnectorsPage"
            element={
              <ConnectorsPage />
            }
          />


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />


          {/* =================================================
              PROJECTS
          ================================================= */}

          <Route
            path="/projects"
            element={
              <ProjectsPage />
            }
          />


          {/* =================================================
              PROFILE
          ================================================= */}

          <Route
            path="/profile"
            element={
              <ProfilePage />
            }
          />


          {/* =================================================
              CREATE NEW PROJECT
          ================================================= */}

          <Route
            path="/builder"
            element={
              <BuilderPage />
            }
          />


          {/* =================================================
              PROJECT WORKSPACE
          ================================================= */}

          <Route
            path="/builder/:projectId"
            element={
              <BuilderWorkspacePage />
            }
          />

        </Route>


        {/* =================================================
            404 FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <LandingPage />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


// =====================================================
// EXPORT
// =====================================================

export default App;
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/authStore";
import AppRoutes from "./routes/AppRoutes";

// One auth listener for the entire application. INITIAL_SESSION hydrates the store.
export default function App() {
  const setSession = useAuthStore(state => state.setSession);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [setSession]);
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

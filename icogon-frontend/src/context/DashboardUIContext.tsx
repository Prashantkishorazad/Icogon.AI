import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DashboardOverlay = "search" | "connector-catalog" | null;

interface DashboardUIContextValue {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeOverlay: DashboardOverlay;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openOverlay: (overlay: Exclude<DashboardOverlay, null>) => void;
  closeOverlay: () => void;
}

const DashboardUIContext = createContext<DashboardUIContextValue | undefined>(undefined);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<DashboardOverlay>(null);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((value) => !value), []);
  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const openOverlay = useCallback((overlay: Exclude<DashboardOverlay, null>) => {
    setActiveOverlay(overlay);
    setMobileSidebarOpen(false);
  }, []);
  const closeOverlay = useCallback(() => setActiveOverlay(null), []);

  const value = useMemo(() => ({
    sidebarCollapsed,
    mobileSidebarOpen,
    activeOverlay,
    setSidebarCollapsed,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
    openOverlay,
    closeOverlay,
  }), [
    sidebarCollapsed, mobileSidebarOpen, activeOverlay, toggleSidebar,
    openMobileSidebar, closeMobileSidebar, openOverlay, closeOverlay,
  ]);

  return <DashboardUIContext.Provider value={value}>{children}</DashboardUIContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboardUI() {
  const context = useContext(DashboardUIContext);
  if (!context) {
    throw new Error("useDashboardUI must be used inside DashboardUIProvider");
  }
  return context;
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = "icogon-theme";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "system";

  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(saved) ? saved : "light";
  } catch {
    return "light";
  }
};

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
};

const subscribeToSystemTheme = (onChange: () => void) => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};

  const media = window.matchMedia(SYSTEM_THEME_QUERY);
  if (media.addEventListener) {
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }

  media.addListener(onChange);
  return () => media.removeListener(onChange);
};

const applyThemeToDocument = (resolvedTheme: ResolvedTheme) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const dark = resolvedTheme === "dark";

  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;

  const tokens: Record<string, string> = dark
    ? {
        "--builder-bg": "#090b11",
        "--builder-panel": "#10131b",
        "--builder-surface": "#151925",
        "--builder-header": "#0c0e14",
        "--builder-sidebar": "#0c0e14",
        "--builder-preview": "#0f121a",
        "--builder-card": "#151925",
        "--builder-input": "#10131b",
        "--builder-hover": "#1c2230",
        "--builder-border": "#252a38",
        "--builder-text": "#e7eaf2",
        "--builder-muted": "#929bad",
        "--builder-shadow": "0 8px 24px rgb(0 0 0 / 24%)",
        "--background": "#090b11",
        "--foreground": "#e7eaf2",
        "--card": "#10131b",
        "--border": "#252a38",
      }
    : {
        "--builder-bg": "#f5f6fa",
        "--builder-panel": "#ffffff",
        "--builder-surface": "#f1f3f8",
        "--builder-header": "#ffffff",
        "--builder-sidebar": "#ffffff",
        "--builder-preview": "#f5f6fa",
        "--builder-card": "#ffffff",
        "--builder-input": "#ffffff",
        "--builder-hover": "#f1f3f8",
        "--builder-border": "#e1e5ee",
        "--builder-text": "#202536",
        "--builder-muted": "#697386",
        "--builder-shadow": "0 8px 24px rgb(32 37 54 / 8%)",
        "--background": "#f5f6fa",
        "--foreground": "#202536",
        "--card": "#ffffff",
        "--border": "#e1e5ee",
      };

  for (const [name, value] of Object.entries(tokens)) {
    root.style.setProperty(name, value);
  }
};

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    (): ResolvedTheme => "light",
  );

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;

  const setTheme = useCallback((nextTheme: Theme) => {
    if (!isTheme(nextTheme)) return;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      window.localStorage.removeItem("icogon-theme-v2");
      window.localStorage.removeItem("icogon-theme-v3");
    } catch {
      // Theme still changes for this session when storage is unavailable.
    }

    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
        setThemeState(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const THEME_STORAGE_KEY = "icogon-theme";

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // ==========================================
  // DEFAULT THEME
  // ==========================================

  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(
      THEME_STORAGE_KEY
    );

    // Only accept valid values
    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      return savedTheme;
    }

    // DEFAULT = LIGHT
    return "light";
  });

  const [resolvedTheme, setResolvedTheme] = useState<
    "light" | "dark"
  >("light");

  // ==========================================
  // APPLY THEME
  // ==========================================

  useEffect(() => {
    const root = document.documentElement;

    const getResolvedTheme = (): "light" | "dark" => {
      if (theme === "system") {
        return window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light";
      }

      return theme;
    };

    const applyTheme = () => {
      const newTheme = getResolvedTheme();

      // Remove EVERYTHING related to old theme
      root.classList.remove("dark");
      root.classList.remove("light");

      // Set correct theme
      root.setAttribute("data-theme", newTheme);

      // Add only correct class
      root.classList.add(newTheme);

      // Apply browser color scheme
      root.style.colorScheme = newTheme;

      // Update state
      setResolvedTheme(newTheme);
    };

    applyTheme();

    // ==========================================
    // SYSTEM THEME LISTENER
    // ==========================================

    if (theme === "system") {
      const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      const handleSystemThemeChange = () => {
        applyTheme();
      };

      mediaQuery.addEventListener(
        "change",
        handleSystemThemeChange
      );

      return () => {
        mediaQuery.removeEventListener(
          "change",
          handleSystemThemeChange
        );
      };
    }
  }, [theme]);

  // ==========================================
  // CHANGE THEME
  // ==========================================

  const setTheme = (newTheme: Theme) => {
    // Save new preference
    localStorage.setItem(
      THEME_STORAGE_KEY,
      newTheme
    );

    // Remove old conflicting keys
    localStorage.removeItem("icogon-theme-v2");
    localStorage.removeItem("icogon-theme-v3");

    // Update React state
    setThemeState(newTheme);
  };

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
};
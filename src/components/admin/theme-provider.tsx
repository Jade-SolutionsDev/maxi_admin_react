import { useEffect, useState } from "react";

import { ThemeProviderContext, type Theme } from "./theme-context";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

/**
 * Theme provider that enables light, dark, and system theme modes.
 *
 * @internal
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  // storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const STORAGE_KEY = "maxi-theme";
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? defaultTheme,
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    // Resolve "system" to a concrete light/dark and mirror it onto <html> so
    // both class-based CSS and JS consumers (charts, logo) agree. Without this,
    // components reading the raw theme string saw "system" and fell back to the
    // light palette on a dark shell.
    const apply = () => {
      const effective =
        theme === "system" ? (mql.matches ? "dark" : "light") : theme;
      root.classList.remove("light", "dark");
      root.classList.add(effective);
      setResolvedTheme(effective);
    };

    apply();

    // Follow live OS light/dark switches while on "system".
    if (theme === "system") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

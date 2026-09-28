import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildTheme } from "./theme";

const STORAGE_KEY = "theme-preference"; // "light" | "dark" | "system"
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState("system");
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || "light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") setPreference(stored);
      setReady(true);
    });
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || "light");
    });
    return () => sub.remove();
  }, []);

  const resolvedScheme = preference === "system" ? systemScheme : preference;
  const theme = useMemo(() => buildTheme(resolvedScheme), [resolvedScheme]);

  async function setThemePreference(next) {
    setPreference(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo(
    () => ({
      theme,
      isDark: resolvedScheme === "dark",
      preference,
      setThemePreference,
      ready,
    }),
    [theme, resolvedScheme, preference, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

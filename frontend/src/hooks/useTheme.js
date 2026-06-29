import { useEffect } from "react";
import { THEME_KEY } from "../app/constants.js";
import { usePersistentState } from "./usePersistentState.js";

export function useTheme() {
  const [theme, setTheme] = usePersistentState(THEME_KEY, "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}
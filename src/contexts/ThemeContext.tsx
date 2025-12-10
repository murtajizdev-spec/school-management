"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("light"); // Default to light theme
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Update document class and localStorage
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (!mounted) {
    // Prevent flash of wrong theme
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values during SSR or when provider is not available
    return {
      theme: "light" as Theme,
      toggleTheme: () => {
        // Fallback implementation
        if (typeof window !== "undefined") {
          const currentTheme = localStorage.getItem("theme") as Theme | null;
          const newTheme = currentTheme === "dark" ? "light" : "dark";
          localStorage.setItem("theme", newTheme);
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(newTheme);
        }
      },
    };
  }
  return context;
};


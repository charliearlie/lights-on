import { createContext, useContext, useEffect, useState } from "react";

interface DarkModeContextValue {
  isDark: boolean;
  onToggle: () => void;
  showFlash: boolean;
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null);

export function useDarkMode(): DarkModeContextValue {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error("useDarkMode must be used within DarkModeProvider");
  return ctx;
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!showFlash) return;
    const id = setTimeout(() => setShowFlash(false), 700);
    return () => clearTimeout(id);
  }, [showFlash]);

  const onToggle = () => {
    if (!isDark) setShowFlash(true);
    setIsDark((prev) => !prev);
  };

  return (
    <DarkModeContext value={{ isDark, onToggle, showFlash }}>
      {children}
    </DarkModeContext>
  );
}

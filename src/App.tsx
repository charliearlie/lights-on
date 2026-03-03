import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { ProductGrid } from "./components/ProductGrid";
import { Generate } from "./pages/Generate";

function useHash() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash;
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showFlash, setShowFlash] = useState(false);
  const hash = useHash();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Clean up amber flash timeout
  useEffect(() => {
    if (!showFlash) return;
    const id = setTimeout(() => setShowFlash(false), 700);
    return () => clearTimeout(id);
  }, [showFlash]);

  const handleToggle = () => {
    if (!isDark) {
      setShowFlash(true);
    }
    setIsDark(!isDark);
  };

  if (hash === "#generate") {
    return <Generate />;
  }

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      {/* Amber flash overlay */}
      {showFlash && (
        <div
          className="amber-flash pointer-events-none fixed inset-0 z-50"
          style={{ backgroundColor: "#F59E0B" }}
          aria-hidden="true"
        />
      )}

      <Header isDark={isDark} onToggle={handleToggle} />
      <ProductGrid isDark={isDark} />

      {/* Footer */}
      <footer className="border-t border-border-light px-4 py-8 transition-colors duration-300 dark:border-border-dark sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
              LIGHTS ON&ensp;&middot;&ensp;Nordic Lighting
            </p>
            <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
              &copy; 2026&ensp;&middot;&ensp;Free delivery over &pound;75
            </p>
          </div>
          <p className="mt-3 text-center text-[0.6875rem] text-[#78716C]/60 dark:text-[#A8A097]/60">
            Product images generated with AI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

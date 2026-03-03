import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { Header } from "./components/Header";
import { ProductGrid } from "./components/ProductGrid";
import { ProductDetail } from "./pages/ProductDetail";
import { FireplaceGrid } from "./components/FireplaceGrid";
import { FireplaceDetail } from "./pages/FireplaceDetail";
import { Home } from "./pages/Home";

const Generate = lazy(() =>
  import("./pages/Generate").then((m) => ({ default: m.Generate })),
);

const GenerateFireplaces = lazy(() =>
  import("./pages/GenerateFireplaces").then((m) => ({
    default: m.GenerateFireplaces,
  })),
);

const GenerateHero = lazy(() =>
  import("./pages/GenerateHero").then((m) => ({
    default: m.GenerateHero,
  })),
);

function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showFlash, setShowFlash] = useState(false);

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

  return (
    <>
      {showFlash && (
        <div
          className="amber-flash pointer-events-none fixed inset-0 z-50"
          style={{ backgroundColor: "#F59E0B" }}
          aria-hidden="true"
        />
      )}

      <Routes>
        <Route path="/" element={<Home isDark={isDark} onToggle={handleToggle} />} />

        <Route
          path="/lamps"
          element={
            <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
              <Header isDark={isDark} onToggle={handleToggle} currentSection="lamps" />
              <ProductGrid isDark={isDark} />
              <footer className="border-t border-border-light px-4 py-8 transition-colors duration-300 dark:border-border-dark sm:px-6">
                <div className="mx-auto max-w-7xl">
                  <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
                      ILLUMINATE&ensp;&middot;&ensp;Nordic Home
                    </p>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
                      &copy; 2026&ensp;&middot;&ensp;Free delivery over &pound;75
                    </p>
                  </div>
                  <p className="mt-3 text-center text-[0.6875rem] text-[#78716C]/60 dark:text-[#A8A097]/60">
                    A showcase by Charlie Waite&ensp;&middot;&ensp;Not a real store&ensp;&middot;&ensp;Product images generated with AI
                  </p>
                </div>
              </footer>
            </div>
          }
        />

        <Route
          path="/lamps/:id"
          element={<ProductDetail isDark={isDark} onToggle={handleToggle} />}
        />

        <Route
          path="/fireplaces"
          element={
            <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
              <Header isDark={isDark} onToggle={handleToggle} currentSection="fireplaces" />
              <FireplaceGrid isDark={isDark} />
              <footer className="border-t border-border-light px-4 py-8 transition-colors duration-300 dark:border-border-dark sm:px-6">
                <div className="mx-auto max-w-7xl">
                  <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                    <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
                      ILLUMINATE&ensp;&middot;&ensp;Nordic Home
                    </p>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
                      &copy; 2026&ensp;&middot;&ensp;Free delivery over &pound;75
                    </p>
                  </div>
                  <p className="mt-3 text-center text-[0.6875rem] text-[#78716C]/60 dark:text-[#A8A097]/60">
                    A showcase by Charlie Waite&ensp;&middot;&ensp;Not a real store&ensp;&middot;&ensp;Product images generated with AI
                  </p>
                </div>
              </footer>
            </div>
          }
        />

        <Route
          path="/fireplaces/:id"
          element={<FireplaceDetail isDark={isDark} onToggle={handleToggle} />}
        />

        <Route
          path="/generate/lamps"
          element={
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
              <Generate />
            </Suspense>
          }
        />

        <Route
          path="/generate/fireplaces"
          element={
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
              <GenerateFireplaces />
            </Suspense>
          }
        />

        <Route
          path="/generate/hero"
          element={
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
              <GenerateHero />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;

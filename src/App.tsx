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
  const hash = useHash();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  if (hash === "#generate") {
    return <Generate />;
  }

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      <ProductGrid isDark={isDark} />
    </div>
  );
}

export default App;

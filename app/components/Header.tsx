import { Link } from "react-router";
import { DarkModeToggle } from "./DarkModeToggle";

interface HeaderProps {
  currentSection?: "lamps" | "fireplaces" | "outdoor";
}

export function Header({ currentSection }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10">
      {/* Announcement bar */}
      <div className="border-b border-border-light bg-white/80 px-4 py-2 text-center backdrop-blur-sm transition-colors duration-300 dark:border-border-dark dark:bg-card-dark/80">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Free delivery on orders over £75
        </p>
      </div>

      {/* Main header */}
      <div className="border-b border-border-light bg-white/95 px-4 backdrop-blur-sm transition-colors duration-300 dark:border-border-dark dark:bg-surface-dark/95 sm:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-xl tracking-tight text-[#1C1917] dark:text-[#F5F0E8] sm:text-[1.75rem]">
              KARLS LJUS
            </Link>
            <div className="h-5 w-px bg-border-light dark:bg-border-dark" />
            <span className="hidden text-[0.5625rem] font-medium uppercase tracking-[0.15em] text-[#78716C] dark:text-[#A8A097] sm:block">
              Nordic Home
            </span>
          </div>
          <DarkModeToggle />
        </div>
      </div>

      {/* Category navigation */}
      {currentSection && (
        <nav className="border-b border-border-light bg-white/95 px-4 backdrop-blur-sm transition-colors duration-300 dark:border-border-dark dark:bg-surface-dark/95 sm:px-6">
          <div className="mx-auto flex max-w-7xl gap-6">
            <Link
              to="/lamps"
              className={`relative py-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.15em] transition-colors duration-150 ${
                currentSection === "lamps"
                  ? "text-ikea-blue dark:text-amber-glow"
                  : "text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
              }`}
            >
              Lamps
              {currentSection === "lamps" && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ikea-blue dark:bg-amber-glow" />
              )}
            </Link>
            <Link
              to="/fireplaces"
              className={`relative py-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.15em] transition-colors duration-150 ${
                currentSection === "fireplaces"
                  ? "text-ikea-blue dark:text-amber-glow"
                  : "text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
              }`}
            >
              Fireplaces
              {currentSection === "fireplaces" && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ikea-blue dark:bg-amber-glow" />
              )}
            </Link>
            <Link
              to="/outdoor"
              className={`relative py-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.15em] transition-colors duration-150 ${
                currentSection === "outdoor"
                  ? "text-ikea-blue dark:text-amber-glow"
                  : "text-[#78716C] hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
              }`}
            >
              Outdoor
              {currentSection === "outdoor" && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ikea-blue dark:bg-amber-glow" />
              )}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

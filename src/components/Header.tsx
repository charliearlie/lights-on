import { DarkModeToggle } from "./DarkModeToggle";

interface HeaderProps {
  isDark: boolean;
  onToggle: () => void;
}

export function Header({ isDark, onToggle }: HeaderProps) {
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
            <h1 className="font-display text-xl tracking-tight text-[#1C1917] dark:text-[#F5F0E8] sm:text-[1.75rem]">
              LIGHTS ON
            </h1>
            <div className="h-5 w-px bg-border-light dark:bg-border-dark" />
            <span className="hidden text-[0.5625rem] font-medium uppercase tracking-[0.15em] text-[#78716C] dark:text-[#A8A097] sm:block">
              Nordic Lighting
            </span>
          </div>
          <DarkModeToggle isDark={isDark} onToggle={onToggle} />
        </div>
      </div>
    </header>
  );
}

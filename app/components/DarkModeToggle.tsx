import { useDarkMode } from "../context/dark-mode";

export function DarkModeToggle() {
  const { isDark, onToggle } = useDarkMode();

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      className="flex items-center gap-2.5"
      aria-label="Toggle lights"
    >
      <span className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-[#78716C] dark:text-[#A8A097]">
        Lights
      </span>

      {/* Pill track */}
      <div
        className="relative h-[26px] w-12 rounded-full transition-colors duration-400"
        style={{ backgroundColor: isDark ? "#F59E0B" : "#D4CFC8" }}
      >
        {/* Knob */}
        <div
          className="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          style={{
            transform: isDark ? "translateX(25px)" : "translateX(3px)",
            transition: "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>

      <span className="w-5 text-[0.625rem] font-medium uppercase tracking-[0.1em] text-[#78716C] dark:text-[#A8A097]">
        {isDark ? "On" : "Off"}
      </span>
    </button>
  );
}

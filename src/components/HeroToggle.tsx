interface HeroToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function HeroToggle({ isDark, onToggle }: HeroToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        role="switch"
        aria-checked={isDark}
        onClick={onToggle}
        className="flex items-center gap-3"
        aria-label="Toggle lights"
      >
        <span className="text-sm font-medium uppercase tracking-[0.1em] text-white/70">
          Lights
        </span>

        {/* Pill track */}
        <div
          className="relative h-12 w-24 rounded-full"
          style={{
            backgroundColor: isDark ? "#F59E0B" : "#D4CFC8",
            boxShadow: isDark
              ? "0 0 20px 4px rgba(245,158,11,0.35)"
              : "none",
            transition: "background-color 400ms, box-shadow 400ms",
          }}
        >
          {/* Knob */}
          <div
            className="absolute top-[6px] h-9 w-9 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            style={{
              transform: isDark ? "translateX(55px)" : "translateX(5px)",
              transition:
                "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>

        <span className="w-6 text-sm font-medium uppercase tracking-[0.1em] text-white/70">
          {isDark ? "On" : "Off"}
        </span>
      </button>

      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-white/50">
        Flip the switch
      </p>
    </div>
  );
}

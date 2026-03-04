import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Generalised ImageToggle — supports multiple states and transition types
// ---------------------------------------------------------------------------

export interface ImageState {
  label: string;
  src: string;
  alt: string;
}

export type TransitionType = "crossfade" | "slider" | "flip";
export type TriggerType = "switch" | "hover" | "click" | "external";

export interface ImageToggleProps {
  /** Array of image states to toggle between */
  states: ImageState[];
  /** Transition animation type */
  transitionType?: TransitionType;
  /** How the toggle is triggered */
  triggerType?: TriggerType;
  /** Additional CSS classes for the container */
  className?: string;
  /** Default state index (uncontrolled mode) */
  defaultStateIndex?: number;
  /** Active state index (controlled mode) */
  activeStateIndex?: number;
  /** Callback when state changes */
  onStateChange?: (index: number) => void;
  /** Transition duration in ms */
  transitionDuration?: number;
}

export function ImageToggle({
  states,
  transitionType = "crossfade",
  triggerType = "switch",
  className = "",
  defaultStateIndex = 0,
  activeStateIndex,
  onStateChange,
  transitionDuration = 500,
}: ImageToggleProps) {
  const [internalIndex, setInternalIndex] = useState(defaultStateIndex);

  const isControlled = activeStateIndex !== undefined;
  const currentIndex = isControlled ? activeStateIndex : internalIndex;

  const setIndex = useCallback(
    (index: number) => {
      if (!isControlled) {
        setInternalIndex(index);
      }
      onStateChange?.(index);
    },
    [isControlled, onStateChange],
  );

  const nextState = useCallback(() => {
    const next = (currentIndex + 1) % states.length;
    setIndex(next);
  }, [currentIndex, states.length, setIndex]);

  // Event handlers based on trigger type
  const containerProps: React.HTMLAttributes<HTMLDivElement> = {};
  if (triggerType === "click") {
    containerProps.onClick = nextState;
    containerProps.role = "button";
    containerProps.tabIndex = 0;
    containerProps.onKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nextState();
      }
    };
  } else if (triggerType === "hover") {
    containerProps.onMouseEnter = () => setIndex(1);
    containerProps.onMouseLeave = () => setIndex(0);
  }

  if (states.length === 0) return null;

  // Crossfade: stack all images, toggle opacity
  if (transitionType === "crossfade") {
    return (
      <div className={`relative overflow-hidden ${className}`} {...containerProps}>
        {states.map((state, i) => (
          <img
            key={state.label}
            src={state.src}
            alt={state.alt}
            className={`${i === 0 ? "relative" : "absolute inset-0"} h-full w-full object-cover`}
            style={{
              opacity: i === currentIndex ? 1 : 0,
              transition: `opacity ${transitionDuration}ms ease`,
            }}
          />
        ))}
        {triggerType === "switch" && states.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {states.map((state, i) => (
              <button
                key={state.label}
                onClick={() => setIndex(i)}
                aria-label={state.label}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentIndex
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Slider: clip-path reveal
  if (transitionType === "slider") {
    const progress = states.length > 1 ? currentIndex / (states.length - 1) : 0;
    return (
      <div className={`relative overflow-hidden ${className}`} {...containerProps}>
        <img
          src={states[0].src}
          alt={states[0].alt}
          className="h-full w-full object-cover"
        />
        {states.length > 1 && (
          <img
            src={states[states.length - 1].src}
            alt={states[states.length - 1].alt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
              transition: `clip-path ${transitionDuration}ms ease`,
            }}
          />
        )}
      </div>
    );
  }

  // Flip: Y-axis rotation
  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: "1000px" }}
      {...containerProps}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: `transform ${transitionDuration}ms ease`,
          transform: currentIndex === 0 ? "rotateY(0deg)" : "rotateY(180deg)",
        }}
      >
        <img
          src={states[0].src}
          alt={states[0].alt}
          className="h-full w-full object-cover"
          style={{ backfaceVisibility: "hidden" }}
        />
        {states.length > 1 && (
          <img
            src={states[1].src}
            alt={states[1].alt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          />
        )}
      </div>
    </div>
  );
}

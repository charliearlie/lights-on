import { Link } from "react-router";
import type { StudioPackage } from "../../data/studio-packages";

interface PricingCardsProps {
  packages: StudioPackage[];
  mode: "display" | "select";
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function PricingCards({
  packages,
  mode,
  selectedId,
  onSelect,
}: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {packages.map((pkg) => {
        const isHighlighted = pkg.highlighted;
        const isSelected = mode === "select" && selectedId === pkg.id;
        const isEnterprise = pkg.id === "enterprise";

        const cardClasses = [
          "relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200",
          isHighlighted
            ? "border-ikea-blue dark:border-amber-glow"
            : "border-border-light dark:border-border-dark",
          isSelected
            ? "ring-2 ring-ikea-blue dark:ring-amber-glow"
            : "",
          mode === "select" && !isEnterprise
            ? "cursor-pointer"
            : "",
          "hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]",
          "bg-card-light dark:bg-card-dark",
        ].join(" ");

        const handleClick = () => {
          if (mode !== "select") return;
          if (isEnterprise) {
            window.location.href = "mailto:hello@karlsljus.studio";
            return;
          }
          onSelect?.(pkg.id);
        };

        const cardContent = (
          <>
            {/* Recommended badge */}
            {isHighlighted && (
              <div className="bg-ikea-blue px-4 py-1.5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-white dark:bg-amber-glow dark:text-[#1C1917]">
                Recommended
              </div>
            )}

            <div className="flex flex-1 flex-col p-6">
              {/* Package name */}
              <h3 className="font-display text-xl italic text-[#1C1917] dark:text-[#F5F0E8]">
                {pkg.name}
              </h3>

              {/* Price */}
              <p className="mt-2 text-3xl font-semibold text-[#1C1917] dark:text-[#F5F0E8]">
                {pkg.priceLabel}
              </p>

              {/* Features */}
              <ul className="mt-6 flex-1 space-y-3">
                {pkg.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[#44403C] dark:text-[#C4BAB0]"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-ikea-blue dark:text-amber-glow"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {mode === "display" && (
                <div className="mt-6">
                  {isEnterprise ? (
                    <a
                      href="mailto:hello@karlsljus.studio"
                      className="block rounded-lg border border-border-light px-4 py-2.5 text-center text-sm font-medium text-[#1C1917] transition-colors duration-300 hover:bg-[#F7F5F2] dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#1A1915]"
                    >
                      Contact Us
                    </a>
                  ) : (
                    <Link
                      to={`/studio/order?package=${pkg.id}`}
                      className={
                        isHighlighted
                          ? "block rounded-lg bg-ikea-blue px-4 py-2.5 text-center text-sm font-medium text-white transition-colors duration-300 hover:bg-[#004A8C] dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-[#D97706]"
                          : "block rounded-lg border border-border-light px-4 py-2.5 text-center text-sm font-medium text-[#1C1917] transition-colors duration-300 hover:bg-[#F7F5F2] dark:border-border-dark dark:text-[#F5F0E8] dark:hover:bg-[#1A1915]"
                      }
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              )}

              {mode === "select" && !isEnterprise && (
                <div className="mt-6">
                  <span
                    className={
                      isSelected
                        ? "block rounded-lg bg-ikea-blue px-4 py-2.5 text-center text-sm font-medium text-white transition-colors duration-300 dark:bg-amber-glow dark:text-[#1C1917]"
                        : "block rounded-lg border border-border-light px-4 py-2.5 text-center text-sm font-medium text-[#1C1917] transition-colors duration-300 dark:border-border-dark dark:text-[#F5F0E8]"
                    }
                  >
                    {isSelected ? "Selected" : "Select"}
                  </span>
                </div>
              )}

              {mode === "select" && isEnterprise && (
                <div className="mt-6">
                  <span className="block rounded-lg border border-border-light px-4 py-2.5 text-center text-sm font-medium text-[#1C1917] transition-colors duration-300 dark:border-border-dark dark:text-[#F5F0E8]">
                    Contact Us
                  </span>
                </div>
              )}
            </div>
          </>
        );

        if (mode === "select") {
          return (
            <div
              key={pkg.id}
              role="button"
              tabIndex={0}
              className={cardClasses}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick();
                }
              }}
            >
              {cardContent}
            </div>
          );
        }

        return (
          <div key={pkg.id} className={cardClasses}>
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}

import { Link } from "react-router";
import { Header } from "../components/Header";
import { HeroToggle } from "../components/HeroToggle";
import { products } from "../data/products";
import { fireplaces } from "../data/fireplaces";
import { outdoor } from "../data/outdoor";

interface HomeProps {
  isDark: boolean;
  onToggle: () => void;
}

export function Home({ isDark, onToggle }: HomeProps) {
  const featuredLamp = products[0];
  const featuredFireplace = fireplaces[0];
  const featuredOutdoor = outdoor[0];

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header isDark={isDark} onToggle={onToggle} />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] overflow-hidden bg-border-dark">
        {/* Room scene images with crossfade */}
        <img
          src="/images/hero/showroom-off.png"
          alt="Showroom with lights off"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: isDark ? 0 : 1,
            transition: "opacity 500ms ease",
          }}
        />
        <img
          src="/images/hero/showroom-on.png"
          alt="Showroom with lights on"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: isDark ? 1 : 0,
            transition: "opacity 500ms ease",
          }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

        {/* Centered content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-white/70">
            Nordic Home&ensp;&middot;&ensp;Since 1943
          </p>
          <h1 className="font-display text-[3rem] italic tracking-tight text-white sm:text-[4.5rem] lg:text-[6rem]">
            ILLUMINATE
          </h1>
          <HeroToggle isDark={isDark} onToggle={onToggle} />
        </div>

        {/* Scroll indicator */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <svg
            className="animate-bounce text-white/40"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M5 8L10 13L15 8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Category Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="mb-8 text-center text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Collections
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Lamps Card */}
          <Link
            to="/lamps"
            className="group block overflow-hidden rounded-xl border border-border-light transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-border-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-surface-light dark:bg-surface-dark">
              <img
                src={featuredLamp.imageOff}
                alt={`${featuredLamp.name} off`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isDark ? 0 : 1,
                  transition: "opacity 500ms ease",
                }}
              />
              <img
                src={featuredLamp.imageOn}
                alt={`${featuredLamp.name} on`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isDark ? 1 : 0,
                  transition: "opacity 500ms ease",
                }}
              />
            </div>
            <div className="border-t border-border-light bg-card-light px-4 pb-4 pt-3 transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
              <h3 className="font-display text-base italic leading-tight text-[#1C1917] dark:text-[#F5F0E8]">
                Lamps
              </h3>
              <p className="mt-0.5 text-[0.8125rem] text-[#78716C] dark:text-[#A8A097]">
                {products.length} products
              </p>
              <span className="mt-2.5 flex items-center gap-0.5 text-xs font-medium text-ikea-blue dark:text-amber-glow">
                Explore
                <svg
                  className="-translate-x-1 transition-transform duration-150 group-hover:translate-x-0"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M4.5 2.5L8 6L4.5 9.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Link>

          {/* Fireplaces Card */}
          <Link
            to="/fireplaces"
            className="group block overflow-hidden rounded-xl border border-border-light transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-border-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-surface-light dark:bg-surface-dark">
              <img
                src={featuredFireplace.imageOff}
                alt={`${featuredFireplace.name} off`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isDark ? 0 : 1,
                  transition: "opacity 500ms ease",
                }}
              />
              <img
                src={featuredFireplace.imageOn}
                alt={`${featuredFireplace.name} on`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isDark ? 1 : 0,
                  transition: "opacity 500ms ease",
                }}
              />
            </div>
            <div className="border-t border-border-light bg-card-light px-4 pb-4 pt-3 transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
              <h3 className="font-display text-base italic leading-tight text-[#1C1917] dark:text-[#F5F0E8]">
                Fireplaces
              </h3>
              <p className="mt-0.5 text-[0.8125rem] text-[#78716C] dark:text-[#A8A097]">
                {fireplaces.length} products
              </p>
              <span className="mt-2.5 flex items-center gap-0.5 text-xs font-medium text-ikea-blue dark:text-amber-glow">
                Explore
                <svg
                  className="-translate-x-1 transition-transform duration-150 group-hover:translate-x-0"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M4.5 2.5L8 6L4.5 9.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Link>

          {/* Outdoor Card */}
          <Link
            to="/outdoor"
            className="group block overflow-hidden rounded-xl border border-border-light transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-border-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-surface-light dark:bg-surface-dark">
              <img
                src={featuredOutdoor.imageOff}
                alt={`${featuredOutdoor.name} off`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isDark ? 0 : 1,
                  transition: "opacity 500ms ease",
                }}
              />
              <img
                src={featuredOutdoor.imageOn}
                alt={`${featuredOutdoor.name} on`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: isDark ? 1 : 0,
                  transition: "opacity 500ms ease",
                }}
              />
            </div>
            <div className="border-t border-border-light bg-card-light px-4 pb-4 pt-3 transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
              <h3 className="font-display text-base italic leading-tight text-[#1C1917] dark:text-[#F5F0E8]">
                Outdoor
              </h3>
              <p className="mt-0.5 text-[0.8125rem] text-[#78716C] dark:text-[#A8A097]">
                {outdoor.length} products
              </p>
              <span className="mt-2.5 flex items-center gap-0.5 text-xs font-medium text-ikea-blue dark:text-amber-glow">
                Explore
                <svg
                  className="-translate-x-1 transition-transform duration-150 group-hover:translate-x-0"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M4.5 2.5L8 6L4.5 9.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
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
  );
}

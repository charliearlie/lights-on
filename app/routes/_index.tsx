import { Link } from "react-router";
import { Header } from "../components/Header";
import { HeroToggle } from "../components/HeroToggle";
import { Footer } from "../components/Footer";
import { products } from "../data/products";
import { fireplaces } from "../data/fireplaces";
import { outdoor } from "../data/outdoor";

export default function HomePage() {
  const featuredLamp = products[0];
  const featuredFireplace = fireplaces[0];
  const featuredOutdoor = outdoor[0];

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] overflow-hidden bg-border-dark">
        {/* Room scene images with crossfade */}
        <img
          src="/images/hero/webp/showroom-off.webp"
          alt="Showroom with lights off"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 dark:opacity-0"
        />
        <img
          src="/images/hero/webp/showroom-on.webp"
          alt="Showroom with lights on"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 dark:opacity-100"
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
          <HeroToggle />
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
                src={featuredLamp.thumbOff}
                alt={`${featuredLamp.name} off`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 dark:opacity-0"
              />
              <img
                src={featuredLamp.thumbOn}
                alt={`${featuredLamp.name} on`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 dark:opacity-100"
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
                src={featuredFireplace.thumbOff}
                alt={`${featuredFireplace.name} off`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 dark:opacity-0"
              />
              <img
                src={featuredFireplace.thumbOn}
                alt={`${featuredFireplace.name} on`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 dark:opacity-100"
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
                src={featuredOutdoor.thumbOff}
                alt={`${featuredOutdoor.name} off`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 dark:opacity-0"
              />
              <img
                src={featuredOutdoor.thumbOn}
                alt={`${featuredOutdoor.name} on`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 dark:opacity-100"
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

      <Footer />
    </div>
  );
}

import { Header } from "../components/Header";
import { HeroToggle } from "../components/HeroToggle";
import { Footer } from "../components/Footer";
import { SiteShowcase } from "../components/studio/SiteShowcase";
import { HowItWorks } from "../components/studio/HowItWorks";
import { PricingCards } from "../components/studio/PricingCards";
import { ContactCTA } from "../components/studio/ContactCTA";
import { studioPackages } from "../data/studio-packages";

export default function HomePage() {
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

      <SiteShowcase />
      <HowItWorks />

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="mb-2 text-center text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Pricing
        </p>
        <h2 className="mb-10 text-center font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
          Simple, transparent pricing
        </h2>
        <PricingCards packages={studioPackages} mode="display" />
      </section>

      <ContactCTA />
      <Footer />
    </div>
  );
}

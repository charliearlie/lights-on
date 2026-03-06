import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { Header } from "../components/Header";
import { HeroToggle } from "../components/HeroToggle";
import { Footer } from "../components/Footer";
import { SiteShowcase } from "../components/studio/SiteShowcase";
import { HowItWorks } from "../components/studio/HowItWorks";

export const meta: MetaFunction = () => [
  { title: "Camber AI — AI-Powered Product Image Transformation" },
  {
    name: "description",
    content:
      "Transform your product photography with AI. Show customers what your products look like lit up, switched on, or in use.",
  },
  { property: "og:title", content: "Camber AI — AI-Powered Product Image Transformation" },
  {
    property: "og:description",
    content:
      "Transform your product photography with AI. Show customers what your products look like lit up, switched on, or in use.",
  },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header brand="camber" />

      {/* Hero — compact version */}
      <section className="relative min-h-[50vh] overflow-hidden bg-border-dark">
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
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-white/70">
            AI-Powered Image Transformation
          </p>
          <h1 className="max-w-3xl text-center font-display text-[2.5rem] italic leading-tight tracking-tight text-white sm:text-[3.5rem] lg:text-[4.5rem]">
            Every product, with the lights on
          </h1>
          <p className="max-w-lg text-center text-sm leading-relaxed text-white/60 sm:text-base">
            Transform your product photography with AI. Show customers what your
            products look like lit up, switched on, or in use.
          </p>
          <HeroToggle />
        </div>
      </section>

      {/* Live Demo */}
      <section className="border-t border-border-light bg-[#FAFAF9] px-4 py-20 transition-colors dark:border-border-dark dark:bg-[#0C0A09] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SiteShowcase
            subtitle="Karls Ljus Showcase &middot; Powered by Camber AI"
            heading="Toggle the lights to see it in action"
          />
          <div className="mt-10 text-center">
            <Link
              to="/showcase"
              className="inline-flex items-center gap-2 rounded-lg bg-ikea-blue px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-ikea-blue/90 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-amber-glow/90"
            >
              View Showcase
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M5 3l5 4-5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Two Channels */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="mb-2 text-center text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Two ways to get started
        </p>
        <h2 className="mb-12 text-center font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
          Choose your path
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Self-serve (SaaS) */}
          <div className="group relative overflow-hidden rounded-2xl border border-border-light bg-white p-8 transition-all hover:shadow-lg dark:border-border-dark dark:bg-card-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-ikea-blue/10 dark:bg-amber-glow/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ikea-blue dark:text-amber-glow"
              >
                <path
                  d="M12 16V8M8 12l4-4 4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-display text-xl italic text-[#1C1917] dark:text-[#F5F0E8]">
              Do It Yourself
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-[#78716C] dark:text-[#A8A097]">
              Upload your images, our AI transforms them, and you get embeddable
              interactive toggles for your website.
            </p>
            <ul className="mb-8 space-y-2.5">
              {[
                "Upload your product images",
                "AI generates on/off states",
                "Embed interactive toggles anywhere",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-[#44403C] dark:text-[#D6D3D1]"
                >
                  <svg
                    className="mt-0.5 shrink-0 text-ikea-blue dark:text-amber-glow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M3 7l3 3 5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mb-6">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                Free to start
              </span>
              <span className="mx-2 text-[#D6D3D1] dark:text-[#44403C]">
                &middot;
              </span>
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                From £29/mo
              </span>
            </div>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-ikea-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ikea-blue/90 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-amber-glow/90"
            >
              Start Building
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M5 3l5 4-5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* Done for you (Studio) */}
          <div className="group relative overflow-hidden rounded-2xl border border-border-light bg-white p-8 transition-all hover:shadow-lg dark:border-border-dark dark:bg-card-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-ikea-blue/10 dark:bg-amber-glow/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ikea-blue dark:text-amber-glow"
              >
                <path
                  d="M9.5 2A2.5 2.5 0 0 1 12 4.5V5h4.5A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5V12h-.5A2.5 2.5 0 0 1 2 9.5v-5A2.5 2.5 0 0 1 4.5 2h5Z"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12l4 4M12 12l-4 4M12 12l4-4M12 12l-4-4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-display text-xl italic text-[#1C1917] dark:text-[#F5F0E8]">
              We Do It For You
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-[#78716C] dark:text-[#A8A097]">
              Send us your product images and we handle everything — from AI
              transformation to website integration.
            </p>
            <ul className="mb-8 space-y-2.5">
              {[
                "Send us your product images",
                "We transform and integrate them",
                "Delivered in 48 hours",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-[#44403C] dark:text-[#D6D3D1]"
                >
                  <svg
                    className="mt-0.5 shrink-0 text-ikea-blue dark:text-amber-glow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M3 7l3 3 5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mb-6">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                From £99
              </span>
              <span className="mx-2 text-[#D6D3D1] dark:text-[#44403C]">
                &middot;
              </span>
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                One-time packages
              </span>
            </div>
            <Link
              to="/studio/order"
              className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-6 py-3 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F5F0E8] dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] dark:hover:bg-[#292524]"
            >
              Get a Quote
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M5 3l5 4-5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <HowItWorks />

      <Footer />
    </div>
  );
}

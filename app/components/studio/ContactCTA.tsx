import { Link } from "react-router";

export function ContactCTA() {
  return (
    <section className="bg-border-dark px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-[2rem] italic text-white">
          Want this for your products?
        </h2>
        <p className="mt-4 text-white/60">
          We'll integrate the interactive toggle experience into your website
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/studio/order"
            className="rounded-full bg-ikea-blue px-8 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:bg-[#004A8C] dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-[#D97706]"
          >
            Get Started
          </Link>
          <a
            href="mailto:hello@karlsljus.studio"
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}

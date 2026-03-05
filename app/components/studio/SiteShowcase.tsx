import { Link } from "react-router";
import { products } from "../../data/products";
import { fireplaces } from "../../data/fireplaces";
import { outdoor } from "../../data/outdoor";

const categories = [
  {
    to: "/lamps",
    name: "Lamps",
    count: products.length,
    product: products[0],
  },
  {
    to: "/fireplaces",
    name: "Fireplaces",
    count: fireplaces.length,
    product: fireplaces[0],
  },
  {
    to: "/outdoor",
    name: "Outdoor",
    count: outdoor.length,
    product: outdoor[0],
  },
];

interface SiteShowcaseProps {
  heading?: string;
  subtitle?: string;
}

export function SiteShowcase({
  heading = "Explore our collections",
  subtitle = "Collections",
}: SiteShowcaseProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="mb-2 text-center text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        {subtitle}
      </p>
      <h2 className="mb-10 text-center font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
        {heading}
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.to}
            to={category.to}
            className="group block overflow-hidden rounded-xl border border-border-light transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-border-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-surface-light dark:bg-surface-dark">
              <img
                src={category.product.thumbOff}
                alt={`${category.product.name} off`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 dark:opacity-0"
              />
              <img
                src={category.product.thumbOn}
                alt={`${category.product.name} on`}
                width={500}
                height={500}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 dark:opacity-100"
              />
            </div>
            <div className="border-t border-border-light bg-card-light px-4 pb-4 pt-3 transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
              <h3 className="font-display text-base italic leading-tight text-[#1C1917] dark:text-[#F5F0E8]">
                {category.name}
              </h3>
              <p className="mt-0.5 text-[0.8125rem] text-[#78716C] dark:text-[#A8A097]">
                {category.count} products
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
        ))}
      </div>
    </section>
  );
}

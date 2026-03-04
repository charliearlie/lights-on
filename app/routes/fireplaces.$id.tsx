import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { fireplaces } from "../data/fireplaces";
import { type Product } from "../data/products";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { Footer } from "../components/Footer";
import { useDarkMode } from "../context/dark-mode";

function getRelated(product: Product, all: Product[]): Product[] {
  const idx = all.findIndex((p) => p.id === product.id);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];
  const pool = all.filter(
    (p) => p.id !== product.id && p.id !== prev.id && p.id !== next.id,
  );
  const third = pool[idx % pool.length];
  return [prev, next, third];
}

export default function FireplaceDetailPage() {
  const { isDark } = useDarkMode();
  const { id } = useParams();
  const productId = Number(id);
  const product = fireplaces.find((p) => p.id === productId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
        <Header currentSection="fireplaces" />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <p className="font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
            Fireplace not found
          </p>
          <Link
            to="/fireplaces"
            className="mt-6 inline-block text-[0.75rem] font-medium uppercase tracking-[0.15em] text-[#78716C] transition-colors duration-150 hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
          >
            &larr; All fireplaces
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelated(product, fireplaces);

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header currentSection="fireplaces" />

      <main>
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/fireplaces"
            viewTransition
            className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-[#78716C] transition-colors duration-150 hover:text-[#1C1917] dark:text-[#A8A097] dark:hover:text-[#F5F0E8]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 2.5L4.5 7L9 11.5" />
            </svg>
            All fireplaces
          </Link>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:flex lg:items-start lg:gap-16 lg:px-8">
          <div className="w-full lg:sticky lg:top-27.5 lg:w-[52%]">
            <div data-vt-hero className="relative aspect-square overflow-hidden rounded-2xl bg-surface-light ring-1 ring-border-light dark:bg-surface-dark dark:ring-border-dark" style={{ viewTransitionName: "product-hero" }}>
              <img src={product.imageOff} alt={`${product.name} — unlit`} width={1024} height={1024} decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: isDark ? 0 : 1 }} />
              <img src={product.imageOn} alt={`${product.name} — lit`} width={1024} height={1024} decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: isDark ? 1 : 0 }} />
            </div>
          </div>

          <div className="w-full pt-8 lg:w-[48%] lg:pt-16" style={{ viewTransitionName: "product-info" }}>
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">Nordic Hearth</p>
            <h1 className="font-display mt-2 text-[2.5rem] italic leading-[1.05] tracking-tight text-[#1C1917] dark:text-[#F5F0E8] sm:text-[3.5rem] lg:text-[4rem]">{product.name}</h1>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-[#44403C] dark:text-[#C4BAB0]">{product.description}.</p>
            <div className="my-7 border-t border-border-light dark:border-border-dark" />
            <p className="text-[2.25rem] font-semibold text-ikea-blue dark:text-amber-glow" style={{ textShadow: isDark ? "0 0 16px rgba(245,158,11,0.4)" : "none", transition: "text-shadow 500ms ease" }}>&pound;{product.price}</p>
            <p className="mt-1.5 text-[0.8125rem] text-[#78716C] dark:text-[#A8A097]">Free delivery on orders over &pound;75</p>
            <div className="my-7 border-t border-border-light dark:border-border-dark" />
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full transition-all duration-500" style={{ backgroundColor: isDark ? "#F59E0B" : "#D4CFC8", boxShadow: isDark ? "0 0 6px 2px rgba(245,158,11,0.45)" : "none" }} aria-hidden="true" />
              <span className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[#78716C] dark:text-[#A8A097]">
                {isDark ? "Burning \u2014 warm hearth active" : "Unlit \u2014 toggle lights above"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border-light dark:border-border-dark">
          <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
            <p className="mb-5 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">More hearths</p>
            <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:pb-0">
              {related.map((p, i) => (
                <div key={p.id} className="min-w-[220px] sm:min-w-0">
                  <ProductCard product={p} index={i} linkPrefix="fireplaces" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

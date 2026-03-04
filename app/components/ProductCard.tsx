import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import type { Product } from "../data/products";
import { useDarkMode } from "../context/dark-mode";
import { setLastViewedProduct } from "../hooks/useLastViewedProduct";

interface ProductCardProps {
  product: Product;
  index: number;
  linkPrefix?: string;
  isActive?: boolean;
}

export function ProductCard({ product, index, linkPrefix = "lamps", isActive = false }: ProductCardProps) {
  const { isDark } = useDarkMode();
  const imageRef = useRef<HTMLDivElement>(null);
  // First row (4 cards) loads eagerly; rest are lazy
  const aboveFold = index < 4;

  useLayoutEffect(() => {
    if (isActive && imageRef.current) {
      imageRef.current.style.viewTransitionName = "product-hero";
      imageRef.current.setAttribute("data-vt-hero", "");
    }
  }, [isActive]);

  const handleClick = () => {
    setLastViewedProduct(product.id);
    if (imageRef.current) {
      // Clear any existing product-hero to avoid duplicate viewTransitionName
      const existing = document.querySelector<HTMLElement>("[data-vt-hero]");
      if (existing) {
        existing.style.viewTransitionName = "";
      }
      imageRef.current.style.viewTransitionName = "product-hero";
      imageRef.current.setAttribute("data-vt-hero", "");
    }
  };

  return (
    <Link to={`/${linkPrefix}/${product.id}`} viewTransition onClick={handleClick} className="group block overflow-hidden rounded-xl border border-border-light transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:border-border-dark dark:hover:shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_24px_rgba(245,158,11,0.08)]">
      {/* Image area — bg matches page surface so lamp backgrounds blend */}
      <div ref={imageRef} className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark" >
        <img
          src={product.thumbOff}
          alt={`${product.name} off`}
          width={500}
          height={500}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-500 dark:opacity-0"
          loading={aboveFold ? "eager" : "lazy"}
        />
        <img
          src={product.thumbOn}
          alt={`${product.name} on`}
          width={500}
          height={500}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 dark:opacity-100"
          loading="lazy"
        />
      </div>

      {/* Info section */}
      <div className="border-t border-border-light bg-card-light px-4 pb-4 pt-3 transition-colors duration-300 dark:border-border-dark dark:bg-card-dark"
        style={{
          borderBottomWidth: isDark ? "1px" : "0",
          borderBottomColor: isDark ? "rgba(245,158,11,0.25)" : "transparent",
        }}
      >
        <h3 className="font-display text-base italic leading-tight text-[#1C1917] dark:text-[#F5F0E8]">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[0.8125rem] text-[#78716C] dark:text-[#A8A097]">
          {product.description}
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <p
            className="text-base font-semibold text-ikea-blue dark:text-amber-glow"
            style={{
              textShadow: isDark
                ? "0 0 12px rgba(245,158,11,0.35)"
                : "none",
            }}
          >
            &pound;{product.price}
          </p>
          <span className="flex items-center gap-0.5 text-xs font-medium text-[#78716C] opacity-0 transition-all duration-150 group-hover:opacity-100 dark:text-[#A8A097]">
            View
            <svg
              className="-translate-x-1 transition-transform duration-150 group-hover:translate-x-0"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4.5 2.5L8 6L4.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

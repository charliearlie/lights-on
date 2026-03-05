import { useEffect, useState } from "react";
import { outdoor } from "../data/outdoor";
import { ProductCard } from "./ProductCard";
import { getLastViewedProduct, clearLastViewedProduct } from "../hooks/useLastViewedProduct";

export function OutdoorGrid() {
  const [activeId] = useState(() => getLastViewedProduct());

  useEffect(() => {
    if (activeId !== null) {
      const t = setTimeout(clearLastViewedProduct, 600);
      return () => clearTimeout(t);
    }
  }, [activeId]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero section */}
      <section className="pb-2 pt-10 text-center sm:pb-4 sm:pt-14">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Karls Ljus Showcase&ensp;&middot;&ensp;Powered by Camber AI
        </p>
        <h2 className="font-display mt-2 text-[2rem] italic leading-[1.15] text-[#1C1917] dark:text-[#F5F0E8] sm:text-[3.5rem]">
          Uteljus
        </h2>
        <p className="mt-1 text-[1.1rem] text-[#78716C] dark:text-[#A8A097]">
          Sixteen lights. One switch.
        </p>
      </section>

      {/* Product grid */}
      <div className="py-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {outdoor.map((product, index) => {
            const isActive = activeId === product.id;
            const stagger = activeId !== null && !isActive;
            return (
              <div
                key={product.id}
                className={stagger ? "product-card-wrapper" : undefined}
                style={stagger ? ({ "--i": index } as React.CSSProperties) : undefined}
              >
                <ProductCard
                  product={product}
                  index={index}
                  linkPrefix="outdoor"
                  isActive={isActive}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

import { products } from "../data/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  isDark: boolean;
}

export function ProductGrid({ isDark }: ProductGridProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero section */}
      <section className="pb-2 pt-10 text-center sm:pb-4 sm:pt-14">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Svensk Design&ensp;&middot;&ensp;Since 1943
        </p>
        <h2 className="font-display mt-2 text-[2rem] italic leading-[1.15] text-[#1C1917] dark:text-[#F5F0E8] sm:text-[3.5rem]">
          Illuminate
        </h2>
        <p className="mt-1 text-[1.1rem] text-[#78716C] dark:text-[#A8A097]">
          Sixteen lamps. One switch.
        </p>
      </section>

      {/* Product grid */}
      <div className="py-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

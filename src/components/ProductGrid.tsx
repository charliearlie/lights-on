import { products } from "../data/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  isDark: boolean;
}

export function ProductGrid({ isDark }: ProductGridProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} isDark={isDark} />
        ))}
      </div>
    </main>
  );
}

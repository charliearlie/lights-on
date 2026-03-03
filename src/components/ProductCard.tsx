import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
  isDark: boolean;
}

export function ProductCard({ product, isDark }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg bg-card-light shadow-sm transition-all duration-300 hover:shadow-md dark:bg-card-dark">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imageOff}
          alt={`${product.name} off`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: isDark ? 0 : 1 }}
        />
        <img
          src={product.imageOn}
          alt={`${product.name} on`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: isDark ? 1 : 0 }}
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm font-bold tracking-wide text-gray-900 dark:text-white sm:text-base">
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
          {product.description}
        </p>
        <p className="mt-2 text-base font-bold text-ikea-blue dark:text-ikea-yellow sm:text-lg">
          ${product.price}
        </p>
      </div>
    </div>
  );
}

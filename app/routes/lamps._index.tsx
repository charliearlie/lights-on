import { Header } from "../components/Header";
import { ProductGrid } from "../components/ProductGrid";
import { Footer } from "../components/Footer";

export default function LampsPage() {
  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header currentSection="lamps" />
      <ProductGrid />
      <Footer />
    </div>
  );
}

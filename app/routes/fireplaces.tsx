import { Header } from "../components/Header";
import { FireplaceGrid } from "../components/FireplaceGrid";
import { Footer } from "../components/Footer";

export default function FireplacesPage() {
  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header currentSection="fireplaces" />
      <FireplaceGrid />
      <Footer />
    </div>
  );
}

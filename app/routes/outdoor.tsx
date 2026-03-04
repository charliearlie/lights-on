import { Header } from "../components/Header";
import { OutdoorGrid } from "../components/OutdoorGrid";
import { Footer } from "../components/Footer";

export default function OutdoorPage() {
  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header currentSection="outdoor" />
      <OutdoorGrid />
      <Footer />
    </div>
  );
}

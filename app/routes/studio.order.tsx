import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function StudioOrderPage() {
  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          Place an Order
        </p>
        <h1 className="font-display text-4xl italic text-[#1C1917] dark:text-[#F5F0E8]">
          Choose your package
        </h1>
        <p className="mt-4 text-lg text-[#78716C] dark:text-[#A8A097]">
          Select a package and upload your product images to get started. Coming
          soon.
        </p>
      </main>
      <Footer />
    </div>
  );
}

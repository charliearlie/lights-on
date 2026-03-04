import { useParams } from "react-router";

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Project
      </p>
      <h1 className="font-display text-4xl italic text-[#1C1917] dark:text-[#F5F0E8]">
        Project editor
      </h1>
      <p className="mt-4 text-lg text-[#78716C] dark:text-[#A8A097]">
        Upload images, configure states, and preview your interactive toggle.
        Project ID: {id}. Coming soon.
      </p>
    </main>
  );
}

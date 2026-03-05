export function Footer() {
  return (
    <footer className="border-t border-border-light px-4 py-8 transition-colors duration-300 dark:border-border-dark sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
            Camber AI
          </p>
          <p className="text-xs text-[#78716C] dark:text-[#A8A097]">
            &copy; 2026
          </p>
        </div>
        <p className="mt-3 text-center text-[0.6875rem] text-[#78716C]/60 dark:text-[#A8A097]/60">
          Built by Camber AI&ensp;&middot;&ensp;Product images generated with AI
        </p>
      </div>
    </footer>
  );
}

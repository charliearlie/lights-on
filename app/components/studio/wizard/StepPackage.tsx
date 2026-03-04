import { studioPackages } from "../../../data/studio-packages";
import { PricingCards } from "../PricingCards";

interface StepPackageProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
}

export function StepPackage({
  selectedId,
  onSelect,
  onContinue,
}: StepPackageProps) {
  const isEnterprise = selectedId === "enterprise";

  return (
    <div>
      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Step 1
      </p>
      <h2 className="font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
        Choose your package
      </h2>

      <div className="mt-8">
        <PricingCards
          packages={studioPackages}
          mode="select"
          selectedId={selectedId ?? undefined}
          onSelect={onSelect}
        />
      </div>

      <div className="mt-8 flex justify-end">
        {isEnterprise ? (
          <p className="text-sm text-[#44403C] dark:text-[#C4BAB0]">
            For enterprise enquiries, please contact us at{" "}
            <a
              href="mailto:hello@illuminate.studio"
              className="font-medium text-ikea-blue underline dark:text-amber-glow"
            >
              hello@illuminate.studio
            </a>
          </p>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            disabled={!selectedId}
            className="rounded-lg bg-ikea-blue px-6 py-3 font-medium text-white transition-colors hover:bg-ikea-blue/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-amber-glow/90"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

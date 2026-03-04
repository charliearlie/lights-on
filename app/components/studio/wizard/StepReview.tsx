import { studioPackages } from "../../../data/studio-packages";

interface StepReviewProps {
  packageId: string;
  email: string;
  name: string;
  brief: string;
  files: File[];
  sendLater: boolean;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepReview({
  packageId,
  email,
  name,
  brief,
  files,
  sendLater,
  onBack,
  onSubmit,
  isSubmitting,
}: StepReviewProps) {
  const pkg = studioPackages.find((p) => p.id === packageId);
  const briefExcerpt =
    brief.length > 100 ? `${brief.slice(0, 100)}...` : brief;

  return (
    <div>
      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Step 4
      </p>
      <h2 className="font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
        Review your order
      </h2>

      {/* Summary card */}
      <div className="mt-8 rounded-lg border border-border-light bg-white p-6 dark:border-border-dark dark:bg-card-dark">
        <div className="space-y-4">
          {/* Package */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                Package
              </p>
              <p className="mt-0.5 text-lg font-medium text-[#1C1917] dark:text-[#F5F0E8]">
                {pkg?.name ?? packageId}
              </p>
            </div>
            <p className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F0E8]">
              {pkg?.priceLabel}
            </p>
          </div>

          <hr className="border-border-light dark:border-border-dark" />

          {/* Customer */}
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
              Customer
            </p>
            <p className="mt-0.5 text-[#1C1917] dark:text-[#F5F0E8]">{name}</p>
            <p className="text-sm text-[#44403C] dark:text-[#C4BAB0]">
              {email}
            </p>
          </div>

          {/* Brief */}
          {brief && (
            <>
              <hr className="border-border-light dark:border-border-dark" />
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
                  Brief
                </p>
                <p className="mt-0.5 text-sm text-[#44403C] dark:text-[#C4BAB0]">
                  {briefExcerpt}
                </p>
              </div>
            </>
          )}

          <hr className="border-border-light dark:border-border-dark" />

          {/* Images */}
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
              Images
            </p>
            <p className="mt-0.5 text-sm text-[#44403C] dark:text-[#C4BAB0]">
              {sendLater
                ? "Will send later"
                : `${files.length} image${files.length === 1 ? "" : "s"} uploaded`}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-lg border border-border-light px-6 py-3 font-medium text-[#44403C] transition-colors hover:bg-[#F7F5F2] disabled:cursor-not-allowed disabled:opacity-40 dark:border-border-dark dark:text-[#C4BAB0] dark:hover:bg-card-dark"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-ikea-blue px-6 py-3 font-medium text-white transition-colors hover:bg-ikea-blue/90 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-amber-glow/90"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            `Place Order \u2014 ${pkg?.priceLabel}`
          )}
        </button>
      </div>
    </div>
  );
}

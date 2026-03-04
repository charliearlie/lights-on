const steps = ["Package", "Details", "Upload", "Review"];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={label} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors duration-300 ${
                  isCompleted
                    ? "border-ikea-blue bg-ikea-blue text-white dark:border-amber-glow dark:bg-amber-glow"
                    : isCurrent
                      ? "border-ikea-blue text-ikea-blue dark:border-amber-glow dark:text-amber-glow"
                      : "border-[#D6D3D1] text-[#78716C] dark:border-[#44403C] dark:text-[#78716C]"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`mt-1.5 hidden text-[0.625rem] font-medium uppercase tracking-[0.15em] sm:block ${
                  isCompleted || isCurrent
                    ? "text-ikea-blue dark:text-amber-glow"
                    : "text-[#78716C] dark:text-[#78716C]"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 sm:mx-3 sm:w-12 transition-colors duration-300 ${
                  stepNum < currentStep
                    ? "bg-ikea-blue dark:bg-amber-glow"
                    : "bg-[#D6D3D1] dark:bg-[#44403C]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

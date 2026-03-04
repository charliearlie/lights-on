interface StepDetailsProps {
  email: string;
  name: string;
  brief: string;
  onChange: (field: "email" | "name" | "brief", value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const inputClass =
  "w-full rounded-lg border border-border-light bg-white px-4 py-3 text-[#1C1917] placeholder:text-[#78716C]/50 dark:border-border-dark dark:bg-card-dark dark:text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-ikea-blue/30 dark:focus:ring-amber-glow/30 transition-colors duration-300";

const labelClass =
  "mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]";

export function StepDetails({
  email,
  name,
  brief,
  onChange,
  onBack,
  onContinue,
}: StepDetailsProps) {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canContinue = isValidEmail && name.trim().length > 0;

  return (
    <div>
      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
        Step 2
      </p>
      <h2 className="font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
        Your details
      </h2>

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="order-email" className={labelClass}>
            Email
          </label>
          <input
            id="order-email"
            type="email"
            required
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="order-name" className={labelClass}>
            Name
          </label>
          <input
            id="order-name"
            type="text"
            required
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Your full name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="order-brief" className={labelClass}>
            Brief
          </label>
          <textarea
            id="order-brief"
            value={brief}
            onChange={(e) => onChange("brief", e.target.value)}
            placeholder="Tell us about your products and what you'd like to achieve..."
            rows={4}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border-light px-6 py-3 font-medium text-[#44403C] transition-colors hover:bg-[#F7F5F2] dark:border-border-dark dark:text-[#C4BAB0] dark:hover:bg-card-dark"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="rounded-lg bg-ikea-blue px-6 py-3 font-medium text-white transition-colors hover:bg-ikea-blue/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-amber-glow/90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

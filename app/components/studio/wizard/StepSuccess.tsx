import { Link } from "react-router";

interface StepSuccessProps {
  orderId: string | null;
  email: string;
}

export function StepSuccess({ orderId, email }: StepSuccessProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      {/* Green checkmark */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <svg
          className="h-8 w-8 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="font-display text-[2rem] italic text-[#1C1917] dark:text-[#F5F0E8]">
        Order confirmed!
      </h2>

      <p className="mt-4 max-w-md text-[#44403C] dark:text-[#C4BAB0]">
        Thank you for your order. We'll be in touch at{" "}
        <span className="font-medium text-[#1C1917] dark:text-[#F5F0E8]">
          {email}
        </span>{" "}
        within 24 hours to get started.
      </p>

      {orderId && (
        <p className="mt-4 text-sm text-[#78716C] dark:text-[#A8A097]">
          Order reference:{" "}
          <code className="rounded bg-[#F7F5F2] px-2 py-0.5 font-mono text-xs text-[#44403C] dark:bg-card-dark dark:text-[#C4BAB0]">
            {orderId}
          </code>
        </p>
      )}

      <Link
        to="/"
        className="mt-8 rounded-lg bg-ikea-blue px-6 py-3 font-medium text-white transition-colors hover:bg-ikea-blue/90 dark:bg-amber-glow dark:text-[#1C1917] dark:hover:bg-amber-glow/90"
      >
        Back to Home
      </Link>
    </div>
  );
}

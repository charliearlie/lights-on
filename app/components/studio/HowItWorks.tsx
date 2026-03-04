export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#78716C] dark:text-[#A8A097]">
          How It Works
        </p>
        <h2 className="font-display text-[2.5rem] italic leading-[1.15] text-[#1C1917] sm:text-[3rem] dark:text-[#F5F0E8]">
          Three steps to a showroom on every product page
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#78716C] dark:text-[#A8A097]">
          No new platform to learn. No months-long integration. Your products,
          transformed and live.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {/* ── Step 1 ── */}
          <Step
            number="01"
            title="Send us your photos"
            description="Share your existing product images — any format, any lighting condition. No special equipment or reshoots required."
            outcome="You keep your current photography workflow."
            visual={<UploadVisual />}
          />

          {/* ── Step 2 ── */}
          <Step
            number="02"
            title="AI generates every state"
            description="Our models produce photorealistic alternate states for each product: lights on, lights off, day, night, seasonal. Every variant is consistent and brand-accurate."
            outcome="Days of retouching replaced by hours of AI generation."
            visual={<TransformVisual />}
          />

          {/* ── Step 3 ── */}
          <Step
            number="03"
            title="Live on your site, your way"
            description="We deliver a fully integrated toggle experience for your existing product pages. Visitors switch between states with a single tap — no page reload."
            outcome="Higher engagement. Longer dwell time. More conversions."
            visual={<EmbedVisual />}
          />
        </div>
      </div>

      {/* Bottom proof line */}
      <div className="mt-20 flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-border-light dark:bg-border-dark" />
        <p className="shrink-0 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-[#78716C] dark:text-[#A8A097]">
          Typical turnaround&ensp;&middot;&ensp;5–7 business days
        </p>
        <div className="h-px flex-1 bg-border-light dark:bg-border-dark" />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Step card
───────────────────────────────────────────── */

interface StepProps {
  number: string;
  title: string;
  description: string;
  outcome: string;
  visual: React.ReactNode;
}

function Step({ number, title, description, outcome, visual }: StepProps) {
  return (
    <div className="flex flex-col">
      {/* Number */}
      <div className="mb-8 flex items-center gap-4 sm:flex-col sm:items-start sm:gap-0">
        <div className="flex items-baseline gap-4 sm:flex-col sm:gap-2">
          <span
            className="font-display text-[4.5rem] italic leading-none text-ikea-blue opacity-15 sm:text-[5.5rem] dark:text-amber-glow dark:opacity-30"
            aria-hidden="true"
          >
            {number}
          </span>
          <h3 className="font-display text-[1.375rem] italic leading-snug text-[#1C1917] sm:text-[1.25rem] dark:text-[#F5F0E8]">
            {title}
          </h3>
        </div>
      </div>

      {/* Visual */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border-light bg-card-light transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
        {visual}
      </div>

      {/* Copy */}
      <p className="text-sm leading-relaxed text-[#44403C] dark:text-[#C4BAB0]">
        {description}
      </p>

      {/* Outcome — the "so what" line */}
      <p className="mt-3 flex items-start gap-2 text-[0.75rem] font-medium text-[#78716C] dark:text-[#A8A097]">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-px h-3.5 w-3.5 shrink-0 text-ikea-blue dark:text-amber-glow"
        >
          <path d="M3 8.5L6 11.5L13 4.5" />
        </svg>
        {outcome}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step 1 visual — file upload suggestion
───────────────────────────────────────────── */

function UploadVisual() {
  return (
    <div
      className="flex h-40 flex-col items-center justify-center gap-3 px-6"
      aria-hidden="true"
    >
      {/* Stacked file cards to suggest a batch upload */}
      <div className="relative h-20 w-28">
        {/* Back card */}
        <div className="absolute bottom-0 left-1/2 h-16 w-20 -translate-x-1/2 rotate-[-6deg] rounded-lg border border-border-light bg-[#F7F5F2] shadow-sm dark:border-border-dark dark:bg-[#0D0C0B]" />
        {/* Mid card */}
        <div className="absolute bottom-0 left-1/2 h-16 w-20 -translate-x-1/2 rotate-[2deg] rounded-lg border border-border-light bg-[#F7F5F2] shadow-sm dark:border-border-dark dark:bg-[#0D0C0B]" />
        {/* Front card — has a faint image icon */}
        <div className="absolute bottom-0 left-1/2 flex h-16 w-20 -translate-x-1/2 items-center justify-center rounded-lg border border-border-light bg-card-light shadow-md dark:border-border-dark dark:bg-card-dark">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-[#C4BAB0] dark:text-[#44403C]"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      </div>
      {/* Upload arrow */}
      <div className="flex flex-col items-center gap-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-ikea-blue dark:text-amber-glow"
        >
          <path d="M12 15V3m0 0l-4 4m4-4l4 4" />
          <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
        </svg>
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-[#A8A097] dark:text-[#78716C]">
          Any format
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step 2 visual — before/after toggle hint
   This is the core product concept made tangible
───────────────────────────────────────────── */

function TransformVisual() {
  return (
    <div className="h-40 overflow-hidden" aria-hidden="true">
      <div className="flex h-full">
        {/* OFF state — light side */}
        <div className="relative flex flex-1 flex-col items-center justify-center bg-[#F7F5F2] dark:bg-[#141410]">
          {/* Lamp silhouette OFF */}
          <LampSilhouette lit={false} />
          <span className="absolute bottom-3 left-0 right-0 text-center text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[#A8A097]">
            Off
          </span>
        </div>

        {/* Divider with arrows to suggest the transform */}
        <div className="relative z-10 flex w-10 shrink-0 flex-col items-center justify-center gap-1 bg-card-light dark:bg-card-dark">
          <div className="absolute inset-y-0 left-0 w-px bg-border-light dark:bg-border-dark" />
          <div className="absolute inset-y-0 right-0 w-px bg-border-light dark:bg-border-dark" />
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-ikea-blue dark:text-amber-glow"
          >
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 rotate-180 text-ikea-blue dark:text-amber-glow"
          >
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
        </div>

        {/* ON state — dark side with warm glow */}
        <div className="relative flex flex-1 flex-col items-center justify-center bg-[#1C1610] dark:bg-[#0D0A06]">
          {/* Glow bloom behind lamp */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-[#F59E0B] opacity-20 blur-2xl" />
          </div>
          <LampSilhouette lit={true} />
          <span className="absolute bottom-3 left-0 right-0 text-center text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[#A8A097]">
            On
          </span>
        </div>
      </div>
    </div>
  );
}

/* Simple lamp silhouette — pure SVG, no image dependency */
function LampSilhouette({ lit }: { lit: boolean }) {
  return (
    <svg
      viewBox="0 0 48 64"
      fill="none"
      className="relative z-10 h-16 w-12"
      aria-hidden="true"
    >
      {/* Shade */}
      <path
        d="M12 22L18 8h12l6 14H12z"
        fill={lit ? "#F59E0B" : "none"}
        stroke={lit ? "#F59E0B" : "#6B7280"}
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity={lit ? 0.9 : 0.5}
      />
      {/* Stem */}
      <line
        x1="24"
        y1="22"
        x2="24"
        y2="48"
        stroke={lit ? "#D97706" : "#6B7280"}
        strokeWidth="1.5"
        opacity={lit ? 0.8 : 0.4}
      />
      {/* Base */}
      <path
        d="M16 48h16l2 6H14l2-6z"
        fill={lit ? "#92400E" : "none"}
        stroke={lit ? "#D97706" : "#6B7280"}
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity={lit ? 0.7 : 0.4}
      />
      {/* Glow rays — only when lit */}
      {lit && (
        <>
          <line
            x1="24"
            y1="6"
            x2="24"
            y2="2"
            stroke="#FCD34D"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <line
            x1="34"
            y1="10"
            x2="36"
            y2="7"
            stroke="#FCD34D"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <line
            x1="14"
            y1="10"
            x2="12"
            y2="7"
            stroke="#FCD34D"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Step 3 visual — browser embed mockup
───────────────────────────────────────────── */

function EmbedVisual() {
  return (
    <div
      className="flex h-40 flex-col items-center justify-center px-5 py-4"
      aria-hidden="true"
    >
      {/* Browser chrome mockup */}
      <div className="w-full max-w-[220px] overflow-hidden rounded-lg border border-border-light shadow-sm dark:border-border-dark">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 border-b border-border-light bg-[#F7F5F2] px-3 py-2 dark:border-border-dark dark:bg-[#1A1915]">
          <div className="h-2 w-2 rounded-full bg-[#E8E3DC] dark:bg-[#2A2720]" />
          <div className="h-2 w-2 rounded-full bg-[#E8E3DC] dark:bg-[#2A2720]" />
          <div className="h-2 w-2 rounded-full bg-[#E8E3DC] dark:bg-[#2A2720]" />
          <div className="ml-2 h-2 flex-1 rounded-sm bg-[#E8E3DC] dark:bg-[#2A2720]" />
        </div>

        {/* Page content mockup */}
        <div className="flex gap-3 bg-card-light p-3 dark:bg-card-dark">
          {/* Product image area with glow hint */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#1C1610]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-[#F59E0B] opacity-30 blur-lg" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 32" fill="none" className="h-8 w-6">
                <path
                  d="M5 12L8 4h8l3 8H5z"
                  fill="#F59E0B"
                  stroke="#F59E0B"
                  strokeWidth="0.75"
                  opacity="0.8"
                />
                <line
                  x1="12"
                  y1="12"
                  x2="12"
                  y2="24"
                  stroke="#D97706"
                  strokeWidth="1"
                />
                <path
                  d="M7 24h10l1 3H6l1-3z"
                  fill="#92400E"
                  stroke="#D97706"
                  strokeWidth="0.75"
                />
              </svg>
            </div>
          </div>

          {/* Text + toggle area */}
          <div className="flex flex-1 flex-col justify-between">
            <div className="space-y-1.5">
              <div className="h-2 w-20 rounded-sm bg-[#E8E3DC] dark:bg-[#2A2720]" />
              <div className="h-2 w-14 rounded-sm bg-[#E8E3DC] dark:bg-[#2A2720]" />
            </div>

            {/* Toggle pill */}
            <div className="flex items-center gap-1.5">
              <span className="text-[0.5rem] font-medium uppercase tracking-wide text-[#78716C] dark:text-[#A8A097]">
                Off
              </span>
              <div className="relative h-3.5 w-6 rounded-full bg-ikea-blue dark:bg-amber-glow">
                <div className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-white" />
              </div>
              <span className="text-[0.5rem] font-medium uppercase tracking-wide text-ikea-blue dark:text-amber-glow">
                On
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-[#A8A097] dark:text-[#78716C]">
        Your existing product page
      </p>
    </div>
  );
}

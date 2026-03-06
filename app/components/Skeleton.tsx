// ---------------------------------------------------------------------------
// Skeleton loading primitives
// ---------------------------------------------------------------------------

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const base =
  "animate-pulse rounded bg-[#E7E5E4] dark:bg-[#292524]";

export function SkeletonRect({
  className,
}: {
  className?: string;
}) {
  return <div className={cx(base, className)} />;
}

export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cx("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cx(base, "h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-lg border border-border-light dark:border-border-dark",
        className,
      )}
    >
      <div className={cx(base, "aspect-square w-full rounded-none")} />
      <div className="p-4 space-y-2">
        <div className={cx(base, "h-4 w-3/4")} />
        <div className={cx(base, "h-3 w-1/2")} />
      </div>
    </div>
  );
}

export function SkeletonProjectCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
      <div className={cx(base, "aspect-[4/3] w-full rounded-none")} />
      <div className="p-4 space-y-2">
        <div className={cx(base, "h-4 w-2/3")} />
        <div className="flex items-center gap-2">
          <div className={cx(base, "h-3 w-16")} />
          <div className={cx(base, "h-3 w-20")} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSettingsSection() {
  return (
    <div className="rounded-xl border border-border-light bg-card-light p-6 dark:border-border-dark dark:bg-card-dark">
      <div className={cx(base, "mb-5 h-3 w-20")} />
      <div className="space-y-4">
        <div className={cx(base, "h-4 w-32")} />
        <div className={cx(base, "h-10 w-full max-w-xs")} />
      </div>
    </div>
  );
}

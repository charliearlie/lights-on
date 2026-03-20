// ---------------------------------------------------------------------------
// In-memory sliding window rate limiter (server-only)
//
// NOTE: This is a best-effort guard. Under serverless (Netlify Functions),
// each cold start gets a fresh Map, so limits are per-instance, not global.
// The real backstop is the per-user usage quota checked against the database.
// For stricter rate limiting at scale, swap to Redis/Upstash.
// ---------------------------------------------------------------------------

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per window
const CLEANUP_INTERVAL_MS = 5 * 60_000; // clean stale entries every 5 min

// Periodic cleanup of expired entries
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  // Allow process to exit without waiting for this timer
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a request should be rate-limited.
 * Returns `{ allowed: true }` or `{ allowed: false, retryAfterSeconds }`.
 */
export function checkRateLimit(userId: string, prefix?: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  ensureCleanup();

  const storeKey = prefix ? `${prefix}${userId}` : userId;
  const now = Date.now();
  let entry = store.get(storeKey);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(storeKey, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldestInWindow);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase browser client — uses publishable (anon) key
// ---------------------------------------------------------------------------

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (_client) return _client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables",
    );
  }

  _client = createClient(url, key);
  return _client;
}

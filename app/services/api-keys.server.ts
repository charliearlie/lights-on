import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "./supabase.server";

/**
 * Validate an API key and return the associated user ID.
 * Returns null if the key is invalid or inactive.
 */
export async function validateApiKey(
  key: string,
): Promise<{ userId: string } | null> {
  if (!key.startsWith("cmb_")) return null;

  const hash = createHash("sha256").update(key).digest("hex");
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", hash)
    .eq("is_active", true)
    .single() as { data: { user_id: string } | null; error: unknown };

  if (error || !data) return null;

  // Update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() } as never)
    .eq("key_hash", hash)
    .then();

  return { userId: data.user_id };
}

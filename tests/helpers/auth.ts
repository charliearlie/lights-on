import { createClient } from "@supabase/supabase-js";
import type { BrowserContext } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;

// Extract project ref from URL (e.g., "https://abcdefgh.supabase.co" -> "abcdefgh")
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function createTestUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // If user already exists from a previous failed run, look them up
  if (error && error.message.includes("already been registered")) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (!existing) throw error;

    await supabaseAdmin.from("profiles").upsert({
      id: existing.id,
      display_name: "Test User",
      plan: "free",
      transformations_used: 0,
      transformations_limit: 5,
    });

    return existing;
  }

  // "Database error creating new user" can happen when a DB trigger fails
  // (e.g. stale profile row). Clean up and retry once.
  if (error && error.message.includes("Database error")) {
    // Try to find and delete the partially-created user
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) {
      await deleteTestUser(existing.id);
    }

    // Retry creation
    const { data: retryData, error: retryError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (retryError) throw retryError;

    await supabaseAdmin.from("profiles").upsert({
      id: retryData.user.id,
      display_name: "Test User",
      plan: "free",
      transformations_used: 0,
      transformations_limit: 5,
    });

    return retryData.user;
  }

  if (error) throw error;

  // Ensure profile row exists
  await supabaseAdmin.from("profiles").upsert({
    id: data.user.id,
    display_name: "Test User",
    plan: "free",
    transformations_used: 0,
    transformations_limit: 5,
  });

  return data.user;
}

export async function getTestSession(email: string, password: string) {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session!;
}

export async function authenticateContext(
  context: BrowserContext,
  email: string,
  password: string
) {
  const session = await getTestSession(email, password);

  // @supabase/ssr stores session as chunked cookies
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionPayload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: "bearer",
    type: "access",
  });

  // Chunk into cookies (max 3500 bytes per cookie)
  const CHUNK_SIZE = 3500;
  const chunks: string[] = [];
  for (let i = 0; i < sessionPayload.length; i += CHUNK_SIZE) {
    chunks.push(sessionPayload.slice(i, i + CHUNK_SIZE));
  }

  const cookies = chunks.map((chunk, index) => ({
    name: chunks.length === 1 ? cookieName : `${cookieName}.${index}`,
    value: chunk,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
  }));

  await context.addCookies(cookies);
  return session;
}

export async function deleteTestUser(userId: string) {
  if (!userId) return;
  try {
    await supabaseAdmin.from("transformations").delete().eq("user_id", userId);
    await supabaseAdmin.from("service_orders").delete().eq("user_id", userId);
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("user_id", userId);
    if (projects) {
      for (const project of projects) {
        await supabaseAdmin
          .from("image_states")
          .delete()
          .eq("project_id", project.id);
      }
    }
    await supabaseAdmin.from("projects").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch {
    // Best-effort cleanup — don't fail tests on teardown errors
  }
}

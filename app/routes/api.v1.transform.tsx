import type { Route } from "./+types/api.v1.transform";
import { validateApiKey } from "../services/api-keys.server";
import { checkRateLimit } from "../services/rate-limiter.server";
import { getSupabaseAdmin } from "../services/supabase.server";
import { freeformTransform } from "../services/external-transform.server";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PROMPT_LENGTH = 2000;

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Extract API key from Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer cmb_")) {
    return Response.json(
      { error: "Missing or invalid API key. Use Authorization: Bearer cmb_..." },
      { status: 401 },
    );
  }

  const key = authHeader.slice(7); // "Bearer ".length
  const auth = await validateApiKey(key);
  if (!auth) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Rate limit (separate bucket for external API)
  const rateLimit = checkRateLimit(auth.userId, "api:");
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  // Usage quota check
  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("transformations_used, transformations_limit")
    .eq("id", auth.userId)
    .single() as { data: { transformations_used: number; transformations_limit: number } | null };

  if (
    profile &&
    profile.transformations_used >= profile.transformations_limit
  ) {
    return Response.json(
      { error: "Usage limit reached. Upgrade your plan for more transformations." },
      { status: 429 },
    );
  }

  // Parse and validate request body
  let body: { imageDataUri?: unknown; prompt?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageDataUri, prompt } = body;

  if (!imageDataUri || typeof imageDataUri !== "string") {
    return Response.json({ error: "Missing or invalid imageDataUri" }, { status: 400 });
  }

  if (!imageDataUri.match(/^data:[^;]+;base64,.+$/)) {
    return Response.json({ error: "imageDataUri must be a valid base64 data URI" }, { status: 400 });
  }

  // Rough size check: base64 portion length * 0.75 ≈ decoded bytes
  const base64Part = imageDataUri.split(",")[1];
  if (base64Part && base64Part.length * 0.75 > MAX_IMAGE_SIZE) {
    return Response.json({ error: "Image exceeds 10MB limit" }, { status: 400 });
  }

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Missing or invalid prompt" }, { status: 400 });
  }

  if (prompt.length < 1 || prompt.length > MAX_PROMPT_LENGTH) {
    return Response.json(
      { error: `Prompt must be between 1 and ${MAX_PROMPT_LENGTH} characters` },
      { status: 400 },
    );
  }

  try {
    const result = await freeformTransform(imageDataUri, prompt);

    // Increment usage counter
    const { error: rpcError } = await supabaseAdmin.rpc(
      "increment_transformations" as never,
      { user_uuid: auth.userId } as never,
    );
    if (rpcError) console.error("Failed to increment transformations:", rpcError);

    return Response.json({
      imageDataUri: result.imageDataUri,
      mimeType: result.mimeType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transformation failed";
    console.error("External transform error:", message);
    return Response.json({ error: "Transformation failed" }, { status: 500 });
  }
}

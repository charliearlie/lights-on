import type { Route } from "./+types/api.transform";
import {
  transformImage,
  type TransformationType,
} from "../services/nano-banana.server";
import { getSupabaseAdmin } from "../services/supabase.server";

const VALID_TYPES: TransformationType[] = [
  "lights-on",
  "lights-off",
  "day-to-night",
  "night-to-day",
  "empty-to-staged",
  "plain-to-lifestyle",
];

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Check auth — expect Authorization header with Supabase JWT
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check usage limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("transformations_used, transformations_limit")
    .eq("id", user.id)
    .single();

  if (
    profile &&
    profile.transformations_used >= profile.transformations_limit
  ) {
    return Response.json(
      { error: "Usage limit reached. Upgrade your plan for more transformations." },
      { status: 429 },
    );
  }

  // Parse request body
  let body: { imageDataUri?: string; transformationType?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageDataUri, transformationType, context } = body;

  if (!imageDataUri || typeof imageDataUri !== "string") {
    return Response.json({ error: "Missing imageDataUri" }, { status: 400 });
  }

  if (
    !transformationType ||
    !VALID_TYPES.includes(transformationType as TransformationType)
  ) {
    return Response.json(
      { error: `Invalid transformationType. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const result = await transformImage(
      imageDataUri,
      transformationType as TransformationType,
      { context },
    );

    // Increment usage counter
    await supabase.rpc("increment_transformations", { user_uuid: user.id });

    return Response.json({
      imageDataUri: result.imageDataUri,
      mimeType: result.mimeType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transformation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

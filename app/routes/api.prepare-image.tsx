import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { prepareImage } from "../services/nano-banana.server";
import { checkRateLimit } from "../services/rate-limiter.server";

// ---------------------------------------------------------------------------
// Action — prepare an image with AI (free, no transform charge)
// ---------------------------------------------------------------------------

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: responseHeaders },
    );
  }

  // Rate limit check (per-user, 10 requests/minute)
  const rateLimit = checkRateLimit(user.id);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfterSeconds),
          ...Object.fromEntries(responseHeaders.entries()),
        },
      },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const preparePrompt = (formData.get("preparePrompt") as string) || "";

  if (!file) {
    return Response.json(
      { error: "Missing image file" },
      { status: 400, headers: responseHeaders },
    );
  }

  // Validate file type and size
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return Response.json(
      {
        error: `Invalid file type "${file.type}". Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      },
      { status: 400, headers: responseHeaders },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      {
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`,
      },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    // Convert file to base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/png";
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await prepareImage(dataUri, preparePrompt);

    return Response.json(
      {
        preparedImageDataUri: result.imageDataUri,
        preparedMimeType: result.mimeType,
      },
      { headers: responseHeaders },
    );
  } catch (err) {
    console.error("Prepare image error:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Image preparation failed",
      },
      { status: 500, headers: responseHeaders },
    );
  }
}

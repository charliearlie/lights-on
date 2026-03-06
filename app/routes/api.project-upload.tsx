import type { Route } from "./+types/api.project-upload";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { getSupabaseAdmin } from "../services/supabase.server";
import {
  transformImage,
  type TransformationType,
} from "../services/nano-banana.server";

// ---------------------------------------------------------------------------
// Valid transformation types
// ---------------------------------------------------------------------------

const VALID_TYPES: TransformationType[] = [
  "lights-on",
  "lights-off",
  "day-to-night",
  "night-to-day",
  "empty-to-staged",
  "plain-to-lifestyle",
];

// ---------------------------------------------------------------------------
// Action — upload source image, run AI transform, save results
// ---------------------------------------------------------------------------

export async function action({ request }: Route.ActionArgs) {
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

  // Check usage limits
  const adminSupabase = getSupabaseAdmin();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("transformations_used, transformations_limit")
    .eq("id", user.id)
    .single();

  if (profile && profile.transformations_used >= profile.transformations_limit) {
    return Response.json(
      {
        error:
          "Usage limit reached. Upgrade your plan for more transformations.",
      },
      { status: 429, headers: responseHeaders },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;
  const transformationType = formData.get("transformationType") as string;

  if (!file || !projectId || !transformationType) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400, headers: responseHeaders },
    );
  }

  // Validate file type and size
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return Response.json(
      { error: `Invalid file type "${file.type}". Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}` },
      { status: 400, headers: responseHeaders },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.` },
      { status: 400, headers: responseHeaders },
    );
  }

  // Verify project ownership
  const { data: projectOwnership } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!projectOwnership) {
    return Response.json(
      { error: "Project not found" },
      { status: 404, headers: responseHeaders },
    );
  }

  // Validate transformation type
  if (!VALID_TYPES.includes(transformationType as TransformationType)) {
    return Response.json(
      { error: "Invalid transformation type" },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    // Upload source image to Supabase Storage
    const fileExt = file.name.split(".").pop() || "png";
    const sourceFileName = `${user.id}/${projectId}/${crypto.randomUUID()}-source.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(sourceFileName, file);

    if (uploadError) {
      return Response.json(
        { error: "Failed to upload image" },
        { status: 500, headers: responseHeaders },
      );
    }

    const {
      data: { publicUrl: sourceUrl },
    } = supabase.storage.from("project-images").getPublicUrl(sourceFileName);

    // Convert file to base64 data URI for the transform API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/png";
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Call AI transform — returns { imageDataUri, mimeType }
    const result = await transformImage(
      dataUri,
      transformationType as TransformationType,
    );

    // Upload result image — strip data URI prefix to get raw base64
    const resultFileName = `${user.id}/${projectId}/${crypto.randomUUID()}-result.${fileExt}`;
    const resultBase64 = result.imageDataUri.replace(
      /^data:[^;]+;base64,/,
      "",
    );
    const resultBuffer = Buffer.from(resultBase64, "base64");

    const { error: resultUploadError } = await supabase.storage
      .from("project-images")
      .upload(resultFileName, resultBuffer, {
        contentType: result.mimeType,
      });

    if (resultUploadError) {
      return Response.json(
        { error: "Failed to upload result" },
        { status: 500, headers: responseHeaders },
      );
    }

    const {
      data: { publicUrl: resultUrl },
    } = supabase.storage.from("project-images").getPublicUrl(resultFileName);

    // Create image_states row
    const transformLabel = transformationType
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    const { data: imageState, error: stateError } = await adminSupabase
      .from("image_states")
      .insert({
        project_id: projectId,
        product_name: file.name.replace(/\.[^.]+$/, ""),
        states: [
          { label: "Original", image_url: sourceUrl },
          { label: transformLabel, image_url: resultUrl },
        ],
      })
      .select()
      .single();

    if (stateError) {
      return Response.json(
        { error: "Failed to save image state" },
        { status: 500, headers: responseHeaders },
      );
    }

    // Increment usage
    const { error: rpcError } = await adminSupabase.rpc("increment_transformations", {
      user_uuid: user.id,
    });
    if (rpcError) console.error("Failed to increment transformations:", rpcError);

    // Log transformation
    await adminSupabase.from("transformations").insert({
      user_id: user.id,
      project_id: projectId,
      source_image_url: sourceUrl,
      transformation_type: transformationType,
      status: "completed",
      result_image_url: resultUrl,
      completed_at: new Date().toISOString(),
    });

    return Response.json({ imageState }, { headers: responseHeaders });
  } catch (err) {
    console.error("Transform error:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Transformation failed",
      },
      { status: 500, headers: responseHeaders },
    );
  }
}

import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import { getSupabaseAdmin } from "../services/supabase.server";

// ---------------------------------------------------------------------------
// Action — save a prepared OFF / transformed ON image pair
// ---------------------------------------------------------------------------

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] || "png";
}

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

  let body: {
    projectId?: string;
    offImageDataUri?: string;
    offMimeType?: string;
    onImageDataUri?: string;
    onMimeType?: string;
    productName?: string;
    transformLabel?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: responseHeaders },
    );
  }

  const {
    projectId,
    offImageDataUri,
    offMimeType,
    onImageDataUri,
    onMimeType,
    productName,
    transformLabel,
  } = body;

  if (
    !projectId ||
    !offImageDataUri ||
    !offMimeType ||
    !onImageDataUri ||
    !onMimeType
  ) {
    return Response.json(
      { error: "Missing required fields" },
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

  try {
    // Upload OFF image to storage
    const offExt = mimeToExt(offMimeType);
    const offFileName = `${user.id}/${projectId}/${crypto.randomUUID()}-off.${offExt}`;
    const offBase64 = offImageDataUri.replace(/^data:[^;]+;base64,/, "");
    const offBuffer = Buffer.from(offBase64, "base64");

    const { error: offUploadErr } = await supabase.storage
      .from("project-images")
      .upload(offFileName, offBuffer, { contentType: offMimeType });

    if (offUploadErr) {
      return Response.json(
        { error: "Failed to upload off-state image" },
        { status: 500, headers: responseHeaders },
      );
    }

    const {
      data: { publicUrl: offUrl },
    } = supabase.storage.from("project-images").getPublicUrl(offFileName);

    // Upload ON image to storage
    const onExt = mimeToExt(onMimeType);
    const onFileName = `${user.id}/${projectId}/${crypto.randomUUID()}-on.${onExt}`;
    const onBase64 = onImageDataUri.replace(/^data:[^;]+;base64,/, "");
    const onBuffer = Buffer.from(onBase64, "base64");

    const { error: onUploadErr } = await supabase.storage
      .from("project-images")
      .upload(onFileName, onBuffer, { contentType: onMimeType });

    if (onUploadErr) {
      return Response.json(
        { error: "Failed to upload on-state image" },
        { status: 500, headers: responseHeaders },
      );
    }

    const {
      data: { publicUrl: onUrl },
    } = supabase.storage.from("project-images").getPublicUrl(onFileName);

    // Create image_states row
    const adminSupabase = getSupabaseAdmin();
    const { data: imageState, error: stateError } = await adminSupabase
      .from("image_states")
      .insert({
        project_id: projectId,
        product_name: productName || "Untitled",
        states: [
          { label: "Off", image_url: offUrl },
          { label: transformLabel || "On", image_url: onUrl },
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

    return Response.json({ imageState }, { headers: responseHeaders });
  } catch (err) {
    console.error("Save image pair error:", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Failed to save images",
      },
      { status: 500, headers: responseHeaders },
    );
  }
}

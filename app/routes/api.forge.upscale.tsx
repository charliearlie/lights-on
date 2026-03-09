import type { Route } from "./+types/api.forge.upscale";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import {
  upscaleImage,
  type UpscaleRequest,
} from "../lib/stadium-forge/generate.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Auth check
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response("Not Found", { status: 404, headers: responseHeaders });
  }

  // Admin check
  const adminId = process.env.ADMIN_USER_ID;
  if (!adminId || user.id !== adminId) {
    return new Response("Not Found", { status: 404, headers: responseHeaders });
  }

  try {
    const body = await request.json();

    const { imageBase64, stadiumName, ratio, targetResolution, model } =
      body as {
        imageBase64: string;
        stadiumName: string;
        ratio: string;
        targetResolution: string;
        model: string;
      };

    if (!imageBase64) {
      return Response.json(
        { error: "Missing image data" },
        { status: 400, headers: responseHeaders },
      );
    }

    const upscaleReq: UpscaleRequest = {
      imageBase64,
      stadiumName: stadiumName || "Stadium",
      ratio: ratio || "3:4",
      targetResolution: targetResolution || "4K",
      model: model || "gemini-3.1-flash-image-preview",
    };

    const result = await upscaleImage(upscaleReq);

    return Response.json(result, { headers: responseHeaders });
  } catch (e) {
    console.error("[StadiumForge] Upscale error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json(
      { error: message },
      { status: 500, headers: responseHeaders },
    );
  }
}

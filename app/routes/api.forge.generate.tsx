import type { Route } from "./+types/api.forge.generate";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import {
  generatePoster,
  type PosterRequest,
} from "../lib/stadium-forge/generate.server";
import type { StyleKey } from "../lib/stadium-forge/types";

const VALID_STYLES: StyleKey[] = ["bauhaus", "blueprint", "risograph", "midnight"];

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

    const {
      stadiumName,
      clubName,
      city,
      year,
      coords,
      primaryColor,
      accentColor,
      style,
      ratio,
      resolution,
      model,
      refImageBase64,
      refImageMimeType,
    } = body as {
      stadiumName: string;
      clubName: string;
      city: string;
      year: string;
      coords: string;
      primaryColor: string;
      accentColor: string;
      style: StyleKey;
      ratio: string;
      resolution: string;
      model: string;
      refImageBase64?: string;
      refImageMimeType?: string;
    };

    if (!stadiumName || !VALID_STYLES.includes(style)) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400, headers: responseHeaders },
      );
    }

    const posterReq: PosterRequest = {
      stadiumName,
      clubName,
      city,
      year,
      coords,
      primaryColor: primaryColor || "#C8102E",
      accentColor: accentColor || "#FFFFFF",
      style,
      ratio: ratio || "3:4",
      resolution: resolution || "2K",
      model: model || "gemini-3.1-flash-image-preview",
      refImageBase64,
      refImageMimeType,
    };

    const result = await generatePoster(posterReq);

    return Response.json(result, { headers: responseHeaders });
  } catch (e) {
    console.error("[StadiumForge] Generate error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json(
      { error: message },
      { status: 500, headers: responseHeaders },
    );
  }
}

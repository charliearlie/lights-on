import type { Route } from "./+types/api.forge.mockup";
import { createSupabaseServerClient } from "../services/supabase.ssr.server";
import {
  generateMockup,
  type MockupRequest,
} from "../lib/stadium-forge/generate.server";
import type { MockupType } from "../lib/stadium-forge/types";

const VALID_TYPES: MockupType[] = [
  "living-room",
  "bedroom",
  "detail",
  "gallery-wall",
  "desk",
];

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

    const { posterBase64, mockupType, stadiumName, model } = body as {
      posterBase64: string;
      mockupType: MockupType;
      stadiumName: string;
      model: string;
    };

    if (!posterBase64 || !VALID_TYPES.includes(mockupType)) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400, headers: responseHeaders },
      );
    }

    const mockupReq: MockupRequest = {
      posterBase64,
      mockupType,
      stadiumName: stadiumName || "Stadium",
      model: model || "gemini-3.1-flash-image-preview",
    };

    const result = await generateMockup(mockupReq);

    return Response.json(result, { headers: responseHeaders });
  } catch (e) {
    console.error("[StadiumForge] Mockup error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json(
      { error: message },
      { status: 500, headers: responseHeaders },
    );
  }
}

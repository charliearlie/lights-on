import { getSupabaseAdmin } from "../../services/supabase.server";
import { STYLES, MOCKUP_TYPES } from "./styles";
import { fmtSubtitle } from "./prompts";
import type { StyleKey, MockupType, PromptData } from "./types";

// ---------------------------------------------------------------------------
// Stadium Forge — server-side Gemini image generation
// Uses raw fetch (not SDK) to support imageConfig.aspectRatio & imageSize
// ---------------------------------------------------------------------------

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const STORAGE_BUCKET = "stadium-forge";

function getApiKey(): string {
  const key = process.env.NANO_BANANA_API_KEY;
  if (!key) throw new Error("NANO_BANANA_API_KEY is not set");
  return key;
}

// ---------------------------------------------------------------------------
// Poster generation
// ---------------------------------------------------------------------------

export interface PosterRequest {
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
}

export interface GenerateResult {
  imageDataUri: string;
  storageUrl: string | null;
}

export async function generatePoster(
  req: PosterRequest,
): Promise<GenerateResult> {
  const styleBuilder = STYLES[req.style];
  if (!styleBuilder) throw new Error(`Unknown style: ${req.style}`);

  const promptData: PromptData = {
    stadiumName: req.stadiumName,
    clubName: req.clubName || "Football Club",
    city: req.city || "England",
    subtitle: fmtSubtitle(req.clubName || "Football Club", req.city),
    year: req.year || "—",
    coords: req.coords || "",
    ratio: req.ratio || "3:4",
    primaryColor: req.primaryColor,
    accentColor: req.accentColor,
    hasRefImage: !!req.refImageBase64,
  };

  const prompt = styleBuilder.buildPrompt(promptData);

  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (req.refImageBase64) {
    parts.push({
      inlineData: {
        mimeType: req.refImageMimeType || "image/png",
        data: req.refImageBase64,
      },
    });
  }

  const imgData = await callGemini(req.model, parts, req.ratio, req.resolution);

  const imageDataUri = `data:image/png;base64,${imgData}`;

  // Upload to Supabase Storage
  const storageUrl = await uploadToStorage(
    `posters/${slug(req.stadiumName)}-${req.style}-${Date.now()}.png`,
    imgData,
  );

  return { imageDataUri, storageUrl };
}

// ---------------------------------------------------------------------------
// Mockup generation
// ---------------------------------------------------------------------------

export interface MockupRequest {
  posterBase64: string;
  mockupType: MockupType;
  stadiumName: string;
  model: string;
}

export async function generateMockup(
  req: MockupRequest,
): Promise<GenerateResult> {
  const mockupDef = MOCKUP_TYPES[req.mockupType];
  if (!mockupDef) throw new Error(`Unknown mockup type: ${req.mockupType}`);

  const prompt = mockupDef.prompt(req.stadiumName);

  const parts: Array<Record<string, unknown>> = [
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/png",
        data: req.posterBase64,
      },
    },
  ];

  const imgData = await callGemini(req.model, parts, "4:3", "2K");

  const imageDataUri = `data:image/png;base64,${imgData}`;

  const storageUrl = await uploadToStorage(
    `mockups/${slug(req.stadiumName)}-${req.mockupType}-${Date.now()}.png`,
    imgData,
  );

  return { imageDataUri, storageUrl };
}

// ---------------------------------------------------------------------------
// Upscale — send existing image back to Gemini at higher resolution
// ---------------------------------------------------------------------------

export interface UpscaleRequest {
  imageBase64: string;
  stadiumName: string;
  ratio: string;
  targetResolution: string;
  model: string;
}

export async function upscaleImage(
  req: UpscaleRequest,
): Promise<GenerateResult> {
  const prompt = `You are an image upscaler. Your ONLY job is to output this EXACT same image at higher resolution.

ABSOLUTE RULES — VIOLATING ANY OF THESE IS A FAILURE:
- The output must be IDENTICAL to the input in every way: same composition, same layout, same colours, same shapes, same text, same positions.
- Do NOT add anything: no streets, no surrounding area, no extra detail, no context, no background elements that aren't in the original.
- Do NOT remove anything.
- Do NOT reinterpret, reimagine, or "improve" the artwork in any way.
- Do NOT change the perspective, angle, or framing.
- Do NOT move, resize, or reposition any element.
- The stadium shape, stands, pitch, and all geometric elements must be EXACTLY as they appear in the input — same proportions, same angles, same asymmetries.
- All text must remain in the exact same position with the exact same content and styling.
- The background colour and all fill colours must remain identical.

Think of this as a mechanical resolution increase — like nearest-neighbour upscaling but with anti-aliasing. The output should be indistinguishable from the input except for being sharper and higher resolution.`;

  const parts: Array<Record<string, unknown>> = [
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/png",
        data: req.imageBase64,
      },
    },
  ];

  const imgData = await callGemini(
    req.model,
    parts,
    req.ratio,
    req.targetResolution,
  );

  const imageDataUri = `data:image/png;base64,${imgData}`;

  const storageUrl = await uploadToStorage(
    `posters/${slug(req.stadiumName)}-upscaled-${req.targetResolution}-${Date.now()}.png`,
    imgData,
  );

  return { imageDataUri, storageUrl };
}

// ---------------------------------------------------------------------------
// Gemini API call
// ---------------------------------------------------------------------------

async function callGemini(
  model: string,
  parts: Array<Record<string, unknown>>,
  aspectRatio: string,
  imageSize: string,
): Promise<string> {
  const apiKey = getApiKey();
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    const msg =
      (e as { error?: { message?: string } })?.error?.message ||
      `API error ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const resParts =
    (
      data as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              thought?: boolean;
              inlineData?: { data?: string; mimeType?: string };
              text?: string;
            }>;
          };
          finishReason?: string;
        }>;
      }
    )?.candidates?.[0]?.content?.parts || [];

  let imgData: string | null = null;
  let textOut = "";

  for (const p of resParts) {
    if (p.thought) continue;
    if (p.inlineData?.data) {
      imgData = p.inlineData.data;
      break;
    }
    if (p.text) textOut += p.text;
  }

  if (!imgData) {
    const reason =
      (data as { candidates?: Array<{ finishReason?: string }> })
        ?.candidates?.[0]?.finishReason || "unknown";
    throw new Error(
      `No image returned. Finish: ${reason}. Text: "${textOut.slice(0, 150)}".`,
    );
  }

  return imgData;
}

// ---------------------------------------------------------------------------
// Supabase Storage upload
// ---------------------------------------------------------------------------

async function uploadToStorage(
  path: string,
  base64Data: string,
): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(base64Data, "base64");

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error("[StadiumForge] Storage upload error:", error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return publicUrl;
  } catch (e) {
    console.error("[StadiumForge] Storage upload failed:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

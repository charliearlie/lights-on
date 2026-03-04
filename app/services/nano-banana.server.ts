import { GoogleGenAI } from "@google/genai";
import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// Nano Banana — server-side AI image transformation engine
// Uses Gemini 2.5 Flash Image (via @google/genai SDK)
// ---------------------------------------------------------------------------

let _ai: GoogleGenAI | null = null;

function ai(): GoogleGenAI {
  if (!_ai) {
    const key = process.env.NANO_BANANA_API_KEY;
    if (!key) throw new Error("NANO_BANANA_API_KEY is not set");
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TransformationType =
  | "lights-on"
  | "lights-off"
  | "day-to-night"
  | "night-to-day"
  | "empty-to-staged"
  | "plain-to-lifestyle";

export interface TransformOptions {
  /** Additional prompt context */
  context?: string;
  /** Gemini model override (default: gemini-2.5-flash-preview-image-generation) */
  model?: string;
}

export interface TransformResult {
  /** Base64 data URI of the transformed image */
  imageDataUri: string;
  /** MIME type of the output */
  mimeType: string;
}

// ---------------------------------------------------------------------------
// Prompt templates
// ---------------------------------------------------------------------------

const PROMPT_TEMPLATES: Record<TransformationType, string> = {
  "lights-on": `This is a product photo with the light/fire turned OFF. Generate a new image of this EXACT SAME product, but now turned ON.
Keep the design, angle, position, and composition identical.
Changes: The product should now emit a warm golden glow. The background should change to dark/black. The surrounding area should be illuminated by warm light. Cozy, inviting atmosphere.
Style: IKEA catalog photography, minimal, modern, square format. No text or labels.`,

  "lights-off": `This is a product photo with the light/fire turned ON with warm glow. Generate a new image of this EXACT SAME product, but now turned OFF.
Keep the design, angle, position, and composition identical.
Changes: The product should appear as an inert decorative object. The background should change to clean white. Lit by soft ambient daylight.
Style: IKEA catalog photography, minimal, modern, square format. No text or labels.`,

  "day-to-night": `This is a daytime photo of a scene. Generate a new image of this EXACT SAME scene, but at night.
Keep the composition, objects, and layout identical.
Changes: Dark sky, nighttime lighting, any lights/lamps in the scene should glow warmly, ambient mood lighting.
Style: Architectural photography, clean, realistic lighting. No text or labels.`,

  "night-to-day": `This is a nighttime photo of a scene. Generate a new image of this EXACT SAME scene, but in daylight.
Keep the composition, objects, and layout identical.
Changes: Bright natural daylight, clear sky, shadows appropriate for daytime. Any lamps should appear off.
Style: Architectural photography, clean, realistic lighting. No text or labels.`,

  "empty-to-staged": `This is a photo of an empty room or space. Generate a new image of this EXACT SAME space, but now staged with tasteful Scandinavian furniture and decor.
Keep the room dimensions, windows, and architectural features identical.
Changes: Add modern Nordic furniture, warm textiles, plants, and decorative objects. Make it feel lived-in and inviting.
Style: Interior design photography, Scandinavian minimalism, warm and cozy. No text or labels.`,

  "plain-to-lifestyle": `This is a plain product photo on a white/neutral background. Generate a new image of this EXACT SAME product, but now shown in a styled lifestyle setting.
Keep the product design identical.
Changes: Place the product in a beautiful Scandinavian home interior. Show it in context — on a table, shelf, or appropriate surface. Warm, inviting atmosphere.
Style: Lifestyle product photography, Scandinavian interiors, editorial quality. No text or labels.`,
};

// ---------------------------------------------------------------------------
// In-memory cache (upgrade to Supabase Storage later)
// ---------------------------------------------------------------------------

const cache = new Map<string, TransformResult>();

function cacheKey(sourceDataUri: string, type: TransformationType): string {
  const hash = createHash("sha256")
    .update(sourceDataUri)
    .update(type)
    .digest("hex");
  return hash;
}

// ---------------------------------------------------------------------------
// Core: extractImageDataUri
// ---------------------------------------------------------------------------

function extractImageDataUri(
  response: Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>,
): TransformResult | null {
  const candidate = response.candidates?.[0];
  if (!candidate) return null;

  const parts = candidate.content?.parts;
  if (!parts || parts.length === 0) return null;

  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData.mimeType) {
      return {
        imageDataUri: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
        mimeType: part.inlineData.mimeType,
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Transform an image using the Nano Banana engine (Gemini 2.5 Flash Image).
 *
 * @param sourceImageDataUri - Base64 data URI of the source image
 * @param transformationType - The type of transformation to apply
 * @param options - Additional options (context, model override)
 * @returns The transformed image as a data URI
 */
export async function transformImage(
  sourceImageDataUri: string,
  transformationType: TransformationType,
  options: TransformOptions = {},
): Promise<TransformResult> {
  // Check cache
  const key = cacheKey(sourceImageDataUri, transformationType);
  const cached = cache.get(key);
  if (cached) return cached;

  const model = options.model ?? "gemini-2.5-flash-preview-image-generation";
  const promptTemplate = PROMPT_TEMPLATES[transformationType];
  const prompt = options.context
    ? `${promptTemplate}\n\nAdditional context: ${options.context}`
    : promptTemplate;

  // Extract base64 data from the data URI
  const match = sourceImageDataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid source image data URI");
  const [, mimeType, data] = match;

  const result = await withRetry(async () => {
    const response = await ai().models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType!, data: data! } },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const extracted = extractImageDataUri(response);
    if (!extracted) {
      throw new Error(
        `Nano Banana: No image returned for ${transformationType} transformation`,
      );
    }
    return extracted;
  });

  // Cache the result
  cache.set(key, result);
  return result;
}

/**
 * Process multiple images sequentially to respect API rate limits.
 */
export async function batchTransform(
  images: Array<{
    sourceImageDataUri: string;
    transformationType: TransformationType;
    options?: TransformOptions;
  }>,
): Promise<Array<TransformResult | { error: string }>> {
  const results: Array<TransformResult | { error: string }> = [];

  for (const item of images) {
    try {
      const result = await transformImage(
        item.sourceImageDataUri,
        item.transformationType,
        item.options,
      );
      results.push(result);
    } catch (err) {
      results.push({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

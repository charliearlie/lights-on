import { ai, withRetry, extractImageDataUri } from "./nano-banana.server";
import type { TransformResult } from "./nano-banana.server";

const SAFETY_PREAMBLE = `You are an image transformation assistant. Apply the user's requested transformation to the provided image.

RULES:
- Do NOT generate deepfakes or impersonate real people
- Do NOT generate NSFW, violent, or hateful content
- Do NOT add text, watermarks, or logos to the image
- Preserve the original image's composition and subject unless the prompt explicitly asks to change it
`;

/**
 * Free-form image transformation using Gemini.
 * Wraps the user prompt with safety guardrails.
 */
export async function freeformTransform(
  sourceImageDataUri: string,
  prompt: string,
  options?: { model?: string },
): Promise<TransformResult> {
  const model = options?.model ?? "gemini-3.1-flash-image-preview";
  const fullPrompt = `${SAFETY_PREAMBLE}\nUser request: ${prompt}`;

  const match = sourceImageDataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid source image data URI");
  const [, mimeType, data] = match;

  return withRetry(async () => {
    const response = await ai().models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { text: fullPrompt },
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
      throw new Error("No image returned from transformation");
    }
    return extracted;
  });
}

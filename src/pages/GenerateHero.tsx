import { useState } from "react";
import { Link } from "react-router";
import { GoogleGenAI } from "@google/genai";
import { saveImage, loadImage } from "../data/imageStore";

function getAI() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("VITE_GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: key });
}

let _ai: GoogleGenAI | null = null;
function ai() {
  if (!_ai) _ai = getAI();
  return _ai;
}

interface HeroImages {
  off: string | null;
  on: string | null;
}

function extractImageDataUri(
  response: Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>,
  log?: (msg: string) => void,
): string | null {
  const candidate = response.candidates?.[0];
  if (!candidate) {
    log?.("No candidates in response");
    return null;
  }

  const parts = candidate.content?.parts;
  if (!parts || parts.length === 0) {
    log?.(
      `No parts in response. finishReason: ${candidate.finishReason ?? "unknown"}`,
    );
    return null;
  }

  for (const part of parts) {
    if (part.inlineData) {
      log?.(
        `Found image: ${part.inlineData.mimeType}, ${Math.round((part.inlineData.data?.length ?? 0) / 1024)}KB base64`,
      );
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  const partTypes = parts.map((p) => {
    if (p.text) return `text(${p.text.slice(0, 80)}...)`;
    return Object.keys(p).join(",");
  });
  log?.(`No image in parts. Got: [${partTypes.join(", ")}]`);
  return null;
}

function extractBase64(dataUri: string): { data: string; mimeType: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URI");
  return { mimeType: match[1], data: match[2] };
}

async function generateHeroPair(
  log?: (msg: string) => void,
): Promise<{ off: string | null; on: string | null }> {
  log?.('Step 1: Requesting OFF image (daytime showroom)...');
  const offResponse = await ai().models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: `Interior photography of a spacious Scandinavian living room.
The room features several designer table and floor lamps, plus a stone fireplace.
Everything is UNLIT — no lamps on, no fire, no warm glow.
The room is illuminated by bright natural daylight streaming through large windows.
Furniture includes a sofa, armchair, wooden coffee table, and bookshelves.
Walls are light, floors are warm wood. Clean Nordic aesthetic.
Style: Architectural interior photography, warm Scandinavian aesthetic, photorealistic.
Wide landscape format, 16:9 aspect ratio. No text, watermarks, or labels.`,
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  const offImage = extractImageDataUri(offResponse, log);
  if (!offImage) {
    log?.("OFF image extraction failed — skipping ON generation");
    return { off: null, on: null };
  }

  log?.('Step 2: Requesting ON image using OFF image as reference...');
  const { data, mimeType } = extractBase64(offImage);

  const onResponse = await ai().models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `This is an interior photo of a Scandinavian living room with unlit lamps and fireplace during the day.
Generate a new image of this EXACT SAME room, but now at NIGHT with everything LIT.
Keep the room layout, furniture, and composition identical.
Changes:
- All lamps are ON, casting pools of warm light
- The fireplace has a roaring fire with visible flames and glowing embers
- Windows show nighttime outside
- The lamps and fire are the PRIMARY light sources
- Warm amber/orange light fills the room, deep shadows in corners
- Cozy, intimate, hygge atmosphere — the room feels alive
Style: Architectural interior photography, dramatic warm lighting.
Wide landscape format, 16:9 aspect ratio. No text, watermarks, or labels.`,
          },
          {
            inlineData: {
              mimeType,
              data,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  const onImage = extractImageDataUri(onResponse, log);
  return { off: offImage, on: onImage };
}

export function GenerateHero() {
  const [images, setImages] = useState<HeroImages>(() => {
    const off = loadImage("hero", 0, "off");
    const on = loadImage("hero", 0, "on");
    return { off, on };
  });
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<"off" | "on">("off");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const generate = async () => {
    setGenerating(true);
    addLog("Generating hero showroom images...");

    try {
      const result = await generateHeroPair((msg) => addLog(msg));

      setImages(result);

      try {
        if (result.off) saveImage("hero", 0, "off", result.off);
        if (result.on) saveImage("hero", 0, "on", result.on);
      } catch {
        addLog("Could not save to localStorage (quota exceeded) — use download buttons");
      }

      addLog(
        `Done: ${result.off ? "OFF ok" : "OFF failed"}, ${result.on ? "ON ok" : "ON failed"}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`Error - ${message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-ikea-blue hover:underline dark:text-ikea-yellow"
            >
              &larr; Back to Home
            </Link>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">
              Hero Image Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 aspect-video overflow-hidden rounded bg-gray-100 dark:bg-gray-900">
            {images[preview] ? (
              <img
                src={images[preview]!}
                alt={`Showroom - ${preview}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No image yet
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Hero Showroom
          </h3>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Scandinavian living room with lamps and fireplace
          </p>

          {(images.off || images.on) && (
            <div className="mb-3 flex gap-1">
              <button
                onClick={() => setPreview("off")}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  preview === "off"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                OFF
              </button>
              <button
                onClick={() => setPreview("on")}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  preview === "on"
                    ? "bg-ikea-yellow text-gray-900"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                ON
              </button>
            </div>
          )}

          <button
            onClick={generate}
            disabled={generating}
            className="w-full rounded bg-ikea-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? "Generating..." : images.off ? "Regenerate" : "Generate"}
          </button>

          {images.off && images.on && (
            <div className="mt-2 flex gap-1">
              <a
                href={images.off}
                download="showroom-off.png"
                className="flex-1 rounded bg-gray-100 px-2 py-1 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Save OFF
              </a>
              <a
                href={images.on}
                download="showroom-on.png"
                className="flex-1 rounded bg-gray-100 px-2 py-1 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Save ON
              </a>
            </div>
          )}
        </div>

        {log.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
              Log
            </h2>
            <div className="max-h-40 overflow-y-auto font-mono text-xs text-gray-600 dark:text-gray-400">
              {log.map((entry, i) => (
                <div key={i}>{entry}</div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

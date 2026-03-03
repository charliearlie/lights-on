import { useState } from "react";
import { Link } from "react-router";
import { GoogleGenAI } from "@google/genai";
import { fireplaces } from "../data/fireplaces";
import { type Product } from "../data/products";
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

interface FireplaceImages {
  off: string | null;
  on: string | null;
}

type ImageMap = Record<number, FireplaceImages>;

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

async function generateFireplacePair(
  product: Product,
  log?: (msg: string) => void,
): Promise<{ off: string | null; on: string | null }> {
  // Step 1: Generate the fireplace in its OFF state (daytime, unlit)
  log?.(`Step 1: Requesting OFF image for "${product.name}"...`);
  const offResponse = await ai().models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: `Interior photography of a Scandinavian-style room featuring a ${product.description}.
The fireplace is UNLIT — no fire, no embers, no glow. The fireplace opening is dark and empty.
The room is illuminated by natural daylight streaming through windows. Furniture, walls, and decor are clearly visible in warm natural light.
Style: Architectural interior photography, warm Scandinavian aesthetic, photorealistic, square format. No text or labels.`,
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  const offImage = extractImageDataUri(offResponse, log);
  if (!offImage) {
    log?.("OFF image extraction failed — skipping ON generation");
    return { off: null, on: null };
  }

  // Step 2: Send the OFF image back and ask for the ON version with the fireplace lit at night
  log?.(`Step 2: Requesting ON image using OFF image as reference...`);
  const { data, mimeType } = extractBase64(offImage);

  const onResponse = await ai().models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `This is an interior photo of a room with an unlit fireplace during the day. Generate a new image of this EXACT SAME room, but now at NIGHT with the fireplace LIT.
Keep the room layout, furniture, fireplace design, and composition identical.
Changes: The fireplace now has a roaring fire with visible flames and glowing embers. Windows show nighttime outside. The fire is the PRIMARY light source, casting warm amber light across walls, floor, and furniture. Deep dramatic shadows in corners. Warm flickering highlights on nearby surfaces. Cozy, intimate, hygge atmosphere.
Style: Architectural interior photography, warm Scandinavian aesthetic, dramatic firelight, square format. No text or labels.`,
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

function FireplaceGeneratorCard({
  product,
  images,
  onGenerate,
  generating,
}: {
  product: Product;
  images: FireplaceImages;
  onGenerate: () => void;
  generating: boolean;
}) {
  const [preview, setPreview] = useState<"off" | "on">("off");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 aspect-square overflow-hidden rounded bg-gray-100 dark:bg-gray-900">
        {images[preview] ? (
          <img
            src={images[preview]!}
            alt={`${product.name} - ${preview}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image yet
          </div>
        )}
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
        {product.name}
      </h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {product.description}
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
        onClick={onGenerate}
        disabled={generating}
        className="w-full rounded bg-ikea-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? "Generating..." : images.off ? "Regenerate" : "Generate"}
      </button>

      {images.off && images.on && (
        <div className="mt-2 flex gap-1">
          <a
            href={images.off}
            download={`${product.name.toLowerCase()}-off.png`}
            className="flex-1 rounded bg-gray-100 px-2 py-1 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Save OFF
          </a>
          <a
            href={images.on}
            download={`${product.name.toLowerCase()}-on.png`}
            className="flex-1 rounded bg-gray-100 px-2 py-1 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Save ON
          </a>
        </div>
      )}
    </div>
  );
}

export function GenerateFireplaces() {
  const [imageMap, setImageMap] = useState<ImageMap>(() => {
    const initial: ImageMap = {};
    for (const product of fireplaces) {
      const off = loadImage("fireplace", product.id, "off");
      const on = loadImage("fireplace", product.id, "on");
      if (off || on) {
        initial[product.id] = { off, on };
      }
    }
    return initial;
  });
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const generateForProduct = async (product: Product) => {
    setGenerating((prev) => new Set(prev).add(product.id));
    addLog(`Generating images for ${product.name}...`);

    try {
      const result = await generateFireplacePair(product, (msg) =>
        addLog(`${product.name}: ${msg}`),
      );

      // Update UI state first — must happen even if localStorage is full
      setImageMap((prev) => ({
        ...prev,
        [product.id]: result,
      }));

      // Persist to localStorage (may fail if quota exceeded — images are ~1.7MB each)
      try {
        if (result.off) saveImage("fireplace", product.id, "off", result.off);
        if (result.on) saveImage("fireplace", product.id, "on", result.on);
      } catch {
        addLog(`${product.name}: Could not save to localStorage (quota exceeded) — use download buttons`);
      }

      addLog(
        `${product.name}: ${result.off ? "OFF ok" : "OFF failed"}, ${result.on ? "ON ok" : "ON failed"}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`${product.name}: Error - ${message}`);
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const generateAll = async () => {
    for (const product of fireplaces) {
      await generateForProduct(product);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/fireplaces"
              className="text-sm text-ikea-blue hover:underline dark:text-ikea-yellow"
            >
              &larr; Back to Store
            </Link>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">
              Fireplace Image Generator
            </h1>
          </div>
          <button
            onClick={generateAll}
            disabled={generating.size > 0}
            className="rounded bg-ikea-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating.size > 0
              ? `Generating (${generating.size})...`
              : "Generate All"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {fireplaces.map((product) => (
            <FireplaceGeneratorCard
              key={product.id}
              product={product}
              images={imageMap[product.id] ?? { off: null, on: null }}
              onGenerate={() => generateForProduct(product)}
              generating={generating.has(product.id)}
            />
          ))}
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

import type { MockupDefinition, PromptData, StyleDefinition, StyleKey, MockupType } from "./types";
import { buildSharedRules, TYPOGRAPHY_RULES } from "./prompts";

// ---------------------------------------------------------------------------
// Style prompt builders — verbatim from stadium-forge prototype
// ---------------------------------------------------------------------------

export const STYLES: Record<StyleKey, StyleDefinition> = {
  bauhaus: {
    label: "Bauhaus",
    buildPrompt: (d: PromptData) =>
      `Create a premium minimalist poster art print featuring a bird's eye view of ${d.stadiumName}.
${buildSharedRules(d.ratio)}
${TYPOGRAPHY_RULES}
TEXT CONTENT TO RENDER:
- Title: "${d.stadiumName.toUpperCase()}"
- Subtitle: "${d.subtitle}"
- Bottom left: "EST. ${d.year}"
- Bottom right: "${d.coords}"

STYLE: Bauhaus poster art. Flat geometric shapes, hard edges, zero gradients. Primary stand colour: ${d.primaryColor}. Accent trim: ${d.accentColor}. Background: warm off-white (#F5F0E8). Pitch: deep forest green (#2D6A2D) with clean white markings. Text colour: near-black (#1a1a1a). Inspired by Herbert Bayer. Bold, confident, frameable as premium wall art.`,
  },
  blueprint: {
    label: "Blueprint",
    buildPrompt: (d: PromptData) =>
      `Create a premium minimalist poster art print featuring a bird's eye view of ${d.stadiumName}.
${buildSharedRules(d.ratio)}
${TYPOGRAPHY_RULES}
TEXT CONTENT TO RENDER:
- Title: "${d.stadiumName.toUpperCase()}"
- Subtitle: "${d.subtitle}"
- Bottom left: "EST. ${d.year}"
- Bottom right: "${d.coords}"

STYLE: Architectural blueprint. Deep navy background (#0a1628). All stadium geometry rendered as precise white/cyan (#7ec8e3) linework only — no fills except the pitch. Pitch: deep navy with white line markings. Thin consistent stroke weight. Text colour: white (#ffffff) with slight cyan tint. Feels like a technical drawing from a master architect's archive.`,
  },
  risograph: {
    label: "Risograph",
    buildPrompt: (d: PromptData) =>
      `Create a premium minimalist poster art print featuring a bird's eye view of ${d.stadiumName}.
${buildSharedRules(d.ratio)}
${TYPOGRAPHY_RULES}
TEXT CONTENT TO RENDER:
- Title: "${d.stadiumName.toUpperCase()}"
- Subtitle: "${d.subtitle}"
- Bottom left: "EST. ${d.year}"
- Bottom right: "${d.coords}"

STYLE: Risograph print aesthetic. Two-colour only: ${d.primaryColor} and ${d.accentColor}. Slight grain texture overlay. Slight mis-registration effect on overlapping colours. Cream paper background (#F2EDE4). Text in the darker of the two colours. Feels like a limited edition gig poster. Warm, tactile, collectible.`,
  },
  midnight: {
    label: "Midnight",
    buildPrompt: (d: PromptData) =>
      `Create a premium minimalist poster art print featuring a bird's eye view of ${d.stadiumName}.
${buildSharedRules(d.ratio)}
${TYPOGRAPHY_RULES}
TEXT CONTENT TO RENDER:
- Title: "${d.stadiumName.toUpperCase()}"
- Subtitle: "${d.subtitle}"
- Bottom left: "EST. ${d.year}"
- Bottom right: "${d.coords}"

STYLE: Luxury dark. Near-black background (#080808). Stand geometry in ${d.primaryColor} with subtle ${d.accentColor} edge highlight. Pitch glows in deep emerald (#1a4a2a) with white markings. Text colour: white (#ffffff). Feels like a premium poster from a high-end sports boutique. Subtle vignette. Flat colour only, no gradients on shapes.`,
  },
};

// ---------------------------------------------------------------------------
// Mockup prompt builders — verbatim from stadium-forge prototype
// ---------------------------------------------------------------------------

export const MOCKUP_TYPES: Record<MockupType, MockupDefinition> = {
  "living-room": {
    label: "Living Room",
    prompt: (_name: string) =>
      `A high-end interior design photograph of a modern Scandinavian living room. On the main wall, there is a single large framed print of the attached artwork. The frame is thin, black, with a white mat border. The room has a neutral linen sofa, a wooden coffee table, warm natural light from a window, and a few minimal decor items (a plant, a ceramic vase). The framed print is the clear focal point. Photorealistic, editorial interior photography style. Shot on a 35mm lens. The artwork in the frame must match the attached image EXACTLY — do not alter, crop, or reinterpret it.`,
  },
  bedroom: {
    label: "Bedroom",
    prompt: (_name: string) =>
      `A stylish modern bedroom interior photograph. Above the bed headboard, the attached artwork is displayed in a slim oak wood frame. The bedroom has white linen bedding, bedside tables with warm lamps, and a calm, minimal aesthetic. Soft morning light. The framed artwork is the hero element — clearly visible and unaltered. Photorealistic editorial style. The artwork in the frame must match the attached image EXACTLY.`,
  },
  detail: {
    label: "Close-Up",
    prompt: (_name: string) =>
      `An extreme close-up photograph of a framed art print hanging on a white textured wall. The photograph is zoomed into the upper portion of the print showing the title typography and the top of the stadium illustration. Shallow depth of field — the edges of the frame are slightly out of focus, the text is tack-sharp. You can see the paper texture and print quality. Premium, tactile, gallery feel. Natural side lighting creating a subtle shadow from the frame edge. The artwork must match the attached image EXACTLY — just show it closer.`,
  },
  "gallery-wall": {
    label: "Gallery Wall",
    prompt: (_name: string) =>
      `A curated gallery wall arrangement in a minimalist apartment hallway. The attached artwork is the largest piece, centred, in a black frame. Around it are 2-3 smaller complementary abstract geometric prints in matching frames. White wall, wooden floor visible at bottom. The arrangement is intentional and balanced. Interior design magazine style. Natural light. The main artwork must match the attached image EXACTLY and be clearly the dominant piece.`,
  },
  desk: {
    label: "Desk / Office",
    prompt: (_name: string) =>
      `A clean, modern home office desk setup. Behind the desk, leaning against the wall on a shelf, is the attached artwork in a black frame — it's unframed and casually propped. The desk has a laptop, a coffee cup, a small plant, and a desk lamp. Warm ambient lighting. The print is clearly visible and the hero of the composition. Lifestyle product photography style. The artwork must match the attached image EXACTLY.`,
  },
};

export const STYLE_KEYS = Object.keys(STYLES) as StyleKey[];
export const MOCKUP_TYPE_KEYS = Object.keys(MOCKUP_TYPES) as MockupType[];

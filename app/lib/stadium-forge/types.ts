// ---------------------------------------------------------------------------
// Stadium Forge — shared TypeScript interfaces
// ---------------------------------------------------------------------------

export interface Club {
  name: string;
  stadium: string;
  city: string;
  year: string;
  lat: string;
  lon: string;
  /** Primary colour hex */
  p: string;
  /** Accent colour hex */
  a: string;
}

export interface QueueItem {
  id: string;
  stadiumName: string;
  clubName: string;
  city: string;
  year: string;
  coords: string;
  primaryColor: string;
  accentColor: string;
  ratio: string;
  resolution: string;
  refImage: { base64: string; mimeType: string } | null;
  refPreview: string | null;
  status: "queued" | "generating" | "done" | "error";
  result: string | null;
  error: string | null;
  mockups: Record<string, string>;
}

export type StyleKey = "bauhaus" | "blueprint" | "risograph" | "midnight";

export type MockupType =
  | "living-room"
  | "bedroom"
  | "detail"
  | "gallery-wall"
  | "desk";

export interface PromptData {
  stadiumName: string;
  clubName: string;
  city: string;
  subtitle: string;
  year: string;
  coords: string;
  ratio: string;
  primaryColor: string;
  accentColor: string;
  hasRefImage: boolean;
}

export interface StyleDefinition {
  label: string;
  buildPrompt: (d: PromptData) => string;
}

export interface MockupDefinition {
  label: string;
  prompt: (name: string) => string;
}

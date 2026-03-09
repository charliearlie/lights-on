// ---------------------------------------------------------------------------
// Stadium Forge — prompt building utilities
// Verbatim from stadium-forge prototype
// ---------------------------------------------------------------------------

/** Format coordinates for display on poster */
export function fmtCoord(lat: string, lon: string): string {
  const fLat = parseFloat(lat);
  const fLon = parseFloat(lon);
  if (isNaN(fLat) || isNaN(fLon)) return "";
  const ns = fLat >= 0 ? "N" : "S";
  const ew = fLon >= 0 ? "E" : "W";
  return `${Math.abs(fLat).toFixed(4)}°${ns}  ${Math.abs(fLon).toFixed(4)}°${ew}`;
}

/** Build subtitle: skip city if same as club name */
export function fmtSubtitle(clubName: string, city: string): string {
  const c = (clubName || "").trim().toUpperCase();
  const t = (city || "").trim().toUpperCase();
  if (!t || t === c) return c;
  return `${c} — ${t}`;
}

export function buildSharedRules(ratio: string, hasRefImage = false): string {
  const orientations: Record<string, string> = {
    "3:4": "Portrait orientation (3:4 aspect ratio)",
    "2:3": "Tall portrait orientation (2:3 aspect ratio)",
    "4:5": "Portrait orientation (4:5 aspect ratio)",
    "1:1": "Square format (1:1 aspect ratio)",
    "9:16": "Tall narrow portrait (9:16 aspect ratio)",
  };
  const orient = orientations[ratio] || `${ratio} aspect ratio`;

  const refImageBlock = hasRefImage
    ? `A satellite reference image of the actual stadium footprint is attached. This image is your PRIMARY source of truth for all geometry. Study it carefully before generating.`
    : `No satellite reference image is provided. Use your knowledge of this stadium's real-world architecture and layout to accurately represent its unique shape and asymmetries.`;

  return `${refImageBlock}

IMAGE FORMAT: ${orient}. This is a print-ready poster.

GEOMETRY FIDELITY (critical — fans will reject inaccurate shapes):
- ${hasRefImage ? "Trace the EXACT outline and proportions from the satellite image." : "Reproduce the stadium's real-world outline and proportions as accurately as possible."} Do NOT idealise, symmetrise, or generalise.
- Each of the four stands (North, South, East, West) may have DIFFERENT depths, heights, and shapes. Reproduce these differences faithfully. If one stand is visibly shallower or narrower than the others, it MUST appear that way in your output.
- Preserve asymmetry. Many stadiums have one stand that is distinctly different (e.g. smaller, older, single-tier vs multi-tier). This asymmetry is what makes each stadium recognisable and unique. Do NOT make all four sides equal.
- Corner treatments matter: some stadiums have open corners, some have filled corners, some have rounded corners. Match the real stadium exactly.
- Roof structures and stand segmentation should inform the block shapes you draw. If there are visible seating tier divisions, reflect them as geometric subdivisions.
- The overall silhouette when viewed top-down must be instantly recognisable as THIS specific stadium, not a generic football ground.

COMPOSITION (critical — this is a clean poster, NOT a map):
- The stadium artwork must be CENTRED horizontally in the image.
- Show ONLY the stadium itself. Do NOT include surrounding streets, roads, car parks, buildings, trees, or any context outside the stadium boundary.
- The background around the stadium must be a clean, solid colour — no terrain, no urban context, no landscape.
- The stadium should fill the centre zone generously without being cramped or off-centre.

ADDITIONAL RULES:
- Strict overhead top-down perspective. Zero perspective tilt. No 3D or isometric view.
- Playing pitch: centred within the stadium, correct proportions relative to the stands, clean white markings.
- All stand geometry must have clean, straight edges. No wobbly, diagonal, or distorted lines.
- Absolutely no club crests, badges, logos, sponsor text, or player figures.
- Print-ready. No watermarks. No borders. No outer frame.`;
}

export const TYPOGRAPHY_RULES = `
TYPOGRAPHY LAYOUT (this is what makes it a sellable poster, not just clip art):
- Use a bold, condensed, uppercase, architectural sans-serif typeface throughout. Clean and geometric.
- TOP ZONE (upper ~15% of image): Stadium name in large bold condensed uppercase, filling the width. Below it in noticeably smaller text: club name + city.
- CENTRE ZONE (~65% of image): The overhead stadium artwork — this is the hero. It must be large and dominant, filling the horizontal space generously.
- BOTTOM ZONE (lower ~10% of image): A single line of small uppercase monospaced text: "EST. [year]" flush left, coordinates flush right.
- All text must be perfectly legible, horizontally aligned, and use consistent letter-spacing.
- Text colour should contrast clearly against the background.
- No decorative text effects — just clean, sharp, architectural typography.`.trim();

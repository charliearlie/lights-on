# Lights On

IKEA-inspired single-page lamp store where toggling dark mode "turns on" all the lamps.

## What This Is
A fun retail product page showcasing 16 lamp products in a responsive grid (2 columns mobile, 4 columns desktop). The dark mode toggle crossfades every lamp image from its "off" state to its "on" state, simulating flipping the lights on in a showroom.

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS v4 (dark mode via `class` strategy on `<html>`)

## Image Generation
Lamp images (off/on pairs) are generated using **Gemini 3.1** (`gemini-3.1-flash-image-preview`).
- Navigate to `#generate` to access the image generator page
- Each lamp generates 2 images simultaneously: OFF (white bg) and ON (dark bg, warm glow)
- API key stored in `.env` as `VITE_GEMINI_API_KEY`
- SDK: `@google/genai`

## Theme Behavior
- **Light mode (default)**: White background, lamps appear OFF
- **Dark mode (toggle ON)**: Black/dark background, lamps appear ON with warm glow

## Project Structure
- `src/data/products.ts` — 16 hardcoded lamp products
- `src/components/` — Header, DarkModeToggle, ProductGrid, ProductCard
- `src/pages/Generate.tsx` — Gemini image generation page (accessed via `#generate`)
- Dark mode state lives in `App.tsx`, toggling the `dark` class on `<html>`
- Hash-based routing: `#generate` for image gen, default for store

## Conventions
- IKEA-style: uppercase Swedish product names, clean sans-serif typography
- Color palette: blue (#0058A3), yellow (#FFDB00), white/charcoal backgrounds
- All image transitions use 500ms ease crossfade

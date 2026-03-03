# Illuminate

IKEA-inspired Nordic home store where toggling dark mode "turns on" all the lamps and fireplaces.

## What This Is
A fun retail product page showcasing 16 lamp products and 16 fireplace products in responsive grids (2 columns mobile, 4 columns desktop). The dark mode toggle crossfades every product image from its "off" state to its "on" state, simulating flipping the lights on in a showroom.

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS v4 (dark mode via `class` strategy on `<html>`)
- React Router v7 (BrowserRouter)

## Image Generation
Product images (off/on pairs) are generated using **Gemini 3.1** (`gemini-3.1-flash-image-preview`).
- Navigate to `/generate/lamps` to access the lamp image generator
- Navigate to `/generate/fireplaces` to access the fireplace image generator
- Navigate to `/generate/hero` to access the hero image generator
- Each product generates 2 images simultaneously: OFF (white bg) and ON (dark bg, warm glow)
- API key stored in `.env` as `VITE_GEMINI_API_KEY`
- SDK: `@google/genai`

## Theme Behavior
- **Light mode (default)**: White background, lamps appear OFF
- **Dark mode (toggle ON)**: Black/dark background, lamps appear ON with warm glow

## Routes
- `/` — Home page
- `/lamps` — Lamp product grid
- `/lamps/:id` — Lamp product detail
- `/fireplaces` — Fireplace product grid
- `/fireplaces/:id` — Fireplace product detail
- `/generate/lamps` — Lamp image generation page
- `/generate/fireplaces` — Fireplace image generation page
- `/generate/hero` — Hero image generation page

## Project Structure
- `src/data/products.ts` — 16 hardcoded lamp products
- `src/data/fireplaces.ts` — 16 hardcoded fireplace products
- `src/components/` — Header, DarkModeToggle, HeroToggle, ProductGrid, ProductCard, FireplaceGrid
- `src/pages/Home.tsx` — Home landing page
- `src/pages/ProductDetail.tsx` — Lamp detail page (uses `useParams()` for ID)
- `src/pages/FireplaceDetail.tsx` — Fireplace detail page (uses `useParams()` for ID)
- `src/pages/Generate.tsx` — Lamp image generation page
- `src/pages/GenerateFireplaces.tsx` — Fireplace image generation page
- `src/pages/GenerateHero.tsx` — Hero image generation page
- Dark mode state lives in `App.tsx`, toggling the `dark` class on `<html>`
- Routing via React Router v7 `<BrowserRouter>` wrapping `<App>` in `main.tsx`

## Conventions
- IKEA-style: uppercase Swedish product names, clean sans-serif typography
- Color palette: blue (#0058A3), yellow (#FFDB00), white/charcoal backgrounds
- All image transitions use 500ms ease crossfade

# Edo-AI Bonsai

Generative bonsai visual paired with playful Edo-tech haiku responses running on Cloudflare Pages + Functions.

## Project Layout
- `public/` – client-side app served by Pages (HTML/CSS/JS for the bonsai canvas and UI).
- `functions/` – API routes for haiku generation (Cloudflare Pages Functions via Hono).
- `wrangler.toml` – Pages configuration pointing builds to `public/`.

> Note: The repository previously included duplicate HTML/CSS/JS assets at the repo root and an extra `api/` folder. These have been removed so the single source of truth lives in `public/` and `functions/`.

## Local Development
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the preview URL from Wrangler (defaults to `http://localhost:8788`).

## Deployment
Use `npm run deploy` to publish the static site in `public/` and the functions in `functions/` to Cloudflare Pages.

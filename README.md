# Audr Revenue Leak Calculator

Lead magnet for Audr — a single-page React quiz/calculator for skincare DTC brands running Meta ads. Cold traffic lands here from Instagram ads, completes an 8-step quiz, and gets a personalised ad-fatigue risk score + revenue recovery estimate. No backend, no routing — pure client-side, deploys as a static site.

## Run locally

```bash
npm install
npm run dev
# Opens on http://localhost:5173 with hot reload
```

In dev mode all webhook and pixel calls **log to the console instead of firing** — open DevTools to verify the payload shapes.

**Developer tweaks panel:** click the gear icon in the bottom-right corner (dev builds only — it's stripped from production). It lets you:
- Toggle the accent colour (Amber / Blue / Violet / Emerald) to preview variants
- **Preview Results** — jump straight to the results page with sample data (skincare, ~£32k spend, low diversity, 3 frustrations → hot lead)
- **Reset** — back to the landing page

## Build for production

```bash
npm run build
# Outputs a static dist/ folder — that's the whole site
npm run preview   # optional: serve the production build locally
```

## Deploy to Replit

1. Push this repo to GitHub.
2. In Replit: **Create Repl → Import from GitHub** → pick this repo.
3. The included `.replit` file configures everything: a **Static** deployment that runs `npm install && npm run build` and serves the `dist/` folder.
4. Click **Deploy → Static deployment → Deploy**. Done — no server needed.

(`npm run dev` also works inside the Replit workspace for testing before deploying.)

## Activating the GHL webhook (when GoHighLevel is ready)

1. Open [src/webhook.js](src/webhook.js).
2. Replace `YOUR_GHL_WEBHOOK_URL_HERE` (top of the file) with your GHL Inbound Webhook URL from **GoHighLevel → Automations**.
3. Search the file for `ACTIVATE:` — uncomment the two `fetch()` blocks (main submission + follow-up events).
4. Rebuild and redeploy.

The payload includes every quiz answer plus computed values (`fatigue_score`, `revenue_leak_low/high`, `lead_temperature`) so GHL can route email sequences without re-deriving anything. Lead temperatures: `super_hot` / `hot` / `warm` / `cold`.

## Activating the Meta Pixel

1. Open [index.html](index.html) — uncomment the Meta Pixel base code block in `<head>` and replace `YOUR_PIXEL_ID`.
2. Open [src/webhook.js](src/webhook.js) — uncomment the `fbq()` calls in `firePageView`, `fireQualificationPixel`, and `fireLeadPixel` (search for `ACTIVATE:`).
3. Rebuild and redeploy.

Events fired:
- `PageView` — on landing
- `QualifiedLead` (custom) — after Step 4, only when brand type is Skincare/Beauty **and** revenue is £60k+ **and** spend is £5k+
- `Lead` — on quiz completion, tagged with lead temperature

## Project structure

```
src/
  App.jsx          — shell, phase transitions, global state, dev panel
  Landing.jsx      — Phase 1: hero/landing
  Quiz.jsx         — Phase 2: 8-step form
  Loading.jsx      — Phase 3: theatrical loading (6s)
  Results.jsx      — Phase 4: gauge, leak card, angles, CTAs, formula footer
  scoring.js       — calculator formula + lead temperature logic
  angles-data.js   — niche-specific competitor angle content
  webhook.js       — GHL webhook + Meta Pixel (commented out, ready to activate)
  styles.css       — the whole design system
.claude/skills/    — C.L.E.A.R. UI framework + Product Psychology skills
                     (auto-loaded by Claude Code when iterating on this repo)
docs/
  design-rationale.md — how the design decisions map to the two frameworks
```

## Results behaviour by lead temperature

| Temperature | Sections shown |
|---|---|
| `super_hot` / `hot` | Full results + Loom teardown CTA + How it works + offer teaser |
| `warm` | Full results + email course CTA (with 50% Audr discount note) |
| `cold` | Score + leak estimate + email course CTA only |

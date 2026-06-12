# Audr Lead Magnet — project notes

Single-page Vite + React 18 lead magnet for Audr (paid media consultancy for UK skincare DTC brands). Four state-driven phases in `App.jsx`: landing → quiz (8 steps) → loading (6s theatrical) → results. No router, no backend; GHL webhook + Meta Pixel are written but commented out (search `ACTIVATE:` in `src/webhook.js` and `index.html`).

## Before changing UI or copy

Two skills are installed in `.claude/skills/` — use them:

- **clear-ui-framework** — run a C.L.E.A.R. pass (Copywriting, Layout, Emphasis, Accessibility, Reward) on any screen you touch.
- **product-psychology** — diagnose flow/conversion changes with BMAP, NPV, B.I.A.S., Peak-End, ethics checks.

`docs/design-rationale.md` records which decisions are deliberate applications of these frameworks — read it before "fixing" something that looks unusual (e.g. the 6-second loading delay is Labor Illusion, not a bug).

## Hard constraints (from the build brief)

- Performance first: first paint < 800ms, no render-blocking scripts, CSS animations only, dark page (Meta ads destination — speed affects ad delivery).
- Copy must say "skincare brands" unambiguously — the page content is Meta Andromeda targeting signal. Banned vocabulary: "D2C health brands", "ROAS optimisation", "creative fatigue" (as jargon), "audience intel", "conversion rate", "media buying".
- Currency GBP. Tone: "you could be making £X more", never "you're wasting £X".
- One accent colour for action; corner radius ≤ 8px; no gradient blobs/glassmorphism; every visual element must carry information.
- The scoring formula and lead temperature logic in `src/scoring.js` follow the brief exactly — don't tweak coefficients without Ahmad's sign-off.

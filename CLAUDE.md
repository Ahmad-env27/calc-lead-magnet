# Audr Lead Magnet — project notes

Single-page Vite + React 18 lead magnet for Audr (paid media consultancy for UK skincare brands). Five state-driven phases in `App.jsx`: landing → quiz (12 questions, no email) → email unlock → loading (6s theatrical) → results. No router, no backend; GHL webhook + Meta Pixel are written but commented out (search `ACTIVATE:` in `src/webhook.js` and `index.html`).

**Hardline rules (Ahmad, 12 Jun 2026):**
- No pricing, offers, fees, or guarantee mechanics anywhere in the funnel. The results page teases monthly benefit only; money talk happens on the call.
- The email ask lives at the unlock screen (after the quiz), never at the start.
- Results framing is opportunity ("what you could be adding"), never waste/loss. The landing page loss-tease is the one deliberate exception (ad congruence).

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
- The scoring formula in `src/scoring.js` was recalibrated 12 Jun 2026 (required ROAS bracket, creative volume, cost trend, revenue cap at ~15% of revenue midpoint, £700 display floor). The sweet-spot lead (£30–80k spend, ~2x return, low diversity) must output £8–25k/month — verify with the node test in `docs/audit-2026-06-12.md` before changing coefficients, and don't tweak without Ahmad's sign-off.

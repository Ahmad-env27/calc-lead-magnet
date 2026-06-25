# Implementation Specs — 24 Jun 2026

Six changes across quiz and results page. Each spec lists the exact files, lines, and what to change. Run the scoring audit test after any scoring.js changes (`node docs/audit-2026-06-12.md` test commands).

Read `docs/design-rationale.md` and `.claude/skills/` (clear-ui-framework, product-psychology) before touching UI or copy.

---

## 1. Fix garbled gauge (Results page — HIGH PRIORITY)

**Problem:** The score readout (`69/100`), risk band label, "Top brands: 32" SVG text, and benchmark gap text all overlap on narrow viewports. The `.gauge-readout` uses `position: absolute; bottom: 34px` which doesn't scale with the SVG's responsive width.

**Files:**
- `src/Results.jsx` lines 91–175 (Gauge component)
- `src/styles.css` lines 700–733 (gauge styles)

**Changes:**

### a) Pull readout out of absolute positioning
In `src/styles.css`, change `.gauge-readout` from:
```css
.gauge-readout {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 34px;
  font-family: var(--font-display);
}
```
to a layout that lives below the SVG arc rather than overlapping it. Two approaches:
- **Option A (recommended):** Place score/max inside the SVG itself as `<text>` elements centered at the arc's center point (x=110, y=100), eliminating the HTML overlay entirely. This guarantees scaling with the SVG viewBox.
- **Option B:** Keep the HTML overlay but use a flexbox layout with the SVG and readout stacked, no absolute positioning.

### b) Fix benchmark label collision
In the SVG (Results.jsx line 152–157), the "Top brands: 32" label is at fontSize="7" with dynamic positioning based on `bx`. It collides with the score. Move it to a fixed position outside the arc — either above the arc at the benchmark tick position, or render it as a separate HTML element below the gauge.

### c) Increase gauge SVG viewBox height
The current viewBox is `0 0 220 130`. This is tight — the arc endpoint is at y=110, leaving only 20px for x-axis labels. Increase to `0 0 220 150` to give breathing room, and adjust the arc center or add bottom padding accordingly.

### d) Test at viewport widths: 320px, 375px, 414px, 768px
The gauge container is `max-width: 280px` so it should be tested at mobile widths where the container hits its max and below.

---

## 2. Upgrade decay curve quality (Results page — HIGH PRIORITY)

**Problem:** The current curve uses straight line segments (SVG `L` commands at 0.5-week intervals), has no zone annotations, minimal styling, and the "you are here" label floats without context. It looks nothing like the clean reference visualizations.

**Files:**
- `src/Results.jsx` lines 544–640 (SigmoidDecayCurve component)
- `src/styles.css` — decay-curve related classes
- `src/scoring.js` lines 300–337 (DECAY_PARAMS, effectiveness function)

**Changes:**

### a) Smooth the curve path
Replace the `L` (lineTo) path commands with smooth cubic Bézier curves. Either:
- Use monotone cubic interpolation (catmull-rom → cubic bézier conversion) across the data points
- Or increase the sampling density to every 0.1 weeks (120 points) which will make `L` segments indistinguishable from a curve at render size

### b) Add zone gradient fills under the curve
Split the area under the curve into three colored zones:
- **Safe zone (Weeks 1 to cliff-2):** Green-tinted fill (`var(--risk-low)` at ~0.08 opacity)
- **Warning zone (cliff-2 to cliff+1):** Amber-tinted fill (`var(--risk-moderate)` at ~0.08 opacity)
- **Fatigue cliff (cliff+1 to 12):** Red-tinted fill (`var(--risk-critical)` at ~0.08 opacity)

Use `<clipPath>` with the curve path as the top boundary and the x-axis as the bottom, then overlay three rectangles with the zone colors.

### c) Add zone legend boxes below the chart
Three boxes in a row (like the reference image):
```
┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  Safe zone   │  │  Warning zone    │  │  Fatigue cliff    │
│  Weeks 1–3   │  │  Weeks 4–6       │  │  Weeks 7+         │
│  CPA within  │  │  CPA up 20–50%   │  │  CPA doubles or   │
│  10–15%      │  │  — refresh window │  │  worse — burning   │
│              │  │  closing          │  │  budget            │
└─────────────┘  └─────────────────┘  └──────────────────┘
```
The week ranges should be dynamic based on the cliff parameter from DECAY_PARAMS, not hardcoded. For example, if cliff=4: Safe=W1–2, Warning=W3–5, Cliff=W6+.

### d) Improve the "you are here" marker
Currently it's a circle + floating text label. Make it:
- A vertical dashed line from the x-axis up to the curve point (already exists, keep it)
- The circle dot on the curve (keep)
- A small annotation box/callout connected to the dot showing:
  - The effectiveness percentage
  - "Based on [monthly/weekly/etc.] refresh cadence"
- Remove the bare "you are here" text label and integrate it into the annotation

### e) Fix the "you are here" framing
The `markerWeek` is a hardcoded lookup in DECAY_PARAMS (weekly→2, bi-weekly→4, monthly→6, reactive→9). This is fine as logic, but the visual framing should clarify what it means. Add a subtitle or axis annotation: "Your typical refresh gap places you here on the curve" rather than implying they're at a specific calendar week.

### f) Add revenue context to the commentary text
Below the curve, the status text (lines 573–583) talks about budget effectiveness percentages. Add a line that connects this to their revenue tier. For example: "At your revenue level, this effectiveness drop represents approximately £X–£Y in monthly orders left on the table." Use the leakLow/leakHigh values that are already computed and passed as props, or accept them as new props.

### g) Increase SVG viewBox size
Current is `0 0 440 220`. This is cramped. Increase to `0 0 480 250` and increase padding to give the curve, labels, and zones room to breathe.

---

## 3. Clean up radar chart to 5 axes (Results page — HIGH PRIORITY)

**Problem:** The chart plots 5 data points on an 8-axis grid, warping the polygon. The 3 locked axes ("Audience Precision", "Signal Quality", "Competitive Position") at 0.3 opacity with "?" labels look broken, not premium.

**Files:**
- `src/Results.jsx` lines 642–742 (RadarChart component)
- `src/scoring.js` lines 252–288 (radar data)

**Changes:**

### a) Remove the 3 locked axes entirely
- Delete `RADAR_LABELS_LOCKED` (line 645)
- Change `N_TOTAL` from 8 to 5 (line 650: `const N_TOTAL = 8` → `const N_TOTAL = 5`)
- Remove the locked axis rendering loop (lines 712–727)
- Remove the "Requires audit" legend item from the legend div (line 670)

### b) Fix polygon geometry
With N_TOTAL = 5, the angle calculation `(Math.PI * 2 * i) / N_TOTAL` will automatically produce a regular pentagon, fixing the warped shape.

### c) Improve visual quality
- The benchmark polygon (green dashed) and user polygon (orange filled) are fine conceptually. Increase the benchmark fill opacity slightly from 0.08 to 0.12 for better visibility.
- Add percentage labels at each vertex showing the user's score for that axis (e.g., "20%" near the Pain/Problem vertex)
- Style the grid rings with slightly more visible strokes

### d) Update the legend
Remove the "Requires audit" legend dot. Keep:
- Orange dot: "Your estimated coverage"
- Green dot: "Top-performing benchmark"

---

## 4. Add 5th revenue tier (Quiz — NEEDS SIGN-OFF ON SCORING RECALIBRATION)

**Problem:** Current 4 tiers (Under £30k / £30k–60k / £60k–150k / £150k+) are too coarse. The £60k–150k range lumps together very different business profiles. A 5th tier gives better qualification signal for whether the brand can realistically grow by £80k/month.

**Files to change (pending Ahmad's sign-off on the exact brackets):**
- `src/Quiz.jsx` lines 38–43 (REVENUE_TIERS)
- `src/scoring.js` lines 18–23 (REVENUE_MIDPOINTS)
- `server/insights.js` line 5 (LABEL_MAP.revenue)
- `src/webhook.js` (if the webhook payload references revenue labels)

**Proposed new tiers:**
```js
const REVENUE_TIERS = [
  { id: 'under_30k', title: 'Under £30k' },
  { id: '30k_60k', title: '£30k–£60k' },
  { id: '60k_100k', title: '£60k–£100k' },
  { id: '100k_250k', title: '£100k–£250k' },
  { id: '250k_plus', title: '£250k+' },
]
```

**Scoring impact — requires recalibration:**
```js
// New REVENUE_MIDPOINTS
export const REVENUE_MIDPOINTS = {
  under_30k: 20000,
  '30k_60k': 45000,
  '60k_100k': 80000,
  '100k_250k': 175000,
  '250k_plus': 350000,
}
```

The revenue midpoint feeds the guardrail cap at line 100: `Math.min(recoverableMonthly, revenueMid * 0.15)`. Changing midpoints changes the cap, which changes the output. The sweet-spot lead test (£30–80k spend, ~2x return, low diversity → output £8–25k/month) must still pass after this change. Run the audit test.

Also update `server/insights.js` LABEL_MAP:
```js
revenue: { under_30k: 'Under £30k', '30k_60k': '£30k-£60k', '60k_100k': '£60k-£100k', '100k_250k': '£100k-£250k', '250k_plus': '£250k+' },
```

**⚠️ Do NOT implement without Ahmad's explicit sign-off on the tier boundaries. Only implement after he confirms the exact brackets.**

---

## 5. Bump frustration max from 3 to 4 (Quiz)

**Files:**
- `src/Quiz.jsx` line 179: change `f.length < 3` → `f.length < 4`
- `src/Quiz.jsx` line 446: change `.length >= 3` → `.length >= 4`
- `src/scoring.js` line 111: the fatigue score adds `frustrationCount * 4` — with max 4 selections this becomes max +16 instead of max +12. The score range shifts. Check that the score still lands in reasonable bands (12–97 range, clamped at line 133). If the extra 4 points pushes too many users into "Critical" (>75), reduce the coefficient from 4 to 3: `frustrationCount * 3` (max +12 at 4 selections, same ceiling as current 3×4).
- Update the TOTAL_STEPS count if this question now shows a "(select up to 4)" label
- Update the quiz UI microcopy if it says "pick up to 3" anywhere

---

## 6. Website URL integration (Backend — SEPARATE EFFORT)

**Current state:** The website URL from Quiz Step 1 is passed as plain text in the LLM prompt (`server/insights.js` line 43: `"- Website: ${answers.websiteUrl}"`). The Haiku call has NO tool use, no web search, no scraping. The model can only infer from the domain string itself. The "hyper-personalised results" promise on the quiz is currently empty.

**Two implementation options (discuss with Ahmad which to pursue):**

### Option A: Firecrawl scrape before LLM call
Add a pre-step in `server/insights.js` `generateInsights()` that:
1. Checks if `answers.websiteUrl` is non-empty
2. Calls Firecrawl's `/scrape` endpoint to extract the page content (homepage or /about)
3. Truncates the result to ~2000 chars
4. Injects it into the user prompt as a `WEBSITE CONTEXT:` block

**Pros:** Rich context (product descriptions, brand positioning, ingredient lists, tone of voice). **Cons:** Adds dependency, latency (2–5s), cost per scrape, and failure handling.

### Option B: Web search via Anthropic tool use
Switch the Haiku call to include web search as a tool, passing the URL as a search query. The model can then pull context about the brand.

**Pros:** No extra dependency. **Cons:** Web search results are hit-or-miss for small skincare brands, adds latency, may not surface the brand's own site content.

### Option C: Do nothing, remove the "hyper-personalised" claim
If the URL doesn't actually feed into the output, remove the "For hyper-personalised results" microcopy from Quiz Step 1 (Quiz.jsx ~line 262). Replace with something honest like "Optional — helps us understand your brand."

**Recommendation:** Option A (Firecrawl) gives the best quality result but needs a Firecrawl API key and error handling. Option C is the zero-effort honest fix. Do NOT leave the "hyper-personalised" claim if the URL isn't actually used.

**If implementing Option A**, the changes go in `server/insights.js`:
- Add Firecrawl SDK import
- Add a `scrapeWebsite(url)` function with timeout + truncation
- Call it at the top of `generateInsights()` before `buildUserPrompt()`
- Pass scraped content as a new parameter to `buildUserPrompt()`
- Add a `WEBSITE CONTEXT:` section to the prompt between BRAND DATA and OUTPUT FORMAT
- Handle failures gracefully (if scrape fails, proceed without website context)
- Increase the Haiku timeout from 8000ms (line 154) to 12000ms to accommodate the extra context

---

## Execution order

1. **Gauge fix** (#1) — standalone, no dependencies, highest visual impact
2. **Radar cleanup** (#3) — standalone, no dependencies
3. **Decay curve upgrade** (#2) — standalone but largest scope
4. **Frustration bump** (#5) — small, but verify scoring impact
5. **Revenue tier** (#4) — BLOCKED on Ahmad's sign-off on brackets + scoring recalibration
6. **Website URL** (#6) — BLOCKED on decision between options A/B/C

## Testing

After all changes:
- Run `npm run build` — must succeed with no errors
- Run the scoring audit test from `docs/audit-2026-06-12.md` — sweet-spot lead must still output £8–25k/month
- Test at 320px, 375px, 414px mobile widths — gauge, curve, radar must not overlap or overflow
- Test with these quiz combinations for decay curve:
  - under_5k + weekly (marker at week 2, cliff at 8 — should be in safe zone)
  - 15k_50k + monthly_or_less (marker at week 6, cliff at 4 — should be past cliff)
  - 100k_plus + only_when_drops (marker at week 9, cliff at 2.5 — deep past cliff)
- Verify the radar renders as a regular pentagon with 5 vertices, no warping

# Implementation Specs v4 — 25 Jun 2026

Three items: spend tier update, scoring guardrail tests, and dev server setup for LLM insights.

---

## 11. Update spend tiers to new brackets

### Current tiers (`src/Quiz.jsx` SPEND_TIERS)
```
Under £5k | £5k–£15k | £15k–£50k | £50k–£100k | £100k+
```

### New tiers
```
Under £10k | £10k–£30k | £30k–£50k | £50k–£100k | £100k+
```

### All 9 locations that reference spend tier IDs

Every instance of `under_5k`, `5k_15k`, `15k_50k` must be replaced. The `50k_100k` and `100k_plus` keys stay the same.

**1. `src/Quiz.jsx` — SPEND_TIERS array:**
```js
const SPEND_TIERS = [
  { id: 'under_10k', title: 'Under £10k' },
  { id: '10k_30k', title: '£10k–£30k' },
  { id: '30k_50k', title: '£30k–£50k' },
  { id: '50k_100k', title: '£50k–£100k' },
  { id: '100k_plus', title: '£100k+' },
]
```

**2. `src/scoring.js` — SPEND_MIDPOINTS:**
```js
export const SPEND_MIDPOINTS = {
  under_10k: 6000,
  '10k_30k': 20000,
  '30k_50k': 40000,
  '50k_100k': 75000,
  '100k_plus': 125000,
}
```

**3. `src/scoring.js` — Fatigue score contribution (in `calculateScore`):**
```js
score += {
  under_10k: 0,
  '10k_30k': 3,
  '30k_50k': 6,
  '50k_100k': 8,
  '100k_plus': 10,
}[inputs.spendTier]
```

**4. `src/scoring.js` — Lead qualification check:**
Currently `under_5k` disqualifies. Change to `under_10k`:
```js
const qualifiedSpend = !['under_10k'].includes(inputs.spendTier)
```

**5. `src/scoring.js` — LANE_MULTIPLIERS:**
```js
const LANE_MULTIPLIERS = {
  under_10k:   { low: 3.5, high: 5.0 },
  '10k_30k':   { low: 3.5, high: 5.0 },
  '30k_50k':   { low: 3.5, high: 4.5 },
  '50k_100k':  { low: 3.0, high: 4.0 },
  '100k_plus': { low: 3.0, high: 3.5 },
}
```

**6. `src/scoring.js` — BENCHMARK_SCORES:**
```js
export const BENCHMARK_SCORES = {
  under_10k: 42,
  '10k_30k': 35,
  '30k_50k': 30,
  '50k_100k': 28,
  '100k_plus': 25,
}
```

**7. `src/scoring.js` — DECAY_PARAMS (5 blocks × 4 refresh rates):**

Replace `under_5k`, `5k_15k`, and `15k_50k` blocks. Keep `50k_100k` and `100k_plus` as-is.

```js
export const DECAY_PARAMS = {
  under_10k: {
    weekly:          { cliff: 8,   steepness: 0.45, markerWeek: 2 },
    every_2_3_weeks: { cliff: 6,   steepness: 0.50, markerWeek: 4 },
    monthly_or_less: { cliff: 5,   steepness: 0.55, markerWeek: 6 },
    only_when_drops: { cliff: 4,   steepness: 0.60, markerWeek: 9 },
  },
  '10k_30k': {
    weekly:          { cliff: 7,   steepness: 0.55, markerWeek: 2 },
    every_2_3_weeks: { cliff: 5.5, steepness: 0.60, markerWeek: 4 },
    monthly_or_less: { cliff: 4.5, steepness: 0.70, markerWeek: 6 },
    only_when_drops: { cliff: 3.5, steepness: 0.80, markerWeek: 9 },
  },
  '30k_50k': {
    weekly:          { cliff: 6,   steepness: 0.70, markerWeek: 2 },
    every_2_3_weeks: { cliff: 5,   steepness: 0.85, markerWeek: 4 },
    monthly_or_less: { cliff: 4,   steepness: 1.00, markerWeek: 6 },
    only_when_drops: { cliff: 3,   steepness: 1.10, markerWeek: 9 },
  },
  '50k_100k': {
    weekly:          { cliff: 5,   steepness: 0.90, markerWeek: 2 },
    every_2_3_weeks: { cliff: 4,   steepness: 1.10, markerWeek: 4 },
    monthly_or_less: { cliff: 3,   steepness: 1.30, markerWeek: 6 },
    only_when_drops: { cliff: 2.5, steepness: 1.50, markerWeek: 9 },
  },
  '100k_plus': {
    weekly:          { cliff: 5,   steepness: 0.90, markerWeek: 2 },
    every_2_3_weeks: { cliff: 4,   steepness: 1.10, markerWeek: 4 },
    monthly_or_less: { cliff: 3,   steepness: 1.30, markerWeek: 6 },
    only_when_drops: { cliff: 2.5, steepness: 1.50, markerWeek: 9 },
  },
}
```

**8. `server/insights.js` — LABEL_MAP.spendTier:**
```js
spendTier: { under_10k: 'Under £10k', '10k_30k': '£10k-£30k', '30k_50k': '£30k-£50k', '50k_100k': '£50k-£100k', '100k_plus': '£100k+' },
```

**9. `src/App.jsx` — SAMPLE_ANSWERS:**
Change `spendTier: '15k_50k'` → `spendTier: '30k_50k'`

**10. `src/webhook.js`** — search for any hardcoded spend tier IDs and update.

### ⚠️ Scoring impact — READ THIS

The `SPEND_MIDPOINTS` change is the highest-risk part of this spec. The midpoint feeds directly into the main formula:

- `fatigueTax = spend × fatigueCoeff × (1 - diversityScore) × volumeMult`
- `efficiencyGap = max(0, 3.2 - roasMid) × spend × 0.35`
- `costTrendTax = spend × costTrendRate`

Changing the midpoint changes the output proportionally. Key shifts:

| Old tier | Old midpoint | New tier | New midpoint | Change |
|----------|-------------|----------|-------------|--------|
| under_5k | £3,000 | under_10k | £6,000 | 2× |
| 5k_15k | £10,000 | 10k_30k | £20,000 | 2× |
| 15k_50k | £32,500 | 30k_50k | £40,000 | 1.23× |

The guardrail cap (`min(recoverable, revenue × 0.15)`) prevents runaway numbers, but the sweet-spot lead test MUST pass after this change. **Run `npm run test:scoring` (item 12) before committing.**

### ⚠️ Global search after changes

Run this and confirm zero matches:
```bash
grep -r "under_5k\|5k_15k\|15k_50k" src/ server/
```

---

## 12. Create automated scoring guardrail test

Create a runnable test script that catches blowouts. Must exit non-zero on failure.

### Create `tests/scoring-guardrails.mjs`

```js
import { calculateScore, calculateThreeLaneImpact } from '../src/scoring.js'

let failures = 0

function test(name, inputs, checks) {
  const result = calculateScore(inputs)
  const tl = calculateThreeLaneImpact(result.leakLow, result.leakHigh, inputs.spendTier, inputs)

  for (const [check, fn] of Object.entries(checks)) {
    const passed = fn(result, tl)
    if (!passed) {
      console.error(`FAIL: ${name} — ${check}`)
      console.error(`  Score: ${result.score}, Leak: £${result.leakLow}–£${result.leakHigh}/mo`)
      console.error(`  Combined: £${tl.combined.low}–£${tl.combined.high}/mo`)
      failures++
    } else {
      console.log(`  OK: ${name} — ${check}`)
    }
  }
}

// ─── SWEET-SPOT LEAD (the most important test) ───────────────────────────
// £30–50k spend, ~2x ROAS, low diversity, monthly refresh
// MUST output £8,000–£25,000/month for the Meta lane
test('Sweet-spot lead (30k_50k spend, 2x ROAS, low diversity)', {
  spendTier: '30k_50k',
  revenue: '80k_120k',
  roasBracket: 'r_1_5_2_5',
  refreshRate: 'monthly_or_less',
  angleDiversity: 'yes_same',
  creativeVolume: 'vol_3_7',
  costTrend: 'up_some',
  adsMadeBy: 'agency',
  frustrationCount: 3,
  frustrations: ['stop_performing', 'shrinking_returns', 'same_message'],
}, {
  'Meta lane low ≥ £8,000': (r) => r.leakLow >= 8000,
  'Meta lane high ≤ £25,000': (r) => r.leakHigh <= 25000,
  'Score in high-risk band (60–85)': (r) => r.score >= 60 && r.score <= 85,
})

// ─── SWEET-SPOT LEAD — 10k-30k spend variant ─────────────────────────────
test('Sweet-spot lead (10k_30k spend, 2x ROAS, low diversity)', {
  spendTier: '10k_30k',
  revenue: '30k_80k',
  roasBracket: 'r_1_5_2_5',
  refreshRate: 'monthly_or_less',
  angleDiversity: 'yes_same',
  creativeVolume: 'vol_1_2',
  costTrend: 'up_lots',
  adsMadeBy: 'founder',
  frustrationCount: 3,
  frustrations: ['stop_performing', 'shrinking_returns', 'hit_wall'],
}, {
  'Meta lane low ≥ £3,000': (r) => r.leakLow >= 3000,
  'Meta lane high ≤ £15,000': (r) => r.leakHigh <= 15000,
})

// ─── HIGH SPENDER SANITY CHECK ───────────────────────────────────────────
// £100k+ spend should not produce fantasy numbers
test('High spender (100k_plus, 1.2x ROAS, worst practice)', {
  spendTier: '100k_plus',
  revenue: '120k_plus',
  roasBracket: 'under_1_5',
  refreshRate: 'only_when_drops',
  angleDiversity: 'yes_same',
  creativeVolume: 'vol_1_2',
  costTrend: 'up_lots',
  adsMadeBy: 'founder',
  frustrationCount: 4,
  frustrations: ['stop_performing', 'shrinking_returns', 'hit_wall', 'volatile_months'],
}, {
  'Meta lane high ≤ £30,000 (capped by revenue)': (r) => r.leakHigh <= 30000,
  'Score ≤ 97 (clamped)': (r) => r.score <= 97,
  'Combined high ≤ £120,000': (_, tl) => tl.combined.high <= 120000,
})

// ─── LOW SPENDER FLOOR CHECK ─────────────────────────────────────────────
test('Low spender (under_10k, 4x ROAS, decent practice)', {
  spendTier: 'under_10k',
  revenue: 'under_30k',
  roasBracket: 'over_4',
  refreshRate: 'every_2_3_weeks',
  angleDiversity: 'no_varied',
  creativeVolume: 'vol_8_12',
  costTrend: 'flat',
  adsMadeBy: 'in_house',
  frustrationCount: 0,
  frustrations: ['none'],
}, {
  'Meta lane low ≥ £700 (floor)': (r) => r.leakLow >= 700,
  'Score in low-risk band (12–35)': (r) => r.score >= 12 && r.score <= 35,
})

// ─── HEALTHY BRAND SHOULD NOT LOOK SICK ──────────────────────────────────
test('Healthy brand (50k_100k, 4x ROAS, weekly refresh, varied)', {
  spendTier: '50k_100k',
  revenue: '120k_plus',
  roasBracket: 'over_4',
  refreshRate: 'weekly',
  angleDiversity: 'no_varied',
  creativeVolume: 'vol_12_plus',
  costTrend: 'improved',
  adsMadeBy: 'in_house',
  frustrationCount: 0,
  frustrations: ['none'],
}, {
  'Score ≤ 35 (low risk)': (r) => r.score <= 35,
  'Meta lane high ≤ £10,000': (r) => r.leakHigh <= 10000,
})

// ─── NO LANE PRODUCES ZERO OR NEGATIVE ───────────────────────────────────
for (const spend of ['under_10k', '10k_30k', '30k_50k', '50k_100k', '100k_plus']) {
  test(`All lanes positive for ${spend}`, {
    spendTier: spend,
    revenue: '80k_120k',
    roasBracket: 'r_1_5_2_5',
    refreshRate: 'monthly_or_less',
    angleDiversity: 'probably',
    creativeVolume: 'vol_3_7',
    costTrend: 'up_some',
    adsMadeBy: 'agency',
    frustrationCount: 2,
    frustrations: ['stop_performing', 'same_message'],
  }, {
    'Lane 1 low > 0': (_, tl) => tl.lane1.low > 0,
    'Lane 2 low > 0': (_, tl) => tl.lane2.low > 0,
    'Lane 3 low > 0': (_, tl) => tl.lane3.low > 0,
    'Combined ≈ sum of lanes': (_, tl) => {
      const sum = tl.lane1.low + tl.lane2.low + tl.lane3.low
      return Math.abs(tl.combined.low - sum) <= 200
    },
  })
}

// ─── REPORT ──────────────────────────────────────────────────────────────
if (failures > 0) {
  console.error(`\n${failures} test(s) failed`)
  process.exit(1)
} else {
  console.log('\nAll scoring guardrail tests passed')
  process.exit(0)
}
```

### Add to `package.json` scripts
```json
"test:scoring": "node tests/scoring-guardrails.mjs"
```

### Execution rule

Claude Code MUST run `npm run test:scoring` after ANY change to `src/scoring.js`. If any test fails, **stop and report** — do not commit or deploy.

---

## 13. Make LLM insights visible during development

### Problem

The Replit/dev setup runs `npm run dev` which starts only the Vite dev server. The Express backend (which handles `/api/insights`) runs separately on port 3001. Without it, Vite's proxy returns `ECONNREFUSED` and insights silently fail. The LLM diagnosis section ("What this means for [brand name]") never appears.

### Changes

**a) Add a combined dev script to `package.json`:**

Check if `concurrently` is installed. If not, add it. Then add:
```json
"dev:full": "concurrently \"npm run dev\" \"node server/index.js\"",
```

This starts both Vite (port 5000) and Express (port 3001) in one terminal. The Vite proxy config (in `vite.config.js`) already forwards `/api` to `localhost:3001`.

If `concurrently` is too heavy, a simpler alternative using `&`:
```json
"dev:full": "node server/index.js & vite",
```

**b) Verify the Vite proxy config:**

Check `vite.config.js` for the proxy setting. It should have:
```js
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```
If this doesn't exist, add it.

**c) Ensure ANTHROPIC_API_KEY is available:**

On Replit: Add `ANTHROPIC_API_KEY` in the Secrets tab (visible in the Replit UI top bar). The Express server reads it from `process.env.ANTHROPIC_API_KEY`.

Locally: Create a `.env` file from `.env.example` and use `dotenv` or pass it inline:
```bash
ANTHROPIC_API_KEY=sk-ant-... npm run dev:full
```

If the server doesn't load `.env` automatically, add `dotenv` to `server/index.js`:
```js
import 'dotenv/config'  // add at top of file
```
And install: `npm install dotenv`

**d) Where the insights appear on the results page:**

The LLM diagnosis renders as a section titled **"What this means for [brand name]"** with four cards in a grid:

1. ✓ **What's working** — one sentence affirming strongest signal
2. ⚠ **Where the leak is** — the specific friction point
3. → **The angle you're missing** — a concrete creative direction
4. ⚡ **Test this week** — a specific ad test to run

This section appears between the radar chart and the Loom CTA card. If insights are `null` (v3 added a fallback), you'll see italic text: "Personalised diagnosis unavailable — results based on quiz data only."

### How to verify it's working

1. Start with `npm run dev:full` (or start both servers manually)
2. Check the server terminal for `[SERVER] Listening on port 3001`
3. Run through the full quiz
4. During the 11-second scoring screen, check the server terminal for:
   - `[ROUTE] POST /api/insights received`
   - `[INSIGHTS] Raw LLM response length: XXX`
   - `[VALIDATE] Diagnosis passed validation`
5. On the results page, scroll past the radar chart — the 4-card diagnosis grid should be visible
6. If you see the fallback text instead, check the server terminal for which `[VALIDATE]` or `[INSIGHTS]` warning appeared

---

## Execution order

1. Create the test script first (item 12) — using the OLD spend tier IDs so it captures the current baseline
2. Run the tests to confirm they pass with old tiers
3. Implement spend tier changes (item 11)
4. Run `npm run test:scoring` — if any test fails, adjust coefficients or midpoints until they pass
5. Set up dev:full script (item 13)
6. Run `grep -r "under_5k\|5k_15k\|15k_50k" src/ server/` — must return zero matches
7. `npm run build` — must succeed

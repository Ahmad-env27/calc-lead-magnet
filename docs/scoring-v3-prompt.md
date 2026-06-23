# Scoring V3 — Claude Code Implementation Prompt

Copy everything below the line into Claude Code.

---

## Task

Rewrite the scoring formula in `src/scoring.js` and update any consuming components (`src/Results.jsx`, `src/App.jsx`, `server/insights.js`) to match. The goal: replace the current three-component formula (fatigue tax + efficiency gap + cost creep × 0.55) with Josh's model — a single derived "creative leak percentage" that the lead can verify with mental arithmetic.

Read `CLAUDE.md` before making any changes — it has hard constraints on copy, tone, and what requires sign-off.

## Why we're changing this

The current formula stacks three layers of conservatism (× 0.55 haircut, 15% revenue cap, ±30% band) that double-dampen the output. A £20k/month spender with terrible fatigue scores gets crushed to ~£3k/month, which is underwhelming and doesn't match the ad creative claim (684 orders lost at £20k spend / £35 AOV / 20% leak / 6 months). The new formula must reconcile with that ad.

## The new formula

### Step 1 — Calculate leak percentage

Start with a base from refresh rate, then add modifiers from other quiz answers. All values are additive percentages.

**Base leak % by refresh rate:**

```js
const LEAK_BASE = {
  weekly: 0.12,           // 12% — refreshing at best-practice cadence
  every_2_3_weeks: 0.18,  // 18% — median of 15-25% waste range
  monthly_or_less: 0.24,  // 24% — 20-40% CTR decay by week 3-4
  only_when_drops: 0.28,  // 28% — reactive management, fatigue already baked in
}
```

**Angle diversity modifier:**

```js
const DIVERSITY_MOD = {
  yes_same: 0.06,   // +6% — near-duplicate creatives, algorithm starved
  probably: 0.03,   // +3% — uncertain = likely low
  no_varied: 0,     // 0%
}
```

**Creative volume modifier:**

```js
const VOLUME_MOD = {
  vol_1_2: 0.04,    // +4% — severely underfeeding algorithm
  vol_3_7: 0.02,    // +2% — below 8-12 recommendation
  vol_8_12: 0,      // 0% — at best practice
  vol_12_plus: -0.02, // -2% — above average supply
}
```

**Cost trend modifier:**

```js
const COST_TREND_MOD = {
  up_lots: 0.03,    // +3% — auction already taxing them for fatigue
  up_some: 0.01,    // +1%
  flat: 0,
  improved: 0,
}
```

**ROAS modifier:**

```js
const ROAS_MOD = {
  under_1_5: 0.04,  // +4% — significant efficiency gap vs 3.2x benchmark
  r_1_5_2_5: 0.02,  // +2% — below benchmark
  r_2_5_4: 0,       // 0% — at benchmark
  over_4: -0.02,    // -2% — outperforming
  not_sure: 0.02,   // +2% — assume slightly below
}
```

**Combined:**

```js
const rawLeak = LEAK_BASE[refreshRate]
  + DIVERSITY_MOD[angleDiversity]
  + VOLUME_MOD[creativeVolume]
  + COST_TREND_MOD[costTrend]
  + ROAS_MOD[roasBracket]

const leakPercent = Math.max(0.08, Math.min(0.35, rawLeak))
// Clamped: 8% floor, 35% ceiling
```

### Step 2 — Calculate the money

```js
const spend = SPEND_MIDPOINTS[spendTier]       // keep existing midpoints
const aovMid = AOV_MIDPOINTS[aov]              // keep existing midpoints
const revenueMid = REVENUE_MIDPOINTS[revenue]  // keep existing midpoints

const leakMonthly = spend * leakPercent

// Revenue cap — raised from 15% to 25%. Sanity check only.
const recoverableMonthly = Math.min(leakMonthly, revenueMid * 0.25)

// Display band — ±20% (tighter than old ±30%, leak % itself has variance)
const leakLow = Math.max(400, Math.round(recoverableMonthly * 0.8))
const leakHigh = Math.round(recoverableMonthly * 1.2)

// Annual
const annualLow = leakLow * 12
const annualHigh = leakHigh * 12
```

Note: the display floor is now £400 (was £700). Low-spend brands with good habits should see a proportionally small number — that's honest, and they score as cold leads anyway.

### Step 3 — Spend Decoder (orders framing, Josh's model)

```js
// This replaces the old calculateSpendDecoder function
const ordersLostMonthly = Math.round(recoverableMonthly / aovMid)
const ordersLost6Months = ordersLostMonthly * 6
const revenueLost6Months = ordersLost6Months * aovMid

// Also keep monthly orders rounded to nearest 5 for display
const ordersPerMonth = Math.round(ordersLostMonthly / 5) * 5
const ordersPerYear = ordersPerMonth * 12
const revenuePerYear = ordersPerYear * aovMid
```

**Critical validation:** `£20,000 spend × 0.20 leak ÷ £35 AOV = 114 orders/month × 6 = 686 orders`. This must reconcile with the ad creative claim of 684. The small difference (rounding) is fine.

### Step 4 — Improvement percentage

```js
const currentReturn = spend * roasMid  // keep ROAS_MIDPOINTS as-is
const impLow = Math.max(1, Math.round((leakLow / currentReturn) * 100))
const impHigh = Math.max(impLow + 1, Math.round((leakHigh / currentReturn) * 100))
```

### Step 5 — Ad Fatigue Risk Score

**No changes to the risk score calculation.** Keep the existing additive point system (base 30, clamped 12–97). It serves a different purpose (engagement/psychology) and the current calibration is fine.

### Step 6 — Return object

The `calculateScore` function should now return:

```js
return {
  score,                // risk score (unchanged)
  leakPercent,          // NEW — the derived leak %, e.g. 0.24
  leakLow,
  leakHigh,
  annualLow,
  annualHigh,
  impLow,
  impHigh,
  spend,
  recoverableMonthly,
  strongROAS: inputs.roasBracket === 'over_4',
}
```

### Step 7 — Update Spend Decoder function

Replace `calculateSpendDecoder` to also return the 6-month figures:

```js
export function calculateSpendDecoder(recoverableMonthly, aovMidpoint) {
  const ordersPerMonth = Math.round((recoverableMonthly / aovMidpoint) / 5) * 5
  const ordersPerYear = ordersPerMonth * 12
  const revenuePerYear = ordersPerYear * aovMidpoint
  const orders6Months = ordersPerMonth * 6
  const revenue6Months = orders6Months * aovMidpoint
  return { ordersPerMonth, ordersPerYear, revenuePerYear, orders6Months, revenue6Months }
}
```

## What to remove

- Delete `FATIGUE_COEFFICIENTS` — replaced by `LEAK_BASE`
- Delete `VOLUME_MULTIPLIERS` — replaced by `VOLUME_MOD`
- Delete `COST_TREND_RATES` — replaced by `COST_TREND_MOD`
- Delete `calculateDiversityScore` function — the diversity effect is now a flat modifier, not a multiplicative score
- Delete the 0.55 multiplier (line ~96 in current scoring.js)
- The `SPEND_MIDPOINTS`, `REVENUE_MIDPOINTS`, `AOV_MIDPOINTS`, `ROAS_MIDPOINTS` lookup tables stay exactly as they are

## Results page updates (`src/Results.jsx`)

1. **Show the leak percentage on the results page.** Near the opportunity card or as its own line, display something like: "Your estimated creative leak: 24%". This is the "aha" moment — the lead can multiply their spend by that number and verify it.

2. **Update the formula footer** to reflect the new methodology. The expandable section should explain: `recoverable/month = monthly ad spend × creative leak %` and briefly describe what feeds the leak % (refresh cadence, angle diversity, creative volume, cost trend, ROAS efficiency). Keep it concise.

3. **If the Spend Decoder section renders, add the 6-month framing** alongside the existing monthly/annual numbers — e.g. "Over 6 months, that's ~N orders worth £X that your current ads aren't capturing." This matches the ad creative's 6-month framing.

4. **Do not change any copy tone.** Keep opportunity-framing ("could be adding"), not loss-framing ("you're wasting"). The only loss lines are the two already permitted in CLAUDE.md.

## Server-side updates (`server/insights.js`)

The AI prompt that generates the 3 insights should now also receive `leakPercent` as a data point, so the LLM can reference it. Add it to the quiz answers section of the prompt: `- Estimated creative leak: ${(leakPercent * 100).toFixed(0)}%`

Also: **feed `extraContext` (question 13) into the AI prompt.** It's currently collected but never sent. Add it as: `- Additional context: ${answers.extraContext || 'None provided'}`

## Sanity checks (run these after implementation)

Verify these scenarios produce reasonable output:

1. **Josh's ad match:** £15k-50k spend tier (midpoint £32,500), AOV £35, leak 20% → should show ~£6,500/month, ~186 orders/month, ~1,114 orders/6 months

2. **Sweet-spot lead (from CLAUDE.md):** £30-80k spend (~£32,500 midpoint), ~2x ROAS, low diversity (yes_same), monthly_or_less refresh, vol_3_7 ads, up_some cost trend → leak should be ~33% (0.24 + 0.06 + 0.02 + 0.01 + 0.02 = 0.35, clamped to 0.35). Monthly: ~£11,375. Should fall in the £8-25k/month range.

3. **Well-managed brand:** weekly refresh, varied angles, 8-12 ads, flat costs, 3.2x ROAS → leak should be ~12%. At £10k spend = £1,200/month. Small and honest.

4. **Worst case:** only_when_drops, same hooks, 1-2 ads, costs up lots, under 1.5x ROAS → leak = 0.28 + 0.06 + 0.04 + 0.03 + 0.04 = 0.45, clamped to **0.35**. At £75k spend = £26,250/month.

5. **Revenue cap test:** £125k spend, 35% leak = £43,750/month. Revenue under_30k (midpoint £20k), cap at 25% = £5,000/month. Cap fires correctly — prevents nonsensical ratio.

## Do NOT change

- Risk score calculation (the 12-97 additive points system)
- `getRiskBand` function
- `getLeadTemperature` function
- `SPEND_MIDPOINTS`, `REVENUE_MIDPOINTS`, `AOV_MIDPOINTS`, `ROAS_MIDPOINTS` values
- Any copy/tone rules from CLAUDE.md
- The two permitted loss-framed lines
- Webhook payload structure (just make sure new fields like `leakPercent` are included)

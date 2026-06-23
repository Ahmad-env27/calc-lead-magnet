# Scoring Formula Overhaul — Implementation Prompt

## Context

This is the Audr lead magnet calculator (Vite + React 18). The scoring formula in `src/scoring.js` needs to be overhauled. The current formula uses three opaque components (fatigue tax, efficiency gap, cost creep) multiplied by an arbitrary 0.55 dampener, producing numbers that are too small and unexplainable. We're replacing it with Josh's model: a single derived **leak percentage** applied to monthly spend, producing a monthly £ leak and an orders-lost figure. The leak % is built from quiz answers and grounded in real Meta Ads benchmarks.

**Read `CLAUDE.md` before making any changes** — it has hard constraints on copy, tone, and scoring sign-off rules. The scoring formula itself is what's changing here, but the surrounding rules (currency GBP, opportunity-framing, no pricing/fees, banned vocab, etc.) still apply.

**Do not touch:** the Ad Fatigue Risk Score calculation (the 12–97 score). That stays exactly as-is. Only the revenue/leak/orders calculation and its display are changing.

---

## File: `src/scoring.js` — Formula Changes

### 1. Remove these constants (no longer needed)

```js
// DELETE these:
const FATIGUE_COEFFICIENTS = { ... }
const VOLUME_MULTIPLIERS = { ... }
const COST_TREND_RATES = { ... }
```

Also delete the `calculateDiversityScore` function (lines 69-77). It's no longer used in the new model.

### 2. Add new constants

```js
// Base creative leak % by refresh cadence.
// Grounded in: 15–25% of Meta spend is typically wasted on fatigued
// creatives (Triple Whale, Madgicx, Northbeam data 2024-2025).
// Weekly refreshers sit below average waste; "only when drops" sits above.
const LEAK_BASE = {
  weekly: 0.12,
  every_2_3_weeks: 0.18,
  monthly_or_less: 0.24,
  only_when_drops: 0.28,
}

// Additive modifiers to leak %. Each is grounded in benchmark data:
// - Angle diversity: low diversity = near-duplicate creatives, Meta treats
//   as one ad. Algorithm starved for signal. (Meta 2024 performance report)
// - Creative volume: 8–12 net-new assets/month is best practice. Below
//   that, the algorithm runs out of fresh signal. (Foxwell Digital data)
// - Cost trend: rising CAC = the auction is already taxing for fatigue.
// - ROAS gap: distance from the 3.2x optimised-brand benchmark indicates
//   efficiency drag beyond just creative issues.
const LEAK_MODIFIERS = {
  angleDiversity: { yes_same: 0.06, probably: 0.03, no_varied: 0 },
  creativeVolume: { vol_1_2: 0.04, vol_3_7: 0.02, vol_8_12: 0, vol_12_plus: -0.02 },
  costTrend: { up_lots: 0.03, up_some: 0.01, flat: 0, improved: 0 },
  roasBracket: { under_1_5: 0.04, r_1_5_2_5: 0.02, r_2_5_4: 0, over_4: -0.02, not_sure: 0.02 },
}

// Leak % is clamped to this range. 8% floor = even well-run brands have
// some waste. 35% cap = prevents claiming more than a third of spend is
// leaked, which strains credibility.
const LEAK_MIN = 0.08
const LEAK_MAX = 0.35
```

### 3. Add `calculateLeakPercent` function

```js
export function calculateLeakPercent(inputs) {
  let leak = LEAK_BASE[inputs.refreshRate] || 0.18

  leak += (LEAK_MODIFIERS.angleDiversity[inputs.angleDiversity] || 0)
  leak += (LEAK_MODIFIERS.creativeVolume[inputs.creativeVolume] || 0)
  leak += (LEAK_MODIFIERS.costTrend[inputs.costTrend] || 0)
  leak += (LEAK_MODIFIERS.roasBracket[inputs.roasBracket] || 0.02)

  return Math.max(LEAK_MIN, Math.min(LEAK_MAX, leak))
}
```

### 4. Rewrite `calculateScore` — the revenue calculation portion only

Replace everything from `// Component 1: Creative Fatigue Tax` through the `return` statement. Keep the risk score calculation (lines 110-133) exactly as-is.

The new revenue calculation:

```js
export function calculateScore(inputs) {
  const spend = SPEND_MIDPOINTS[inputs.spendTier]
  const revenueMid = REVENUE_MIDPOINTS[inputs.revenue]
  const roasMid = ROAS_MIDPOINTS[inputs.roasBracket] || 2.6

  // --- Leak-based revenue calculation (Josh's model) ---
  const leakPercent = calculateLeakPercent(inputs)
  let recoverableMonthly = spend * leakPercent

  // Guardrail: cap at 25% of monthly revenue to catch nonsensical
  // spend/revenue combos. Raised from the old 15% — the leak % itself
  // is already bounded at 35%, so this only clips edge cases.
  recoverableMonthly = Math.min(recoverableMonthly, revenueMid * 0.25)

  // Floor so the displayed low never reads as noise for tiny-spend leads
  recoverableMonthly = Math.max(recoverableMonthly, 400)

  // Display range: ±20% (tighter than old ±30% because the leak %
  // already has variance baked in from the modifiers)
  const leakLow = Math.round(recoverableMonthly * 0.8)
  const leakHigh = Math.round(recoverableMonthly * 1.2)

  // --- Ad Fatigue Risk Score (12–97) — UNCHANGED ---
  let score = 30
  score += inputs.frustrationCount * 4
  score += {
    weekly: -5,
    every_2_3_weeks: 3,
    monthly_or_less: 8,
    only_when_drops: 12,
  }[inputs.refreshRate]
  score += {
    yes_same: 15,
    probably: 10,
    no_varied: 0,
  }[inputs.angleDiversity]
  score += {
    under_5k: 0,
    '5k_15k': 3,
    '15k_50k': 5,
    '50k_100k': 8,
    '100k_plus': 10,
  }[inputs.spendTier]
  score += { up_lots: 4, up_some: 2, flat: 0, improved: -3 }[inputs.costTrend] || 0
  score += { vol_1_2: 4, vol_3_7: 1, vol_8_12: 0, vol_12_plus: -3 }[inputs.creativeVolume] || 0
  score += { under_1_5: 4, r_1_5_2_5: 1, r_2_5_4: 0, over_4: 0, not_sure: 1 }[inputs.roasBracket] || 0
  score = Math.max(12, Math.min(97, Math.round(score)))

  // % improvement framing
  const currentReturn = spend * roasMid
  const impLow = Math.max(1, Math.round((leakLow / currentReturn) * 100))
  const impHigh = Math.max(impLow + 1, Math.round((leakHigh / currentReturn) * 100))

  return {
    score,
    leakPercent,          // NEW — the derived leak % (0.08–0.35)
    leakLow,
    leakHigh,
    annualLow: leakLow * 12,
    annualHigh: leakHigh * 12,
    impLow,
    impHigh,
    spend,
    recoverableMonthly,
    strongROAS: inputs.roasBracket === 'over_4',
  }
}
```

**Key differences from old formula:**
- No 0.55 multiplier (killed — it was arbitrary)
- No three-component system (fatigue + gap + creep merged into one leak %)
- Revenue cap raised from 15% → 25%
- Display band tightened from ±30% → ±20%
- Floor lowered from £1,000 → £400
- `leakPercent` added to the return object (used in UI for display)

### 5. `calculateSpendDecoder` — unchanged

This function already takes `recoverableMonthly` and `aovMidpoint` as inputs and converts to orders. It doesn't need changes — it'll automatically produce larger numbers because `recoverableMonthly` is now larger.

### 6. Keep `ROAS_MIDPOINTS` — still used

The ROAS midpoints are still used for the improvement % calculation and are referenced by the leak modifier. Don't delete them.

---

## File: `src/Results.jsx` — UI Changes

### 1. Show the leak % on the results page

In the opportunity card (around line 543 where `leakLow`–`leakHigh` is displayed), add a line above the hero number showing the derived leak percentage. Something like:

```jsx
<p className="leak-percent-label">
  Your estimated creative leak: {Math.round(results.leakPercent * 100)}%
</p>
```

This is the "how do they know that" moment — the lead can verify: "my spend × that percentage = roughly that range." Style it as a secondary label above the hero GBP range.

### 2. Update the formula footer (lines 674-703)

Replace the hardcoded formula explanation text. The old text references "fatigue tax + return gap + cost creep × 55%", the 15% cap, ±30% range, and £700 floor. Replace with text that reflects the new model:

**Summary text (the `<pre>` at lines 676-678):**
```
Your score is based on: refresh cadence × messaging variety × creative volume × return on spend.
The revenue range uses your estimated creative leak — the percentage of monthly spend going to
fatigued or underperforming creatives. Treat it as a directional indicator, not a quote.
```

**Expandable detail (the `<pre>` at lines 690-700):**
```
creative leak %   starts at your refresh cadence baseline
                  (12–28%), then adjusts for angle diversity,
                  creative volume, cost trend, and ROAS bracket
                  — clamped between 8% and 35%
recoverable/mo    monthly spend × creative leak %
orders lost       recoverable ÷ your average order value
cap               never more than ~25% of your monthly revenue
display range     ±20% around the midpoint
```

---

## Verification — Required Sanity Checks

After making changes, run these scenarios to verify the output is correct. You can do this in a node script or in browser console.

### Test 1: Josh's ad claim (must reconcile)
- Spend: £20k/month (`15k_50k` tier, midpoint £32,500)
- AOV: £35 (`aov_25_40`, midpoint £32 — or use custom £35 if available)
- Leak: should be ~20% for a moderate-bad profile
- Expected: ~114 orders/month at £35 AOV, ~684 over 6 months

Inputs: `refreshRate: 'monthly_or_less'`, `angleDiversity: 'probably'`, `creativeVolume: 'vol_3_7'`, `costTrend: 'up_some'`, `roasBracket: 'r_1_5_2_5'`
Expected leak: 24% + 3% + 2% + 1% + 2% = **32%**. That's higher than 20% — but 20% is the ad's conservative framing. The calculator showing 32% for someone with moderate-bad signals is fine; it means the ad understates the problem, which is better than overstating it.

### Test 2: Sweet-spot lead (CLAUDE.md requirement: £8–25k/month)
- Inputs: `spendTier: '15k_50k'` (£32,500), `revenue: '60k_150k'`, `refreshRate: 'monthly_or_less'`, `angleDiversity: 'yes_same'`, `costTrend: 'up_some'`, `roasBracket: 'r_1_5_2_5'`, `creativeVolume: 'vol_3_7'`
- Expected leak: 24% + 6% + 2% + 1% + 2% = **35%** (capped at max)
- Recoverable: £32,500 × 0.35 = £11,375/month
- Revenue cap check: £100,000 × 0.25 = £25,000. Not hit.
- Display band: £9,100 – £13,650
- ✓ Within £8–25k range

### Test 3: Well-run brand (should show small, honest number)
- Inputs: `spendTier: '5k_15k'` (£10,000), `refreshRate: 'weekly'`, `angleDiversity: 'no_varied'`, `creativeVolume: 'vol_8_12'`, `costTrend: 'improved'`, `roasBracket: 'over_4'`
- Expected leak: 12% + 0% + 0% + 0% + (-2%) = **10%** (clamped above 8%)
- Recoverable: £10,000 × 0.10 = £1,000/month
- Display band: £800 – £1,200
- ✓ Small, honest, still above the £400 floor

### Test 4: High spender, bad habits
- Inputs: `spendTier: '100k_plus'` (£125,000), `revenue: '150k_plus'`, `refreshRate: 'only_when_drops'`, `angleDiversity: 'yes_same'`, `creativeVolume: 'vol_1_2'`, `costTrend: 'up_lots'`, `roasBracket: 'under_1_5'`
- Expected leak: 28% + 6% + 4% + 3% + 4% = **45%** → clamped to **35%**
- Recoverable: £125,000 × 0.35 = £43,750/month
- Revenue cap check: £200,000 × 0.25 = £50,000. Not hit.
- Display band: £35,000 – £52,500
- ✓ Big number but credible for someone burning £125k/month with terrible habits

### Test 5: Revenue cap should clip
- Inputs: `spendTier: '50k_100k'` (£75,000), `revenue: 'under_30k'` (£20,000 — nonsensical combo), `refreshRate: 'only_when_drops'`, `angleDiversity: 'yes_same'`, everything else worst
- Leak: 35% → £75,000 × 0.35 = £26,250
- Revenue cap: £20,000 × 0.25 = **£5,000** — clips it
- ✓ Guardrail catches the bad input combo

---

## What NOT to change

- **Risk score calculation** (the 12–97 score and `getRiskBand`) — unchanged
- **Lead temperature logic** (`getLeadTemperature`) — unchanged
- **`calculateSpendDecoder`** — unchanged (it receives `recoverableMonthly` which is now larger)
- **AI insights prompt** in `server/insights.js` — not part of this change
- **Quiz questions** in `src/Quiz.jsx` — not part of this change
- **Webhook payload structure** in `src/webhook.js` — add `leakPercent` to the payload if it's currently sent, but don't restructure
- **Any copy outside the formula footer** — the opportunity card copy, loss lines, Spend Decoder copy, etc. should remain as-is. Only the formula explanation text changes.
- **Hardline rules from CLAUDE.md** — all still apply (no pricing, opportunity-framing, loss aversion limits, etc.)

---

## Summary of changes

| What | Old | New |
|---|---|---|
| Formula model | 3 components × 0.55 | `spend × leakPercent` (single derived %) |
| Leak % range | N/A (opaque) | 8–35%, displayed to user |
| 0.55 multiplier | Present | **Removed** |
| Revenue cap | 15% | **25%** |
| Display band | ±30% | **±20%** |
| Floor | £1,000 (midpoint), £700 (display) | **£400** (midpoint) |
| Return object | no leakPercent | **adds `leakPercent`** |
| Formula footer copy | "fatigue tax + return gap + cost creep × 55%" | Describes the leak % model |
| UI | hero £ range only | **leak % label + hero £ range** |

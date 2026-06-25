# Implementation Specs v2 — 24 Jun 2026

## 7. Variable three-lane multipliers

### Current state

`scoring.js` lines 191–226. Lanes 1 and 3 are fixed ratios of Lane 2:

```js
// Lane 1 (Audience intelligence) — FIXED
lane1Low  = lane2Low  * 1.5
lane1High = lane2High * 2.5

// Lane 3 (Signal stack) — FIXED
lane3Low  = lane2Low  * 1.0
lane3High = lane2High * 1.5

// Combined — FIXED multiplier by spend tier (3.0–5.0x of Lane 2)
combinedLow  = lane2Low  * LANE_MULTIPLIERS[spendTier].low
combinedHigh = lane2High * LANE_MULTIPLIERS[spendTier].high
```

The function signature (`calculateThreeLaneImpact(lane2Low, lane2High, spendTier)`) receives no quiz answers, so the lanes can't vary independently. Called at `App.jsx` line 102.

### Goal

Make Lane 1 and Lane 3 multipliers vary based on quiz answers so the three lanes don't move in perfect lockstep. Still derived from Lane 2 (not independently calculated), but the ratios shift based on quiz signals that logically map to each lane's domain.

### Quiz signals → lane mapping

**Lane 1 — Audience intelligence ("Knowing what to say")**
Relevant quiz signals that indicate a larger/smaller messaging gap:

| Signal | Larger gap (higher multiplier) | Smaller gap (lower multiplier) |
|---|---|---|
| `angleDiversity` | `yes_same` — recycling same angles | `no_varied` — actively varied |
| `frustrations` containing `customer_language` | yes — don't know how customers talk | no |
| `frustrations` containing `content_not_strategic` | yes — content doesn't feel strategic | no |
| `frustrations` containing `competitor_blindspot` | yes — can't see what competitors do | no |
| `creativeVolume` | `vol_1_2` — very few assets | `vol_12_plus` — high volume |

**Lane 3 — Signal stack ("How Meta reads you")**
Relevant quiz signals that indicate a larger/smaller technical/signal gap:

| Signal | Larger gap (higher multiplier) | Smaller gap (lower multiplier) |
|---|---|---|
| `costTrend` | `up_lots` — costs rising fast | `improved` — costs dropping |
| `roasBracket` | `under_1_5` — poor returns | `over_4` — strong returns |
| `adsMadeBy` | `founder` — DIY setup | `agency` or `in_house` — professional setup |
| `frustrations` containing `shrinking_returns` | yes | no |
| `frustrations` containing `volatile_months` | yes — inconsistent results | no |

### Implementation

#### Step 1: Change the function signature

In `scoring.js`, change:
```js
export function calculateThreeLaneImpact(lane2Low, lane2High, spendTier)
```
to:
```js
export function calculateThreeLaneImpact(lane2Low, lane2High, spendTier, inputs)
```

Where `inputs` is the same object passed to `calculateScore()` — it has `angleDiversity`, `frustrations` (array), `creativeVolume`, `costTrend`, `roasBracket`, `adsMadeBy`.

#### Step 2: Update the call site

In `App.jsx` line 102, change:
```js
const threeLane = calculateThreeLaneImpact(computed.leakLow, computed.leakHigh, finalAnswers.spendTier)
```
to:
```js
const threeLane = calculateThreeLaneImpact(computed.leakLow, computed.leakHigh, finalAnswers.spendTier, inputs)
```

Also update the dev/sample call at `App.jsx` line 132 similarly.

#### Step 3: Calculate variable multipliers

Replace the fixed Lane 1/Lane 3 ratios with quiz-driven scores. Each lane gets a base multiplier that shifts up or down based on the signals above.

```js
// --- Lane 1: Audience Intelligence multiplier ---
// Base range: 1.2x – 2.8x (was fixed 1.5x – 2.5x)
function getLane1Multiplier(inputs) {
  let signal = 0  // range: -3 to +5

  // Angle diversity: biggest single indicator of messaging gap
  signal += { yes_same: 2, probably: 1, no_varied: -1 }[inputs.angleDiversity] || 0

  // Creative volume: fewer assets = less message exploration
  signal += { vol_1_2: 1, vol_3_7: 0, vol_8_12: 0, vol_12_plus: -1 }[inputs.creativeVolume] || 0

  // Frustration signals (each adds +0.5)
  const frst = inputs.frustrations || []
  if (frst.includes('customer_language'))    signal += 0.5
  if (frst.includes('content_not_strategic')) signal += 0.5
  if (frst.includes('competitor_blindspot')) signal += 0.5

  // Normalize to a 0–1 range, then map to multiplier range
  const t = Math.max(0, Math.min(1, (signal + 3) / 8))  // -3→0, +5→1
  return {
    low:  1.2 + t * 0.8,   // 1.2 → 2.0
    high: 1.8 + t * 1.0,   // 1.8 → 2.8
  }
}

// --- Lane 3: Signal Stack multiplier ---
// Base range: 0.8x – 1.8x (was fixed 1.0x – 1.5x)
function getLane3Multiplier(inputs) {
  let signal = 0  // range: -3 to +4

  // Cost trend: rising costs = likely signal degradation
  signal += { up_lots: 2, up_some: 1, flat: 0, improved: -1 }[inputs.costTrend] || 0

  // ROAS: poor returns can indicate signal/targeting issues
  signal += { under_1_5: 1, r_1_5_2_5: 0, r_2_5_4: 0, over_4: -1, not_sure: 0.5 }[inputs.roasBracket] || 0

  // Who makes the ads: founder-led = more likely to have signal gaps
  signal += { founder: 1, freelancers: 0.5, in_house: 0, agency: -0.5 }[inputs.adsMadeBy] || 0

  // Frustration signals
  const frst = inputs.frustrations || []
  if (frst.includes('shrinking_returns')) signal += 0.5
  if (frst.includes('volatile_months'))  signal += 0.5

  const t = Math.max(0, Math.min(1, (signal + 3) / 7))  // -3→0, +4→1
  return {
    low:  0.8 + t * 0.5,   // 0.8 → 1.3
    high: 1.2 + t * 0.6,   // 1.2 → 1.8
  }
}
```

#### Step 4: Use the variable multipliers

Replace the fixed ratio lines (207–210) with:
```js
const l1m = getLane1Multiplier(inputs)
const l3m = getLane3Multiplier(inputs)

const lane1Low  = Math.round(lane2Low  * l1m.low  / 100) * 100
const lane1High = Math.round(lane2High * l1m.high / 100) * 100
const lane3Low  = Math.round(lane2Low  * l3m.low  / 100) * 100
const lane3High = Math.round(lane2High * l3m.high / 100) * 100
```

#### Step 5: Recalculate combined from actual lane sum

Currently the combined total uses its own `LANE_MULTIPLIERS` lookup, ignoring the individual lanes. Change it to actually sum the three lanes:

```js
const combinedLow  = Math.round((lane1Low + lane2Low + lane3Low) / 100) * 100
const combinedHigh = Math.round((lane1High + lane2High + lane3High) / 100) * 100
```

This makes the display internally consistent — the three cards will visibly add up to the combined total (approximately, due to rounding).

**If you want to keep `LANE_MULTIPLIERS` as a guardrail cap** on the combined total (to prevent unrealistic numbers), apply it as a max:
```js
const sumLow  = lane1Low + lane2Low + lane3Low
const sumHigh = lane1High + lane2High + lane3High
const capLow  = Math.round(lane2Low  * multiplier.low  / 100) * 100
const capHigh = Math.round(lane2High * multiplier.high / 100) * 100
const combinedLow  = Math.min(sumLow, capLow)
const combinedHigh = Math.min(sumHigh, capHigh)
```

#### Step 6: Update 6-month and annualized projections

The 12–18 month target currently uses asymmetric multipliers (12x low, 15x high — line 215). This silently inflates the high end by 25%. Either:
- Make both 12x (honest annualization): `annualizedLow = combinedLow * 12; annualizedHigh = combinedHigh * 12`
- Keep 15x high but document it as "18-month" accumulation: `combinedHigh * 15` months = 15 months of recovered revenue, matching the "12–18 month" label. If this is the intent, leave it but add a code comment explaining it.

### Testing

Run these quiz profiles and verify the lanes produce visibly different ratios:

**Profile A — Messaging-heavy gap (Lane 1 should be noticeably larger than Lane 3):**
- angleDiversity: `yes_same`
- creativeVolume: `vol_1_2`
- frustrations: includes `customer_language`, `content_not_strategic`
- costTrend: `flat`
- roasBracket: `r_2_5_4`
- adsMadeBy: `in_house`

**Profile B — Signal-heavy gap (Lane 3 should be closer to or exceed Lane 1):**
- angleDiversity: `no_varied`
- creativeVolume: `vol_8_12`
- frustrations: includes `shrinking_returns`, `volatile_months`
- costTrend: `up_lots`
- roasBracket: `under_1_5`
- adsMadeBy: `founder`

**Profile C — Both gaps small (lanes closer to base rates):**
- angleDiversity: `no_varied`
- creativeVolume: `vol_12_plus`
- costTrend: `improved`
- roasBracket: `over_4`
- adsMadeBy: `agency`
- frustrations: `['none']`

Verify that:
1. The three lane cards no longer show identical ratios across different profiles
2. The combined total roughly equals lane1 + lane2 + lane3 (within rounding)
3. The sweet-spot lead test still outputs £8–25k/month for Lane 2 (this change should NOT affect Lane 2)
4. No lane ever produces a negative or zero value
5. The combined total doesn't exceed the `LANE_MULTIPLIERS` cap (if using the guardrail approach)

### Files changed

- `src/scoring.js` — `calculateThreeLaneImpact()` function + new helper functions
- `src/App.jsx` — call site at line 102 and line 132
- No UI changes needed — the display code in `Results.jsx` already reads from `tl.lane1`, `tl.lane3`, etc.

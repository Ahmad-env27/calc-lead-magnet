// scoring.js — calculator formula + lead temperature logic
// All of this runs client-side. The webhook payload (webhook.js) carries the
// computed values to GHL so routing never has to re-derive them.
//
// v2 recalibration (12 Jun audit): ROAS is now a required bracket (not a typed
// optional), creative volume and cost trend feed the leak, and the output is
// capped against the revenue tier so edge-case inputs can never produce a
// number we couldn't defend on a call.

export const SPEND_MIDPOINTS = {
  under_10k: 6000,
  '10k_30k': 20000,
  '30k_50k': 40000,
  '50k_100k': 75000,
  '100k_plus': 125000,
}

export const REVENUE_MIDPOINTS = {
  under_30k: 20000,
  '30k_80k': 55000,
  '80k_120k': 100000,
  '120k_plus': 180000,
}

export const AOV_MIDPOINTS = {
  aov_25_40: 32,
  aov_40_60: 50,
  aov_60_100: 80,
  aov_100_plus: 140,
}

const FATIGUE_COEFFICIENTS = {
  weekly: 0.18,
  every_2_3_weeks: 0.22,
  monthly_or_less: 0.26,
  only_when_drops: 0.32,
}

// Bracket midpoints from the Step 8 multiple-choice. "Not sure" gets a
// conservative default just under the 2.87x industry average.
const ROAS_MIDPOINTS = {
  under_1_5: 1.2,
  r_1_5_2_5: 2.0,
  r_2_5_4: 3.2,
  over_4: 4.5,
  not_sure: 2.6,
}

// Brands shipping 8–12 net-new assets/month outperform those recycling 2–3
// hero videos at the same spend — low volume amplifies the fatigue tax.
const VOLUME_MULTIPLIERS = {
  vol_1_2: 1.3,
  vol_3_7: 1.15,
  vol_8_12: 1.0,
  vol_12_plus: 0.85,
}

// Rising acquisition costs signal the account is already paying the fatigue
// tax in the auction — a small additive component, not a multiplier.
const COST_TREND_RATES = {
  up_lots: 0.06,
  up_some: 0.03,
  flat: 0,
  improved: 0,
}

// Diversity score derived from Step 5 (refresh rate) + Step 6 (angle diversity).
// Low: recycling + infrequent refresh. High: actively varied + weekly refresh.
export function calculateDiversityScore(refreshRate, angleDiversity) {
  const varied = angleDiversity === 'no_varied'
  const frequent = refreshRate === 'weekly'
  const regular = refreshRate === 'every_2_3_weeks'
  if (varied && frequent) return 0.7
  if (varied && regular) return 0.55
  if (varied || frequent || regular) return 0.35
  return 0.15
}

export function calculateScore(inputs) {
  const spend = SPEND_MIDPOINTS[inputs.spendTier]
  const revenueMid = REVENUE_MIDPOINTS[inputs.revenue]
  const roasMid = ROAS_MIDPOINTS[inputs.roasBracket] || 2.6

  // Component 1: Creative Fatigue Tax (volume-adjusted)
  const fatigueCoeff = FATIGUE_COEFFICIENTS[inputs.refreshRate]
  const diversityScore = calculateDiversityScore(inputs.refreshRate, inputs.angleDiversity)
  const volumeMult = VOLUME_MULTIPLIERS[inputs.creativeVolume] || 1.0
  const fatigueTax = spend * fatigueCoeff * (1 - diversityScore) * volumeMult

  // Component 2: Efficiency gap — how far below top-quartile performance (5x)
  // the brand sits; always positive so even benchmark performers show opportunity.
  // Coefficient 0.20 is more conservative than the old 0.35 because the gap
  // is now measured to the aspirational ceiling, not a median benchmark.
  const efficiencyGap = Math.max(0, 5.0 - roasMid) * spend * 0.20

  // Component 3: Cost-creep tax
  const costTrendTax = spend * (COST_TREND_RATES[inputs.costTrend] || 0)

  // No global multiplier here — the revenue cap below is the meaningful guardrail.
  let recoverableMonthly = fatigueTax + efficiencyGap + costTrendTax

  // Guardrail: cap against revenue so implausible spend/revenue combos can
  // never output a fantasy number. Tiered by revenue band — larger brands have
  // more absolute headroom but the % ceiling is still conservative.
  const REVENUE_CAP_RATES = {
    under_30k: 0.15,
    '30k_80k': 0.22,
    '80k_120k': 0.22,
    '120k_plus': 0.22,
  }
  const capRate = REVENUE_CAP_RATES[inputs.revenue] ?? 0.22
  recoverableMonthly = Math.min(recoverableMonthly, revenueMid * capRate)

  // Guardrail 2: floor the midpoint so the displayed low never reads as noise
  recoverableMonthly = Math.max(recoverableMonthly, 1000)

  // Display range (±30%)
  const leakLow = Math.round(recoverableMonthly * 0.7)
  const leakHigh = Math.round(recoverableMonthly * 1.3)

  // Ad Fatigue Risk Score (12–97)
  let score = 30
  score += inputs.frustrationCount * 3 // max +12 from 4 selections
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
    under_10k: 0,
    '10k_30k': 3,
    '30k_50k': 6,
    '50k_100k': 8,
    '100k_plus': 10,
  }[inputs.spendTier]
  score += { up_lots: 4, up_some: 2, flat: 0, improved: -3 }[inputs.costTrend] || 0
  score += { vol_1_2: 4, vol_3_7: 1, vol_8_12: 0, vol_12_plus: -3 }[inputs.creativeVolume] || 0
  score += { under_1_5: 4, r_1_5_2_5: 1, r_2_5_4: 0, over_4: 0, not_sure: 1 }[inputs.roasBracket] || 0
  score = Math.max(12, Math.min(97, Math.round(score)))

  // % improvement framing, grounded in their actual return bracket
  const currentReturn = spend * roasMid
  const impLow = Math.max(1, Math.round((leakLow / currentReturn) * 100))
  const impHigh = Math.max(impLow + 1, Math.round((leakHigh / currentReturn) * 100))

  return {
    score,
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

export function getRiskBand(score) {
  if (score <= 30) return { key: 'low', label: 'Low risk' }
  if (score <= 55) return { key: 'moderate', label: 'Moderate risk' }
  if (score <= 75) return { key: 'high', label: 'High risk' }
  return { key: 'critical', label: 'Critical' }
}

export function getLeadTemperature(inputs) {
  const highRevenue = ['80k_120k', '120k_plus'].includes(inputs.revenue)
  const qualifiedSpend = !['under_10k'].includes(inputs.spendTier)
  const highSpend = ['50k_100k', '100k_plus'].includes(inputs.spendTier)
  const highPain = inputs.frustrationCount >= 2
  const selectedDisqualifier = inputs.frustrations.includes('none')

  if (selectedDisqualifier) return 'cold'

  if (highRevenue && qualifiedSpend && highPain) return 'super_hot'
  if (highRevenue && qualifiedSpend) return 'hot'
  if (highRevenue || highSpend) return 'warm'

  return 'cold'
}

export function calculateSpendDecoder(recoverableMonthly, aovMidpoint) {
  const rawPerMonth = recoverableMonthly / aovMidpoint
  const ordersPerMonth = Math.round(rawPerMonth / 10) * 10
  const rawPerYear = rawPerMonth * 12
  const ordersPerYear = Math.round(rawPerYear / 50) * 50
  const revenuePerYear = ordersPerYear * aovMidpoint
  return { ordersPerMonth, ordersPerYear, revenuePerYear }
}

export function formatGBP(n) {
  return '£' + Math.round(n).toLocaleString('en-GB')
}

// --- Three-Lane Impact Stack ------------------------------------------------

const LANE_MULTIPLIERS = {
  under_10k:   { low: 3.5, high: 5.0 },
  '10k_30k':   { low: 3.5, high: 5.0 },
  '30k_50k':   { low: 3.5, high: 4.5 },
  '50k_100k':  { low: 3.0, high: 4.0 },
  '100k_plus': { low: 3.0, high: 3.5 },
}

export function calculateThreeLaneImpact(lane2Low, lane2High, spendTier) {
  const multiplier = LANE_MULTIPLIERS[spendTier] || LANE_MULTIPLIERS['30k_50k']

  const combinedLow = Math.round(lane2Low * multiplier.low / 100) * 100
  const combinedHigh = Math.round(lane2High * multiplier.high / 100) * 100

  const lane1Low = Math.round(lane2Low * 1.5 / 100) * 100
  const lane1High = Math.round(lane2High * 2.5 / 100) * 100
  const lane3Low = Math.round(lane2Low * 1.0 / 100) * 100
  const lane3High = Math.round(lane2High * 1.5 / 100) * 100

  const sixMonthLow = combinedLow * 6
  const sixMonthHigh = combinedHigh * 6
  const annualizedLow = combinedLow * 12
  const annualizedHigh = combinedHigh * 15

  return {
    lane2: { low: lane2Low, high: lane2High },
    lane1: { low: lane1Low, high: lane1High, locked: true },
    lane3: { low: lane3Low, high: lane3High, locked: true },
    combined: { low: combinedLow, high: combinedHigh },
    sixMonth: { low: sixMonthLow, high: sixMonthHigh },
    annualized: { low: annualizedLow, high: annualizedHigh },
    multiplier,
  }
}

// --- Cost of Inaction -------------------------------------------------------

export function calculateCostOfInaction(lane2Low, lane2High, aovMidpoint) {
  const ninetyDayLow = Math.round(lane2Low * 3 / 100) * 100
  const ninetyDayHigh = Math.round(lane2High * 2 * 3 / 100) * 100

  const ordersLow = aovMidpoint ? Math.round(ninetyDayLow / aovMidpoint / 10) * 10 : null
  const ordersHigh = aovMidpoint ? Math.round(ninetyDayHigh / aovMidpoint / 10) * 10 : null

  return {
    revenue: { low: ninetyDayLow, high: ninetyDayHigh },
    orders: ordersLow ? { low: ordersLow, high: ordersHigh } : null,
  }
}

// --- Scenario Match ---------------------------------------------------------

export function getScenarioMatch(fatigueScore) {
  if (fatigueScore >= 70) return 'red'
  if (fatigueScore >= 45) return 'orange'
  return 'green'
}

// --- Radar Inference Matrix -------------------------------------------------
// Axes order: [Pain/Problem, Transformation, Social Proof, Science/Ingredient, Founder Story]

const RADAR_MATRIX = {
  skincare: {
    '1_2':    [20, 75, 15, 85, 10],
    '3_4':    [70, 80, 45, 85, 20],
    '5_plus': [75, 85, 70, 90, 50],
  },
  beauty: {
    '1_2':    [15, 80, 85, 20, 10],
    '3_4':    [25, 80, 85, 40, 65],
    '5_plus': [50, 85, 90, 65, 70],
  },
  wellness: {
    '1_2':    [80, 20, 15, 75, 10],
    '3_4':    [85, 45, 40, 80, 65],
    '5_plus': [85, 70, 65, 85, 70],
  },
}

const RADAR_BENCHMARKS = {
  skincare: [80, 85, 65, 90, 55],
  beauty:   [45, 85, 90, 60, 70],
  wellness: [85, 70, 60, 85, 65],
}

export function getRadarScores(brandType, angleDiversity) {
  const type = RADAR_MATRIX[brandType] ? brandType : 'skincare'
  let countKey = '3_4'
  if (angleDiversity === 'yes_same') countKey = '1_2'
  else if (angleDiversity === 'no_varied') countKey = '5_plus'

  return {
    scores: RADAR_MATRIX[type][countKey],
    benchmark: RADAR_BENCHMARKS[type],
  }
}

// --- Benchmark Scores (top quartile by spend tier) --------------------------

export const BENCHMARK_SCORES = {
  under_10k: 42,
  '10k_30k': 35,
  '30k_50k': 30,
  '50k_100k': 28,
  '100k_plus': 25,
}

// --- Sigmoid Decay Curve Params ---------------------------------------------

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

export function effectiveness(week, cliffPoint, steepness) {
  return Math.round(5 + 90 / (1 + Math.exp(steepness * (week - cliffPoint))))
}

// --- CPA Escalation Lookup --------------------------------------------------

const CPA_ESCALATION = [
  { max: 2, low: 15, high: 25 },
  { max: 4, low: 25, high: 45 },
  { max: 8, low: 40, high: 80 },
  { max: 12, low: 60, high: 120 },
  { max: Infinity, low: 80, high: 150 },
]

export function getCPAEscalation(weeksPastCliff) {
  if (weeksPastCliff <= 0) return null
  const tier = CPA_ESCALATION.find((t) => weeksPastCliff <= t.max)
  return tier ? { low: tier.low, high: tier.high } : { low: 80, high: 150 }
}

// --- Display Rounding -------------------------------------------------------

export function roundForDisplay(n) {
  if (n < 1000) return Math.round(n / 50) * 50
  if (n < 10000) return Math.round(n / 100) * 100
  if (n < 50000) return Math.round(n / 500) * 500
  return Math.round(n / 1000) * 1000
}

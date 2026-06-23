// scoring.js — calculator formula + lead temperature logic
// All of this runs client-side. The webhook payload (webhook.js) carries the
// computed values to GHL so routing never has to re-derive them.
//
// v2 recalibration (12 Jun audit): ROAS is now a required bracket (not a typed
// optional), creative volume and cost trend feed the leak, and the output is
// capped against the revenue tier so edge-case inputs can never produce a
// number we couldn't defend on a call.

export const SPEND_MIDPOINTS = {
  under_5k: 3000,
  '5k_15k': 10000,
  '15k_50k': 32500,
  '50k_100k': 75000,
  '100k_plus': 125000,
}

export const REVENUE_MIDPOINTS = {
  under_30k: 20000,
  '30k_60k': 45000,
  '60k_150k': 100000,
  '150k_plus': 200000,
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

  // Component 2: Efficiency Gap vs the 3.2 benchmark for optimised brands
  const efficiencyGap = Math.max(0, 3.2 - roasMid) * spend * 0.35

  // Component 3: Cost-creep tax
  const costTrendTax = spend * (COST_TREND_RATES[inputs.costTrend] || 0)

  let recoverableMonthly = (fatigueTax + efficiencyGap + costTrendTax) * 0.55

  // Guardrail 1: cap against revenue so implausible spend/revenue combos can
  // never output a fantasy number (max ~15% of monthly revenue midpoint)
  recoverableMonthly = Math.min(recoverableMonthly, revenueMid * 0.15)

  // Guardrail 2: floor the midpoint so the displayed low never reads as noise
  recoverableMonthly = Math.max(recoverableMonthly, 1000)

  // Display range (±30%)
  const leakLow = Math.round(recoverableMonthly * 0.7)
  const leakHigh = Math.round(recoverableMonthly * 1.3)

  // Ad Fatigue Risk Score (12–97)
  let score = 30
  score += inputs.frustrationCount * 4 // max +12 from 3 selections
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
  const isSkincareBrand = ['skincare', 'beauty'].includes(inputs.brandType)
  const highRevenue = ['60k_150k', '150k_plus'].includes(inputs.revenue)
  const qualifiedSpend = !['under_5k'].includes(inputs.spendTier)
  const highPain = inputs.frustrationCount >= 2
  const selectedDisqualifier = inputs.frustrations.includes('none')

  if (selectedDisqualifier) return 'cold'
  if (!isSkincareBrand && inputs.brandType !== 'wellness') return 'cold'

  if (isSkincareBrand && highRevenue && qualifiedSpend && highPain) return 'super_hot'
  if (isSkincareBrand && highRevenue && qualifiedSpend) return 'hot'
  if (isSkincareBrand || (highRevenue && qualifiedSpend)) return 'warm'

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

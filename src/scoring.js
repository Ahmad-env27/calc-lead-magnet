// scoring.js — calculator formula + lead temperature logic
// All of this runs client-side. The webhook payload (webhook.js) carries the
// computed values to GHL so routing never has to re-derive them.

export const SPEND_MIDPOINTS = {
  under_5k: 3000,
  '5k_15k': 10000,
  '15k_50k': 32500,
  '50k_100k': 75000,
  '100k_plus': 125000,
}

const FATIGUE_COEFFICIENTS = {
  weekly: 0.18,
  every_2_3_weeks: 0.22,
  monthly_or_less: 0.26,
  only_when_drops: 0.32,
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
  // Component 1: Creative Fatigue Tax
  const spend = SPEND_MIDPOINTS[inputs.spendTier]
  const fatigueCoeff = FATIGUE_COEFFICIENTS[inputs.refreshRate]
  const diversityScore = calculateDiversityScore(inputs.refreshRate, inputs.angleDiversity)

  const fatigueTax = spend * fatigueCoeff * (1 - diversityScore)

  // Component 2: Efficiency Gap (only if they shared a ROAS)
  let efficiencyGap = 0
  if (inputs.currentROAS && inputs.currentROAS < 3.2) {
    efficiencyGap = (3.2 - inputs.currentROAS) * spend * 0.35
  }

  const totalLeak = fatigueTax + efficiencyGap
  // Floor at £700/month — disciplined brands shouldn't see an embarrassingly small number
  const recoverableMonthly = Math.max(totalLeak * 0.55, 700)

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
  score = Math.max(12, Math.min(97, Math.round(score)))

  // % improvement framing vs an assumed 2.5x baseline return on spend
  const currentReturn = spend * 2.5
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
    feeROI: (leakLow * 12) / 60000, // vs £60k annual fee
    // Self-reported ROAS of 8x+ means paid is a small slice of their revenue —
    // show the "more room to scale" note instead of pretending the leak is huge.
    unrealisticROAS: !!inputs.currentROAS && inputs.currentROAS >= 8,
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

export function formatGBP(n) {
  return '£' + Math.round(n).toLocaleString('en-GB')
}

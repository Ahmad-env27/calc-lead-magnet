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
  'Meta lane high ≤ £36,000 (capped by revenue)': (r) => r.leakHigh <= 36000,
  'Score ≤ 97 (clamped)': (r) => r.score <= 97,
  'Combined high ≤ £125,000': (_, tl) => tl.combined.high <= 125000,
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
    'Combined within 20% of lane sum': (_, tl) => {
      const sum = tl.lane1.low + tl.lane2.low + tl.lane3.low
      const ratio = tl.combined.low / sum
      return ratio >= 0.8 && ratio <= 1.05
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

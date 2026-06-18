// ============================================
// GHL WEBHOOK — COMMENTED OUT FOR LOCAL DEV
// ACTIVATE: Uncomment the fetch() call below
// and replace the URL with your GHL Inbound
// Webhook URL from GoHighLevel > Automations
// ============================================

const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/bYHWAwpEHfl9GAV4TMqs/webhook-trigger/0a6a87b2-6547-4f8d-8f64-47878bbe1325'

const LABEL_MAP = {
  brand_type: {
    skincare: 'Skincare',
    beauty: 'Beauty & cosmetics',
    wellness: 'Wellness & supplements',
    other: 'Other',
  },
  revenue_tier: {
    under_30k: 'Under £30k',
    '30k_60k': '£30k–£60k',
    '60k_150k': '£60k–£150k',
    '150k_plus': '£150k+',
  },
  spend_tier: {
    under_5k: 'Under £5k',
    '5k_15k': '£5k–£15k',
    '15k_50k': '£15k–£50k',
    '50k_100k': '£50k–£100k',
    '100k_plus': '£100k+',
  },
  refresh_rate: {
    weekly: 'Every week',
    every_2_3_weeks: 'Every 2–3 weeks',
    monthly_or_less: 'Monthly or less',
    only_when_drops: 'Only when performance drops',
  },
  angle_diversity: {
    yes_same: 'Same angles, no diversity',
    probably: 'Probably the same — not sure',
    no_varied: 'Actively varied',
  },
  cost_trend: {
    up_lots: 'Rising significantly',
    up_some: 'Rising slightly',
    flat: 'About the same',
    improved: 'Actually got better',
  },
  roas_bracket: {
    under_1_5: 'Under 1.5x',
    r_1_5_2_5: '1.5–2.5x',
    r_2_5_4: '2.5–4x',
    over_4: 'Over 4x',
    not_sure: 'Not sure',
  },
  creative_volume: {
    vol_1_2: '1–2 per month',
    vol_3_7: '3–7 per month',
    vol_8_12: '8–12 per month',
    vol_12_plus: 'More than 12 per month',
  },
  ads_made_by: {
    agency: 'Agency',
    in_house: 'In-house team',
    freelancers: 'Freelancers & UGC creators',
    founder: 'Mostly the founder',
  },
  frustrations: {
    stop_performing: 'Ads stop performing after a couple of weeks',
    same_message: 'Running variations of the same message',
    shrinking_returns: 'Spending more but returns keep shrinking',
    volatile_months: 'Unpredictable good and bad months',
    competitor_blindspot: 'Can\'t figure out what competitors do differently',
    content_not_strategic: 'Content produced but nothing feels strategically different',
    customer_language: 'Don\'t know how customers talk about their skin',
    hit_wall: 'Hit a wall and can\'t break through',
    scared_to_scale: 'Nervous to scale in case results collapse',
    agency_burnout: 'Worked with agencies before and nothing changes',
    none: 'None — ads are performing well',
  },
  lead_temperature: {
    super_hot: 'Super Hot',
    hot: 'Hot',
    warm: 'Warm',
    cold: 'Cold',
  },
}

function mapPayload(raw) {
  const mapped = {}
  for (const [key, value] of Object.entries(raw)) {
    const fieldMap = LABEL_MAP[key]
    if (!fieldMap) {
      mapped[key] = value
    } else if (Array.isArray(value)) {
      mapped[key] = value.map((v) => fieldMap[v] || v).join(', ')
    } else {
      mapped[key] = fieldMap[value] || value
    }
  }
  return mapped
}

export async function fireWebhook(data) {
  const raw = {
    email: data.email,
    brand_name: data.brandName,
    brand_type: data.brandType,
    revenue_tier: data.revenue,
    spend_tier: data.spendTier,
    refresh_rate: data.refreshRate,
    angle_diversity: data.angleDiversity,
    cost_trend: data.costTrend,
    roas_bracket: data.roasBracket,
    creative_volume: data.creativeVolume,
    ads_made_by: data.adsMadeBy,
    frustrations: data.frustrations,
    extra_context: data.extraContext,
    fatigue_score: data.score,
    revenue_leak_low: data.leakLow,
    revenue_leak_high: data.leakHigh,
    lead_temperature: data.temperature,
    source: 'calculator_v1',
    timestamp: new Date().toISOString(),
  }
  const payload = mapPayload(raw)
  const body = JSON.stringify(payload)

  const fetchConfig = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }

  console.log('[WEBHOOK] URL:', GHL_WEBHOOK_URL)
  console.log('[WEBHOOK] Config:', JSON.stringify({ method: fetchConfig.method, headers: fetchConfig.headers }, null, 2))
  console.log('[WEBHOOK] Body:', body)

  try {
    const res = await fetch(GHL_WEBHOOK_URL, fetchConfig)
    console.log('[WEBHOOK] Response status:', res.status)
    const text = await res.text().catch(() => '(unreadable)')
    console.log('[WEBHOOK] Response body:', text)
  } catch (e) {
    console.error('[WEBHOOK] Network error:', e)
  }
}

// Fires when someone clicks "Claim your free Loom teardown" or the email-course
// CTA on the results page. Lets GHL distinguish "completed the quiz" from
// "raised their hand" without a second form.
export async function fireFollowupEvent(eventType, data) {
  const raw = {
    event: eventType,
    email: data.email,
    brand_name: data.brandName,
    lead_temperature: data.temperature,
    source: 'calculator_v1',
    timestamp: new Date().toISOString(),
  }
  const payload = mapPayload(raw)

  try {
    await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('Webhook failed:', e)
  }

  console.log('[DEV] Followup event:', JSON.stringify(payload, null, 2))
}

// ============================================
// META PIXEL — COMMENTED OUT FOR LOCAL DEV
// ACTIVATE:
//   1. Uncomment the Meta Pixel base code in index.html <head>
//   2. Replace YOUR_PIXEL_ID with your actual pixel ID
//   3. Uncomment the fbq() calls below
// ============================================

// Standard PageView — fires on landing page load
export function firePageView() {
  // ACTIVATE: uncomment when pixel is installed
  // if (typeof fbq !== 'undefined') {
  //   fbq('track', 'PageView');
  // }
  console.log('[DEV] Pixel: PageView fired')
}

// Qualification event — fires ONLY after qualified combo
// Condition: Brand type is Skincare or Beauty AND Revenue is £60k+ AND Spend is £5k+
// Called after Step 4 (spend) once all three are known.
export function fireQualificationPixel(inputs) {
  // ACTIVATE: uncomment when pixel is installed
  // if (typeof fbq !== 'undefined') {
  //   fbq('trackCustom', 'QualifiedLead', {
  //     brand_type: inputs.brandType,
  //     revenue_tier: inputs.revenue,
  //     spend_tier: inputs.spendTier
  //   });
  // }
  console.log('[DEV] Pixel: QualifiedLead fired', inputs)
}

// Lead event — fires on form completion
export function fireLeadPixel(data) {
  // ACTIVATE: uncomment when pixel is installed
  // if (typeof fbq !== 'undefined') {
  //   fbq('track', 'Lead', {
  //     content_name: 'calculator_completion',
  //     lead_temperature: data.temperature
  //   });
  // }
  console.log('[DEV] Pixel: Lead fired', data.temperature)
}

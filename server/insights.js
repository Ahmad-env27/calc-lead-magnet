import Anthropic from '@anthropic-ai/sdk'
import { REFERENCE_DOC } from './reference-doc.js'

const LABEL_MAP = {
  revenue: { under_30k: 'Under £30k', '30k_60k': '£30k-£60k', '60k_150k': '£60k-£150k', '150k_plus': '£150k+' },
  spendTier: { under_5k: 'Under £5k', '5k_15k': '£5k-£15k', '15k_50k': '£15k-£50k', '50k_100k': '£50k-£100k', '100k_plus': '£100k+' },
  aov: { aov_25_40: '£25-£40', aov_40_60: '£40-£60', aov_60_100: '£60-£100', aov_100_plus: 'Over £100', aov_other: 'Custom' },
  refreshRate: { weekly: 'Every week', every_2_3_weeks: 'Every 2-3 weeks', monthly_or_less: 'Monthly or less', only_when_drops: 'Only when performance drops' },
  angleDiversity: { yes_same: 'Same angles, no diversity', probably: 'Probably the same', no_varied: 'Actively varied' },
  costTrend: { up_lots: 'Rising significantly', up_some: 'Rising slightly', flat: 'About the same', improved: 'Actually improved' },
  roasBracket: { under_1_5: 'Under 1.5x', r_1_5_2_5: '1.5-2.5x', r_2_5_4: '2.5-4x', over_4: 'Over 4x', not_sure: 'Not sure' },
  creativeVolume: { vol_1_2: '1-2 per month', vol_3_7: '3-7 per month', vol_8_12: '8-12 per month', vol_12_plus: 'More than 12 per month' },
  adsMadeBy: { agency: 'Agency', in_house: 'In-house team', freelancers: 'Freelancers & UGC creators', founder: 'Mostly the founder' },
  frustrations: {
    stop_performing: 'Ads stop performing after a couple of weeks',
    same_message: 'Running variations of the same message',
    shrinking_returns: 'Spending more but returns keep shrinking',
    volatile_months: 'Unpredictable good and bad months',
    competitor_blindspot: "Can't figure out what competitors do differently",
    content_not_strategic: 'Content produced but nothing feels strategically different',
    customer_language: "Don't know how customers talk about their skin",
    hit_wall: "Hit a wall and can't break through",
    scared_to_scale: 'Nervous to scale in case results collapse',
    agency_burnout: 'Worked with agencies before and nothing changes',
  },
}

function label(field, value) {
  return LABEL_MAP[field]?.[value] || value
}

function buildUserPrompt(answers) {
  const frustrationLabels = (answers.frustrations || [])
    .filter((f) => f !== 'none')
    .map((f) => label('frustrations', f))
    .join('; ')

  const aovDisplay = answers.aov === 'aov_other'
    ? `£${answers.aovCustom} (custom)`
    : label('aov', answers.aov)

  const websiteLine = answers.websiteUrl
    ? `- Website: ${answers.websiteUrl}`
    : '- Website: not provided'

  const hookLine = answers.bestHook
    ? `- Best-performing hook/angle: ${answers.bestHook}`
    : '- Best-performing hook/angle: not provided'

  const extraLine = answers.extraContext
    ? `- Additional context from the founder: ${answers.extraContext}`
    : ''

  return `Analyse this skincare brand's quiz data and produce a 4-part diagnosis. Be specific to THIS brand — reference their actual data points, not generic advice.

BRAND DATA:
- Brand: ${answers.brandName}
${websiteLine}
- Type: ${answers.brandType}
- Monthly revenue: ${label('revenue', answers.revenue)}
- Monthly Meta ad spend: ${label('spendTier', answers.spendTier)}
- Average order value: ${aovDisplay}
- Creative refresh rate: ${label('refreshRate', answers.refreshRate)}
- Angle diversity: ${label('angleDiversity', answers.angleDiversity)}
- Cost trend: ${label('costTrend', answers.costTrend)}
- ROAS bracket: ${label('roasBracket', answers.roasBracket)}
- Creative volume: ${label('creativeVolume', answers.creativeVolume)}
${hookLine}
- Ads made by: ${label('adsMadeBy', answers.adsMadeBy)}
- Frustrations: ${frustrationLabels || 'None selected'}
${extraLine}

OUTPUT FORMAT — respond with a JSON object, no markdown, no preamble:
{
  "whats_working": "One sentence affirming their strongest signal from the data",
  "the_leak": "One sentence identifying the specific friction point their answer combination reveals",
  "missing_angle": "One concrete creative direction they likely haven't tested, with reasoning from the five angles (Pain/Problem, Transformation/Result, Social Proof, Science/Ingredient, Founder Story)",
  "test_brief": "A specific test to run this week: format, hook structure, angle, why it works for their AOV/audience"
}

Rules:
- Be specific to THIS brand. Reference their actual data.
- Frame as opportunity ("you could...", "there's room to..."), never criticism ("you're wasting...").
- Do not mention pricing, fees, or service offers.
- Say "skincare brands" not "DTC brands" or "D2C brands".
- Currency is GBP.
- 1-2 sentences per field maximum.
- If data is sparse (no website, no hook, no extra context), still give your best analysis from what's available — never say "I don't have enough information".`
}

const PROHIBITED_TERMS = ['price', 'pricing', 'fee', 'cost you', 'guarantee', 'discount', 'offer', 'package']

function validateDiagnosis(obj) {
  if (!obj || typeof obj !== 'object') return null
  const keys = ['whats_working', 'the_leak', 'missing_angle', 'test_brief']
  const result = {}
  for (const key of keys) {
    const val = obj[key]
    if (typeof val !== 'string' || val.length < 10 || val.length > 400) return null
    if (PROHIBITED_TERMS.some((t) => val.toLowerCase().includes(t))) return null
    result[key] = val
  }
  return result
}

export async function generateInsights(answers) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[INSIGHTS] No ANTHROPIC_API_KEY set — skipping LLM call')
    return null
  }

  const client = new Anthropic({ apiKey })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      temperature: 0.7,
      system: REFERENCE_DOC,
      messages: [{ role: 'user', content: buildUserPrompt(answers) }],
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const text = response.content?.[0]?.text || ''
    try {
      return validateDiagnosis(JSON.parse(text))
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return validateDiagnosis(JSON.parse(match[0]))
        } catch { /* fall through */ }
      }
      return null
    }
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      console.warn('[INSIGHTS] API call timed out (8s)')
    } else {
      console.error('[INSIGHTS] API error:', err.message)
    }
    return null
  }
}

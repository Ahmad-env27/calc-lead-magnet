import Anthropic from '@anthropic-ai/sdk'
import { REFERENCE_DOC } from './reference-doc.js'
import { scrapeWebsite } from './scrape.js'

const LABEL_MAP = {
  revenue: { under_30k: 'Under £30k', '30k_80k': '£30k-£80k', '80k_120k': '£80k-£120k', '120k_plus': '£120k+' },
  spendTier: { under_10k: 'Under £10k', '10k_30k': '£10k-£30k', '30k_50k': '£30k-£50k', '50k_100k': '£50k-£100k', '100k_plus': '£100k+' },
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

function buildUserPrompt(answers, websiteContent) {
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

  const websiteSection = websiteContent
    ? `\nSCRAPED WEBSITE CONTENT (from ${answers.websiteUrl}):\n${websiteContent}\n\nIMPORTANT: Use this real website content to ground your diagnosis. Reference specific products, claims, messaging, and brand positioning you can see. Don't make generic statements — cite what's actually on their site.`
    : ''

  const hookLine = answers.bestHook
    ? `- Best-performing hook/angle: ${answers.bestHook}`
    : '- Best-performing hook/angle: not provided'

  const extraLine = answers.extraContext
    ? `- Additional context from the founder: ${answers.extraContext}`
    : ''

  const JOB_LABELS = {
    role_founder: 'Owner / Founder',
    role_md: 'Managing Director',
    role_csuite: 'C-Suite executive',
    role_marketing: 'Marketing Director / Manager',
    role_growth: 'Head of Growth / Performance',
    role_ecom: 'Ecommerce Director / Manager',
    role_agency: 'Agency managing client accounts',
    role_freelance: 'Freelance / Consultant',
  }

  const RESP_LABELS = {
    resp_paid: 'Paid ads (Meta / social)',
    resp_email: 'Email marketing',
    resp_creative: 'Creative / Content',
    resp_seo: 'SEO / Organic',
    resp_cro: 'CRO / Landing pages',
    resp_strategy: 'Strategy / Planning',
  }

  const jobLabel = JOB_LABELS[answers.jobTitle] || ''
  const respLabels = (answers.responsibilities || []).map((r) => RESP_LABELS[r] || r).join(', ')
  const isAgency = answers.jobTitle === 'role_agency' || answers.jobTitle === 'role_freelance'

  let roleContext = ''
  if (jobLabel) {
    roleContext = `\n\nROLE CONTEXT:
The person completing this is a ${jobLabel} who personally manages: ${respLabels || 'not specified'}.
Frame insights in terms relevant to their role:
- Founders/MDs: revenue, profit, business impact — "your business"
- C-Suite: strategic positioning, competitive advantage — "your brand's position"
- Marketing Directors / Heads of Growth: performance metrics, CPA, efficiency — "your campaigns"
- Ecommerce Directors: order volume, AOV optimisation, conversion — "your store"
- Agency / Freelance: frame as "your client's" not "your" — they're evaluating for someone else`
  }

  return `Analyse this ${isAgency ? "brand's" : 'skincare brand\'s'} quiz data and produce a 4-part diagnosis. Be specific to THIS brand — reference their actual data points, not generic advice.

BRAND DATA:
- Brand: ${answers.brandName}
${websiteLine}
${jobLabel ? `- Role: ${jobLabel}` : ''}
${respLabels ? `- Manages: ${respLabels}` : ''}
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
${extraLine}${roleContext}${websiteSection}

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
  if (!obj || typeof obj !== 'object') {
    console.warn('[VALIDATE] Input is not an object:', typeof obj)
    return null
  }
  const keys = ['whats_working', 'the_leak', 'missing_angle', 'test_brief']
  const result = {}
  for (const key of keys) {
    const val = obj[key]
    if (typeof val !== 'string') {
      console.warn(`[VALIDATE] Key "${key}" is not a string:`, typeof val)
      return null
    }
    if (val.length < 10) {
      console.warn(`[VALIDATE] Key "${key}" too short (${val.length} chars):`, val)
      return null
    }
    if (val.length > 400) {
      console.warn(`[VALIDATE] Key "${key}" too long (${val.length} chars)`)
      return null
    }
    const hit = PROHIBITED_TERMS.find((t) => val.toLowerCase().includes(t))
    if (hit) {
      console.warn(`[VALIDATE] Key "${key}" contains prohibited term "${hit}"`)
      return null
    }
    result[key] = val
  }
  console.log('[VALIDATE] Diagnosis passed validation — all 4 keys OK')
  return result
}

export async function generateInsights(answers) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[INSIGHTS] No ANTHROPIC_API_KEY set — skipping LLM call')
    return null
  }

  let websiteData = { markdown: null, screenshotUrl: null }
  if (answers.websiteUrl) {
    console.log('[INSIGHTS] Scraping website:', answers.websiteUrl)
    websiteData = await scrapeWebsite(answers.websiteUrl)
  }

  const client = new Anthropic({ apiKey })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const promptText = buildUserPrompt(answers, websiteData.markdown)
    let messageContent

    if (websiteData.screenshotUrl) {
      console.log('[INSIGHTS] Sending multimodal request (screenshot + text)')
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'url',
            url: websiteData.screenshotUrl,
          },
        },
        {
          type: 'text',
          text: promptText + '\n\nA screenshot of the brand\'s website is attached above. Use the visual design, product photography, layout, and creative style you can see to inform your diagnosis — especially the "missing_angle" and "test_brief" fields. Note their colour palette, imagery style, and how they present their products visually.',
        },
      ]
    } else {
      messageContent = promptText
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: websiteData.markdown ? 800 : 600,
      temperature: 0.7,
      system: REFERENCE_DOC,
      messages: [{ role: 'user', content: messageContent }],
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const text = response.content?.[0]?.text || ''
    console.log('[INSIGHTS] Raw LLM response length:', text.length)
    console.log('[INSIGHTS] Raw LLM response preview:', text.substring(0, 200))
    try {
      return validateDiagnosis(JSON.parse(text))
    } catch (parseErr) {
      console.warn('[INSIGHTS] Direct JSON parse failed:', parseErr.message)
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return validateDiagnosis(JSON.parse(match[0]))
        } catch (regexErr) {
          console.warn('[INSIGHTS] Regex JSON extraction also failed:', regexErr.message)
        }
      }
      console.warn('[INSIGHTS] All parsing attempts failed. Raw text:', text.substring(0, 300))
      return null
    }
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      console.warn('[INSIGHTS] API call timed out (10s)')
    } else {
      console.error('[INSIGHTS] API error:', err.message)
    }
    return null
  }
}

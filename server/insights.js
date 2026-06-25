import Anthropic from '@anthropic-ai/sdk'
import { REFERENCE_DOC } from './reference-doc.js'

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

// Pass 1 prompt: pure research, no JSON, no format pressure
function buildResearchPrompt(answers) {
  return `Search the website ${answers.websiteUrl} for the skincare brand "${answers.brandName}" and summarise what you find in plain prose — no JSON, no headers, no bullet points.

Cover:
1. Hero products and key ingredients or claims
2. Who they target and what problem they solve (condition-specific? lifestyle? age group?)
3. Customer language lifted from reviews or testimonials on the site
4. The creative/messaging angles they currently use in their copy
5. Any obvious gap — an angle their audience would respond to but they haven't used

Be specific. Cite actual product names, copy phrases, and claims you find. Keep under 400 words.`
}

// Pass 2 prompt: synthesis only — research notes are embedded, no tools will be active
function buildSynthesisPrompt(answers, researchNotes) {
  const frustrationLabels = (answers.frustrations || [])
    .filter((f) => f !== 'none')
    .map((f) => label('frustrations', f))
    .join('; ')

  const aovDisplay = answers.aov === 'aov_other'
    ? `£${answers.aovCustom} (custom)`
    : label('aov', answers.aov)

  const websiteSection = researchNotes
    ? `\nWEBSITE RESEARCH (from web search of ${answers.websiteUrl}):\n${researchNotes}\n`
    : answers.websiteUrl
      ? `\n- Website: ${answers.websiteUrl} (research not available)\n`
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
${websiteSection}
BRAND DATA:
- Brand: ${answers.brandName}
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
${extraLine}${roleContext}

Respond with ONLY this JSON object — no text before or after it:
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
- If data is sparse, still give your best analysis from what's available — never say "I don't have enough information".`
}

const PROHIBITED_TERMS = ['price', 'pricing', 'fee', 'cost you', 'guarantee', 'discount', 'offer', 'package']

function validateDiagnosis(obj) {
  if (!obj || typeof obj !== 'object') {
    console.warn('[VALIDATE] Input is not an object:', typeof obj)
    return null
  }
  const keys = ['whats_working', 'the_leak', 'missing_angle', 'test_brief']
  // test_brief is the action field and runs longer when web search context is available
  const maxLen = { test_brief: 900, default: 600 }
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
    const limit = maxLen[key] ?? maxLen.default
    if (val.length > limit) {
      console.warn(`[VALIDATE] Key "${key}" too long (${val.length} chars, limit ${limit})`)
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

function parseAndValidate(rawText, label) {
  // Strip code fences if present
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

  // Attempt 1: direct parse
  try {
    const result = validateDiagnosis(JSON.parse(cleaned))
    if (result) return result
  } catch (_) { /* fall through */ }

  // Attempt 2: anchor on the known first key — survives any prose before the JSON
  const anchorMatch = cleaned.match(/\{\s*"whats_working"[\s\S]*\}/)
  if (anchorMatch) {
    try {
      const result = validateDiagnosis(JSON.parse(anchorMatch[0]))
      if (result) {
        console.warn(`[INSIGHTS] ${label}: used anchored extraction fallback`)
        return result
      }
    } catch (_) { /* fall through */ }
  }

  console.warn(`[INSIGHTS] ${label}: all parse attempts failed. Preview:`, cleaned.substring(0, 200))
  return null
}

export async function generateInsights(answers) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[INSIGHTS] No ANTHROPIC_API_KEY set — skipping LLM call')
    return null
  }

  const client = new Anthropic({ apiKey })
  // 90s covers two sequential API calls; abort signal is shared across both
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90000)

  try {
    // ── Pass 1: Web research (only when a website URL was provided) ────────────
    let researchNotes = ''
    if (answers.websiteUrl) {
      console.log('[INSIGHTS] Pass 1 — researching:', answers.websiteUrl)
      try {
        const researchResp = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: 'You are a paid media analyst researching skincare brands. Be specific and cite actual content you find on the site.',
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
          messages: [{ role: 'user', content: buildResearchPrompt(answers) }],
        }, { signal: controller.signal })

        // Collect all text blocks (tool results + final summary)
        researchNotes = (researchResp.content || [])
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('\n')
          .trim()
        console.log('[INSIGHTS] Pass 1 complete — research notes length:', researchNotes.length)
      } catch (researchErr) {
        // Non-fatal: if research fails we still synthesise from quiz data alone
        console.warn('[INSIGHTS] Pass 1 failed (continuing without website context):', researchErr.message)
      }
    }

    // ── Pass 2: JSON synthesis (no tools, assistant prefill forces JSON start) ─
    console.log('[INSIGHTS] Pass 2 — synthesising diagnosis')
    const synthesisResp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      temperature: 0.7,
      system: REFERENCE_DOC,
      messages: [
        { role: 'user', content: buildSynthesisPrompt(answers, researchNotes) },
        // Prefill forces the model to complete from `{` — structurally impossible to output prose first
        { role: 'assistant', content: '{' },
      ],
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const rawText = synthesisResp.content?.[0]?.text || ''
    // Prepend the prefill character that the API strips from the returned delta
    const fullText = '{' + rawText
    console.log('[INSIGHTS] Pass 2 response length:', rawText.length)
    console.log('[INSIGHTS] Pass 2 preview:', fullText.substring(0, 150))

    return parseAndValidate(fullText, 'Pass 2')
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      console.warn('[INSIGHTS] Timed out (90s)')
    } else {
      console.error('[INSIGHTS] API error:', err.message)
    }
    return null
  }
}

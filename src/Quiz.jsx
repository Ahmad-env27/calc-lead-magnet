// Phase 2 — Quiz. 12 questions, state lives in the parent so back-navigation
// never loses an answer. Card steps auto-advance after 400ms. No email here —
// that's the unlock screen after the quiz (the report is the reason to give it).
// The qualification pixel check runs once brand type + revenue + spend are known.

import { useRef, useState } from 'react'
import { trackEvent } from './utils/tracking.js'
import { getStoredUTMs } from './utils/utm.js'

const TOTAL_STEPS = 16

const JOB_TITLES = [
  { id: 'role_founder', title: 'Owner / Founder' },
  { id: 'role_md', title: 'Managing Director' },
  { id: 'role_csuite', title: 'C-Suite' },
  { id: 'role_marketing', title: 'Marketing Director / Manager' },
  { id: 'role_growth', title: 'Head of Growth / Performance' },
  { id: 'role_ecom', title: 'Ecommerce Director / Manager' },
  { id: 'role_agency', title: 'Agency — managing client accounts' },
  { id: 'role_freelance', title: 'Freelance / Consultant' },
]

const RESPONSIBILITIES = [
  { id: 'resp_paid', label: 'Paid ads (Meta / social)' },
  { id: 'resp_email', label: 'Email marketing' },
  { id: 'resp_creative', label: 'Creative / Content' },
  { id: 'resp_seo', label: 'SEO / Organic' },
  { id: 'resp_cro', label: 'CRO / Landing pages' },
  { id: 'resp_strategy', label: 'Strategy / Planning' },
]

const BRAND_TYPES = [
  { id: 'skincare', title: 'Skincare', desc: 'Serums, moisturisers, treatments, SPF' },
  { id: 'beauty', title: 'Beauty & cosmetics', desc: 'Makeup, colour cosmetics, tools' },
  { id: 'wellness', title: 'Wellness & supplements', desc: 'Vitamins, powders, functional health' },
  { id: 'other', title: 'Other', desc: 'Something else entirely' },
]

const REVENUE_TIERS = [
  { id: 'under_30k', title: 'Under £30k' },
  { id: '30k_80k', title: '£30k–£80k' },
  { id: '80k_120k', title: '£80k–£120k' },
  { id: '120k_plus', title: '£120k+' },
]

const SPEND_TIERS = [
  { id: 'under_10k', title: 'Under £10k' },
  { id: '10k_30k', title: '£10k–£30k' },
  { id: '30k_50k', title: '£30k–£50k' },
  { id: '50k_100k', title: '£50k–£100k' },
  { id: '100k_plus', title: '£100k+' },
]

const REFRESH_RATES = [
  { id: 'weekly', title: 'Every week', desc: '"Always testing something new"' },
  { id: 'every_2_3_weeks', title: 'Every 2–3 weeks', desc: '"Regular but not constant"' },
  { id: 'monthly_or_less', title: 'Monthly or less', desc: '"When we get round to it"' },
  { id: 'only_when_drops', title: 'Only when performance drops', desc: '"If it ain\'t broke..."' },
]

const DIVERSITY_OPTIONS = [
  { id: 'yes_same', title: 'Yes, pretty much', desc: '"Same hooks, different thumbnails"' },
  { id: 'probably', title: 'Probably — I\'m not sure', desc: '"Hard to tell from the inside"' },
  { id: 'no_varied', title: 'No, we actively vary them', desc: '"Different angles, different messages"' },
]

const COST_TREND_OPTIONS = [
  { id: 'up_lots', title: 'Yes, noticeably', desc: '"It keeps creeping up"' },
  { id: 'up_some', title: 'A little', desc: '"Slightly worse than last year"' },
  { id: 'flat', title: 'About the same', desc: '"Holding steady"' },
  { id: 'improved', title: 'It\'s actually got better', desc: '"Cheaper than it used to be"' },
]

const ROAS_BRACKETS = [
  { id: 'under_1_5', title: 'Under £1.50', desc: '"It\'s tight right now"' },
  { id: 'r_1_5_2_5', title: '£1.50–£2.50', desc: '"Profitable, but thin"' },
  { id: 'r_2_5_4', title: '£2.50–£4', desc: '"Solidly profitable"' },
  { id: 'over_4', title: 'Over £4', desc: '"Ads are working hard for us"' },
  { id: 'not_sure', title: 'Honestly, not sure', desc: '"I don\'t watch this number"' },
]

const VOLUME_OPTIONS = [
  { id: 'vol_1_2', title: '1–2' },
  { id: 'vol_3_7', title: '3–7' },
  { id: 'vol_8_12', title: '8–12' },
  { id: 'vol_12_plus', title: 'More than 12' },
]

const ADS_MADE_BY = [
  { id: 'agency', title: 'An agency', desc: '"We brief, they build"' },
  { id: 'in_house', title: 'In-house team', desc: '"Our own people"' },
  { id: 'freelancers', title: 'Freelancers & UGC creators', desc: '"A mix of outside help"' },
  { id: 'founder', title: 'Mostly me', desc: '"Founder does everything"' },
]

const AOV_BRACKETS = [
  { id: 'aov_25_40', title: '£25–£40' },
  { id: 'aov_40_60', title: '£40–£60' },
  { id: 'aov_60_100', title: '£60–£100' },
  { id: 'aov_100_plus', title: 'Over £100' },
]

const FRUSTRATIONS = [
  { id: 'stop_performing', label: 'My ads stop performing after a couple of weeks' },
  { id: 'same_message', label: 'We keep running variations of the same message' },
  { id: 'shrinking_returns', label: 'I\'m spending more but returns keep shrinking' },
  { id: 'volatile_months', label: 'Good months and bad months — I can\'t tell why' },
  { id: 'competitor_blindspot', label: 'I can\'t figure out what competitors are doing differently' },
  { id: 'content_not_strategic', label: 'My team produces content but none of it feels strategically different' },
  { id: 'customer_language', label: 'I don\'t know how my customers actually talk about their skin' },
  { id: 'hit_wall', label: 'We\'ve hit a wall and can\'t break through' },
  { id: 'scared_to_scale', label: 'I\'m nervous to scale spend in case results collapse' },
  { id: 'agency_burnout', label: 'I\'ve worked with agencies before and nothing changes' },
  { id: 'none', label: '⊘ None of these — my ads are performing well' },
]

function trackStepProgress(stepNumber, stepName) {
  trackEvent('QuizStepCompleted', {
    step: stepNumber,
    step_name: stepName,
    total_steps: TOTAL_STEPS,
  })
  trackEvent('quiz_step', { step: stepNumber, name: stepName })
}

const STEP_NAMES = [
  '', 'brand_name', 'job_title', 'responsibilities', 'brand_type', 'revenue',
  'spend_tier', 'aov', 'refresh_rate', 'angle_diversity', 'cost_trend',
  'roas_bracket', 'creative_volume', 'best_hook', 'ads_made_by', 'frustrations', 'extra_context',
]

function ssQuizFlag(key) {
  try { return sessionStorage.getItem(key) === '1' } catch { return false }
}

export default function Quiz({ answers, setAnswers, onComplete }) {
  const [step, setStep] = useState(() => {
    try {
      const s = parseInt(sessionStorage.getItem('audr_quiz_step'), 10)
      return s >= 1 && s <= TOTAL_STEPS ? s : 1
    } catch { return 1 }
  })
  const [dir, setDir] = useState('fwd')
  const advancing = useRef(false)
  const pixelFired = useRef(ssQuizFlag('audr_qualified_fired'))
  const startedFired = useRef(ssQuizFlag('audr_started_fired'))

  const set = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const goTo = (n, d = 'fwd') => {
    if (!startedFired.current) {
      startedFired.current = true
      try { sessionStorage.setItem('audr_started_fired', '1') } catch {}
      const utms = getStoredUTMs()
      trackEvent('CalculatorStarted', {
        source: utms.utm_source || 'direct',
        medium: utms.utm_medium || 'none',
        campaign: utms.utm_campaign || 'none',
      })
    }
    setDir(d)
    setStep(n)
    try { sessionStorage.setItem('audr_quiz_step', String(n)) } catch {}
    if (d === 'fwd' && STEP_NAMES[n]) trackStepProgress(n, STEP_NAMES[n])
  }

  const maybeFireQualificationPixel = (a) => {
    if (pixelFired.current) return
    const qualifiedBrand = ['skincare', 'beauty'].includes(a.brandType)
    const qualifiedRevenue = ['80k_120k', '120k_plus'].includes(a.revenue)
    const qualifiedSpend = a.spendTier && a.spendTier !== 'under_10k'
    if (qualifiedBrand && qualifiedRevenue && qualifiedSpend) {
      pixelFired.current = true
      try { sessionStorage.setItem('audr_qualified_fired', '1') } catch {}
      trackEvent('QualifiedLead', {
        brand_type: a.brandType,
        revenue_tier: a.revenue,
        spend_tier: a.spendTier,
      })
    }
  }

  // Card-selection steps: select, hold the highlight for 400ms, then advance
  const selectAndAdvance = (key, value, fromStep) => {
    if (advancing.current) return
    advancing.current = true
    set(key, value)
    setTimeout(() => {
      advancing.current = false
      if (fromStep === 6) maybeFireQualificationPixel({ ...answers, [key]: value })
      goTo(fromStep + 1)
    }, 400)
  }

  const toggleFrustration = (id) => {
    setAnswers((a) => {
      let f = a.frustrations
      if (id === 'none') {
        f = f.includes('none') ? [] : ['none']
      } else {
        f = f.filter((x) => x !== 'none')
        if (f.includes(id)) f = f.filter((x) => x !== id)
        else if (f.length < 4) f = [...f, id]
      }
      return { ...a, frustrations: f }
    })
  }

  const toggleResponsibility = (id) => {
    setAnswers((a) => {
      const r = a.responsibilities || []
      if (r.includes(id)) return { ...a, responsibilities: r.filter((x) => x !== id) }
      return { ...a, responsibilities: [...r, id] }
    })
  }

  const frustrationCount = answers.frustrations.length
  const respCount = (answers.responsibilities || []).length

  const renderCards = (options, key, fromStep) =>
    options.map((o) => (
      <button
        key={o.id}
        type="button"
        className={`option-card${answers[key] === o.id ? ' selected' : ''}`}
        onClick={() => selectAndAdvance(key, o.id, fromStep)}
      >
        <span className="option-title">{o.title}</span>
        {o.desc && <span className="option-desc">{o.desc}</span>}
      </button>
    ))

  return (
    <main className="quiz">
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
        aria-label="Quiz progress"
      >
        <div className="progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>

      <div className="quiz-meta">
        {step > 1 ? (
          <button className="back-btn" onClick={() => goTo(step - 1, 'back')} aria-label="Back to previous step">
            ←
          </button>
        ) : (
          <span />
        )}
        <span className="step-counter">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      <div className={`quiz-step ${dir}`} key={step}>
        {step === 1 && (
          <>
            <h2 className="step-header">Let's get your report started</h2>
            <p className="step-subtext">
              16 quick questions, about two minutes. We build your report from these — no email
              needed to start.
            </p>
            <div className="field">
              <label htmlFor="brandName">What's your brand called?</label>
              <input
                id="brandName"
                type="text"
                autoComplete="organization"
                placeholder="Your brand"
                value={answers.brandName}
                onChange={(e) => set('brandName', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="websiteUrl">For hyper-personalised results, add your website</label>
              <input
                id="websiteUrl"
                type="url"
                autoComplete="url"
                placeholder="yourbrand.com"
                value={answers.websiteUrl}
                onChange={(e) => set('websiteUrl', e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              disabled={answers.brandName.trim().length === 0}
              onClick={() => goTo(2)}
            >
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="step-header">What best describes your role?</h2>
            <div className="option-grid">{renderCards(JOB_TITLES, 'jobTitle', 2)}</div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="step-header">Which of these do you personally own or manage?</h2>
            <p className="step-subtext">Select all that apply</p>
            <div className="chip-list">
              {RESPONSIBILITIES.map((r) => {
                const selected = (answers.responsibilities || []).includes(r.id)
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`chip${selected ? ' selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleResponsibility(r.id)}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
            <button
              className="btn-primary"
              disabled={respCount < 1}
              onClick={() => goTo(4)}
            >
              Continue →
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="step-header">What type of brand are you?</h2>
            <div className="option-grid">{renderCards(BRAND_TYPES, 'brandType', 4)}</div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="step-header">What's your brand's monthly revenue?</h2>
            <div className="option-grid">{renderCards(REVENUE_TIERS, 'revenue', 5)}</div>
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="step-header">Roughly how much are you spending on Meta ads per month?</h2>
            <div className="option-grid">{renderCards(SPEND_TIERS, 'spendTier', 6)}</div>
          </>
        )}

        {step === 7 && (
          <>
            <h2 className="step-header">What does a typical customer spend per order?</h2>
            <p className="step-subtext">Rough is fine — your average order value.</p>
            <div className="option-grid">
              {renderCards(AOV_BRACKETS, 'aov', 7)}
              <button
                type="button"
                className={`option-card${answers.aov === 'aov_other' ? ' selected' : ''}`}
                onClick={() => set('aov', 'aov_other')}
              >
                <span className="option-title">Other</span>
              </button>
            </div>
            {answers.aov === 'aov_other' && (
              <div className="field aov-custom-field">
                <label htmlFor="aovCustom">Your average order value (£)</label>
                <input
                  id="aovCustom"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="e.g. 35"
                  value={answers.aovCustom}
                  onChange={(e) => set('aovCustom', e.target.value)}
                />
                <button
                  className="btn-primary"
                  disabled={!answers.aovCustom || Number(answers.aovCustom) < 1}
                  onClick={() => goTo(8)}
                >
                  Continue →
                </button>
              </div>
            )}
          </>
        )}

        {step === 8 && (
          <>
            <h2 className="step-header">How often do you refresh your ad creatives?</h2>
            <div className="option-grid">{renderCards(REFRESH_RATES, 'refreshRate', 8)}</div>
          </>
        )}

        {step === 9 && (
          <>
            <h2 className="step-header">Do your ads keep leaning on the same ideas?</h2>
            <div className="option-grid">{renderCards(DIVERSITY_OPTIONS, 'angleDiversity', 9)}</div>
          </>
        )}

        {step === 10 && (
          <>
            <h2 className="step-header">Has it got more expensive to win a customer this year?</h2>
            <div className="option-grid">{renderCards(COST_TREND_OPTIONS, 'costTrend', 10)}</div>
          </>
        )}

        {step === 11 && (
          <>
            <h2 className="step-header">For every £1 you put into ads, roughly what comes back?</h2>
            <p className="step-subtext">Rough is fine — pick the closest.</p>
            <div className="option-grid">{renderCards(ROAS_BRACKETS, 'roasBracket', 11)}</div>
          </>
        )}

        {step === 12 && (
          <>
            <h2 className="step-header">How many genuinely new ads do you launch in a typical month?</h2>
            <p className="step-subtext">New ideas — not resizes or re-edits.</p>
            <div className="option-grid">{renderCards(VOLUME_OPTIONS, 'creativeVolume', 12)}</div>
          </>
        )}

        {step === 13 && (
          <>
            <h2 className="step-header">What's your best-performing hook or ad angle right now?</h2>
            <p className="step-subtext">Even a rough description helps — we use it to map your creative coverage.</p>
            <div className="field">
              <label htmlFor="bestHook">Your top hook or angle</label>
              <input
                id="bestHook"
                type="text"
                placeholder='e.g. "Before/after transformation reels"'
                value={answers.bestHook}
                onChange={(e) => set('bestHook', e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => goTo(14)}
            >
              Continue →
            </button>
          </>
        )}

        {step === 14 && (
          <>
            <h2 className="step-header">Who makes your ads right now?</h2>
            <div className="option-grid">{renderCards(ADS_MADE_BY, 'adsMadeBy', 14)}</div>
          </>
        )}

        {step === 15 && (
          <>
            <h2 className="step-header">What's your biggest frustration with your ads right now?</h2>
            <p className="step-subtext">Pick up to 4</p>
            <div className="chip-list">
              {FRUSTRATIONS.map((f) => {
                const selected = answers.frustrations.includes(f.id)
                const maxed =
                  !selected && f.id !== 'none' && answers.frustrations.filter((x) => x !== 'none').length >= 4
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`chip${selected ? ' selected' : ''}${f.id === 'none' ? ' chip-none' : ''}`}
                    disabled={maxed}
                    aria-pressed={selected}
                    onClick={() => toggleFrustration(f.id)}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
            {frustrationCount > 0 && !answers.frustrations.includes('none') && (
              <p className="quiz-note">These are exactly the patterns your report digs into.</p>
            )}
            <button
              className="btn-primary"
              disabled={frustrationCount < 1 || frustrationCount > 4}
              onClick={() => goTo(16)}
            >
              Continue →
            </button>
          </>
        )}

        {step === 16 && (
          <>
            <h2 className="step-header">Last one — anything else we should know?</h2>
            <div className="field">
              <label htmlFor="extraContext">
                For the most personalised insights, tell us as much as possible — what you've already tried, what messaging works best for your audience, what's frustrating you most right now
              </label>
              <textarea
                id="extraContext"
                rows={4}
                placeholder="The more detail, the sharper your report"
                value={answers.extraContext}
                onChange={(e) => set('extraContext', e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={onComplete}>
              Build my report →
            </button>
          </>
        )}
      </div>
    </main>
  )
}

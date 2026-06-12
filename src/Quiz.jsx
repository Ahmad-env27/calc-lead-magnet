// Phase 2 — Quiz. 8 steps, state lives in the parent so back-navigation never
// loses an answer. Card steps auto-advance after 400ms; the qualification
// pixel check runs once all of brand type + revenue + spend are known.

import { useRef, useState } from 'react'
import { fireQualificationPixel } from './webhook.js'

const TOTAL_STEPS = 8

const BRAND_TYPES = [
  { id: 'skincare', title: 'Skincare', desc: 'Serums, moisturisers, treatments, SPF' },
  { id: 'beauty', title: 'Beauty & cosmetics', desc: 'Makeup, colour cosmetics, tools' },
  { id: 'wellness', title: 'Wellness & supplements', desc: 'Vitamins, powders, functional health' },
  { id: 'other', title: 'Other', desc: 'Something else entirely' },
]

const REVENUE_TIERS = [
  { id: 'under_30k', title: 'Under £30k' },
  { id: '30k_60k', title: '£30k–£60k' },
  { id: '60k_150k', title: '£60k–£150k' },
  { id: '150k_plus', title: '£150k+' },
]

const SPEND_TIERS = [
  { id: 'under_5k', title: 'Under £5k' },
  { id: '5k_15k', title: '£5k–£15k' },
  { id: '15k_50k', title: '£15k–£50k' },
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

const FRUSTRATIONS = [
  { id: 'stop_performing', label: 'My ads stop performing after a couple of weeks' },
  { id: 'same_message', label: 'We keep running variations of the same message' },
  { id: 'shrinking_returns', label: 'I\'m spending more but returns keep shrinking' },
  { id: 'competitor_blindspot', label: 'I can\'t figure out what competitors are doing differently' },
  { id: 'content_not_strategic', label: 'My team produces content but none of it feels strategically different' },
  { id: 'customer_language', label: 'I don\'t know how my customers actually talk about their skin' },
  { id: 'hit_wall', label: 'We\'ve hit a wall and can\'t break through' },
  { id: 'agency_burnout', label: 'I\'ve worked with agencies before and nothing changes' },
  { id: 'none', label: '⊘ None of these — my ads are performing well' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Quiz({ answers, setAnswers, onSubmit }) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState('fwd')
  const [emailError, setEmailError] = useState(false)
  const [extraOpen, setExtraOpen] = useState(false)
  const advancing = useRef(false)
  const pixelFired = useRef(false)

  const set = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const goTo = (n, d = 'fwd') => {
    setDir(d)
    setStep(n)
  }

  const maybeFireQualificationPixel = (a) => {
    if (pixelFired.current) return
    const qualifiedBrand = ['skincare', 'beauty'].includes(a.brandType)
    const qualifiedRevenue = ['60k_150k', '150k_plus'].includes(a.revenue)
    const qualifiedSpend = a.spendTier && a.spendTier !== 'under_5k'
    if (qualifiedBrand && qualifiedRevenue && qualifiedSpend) {
      pixelFired.current = true
      fireQualificationPixel({
        brandType: a.brandType,
        revenue: a.revenue,
        spendTier: a.spendTier,
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
      if (fromStep === 4) maybeFireQualificationPixel({ ...answers, [key]: value })
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
        else if (f.length < 3) f = [...f, id]
      }
      return { ...a, frustrations: f }
    })
  }

  const emailValid = EMAIL_RE.test(answers.email)
  const step1Valid = emailValid && answers.brandName.trim().length > 0
  const frustrationCount = answers.frustrations.length

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
            <h2 className="step-header">Let’s start with the basics</h2>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@yourbrand.co.uk"
                value={answers.email}
                className={emailError ? 'invalid' : ''}
                onChange={(e) => {
                  set('email', e.target.value)
                  if (emailError) setEmailError(false)
                }}
                onBlur={() => setEmailError(answers.email.length > 0 && !emailValid)}
              />
              {emailError && <span className="field-error">That email doesn’t look right</span>}
            </div>
            <div className="field">
              <label htmlFor="brandName">Brand name</label>
              <input
                id="brandName"
                type="text"
                autoComplete="organization"
                placeholder="Your brand"
                value={answers.brandName}
                onChange={(e) => set('brandName', e.target.value)}
              />
            </div>
            <button className="btn-primary" disabled={!step1Valid} onClick={() => goTo(2)}>
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="step-header">What type of brand are you?</h2>
            <div className="option-grid">{renderCards(BRAND_TYPES, 'brandType', 2)}</div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="step-header">What’s your brand’s monthly revenue?</h2>
            <div className="option-grid">{renderCards(REVENUE_TIERS, 'revenue', 3)}</div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="step-header">Roughly how much are you spending on Meta ads per month?</h2>
            <div className="option-grid">{renderCards(SPEND_TIERS, 'spendTier', 4)}</div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="step-header">How often do you refresh your ad creatives?</h2>
            <div className="option-grid">{renderCards(REFRESH_RATES, 'refreshRate', 5)}</div>
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="step-header">Do your ads keep leaning on the same ideas?</h2>
            <div className="option-grid">{renderCards(DIVERSITY_OPTIONS, 'angleDiversity', 6)}</div>
          </>
        )}

        {step === 7 && (
          <>
            <h2 className="step-header">What’s your biggest frustration with your ads right now?</h2>
            <p className="step-subtext">Pick up to 3</p>
            <div className="chip-list">
              {FRUSTRATIONS.map((f) => {
                const selected = answers.frustrations.includes(f.id)
                const maxed =
                  !selected && f.id !== 'none' && answers.frustrations.filter((x) => x !== 'none').length >= 3
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
            <button
              className="btn-primary"
              disabled={frustrationCount < 1 || frustrationCount > 3}
              onClick={() => goTo(8)}
            >
              Continue →
            </button>
          </>
        )}

        {step === 8 && (
          <>
            <h2 className="step-header">Nearly there — any extra context?</h2>
            <div className="field">
              <label htmlFor="extraContext">Tell us anything else about your ad situation</label>
              <textarea
                id="extraContext"
                rows={4}
                placeholder="Optional — whatever feels relevant"
                value={answers.extraContext}
                onChange={(e) => set('extraContext', e.target.value)}
              />
            </div>
            <button
              type="button"
              className="collapse-toggle"
              aria-expanded={extraOpen}
              onClick={() => setExtraOpen((o) => !o)}
            >
              {extraOpen ? '– Hide extra context' : '+ Add more context'}
            </button>
            {extraOpen && (
              <div className="collapse-body">
                <div className="field">
                  <label htmlFor="roas">Current ROAS or CAC if you know it</label>
                  <input
                    id="roas"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 2.4"
                    value={answers.currentROAS}
                    onChange={(e) => set('currentROAS', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="headline">Your best-performing ad headline right now</label>
                  <input
                    id="headline"
                    type="text"
                    placeholder="Optional"
                    value={answers.bestHeadline}
                    onChange={(e) => set('bestHeadline', e.target.value)}
                  />
                </div>
              </div>
            )}
            <button className="btn-primary" onClick={onSubmit}>
              See my results →
            </button>
          </>
        )}
      </div>
    </main>
  )
}

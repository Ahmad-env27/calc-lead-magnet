import { useRef, useState } from 'react'

const TOTAL_STEPS = 5

const JOB_TITLES = [
  { value: 'role_founder', label: 'Owner / Founder' },
  { value: 'role_md', label: 'Managing Director' },
  { value: 'role_csuite', label: 'C-Suite' },
  { value: 'role_marketing', label: 'Marketing Director / Manager' },
  { value: 'role_growth', label: 'Head of Growth / Performance' },
  { value: 'role_ecom', label: 'Ecommerce Director / Manager' },
  { value: 'role_agency', label: 'Agency — managing client accounts' },
  { value: 'role_freelance', label: 'Freelance / Consultant' },
]

const BRAND_TYPES = [
  { id: 'skincare', title: 'Skincare', desc: 'Serums, moisturisers, treatments, SPF' },
  { id: 'beauty', title: 'Beauty & cosmetics', desc: 'Makeup, colour cosmetics, tools' },
  { id: 'wellness', title: 'Wellness & supplements', desc: 'Vitamins, powders, functional health' },
]

const REVENUE_TIERS = [
  { id: 'under_30k', title: 'Under £30k' },
  { id: '30k_80k', title: '£30k–£80k' },
  { id: '80k_120k', title: '£80k–£120k' },
  { id: '120k_plus', title: '£120k+' },
]

const DIVERSITY_OPTIONS = [
  { id: 'yes_same', title: 'Yes, pretty much', desc: '"Same hooks, different thumbnails"' },
  { id: 'probably', title: "Probably — I'm not sure", desc: '"Hard to tell from the inside"' },
  { id: 'no_varied', title: 'No, we actively vary them', desc: '"Different angles, different messages"' },
]

const COST_TREND_OPTIONS = [
  { id: 'up_lots', title: 'Yes, noticeably', desc: '"It keeps creeping up"' },
  { id: 'up_some', title: 'A little', desc: '"Slightly worse than last year"' },
  { id: 'flat', title: 'About the same', desc: '"Holding steady"' },
  { id: 'improved', title: "It's actually got better", desc: '"Cheaper than it used to be"' },
]

export default function Quiz({ answers, setAnswers, onComplete }) {
  const [step, setStep] = useState(() => {
    try {
      const s = parseInt(sessionStorage.getItem('audr_quiz_step'), 10)
      return s >= 1 && s <= TOTAL_STEPS ? s : 1
    } catch { return 1 }
  })
  const [dir, setDir] = useState('fwd')
  const advancing = useRef(false)

  const set = (key, value) => setAnswers(a => ({ ...a, [key]: value }))

  const goTo = (n, d = 'fwd') => {
    setDir(d)
    setStep(n)
    try { sessionStorage.setItem('audr_quiz_step', String(n)) } catch {}
  }

  const selectAndAdvance = (key, value, fromStep) => {
    if (advancing.current) return
    advancing.current = true
    set(key, value)
    setTimeout(() => {
      advancing.current = false
      if (fromStep >= TOTAL_STEPS) {
        onComplete()
      } else {
        goTo(fromStep + 1)
      }
    }, 400)
  }

  const renderCards = (options, key, fromStep) =>
    options.map(o => (
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

  const step1Valid =
    answers.name?.trim().length > 0 &&
    answers.brandName?.trim().length > 0 &&
    answers.jobTitle

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
          <button className="back-btn" onClick={() => goTo(step - 1, 'back')} aria-label="Back to previous step">←</button>
        ) : <span />}
        <span className="step-counter">Step {step} of {TOTAL_STEPS}</span>
      </div>

      <div className={`quiz-step ${dir}`} key={step}>

        {step === 1 && (
          <>
            <h2 className="step-header">Let's get your report started</h2>
            <p className="step-subtext">5 quick questions, about 60 seconds. We build your report from these.</p>

            <div className="field">
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={answers.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="jobTitle">Your role</label>
              <select
                id="jobTitle"
                className="select-input"
                value={answers.jobTitle || ''}
                onChange={e => set('jobTitle', e.target.value || null)}
              >
                <option value="">Select your role</option>
                {JOB_TITLES.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="brandName">Brand name</label>
              <input
                id="brandName"
                type="text"
                autoComplete="organization"
                placeholder="Your brand"
                value={answers.brandName}
                onChange={e => set('brandName', e.target.value)}
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
            <h2 className="step-header">What's your brand's monthly revenue?</h2>
            <div className="option-grid">{renderCards(REVENUE_TIERS, 'revenue', 3)}</div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="step-header">Do your ads keep leaning on the same ideas?</h2>
            <div className="option-grid">{renderCards(DIVERSITY_OPTIONS, 'angleDiversity', 4)}</div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="step-header">Has it got more expensive to win a customer this year?</h2>
            <div className="option-grid">{renderCards(COST_TREND_OPTIONS, 'costTrend', 5)}</div>
          </>
        )}

      </div>
    </main>
  )
}

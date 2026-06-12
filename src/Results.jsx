// Phase 4 — Results. The big number is the hero; the gauge fill is the one
// mandatory animated moment (the diagnosis being "earned"). Sections shown
// depend on lead temperature. The formula footer is the trust mechanic.

import { useEffect, useRef, useState } from 'react'
import { getRiskBand, formatGBP } from './scoring.js'
import { getAngles, getQuickWin } from './angles-data.js'
import { fireFollowupEvent } from './webhook.js'

const FREQUENCY_LABELS = {
  weekly: 'every week',
  every_2_3_weeks: 'every 2–3 weeks',
  monthly_or_less: 'monthly or less',
  only_when_drops: 'only when performance drops',
}

const DIVERSITY_LABELS = {
  yes_same: 'low',
  probably: 'limited',
  no_varied: 'high',
}

const SPEND_LABELS = {
  under_5k: 'under £5k',
  '5k_15k': '£5k–£15k',
  '15k_50k': '£15k–£50k',
  '50k_100k': '£50k–£100k',
  '100k_plus': '£100k+',
}

function interpretation(answers, results) {
  const brand = answers.brandName || 'Your brand'
  const freq = FREQUENCY_LABELS[answers.refreshRate]
  const div = DIVERSITY_LABELS[answers.angleDiversity]
  const spend = SPEND_LABELS[answers.spendTier]
  const band = getRiskBand(results.score).key

  if (band === 'low')
    return `Based on your responses, ${brand} is in relatively good shape. You're refreshing creatives ${freq} and running ${div} messaging diversity. But even well-optimised brands have blind spots — and your competitors may be closer than you think.`
  if (band === 'moderate')
    return `Your brand shows moderate signs of creative fatigue. Refreshing ${freq} with ${div} diversity means some of your spend is going toward messaging that's lost its edge. The opportunity below isn't a problem — it's upside you're not capturing yet.`
  if (band === 'high')
    return `${brand} is showing strong signs of ad fatigue. At ${spend} per month with ${freq} refresh cycles, a meaningful portion of your budget is working harder than it needs to. The revenue opportunity below is likely conservative.`
  return `Your responses suggest significant creative fatigue across your account. At ${spend} per month, recycling the same ${div}-diversity messaging is costing you materially every month. The numbers below represent the minimum recovery opportunity.`
}

// --- Section A: animated semicircle gauge -----------------------------------

function Gauge({ score }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [drawn, setDrawn] = useState(reduced)
  const [display, setDisplay] = useState(reduced ? score : 0)
  const rafRef = useRef()

  useEffect(() => {
    if (reduced) return
    // Kick the CSS transition one frame after mount, count the number up in sync
    const kick = requestAnimationFrame(() => setDrawn(true))
    let start
    const tick = (t) => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / 2000, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out-cubic, matches the arc
      setDisplay(Math.round(eased * score))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(kick)
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const R = 90
  const LEN = Math.PI * R
  const band = getRiskBand(score)

  return (
    <div className="gauge">
      <svg viewBox="0 0 220 122" width="100%" aria-hidden="true">
        <path
          d="M 20 110 A 90 90 0 0 1 200 110"
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 110 A 90 90 0 0 1 200 110"
          fill="none"
          stroke={`var(--risk-${band.key})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={LEN}
          strokeDashoffset={drawn ? LEN * (1 - score / 100) : LEN}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.33, 1, 0.68, 1)' }}
        />
      </svg>
      <div className="gauge-readout">
        <span className="gauge-score" style={{ color: `var(--risk-${band.key})` }}>
          {display}
        </span>
        <span className="gauge-max">/100</span>
      </div>
      <p className="gauge-label" style={{ color: `var(--risk-${band.key})` }}>
        {band.label}
      </p>
    </div>
  )
}

// --- Section C: expandable angle cards --------------------------------------

function AngleCards({ brandType }) {
  const angles = getAngles(brandType)
  const [open, setOpen] = useState(0)

  return (
    <div className="angle-list">
      {angles.map((a, i) => (
        <div className={`angle-card${open === i ? ' open' : ''}`} key={a.name}>
          <button
            type="button"
            className="angle-head"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span className="angle-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="angle-name">{a.name}</span>
            <span className="angle-tag">{a.category}</span>
            <span className="angle-chevron" aria-hidden="true">
              {open === i ? '–' : '+'}
            </span>
          </button>
          {open === i && (
            <div className="angle-body">
              <p>{a.description}</p>
              <div className="hook-card">
                <span className="hook-label">READY-TO-TEST HOOK</span>
                <p className="hook-copy">{a.hook}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// --- Main results page -------------------------------------------------------

export default function Results({ answers, results }) {
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [guaranteeOpen, setGuaranteeOpen] = useState(false)
  const [loomClaimed, setLoomClaimed] = useState(false)
  const [courseClaimed, setCourseClaimed] = useState(false)
  const loomRef = useRef(null)

  const temp = results.temperature
  const isHot = temp === 'super_hot' || temp === 'hot'
  const isWarm = temp === 'warm'
  const isCold = temp === 'cold'
  const brand = answers.brandName || 'your brand'

  const claimLoom = () => {
    setLoomClaimed(true)
    fireFollowupEvent('loom_claimed', { ...answers, temperature: temp })
  }

  const claimCourse = () => {
    setCourseClaimed(true)
    fireFollowupEvent('course_signup', { ...answers, temperature: temp })
  }

  let sectionIndex = 0
  const stagger = () => ({ '--i': sectionIndex++ })

  return (
    <main className="results">
      {/* Section A — Score header & gauge */}
      <section className="rsection" style={stagger()}>
        <p className="eyebrow">YOUR AD FATIGUE RISK SCORE</p>
        <Gauge score={results.score} />
        <p className="interp">{interpretation(answers, results)}</p>
      </section>

      {/* Section B — Revenue leak */}
      <section className="rsection leak-card" style={stagger()}>
        <p className="card-kicker">ESTIMATED MONTHLY REVENUE LEAK</p>
        <p className="leak-number">
          {formatGBP(results.leakLow)} – {formatGBP(results.leakHigh)}
          <span className="leak-per"> / month</span>
        </p>
        <p className="leak-sub">
          Based on your spend, creative velocity, and messaging diversity, {brand} has an
          estimated {formatGBP(results.annualLow)} – {formatGBP(results.annualHigh)} in annual
          revenue that could be captured with fresher, audience-driven ad messaging.
        </p>
        <p className="leak-note">
          This represents a {results.impLow}–{results.impHigh}% improvement on your current
          return — conservative against industry benchmarks for optimised skincare brands.
        </p>
        {results.unrealisticROAS && (
          <p className="leak-note">
            These numbers suggest most of your revenue comes from non-paid channels — your paid
            media has more room to scale than you think.
          </p>
        )}
      </section>

      {!isCold && (
        <>
          {/* Section C — Competitor angles */}
          <section className="rsection" style={stagger()}>
            <h2 className="section-title">What competitors are saying that you’re not</h2>
            <AngleCards brandType={answers.brandType} />
          </section>

          {/* Section D — Quick win */}
          <section className="rsection quickwin-card" style={stagger()}>
            <p className="card-kicker">⚡ ONE THING TO TRY THIS WEEK</p>
            <p className="quickwin-copy">{getQuickWin(answers.brandType)}</p>
          </section>
        </>
      )}

      {/* Section E — Conversion point */}
      {isHot ? (
        <section className="rsection loom-card" style={stagger()} ref={loomRef}>
          <h2 className="loom-title">Want the full picture?</h2>
          {loomClaimed ? (
            <p className="claim-confirm">
              Done — your teardown is queued. We’ll email {answers.email} within 48 hours with
              your Loom link and a booking link for the live walkthrough. Nothing else to do for
              now.
            </p>
          ) : (
            <>
              <p className="loom-body">
                We’ll prepare a personalised Loom teardown for {brand} — your competitor
                messaging analysis, two additional angles we held back, and a concrete action
                plan. 15-minute video + 30-minute live walkthrough.
              </p>
              <p className="derisk">No pitch unless you ask.</p>
              <button className="cta-btn cta-full" onClick={claimLoom}>
                Claim your free Loom teardown →
              </button>
              <p className="delivery-note">
                Prepared within 48 hours of booking. We review every teardown with a human
                strategist — not just AI.
              </p>
            </>
          )}
        </section>
      ) : (
        <section className="rsection loom-card" style={stagger()}>
          <h2 className="loom-title">Learn to fix this yourself</h2>
          {courseClaimed ? (
            <p className="claim-confirm">
              You’re in — lesson one lands at {answers.email} tomorrow morning.
            </p>
          ) : (
            <>
              <p className="loom-body">
                Get the 5-day email course — learn how to build audience-first ad messaging
                yourself, one short lesson a day.
              </p>
              <button className="cta-btn cta-full" onClick={claimCourse}>
                Send me the free course →
              </button>
              {isWarm && (
                <p className="delivery-note">
                  Course subscribers get 50% off Audr when we open the next intake.
                </p>
              )}
            </>
          )}
        </section>
      )}

      {isHot && (
        <>
          {/* Section F — How it works */}
          <section className="rsection" style={stagger()}>
            <h2 className="section-title">How it works</h2>
            <ol className="steps-list">
              <li>
                <span className="step-num">1</span>
                <div>
                  <span className="step-title">Book a time</span>
                  <span className="step-desc">Pick a 30-minute slot. We’ll confirm within 2 hours.</span>
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div>
                  <span className="step-title">We build your teardown</span>
                  <span className="step-desc">
                    Our team analyses your ad account, competitor landscape, and audience data
                    using Audr. You’ll get a personalised Loom video within 48 hours.
                  </span>
                </div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div>
                  <span className="step-title">Watch, ask, decide</span>
                  <span className="step-desc">
                    Live walkthrough of findings + action plan. No obligation, no pitch.
                  </span>
                </div>
              </li>
            </ol>
            <p className="powered-by">
              Powered by Audr audience intelligence + human creative strategists with £100M+ in
              DTC skincare ad spend
            </p>
          </section>

          {/* Section G — Offer teaser */}
          <section className="rsection" style={stagger()}>
            <div className="stat-cards">
              <div className="stat-card">
                <span className="stat-value">£1M+</span>
                <span className="stat-label">guaranteed revenue lift</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">18 months</span>
                <span className="stat-label">or we work free</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">£4–5k/mo</span>
                <span className="stat-label">3-month proof period</span>
              </div>
            </div>
            <button
              type="button"
              className="expand-link"
              aria-expanded={guaranteeOpen}
              onClick={() => setGuaranteeOpen((o) => !o)}
            >
              Learn how the guarantee works →
            </button>
            {guaranteeOpen && (
              <p className="guarantee-detail">
                If we don’t add £1M in attributable revenue within 18 months, we keep working at
                no fee until we do. The first 3 months run at £4–5k/month as a proof period — you
                see the system working before any longer commitment.
              </p>
            )}
            <button
              type="button"
              className="text-link"
              onClick={() => loomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Or talk to a strategist — no pitch, just answers
            </button>
          </section>
        </>
      )}

      {/* Bottom — show the working */}
      <section className="rsection formula-foot" style={stagger()}>
        <pre className="formula-text">
          {`Your score is based on: creative refresh frequency × messaging diversity × spend efficiency benchmarks.
Estimate assumes disciplined testing — brands that spray underfunded tests will read higher than they are.
Treat the revenue range as a directional indicator, not a quote.`}
        </pre>
        <button
          type="button"
          className="expand-link"
          aria-expanded={formulaOpen}
          onClick={() => setFormulaOpen((o) => !o)}
        >
          How we calculate this →
        </button>
        {formulaOpen && (
          <pre className="formula-text formula-detail">
            {`recoverable/month = spend × fatigue coefficient × (1 − diversity score) × 55%

fatigue coefficient  0.18–0.32 — how fast creative wears out
                     at your refresh cadence
diversity score      0.15–0.70 — how distinct your messaging
                     actually is (refresh rate × angle variety)
efficiency gap       added when your reported ROAS sits under
                     the 3.2 benchmark for optimised brands
display range        ±30% around the midpoint
floor                £700/month — we don't report noise below this`}
          </pre>
        )}
      </section>
    </main>
  )
}

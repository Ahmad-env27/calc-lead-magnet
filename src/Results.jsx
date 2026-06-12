// Phase 4 — Results. The big number is the hero; the gauge fill is the one
// mandatory animated moment. Hierarchy: your number → what the teardown adds →
// CTA → supporting evidence. No pricing, no offer mechanics anywhere — this is
// a lead magnet; money talk happens on the call.

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
    return `Based on your answers, ${brand} is in relatively good shape. You're refreshing creatives ${freq} and running ${div} messaging diversity. But even well-optimised brands have blind spots — and your competitors may be closer than you think.`
  if (band === 'moderate')
    return `Your brand shows moderate signs of creative fatigue. Refreshing ${freq} with ${div} diversity means some of your spend is going toward messaging that's lost its edge. The opportunity below isn't a problem — it's upside you're not capturing yet.`
  if (band === 'high')
    return `${brand} is showing strong signs of ad fatigue. At ${spend} per month with ${freq} refresh cycles, a meaningful portion of your budget is working harder than it needs to. The opportunity below is likely conservative.`
  return `Your answers suggest significant creative fatigue across your account. At ${spend} per month, the same messaging patterns are leaving the most on the table — the range below is the floor of what's recoverable, not the ceiling.`
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

// --- Loom teardown card (the conversion point) -------------------------------

function LoomCard({ answers, claimed, onClaim }) {
  const brand = answers.brandName || 'your brand'

  return (
    <section className="loom-card">
      <h2 className="loom-title">Want the full picture?</h2>
      {claimed ? (
        <p className="claim-confirm">
          Done — your teardown is queued. We’ll email {answers.email} within 48 hours with your
          Loom link and a booking link for the live walkthrough. Nothing else to do for now.
        </p>
      ) : (
        <>
          <p className="loom-body">
            We’ll prepare a personalised Loom teardown for {brand} — a 15-minute video plus a
            30-minute live walkthrough. It includes:
          </p>
          <ul className="deliv-list">
            <li>Your competitor messaging analysis — what brands in your lane are saying that you’re not</li>
            <li>
              Your top 3 competitors run through our Spend Decoder — what they’re spending and
              how hard they’re testing
            </li>
            <li>A concrete plan for your next creative batch</li>
          </ul>
          <div className="locked-list" aria-label="Held back for the teardown">
            <div className="locked-row">
              <span className="angle-num">04</span>
              <span className="locked-name">Angle held back for your walkthrough</span>
              <span className="locked-tag">IN TEARDOWN</span>
            </div>
            <div className="locked-row">
              <span className="angle-num">05</span>
              <span className="locked-name">Angle held back for your walkthrough</span>
              <span className="locked-tag">IN TEARDOWN</span>
            </div>
          </div>
          <p className="derisk">No pitch unless you ask.</p>
          <button className="cta-btn cta-full" onClick={onClaim}>
            Claim your free Loom teardown →
          </button>
          <p className="delivery-note">
            Prepared within 48 hours of booking. We review every teardown with a human
            strategist — not just AI.
          </p>
        </>
      )}
    </section>
  )
}

// --- Email course card (warm / cold) -----------------------------------------

function CourseCard({ answers, claimed, onClaim }) {
  return (
    <section className="loom-card">
      <h2 className="loom-title">Learn to fix this yourself</h2>
      {claimed ? (
        <p className="claim-confirm">
          You’re in — lesson one lands at {answers.email} tomorrow morning.
        </p>
      ) : (
        <>
          <p className="loom-body">
            Your 5-day email course is on its way — one short lesson a day on building
            audience-first ad messaging for your skincare brand.
          </p>
          <button className="cta-btn cta-full" onClick={onClaim}>
            Start the free course →
          </button>
        </>
      )}
    </section>
  )
}

// --- Main results page -------------------------------------------------------

export default function Results({ answers, results }) {
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [loomClaimed, setLoomClaimed] = useState(false)
  const [courseClaimed, setCourseClaimed] = useState(false)

  const temp = results.temperature
  const isHot = temp === 'super_hot' || temp === 'hot'
  const isCold = temp === 'cold'
  const disqualified = answers.frustrations.includes('none')
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
      {/* A — Score header & gauge */}
      <section className="rsection" style={stagger()}>
        <p className="eyebrow">YOUR AD FATIGUE RISK SCORE</p>
        <Gauge score={results.score} />
        <p className="interp">{interpretation(answers, results)}</p>
      </section>

      {/* B — The number. Opportunity framing, not loss framing. */}
      {disqualified ? (
        <section className="rsection validation-card" style={stagger()}>
          <p className="card-kicker">GOOD NEWS</p>
          <p className="quickwin-copy">
            Your ads are holding up — your refresh habits and messaging variety are doing their
            job. The patterns below are what brands like {brand} protect to keep it that way.
          </p>
        </section>
      ) : (
        <section className="rsection opportunity-card" style={stagger()}>
          <p className="card-kicker">WHAT {(answers.brandName || 'YOUR BRAND').toUpperCase()} COULD BE ADDING EACH MONTH</p>
          <p className="leak-number">
            {formatGBP(results.leakLow)} – {formatGBP(results.leakHigh)}
            <span className="leak-per"> / month</span>
          </p>
          <p className="leak-sub">
            Based on your answers, that’s an estimated {formatGBP(results.annualLow)} –{' '}
            {formatGBP(results.annualHigh)} a year that fresher, audience-driven ad messaging
            could capture for {brand}.
          </p>
          <p className="leak-note">
            That’s a {results.impLow}–{results.impHigh}% improvement on your current return —
            conservative against benchmarks for optimised skincare brands.
          </p>
          {results.strongROAS && (
            <p className="leak-note">
              Returns over £4 usually mean your paid channel has more room to scale than it’s
              being given — the opportunity here is headroom, not repair.
            </p>
          )}
        </section>
      )}

      {/* The conversion point — in the same attention span as the number */}
      <div className="rsection" style={stagger()}>
        {isHot ? (
          <LoomCard answers={answers} claimed={loomClaimed} onClaim={claimLoom} />
        ) : (
          <CourseCard answers={answers} claimed={courseClaimed} onClaim={claimCourse} />
        )}
      </div>

      {!isCold && (
        <>
          {/* Supporting evidence — competitor angles */}
          <section className="rsection" style={stagger()}>
            <h2 className="section-title">What competitors are saying that you’re not</h2>
            <AngleCards brandType={answers.brandType} />
          </section>

          {/* Quick win */}
          <section className="rsection quickwin-card" style={stagger()}>
            <p className="card-kicker">⚡ ONE THING TO TRY THIS WEEK</p>
            <p className="quickwin-copy">{getQuickWin(answers.brandType)}</p>
          </section>
        </>
      )}

      {isHot && (
        <>
          {/* How it works */}
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
            <p className="compound-note">
              Worth saying: the range above is monthly. Recovered properly, it doesn’t happen
              once — it repeats and compounds as the messaging improves. That’s the conversation
              worth having.
            </p>
            {!loomClaimed && (
              <button className="cta-btn cta-full" onClick={claimLoom}>
                Claim your free Loom teardown →
              </button>
            )}
            <p className="powered-by">
              Powered by Audr audience intelligence + human creative strategists behind £100M+ of
              skincare ad spend
            </p>
          </section>
        </>
      )}

      {/* Bottom — show the working */}
      <section className="rsection formula-foot" style={stagger()}>
        <pre className="formula-text">
          {`Your score is based on: refresh cadence × messaging variety × creative volume × return on spend.
Estimate assumes disciplined testing — brands that spray underfunded tests will read higher than they are.
The range is capped against your revenue so it stays realistic. Treat it as a directional indicator, not a quote.`}
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
            {`recoverable/month = (fatigue tax + return gap + cost creep) × 55%

fatigue tax     spend × wear-out rate at your refresh cadence
                (0.18–0.32), scaled by how distinct your
                messaging is and how many new ads you ship
return gap      how far your £-in/£-out bracket sits under
                the 3.2 benchmark for optimised brands
cost creep      a small add when winning a customer has been
                getting more expensive this year
cap             never more than ~15% of your monthly revenue
display range   ±30% around the midpoint, floored at £700`}
          </pre>
        )}
      </section>
    </main>
  )
}

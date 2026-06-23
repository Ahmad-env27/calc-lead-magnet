// Phase 4 — Results. The big number is the hero; the gauge fill is the one
// mandatory animated moment. Hierarchy: your number → what the teardown adds →
// CTA → supporting evidence. No pricing, no offer mechanics anywhere — this is
// a lead magnet; money talk happens on the call.

import { useEffect, useRef, useState } from 'react'
import { getRiskBand, formatGBP, calculateSpendDecoder, AOV_MIDPOINTS } from './scoring.js'
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
          Loom link and a booking link for your free consultation. Nothing else to do for now.
        </p>
      ) : (
        <>
          <p className="loom-body">
            We’ll prepare a personalised Loom teardown for {brand} — a 5-minute video plus a
            30-minute free consultation. It includes:
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
          <p className="derisk">The insights are yours whether we work together or not.</p>
          <button className="cta-btn cta-full" onClick={onClaim}>
            Get your free Loom teardown →
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

// --- Section: Spend Decoder (orders + revenue framing) ----------------------

function SpendDecoder({ answers, results }) {
  const aovMid = answers.aov === 'aov_other'
    ? Number(answers.aovCustom)
    : AOV_MIDPOINTS[answers.aov]

  if (!aovMid || aovMid < 1) return null

  const { ordersPerMonth, ordersPerYear, revenuePerYear } =
    calculateSpendDecoder(results.recoverableMonthly, aovMid)

  return (
    <div className="spend-decoder">
      <p className="card-kicker">SPEND DECODER</p>
      <div className="decoder-stat">
        <span className="decoder-number">~{ordersPerMonth.toLocaleString('en-GB')}</span>
        <span className="decoder-label">
          orders a month your brand is leaving on the table
        </span>
      </div>
      <div className="decoder-stat decoder-stat-annual">
        <span className="decoder-number">~{ordersPerYear.toLocaleString('en-GB')}</span>
        <span className="decoder-label">
          orders a year — worth approximately{' '}
          <strong>{formatGBP(revenuePerYear)}</strong> in revenue your ads could
          be recovering
        </span>
      </div>
      <p className="decoder-footnote">
        Based on your average order value and the opportunity range above.
      </p>
    </div>
  )
}

// --- Section: 4-part AI diagnosis -------------------------------------------

const DIAGNOSIS_LABELS = {
  whats_working: "What's working",
  the_leak: 'Where the leak is',
  missing_angle: "The angle you're missing",
  test_brief: 'Test this week',
}

const DIAGNOSIS_ICONS = {
  whats_working: '✓',
  the_leak: '⚠',
  missing_angle: '→',
  test_brief: '⚡',
}

function DiagnosisSection({ insights, brandName }) {
  if (!insights || typeof insights !== 'object') return null
  if (!insights.whats_working) return null

  const keys = ['whats_working', 'the_leak', 'missing_angle', 'test_brief']

  return (
    <div className="diagnosis-section">
      <h3 className="diagnosis-title">What this means for {brandName || 'your brand'}</h3>
      <div className="diagnosis-grid">
        {keys.map((key) => {
          const val = insights[key]
          if (!val) return null
          return (
            <div key={key} className={`diagnosis-card diagnosis-${key}`}>
              <span className="diagnosis-icon">{DIAGNOSIS_ICONS[key]}</span>
              <div>
                <span className="diagnosis-label">{DIAGNOSIS_LABELS[key]}</span>
                <p className="diagnosis-text">{val}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Section: Decay curve placeholder (spend x refresh) --------------------

const SPEND_INDEX = { under_5k: 0, '5k_15k': 1, '15k_50k': 2, '50k_100k': 3, '100k_plus': 3 }
const REFRESH_INDEX = { weekly: 0, every_2_3_weeks: 1, monthly_or_less: 2, only_when_drops: 3 }
const REFRESH_WEEK = { weekly: 1, every_2_3_weeks: 2, monthly_or_less: 4, only_when_drops: 8 }

function getDecayCurve(spendTier, refreshRate) {
  const base = 0.04 + SPEND_INDEX[spendTier] * 0.06
  const accel = 1.0 + REFRESH_INDEX[refreshRate] * 0.4
  const points = []
  for (let w = 1; w <= 12; w++) {
    const cpa = 1.0 + base * Math.pow(w, accel * 0.65)
    points.push({ week: w, cpa: Math.min(cpa, 5.2) })
  }
  return points
}

function DecayCurve({ spendTier, refreshRate }) {
  const points = getDecayCurve(spendTier, refreshRate)
  const markerWeek = REFRESH_WEEK[refreshRate] || 4

  const W = 440
  const H = 200
  const PAD_L = 40
  const PAD_R = 10
  const PAD_T = 10
  const PAD_B = 30
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const maxCPA = 5.2
  const x = (w) => PAD_L + ((w - 1) / 11) * plotW
  const y = (cpa) => PAD_T + plotH - ((cpa - 1) / (maxCPA - 1)) * plotH

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.week).toFixed(1)} ${y(p.cpa).toFixed(1)}`)
    .join(' ')

  const dangerY = y(1.5)
  const marker = points.find((p) => p.week === markerWeek) || points[3]
  const cliffWeek = points.find((p) => p.cpa >= 2.0)?.week

  return (
    <div className="decay-curve">
      <p className="card-kicker">YOUR FATIGUE DECAY CURVE</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="CPA decay curve showing how your cost per acquisition rises over weeks without a creative refresh">
        <rect x={PAD_L} y={dangerY} width={plotW} height={y(1) - dangerY} fill="rgba(226, 92, 80, 0.08)" />
        <line x1={PAD_L} y1={dangerY} x2={PAD_L + plotW} y2={dangerY} stroke="var(--risk-critical)" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.5" />
        <text x={PAD_L + 4} y={dangerY - 3} fill="var(--risk-critical)" fontSize="8" opacity="0.7">danger zone</text>

        {[1.0, 2.0, 3.0, 4.0, 5.0].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={y(v)} x2={PAD_L + plotW} y2={y(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={PAD_L - 4} y={y(v) + 3} fill="var(--faint)" fontSize="8" textAnchor="end">{v.toFixed(1)}x</text>
          </g>
        ))}

        {[1, 3, 5, 7, 9, 11].map((w) => (
          <text key={w} x={x(w)} y={H - 6} fill="var(--faint)" fontSize="8" textAnchor="middle">W{w}</text>
        ))}

        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        <circle cx={x(marker.week)} cy={y(marker.cpa)} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
        <text x={x(marker.week)} y={y(marker.cpa) - 10} fill="var(--accent)" fontSize="9" fontWeight="600" textAnchor="middle">you are here</text>
      </svg>
      <div className="decay-legend">
        <span className="decay-axis-label">Weeks since last creative refresh</span>
        {cliffWeek && (
          <span className="decay-cliff-note">
            Your fatigue cliff: ~week {cliffWeek}
          </span>
        )}
      </div>
    </div>
  )
}

// --- Section: Radar chart placeholder (5 creative angles) -------------------

function estimateCoverage(answers) {
  let pain = 30, transformation = 30, social = 30, science = 30, founder = 30

  if (answers.angleDiversity === 'yes_same') {
    pain = 20; transformation = 20; social = 15; science = 15; founder = 10
  } else if (answers.angleDiversity === 'probably') {
    pain = 45; transformation = 35; social = 25; science = 30; founder = 15
  } else if (answers.angleDiversity === 'no_varied') {
    pain = 55; transformation = 50; social = 45; science = 50; founder = 35
  }

  if (answers.brandType === 'skincare') { science += 20; pain += 10 }
  if (answers.brandType === 'wellness') { transformation += 20; science += 10 }
  if (answers.brandType === 'beauty') { social += 15; transformation += 15 }

  if (answers.frustrations?.includes('same_message')) { pain += 15; transformation -= 5 }
  if (answers.frustrations?.includes('customer_language')) { social -= 15 }
  if (answers.adsMadeBy === 'founder') { founder += 20 }

  const hook = (answers.bestHook || '').toLowerCase()
  if (hook.includes('before') || hook.includes('after') || hook.includes('transform')) transformation += 25
  if (hook.includes('review') || hook.includes('ugc') || hook.includes('testimonial')) social += 25
  if (hook.includes('ingredient') || hook.includes('science') || hook.includes('clinical')) science += 25
  if (hook.includes('pain') || hook.includes('problem') || hook.includes('frustrat')) pain += 25
  if (hook.includes('founder') || hook.includes('story') || hook.includes('mission')) founder += 25

  const clamp = (v) => Math.max(5, Math.min(95, v))
  return [
    { label: 'Pain / Problem', value: clamp(pain) },
    { label: 'Transformation', value: clamp(transformation) },
    { label: 'Social Proof', value: clamp(social) },
    { label: 'Science / Ingredient', value: clamp(science) },
    { label: 'Founder Story', value: clamp(founder) },
  ]
}

function RadarChart({ answers }) {
  const axes = estimateCoverage(answers)
  const N = axes.length
  const CX = 150, CY = 140, R = 100
  const IDEAL = 70

  const angle = (i) => (Math.PI * 2 * i) / N - Math.PI / 2
  const px = (i, pct) => CX + R * (pct / 100) * Math.cos(angle(i))
  const py = (i, pct) => CY + R * (pct / 100) * Math.sin(angle(i))

  const userPath = axes.map((a, i) => `${i === 0 ? 'M' : 'L'} ${px(i, a.value).toFixed(1)} ${py(i, a.value).toFixed(1)}`).join(' ') + ' Z'
  const idealPath = axes.map((_, i) => `${i === 0 ? 'M' : 'L'} ${px(i, IDEAL).toFixed(1)} ${py(i, IDEAL).toFixed(1)}`).join(' ') + ' Z'

  const weakest = axes.reduce((min, a) => a.value < min.value ? a : min, axes[0])
  const strongest = axes.reduce((max, a) => a.value > max.value ? a : max, axes[0])

  return (
    <div className="radar-chart">
      <p className="card-kicker">YOUR CREATIVE ANGLE COVERAGE</p>
      <div className="radar-legend">
        <span className="radar-legend-item"><span className="radar-dot radar-dot-user" /> Your estimated coverage</span>
        <span className="radar-legend-item"><span className="radar-dot radar-dot-ideal" /> Ideal balanced coverage</span>
      </div>
      <svg viewBox="0 0 300 290" width="100%" aria-label="Radar chart showing creative angle coverage across 5 dimensions">
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={axes.map((_, i) => `${px(i, ring).toFixed(1)},${py(i, ring).toFixed(1)}`).join(' ')}
            fill="none" stroke="var(--border)" strokeWidth="0.5"
          />
        ))}

        {axes.map((_, i) => (
          <line key={i} x1={CX} y1={CY} x2={px(i, 100)} y2={py(i, 100)} stroke="var(--border)" strokeWidth="0.5" />
        ))}

        <path d={idealPath} fill="rgba(84, 201, 127, 0.08)" stroke="var(--risk-low)" strokeWidth="1" strokeDasharray="4 3" />
        <path d={userPath} fill="rgba(240, 166, 60, 0.15)" stroke="var(--accent)" strokeWidth="2" />

        {axes.map((a, i) => (
          <circle key={i} cx={px(i, a.value)} cy={py(i, a.value)} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.5" />
        ))}

        {axes.map((a, i) => {
          const labelR = R + 22
          const lx = CX + labelR * Math.cos(angle(i))
          const ly = CY + labelR * Math.sin(angle(i))
          return (
            <text key={i} x={lx} y={ly} fill="var(--muted)" fontSize="9" textAnchor="middle" dominantBaseline="middle">
              {a.label}
            </text>
          )
        })}
      </svg>
      <div className="radar-insight">
        <p className="radar-insight-text">
          <strong>Biggest gap:</strong> {weakest.label} ({weakest.value}%) — this is likely your next creative brief.
          {strongest.label !== weakest.label && (
            <> Your strongest signal is {strongest.label} ({strongest.value}%).</>
          )}
        </p>
      </div>
    </div>
  )
}

// --- Main results page -------------------------------------------------------

export default function Results({ answers, results, insights }) {
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
          {/* The one loss line in the results — exactly one, per Ahmad */}
          <p className="leak-loss">
            And it’s monthly — every month it goes unaddressed, the same range walks out the
            door again.
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

      {/* Spend Decoder — orders + revenue framing */}
      {!disqualified && answers.aov && (
        <section className="rsection" style={stagger()}>
          <SpendDecoder answers={answers} results={results} />
        </section>
      )}

      {/* Decay curve — personalised to spend tier x refresh rate */}
      {!disqualified && answers.spendTier && answers.refreshRate && (
        <section className="rsection" style={stagger()}>
          <DecayCurve spendTier={answers.spendTier} refreshRate={answers.refreshRate} />
        </section>
      )}

      {/* Radar chart — creative angle coverage */}
      {!disqualified && (
        <section className="rsection" style={stagger()}>
          <RadarChart answers={answers} />
        </section>
      )}

      {/* 4-part AI diagnosis */}
      {insights && insights.whats_working && (
        <section className="rsection" style={stagger()}>
          <DiagnosisSection insights={insights} brandName={answers.brandName} />
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
                    Free consultation — we walk through the findings and build an action plan
                    together. No obligation.
                  </span>
                </div>
              </li>
            </ol>
            <p className="compound-note">
              Worth saying: this compounds. As the messaging improves month over month, each
              cycle builds on the last. That’s the conversation worth having.
            </p>
            {!loomClaimed && (
              <button className="cta-btn cta-full" onClick={claimLoom}>
                Get your free Loom teardown →
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

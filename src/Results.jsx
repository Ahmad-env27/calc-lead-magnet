import { useEffect, useRef, useState } from 'react'
import {
  getRiskBand, formatGBP, calculateSpendDecoder, AOV_MIDPOINTS,
  getRadarScores, DECAY_PARAMS, effectiveness,
  getCPAEscalation, roundForDisplay, getScenarioMatch,
} from './scoring.js'
import { getAngles, getQuickWin } from './angles-data.js'
import { fireFollowupEvent } from './webhook.js'

// Qualified (isHot) → bonus A; everyone else → bonus B. Button copy is placeholder
// pending a copy pass. Light UTMs so growth.audr.app can attribute by tier.
const BONUS_LINK_QUALIFIED = 'https://www.growth.audr.app/a-dtc-audience-precision-system'
const BONUS_LINK_UNQUALIFIED = 'https://www.growth.audr.app/b-dtc-audience-precision-system'

function bonusUrl(base, tier) {
  const url = new URL(base)
  url.searchParams.set('utm_source', 'calc')
  url.searchParams.set('utm_content', tier)
  return url.toString()
}

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
  under_10k: 'under £10k',
  '10k_30k': '£10k–£30k',
  '30k_50k': '£30k–£50k',
  '50k_100k': '£50k–£100k',
  '100k_plus': '£100k+',
}

const JOB_TITLE_LABELS = {
  role_founder: 'Founder',
  role_md: 'Managing Director',
  role_csuite: 'C-Suite',
  role_marketing: 'Marketing Director',
  role_growth: 'Head of Growth',
  role_ecom: 'Ecommerce Director',
  role_agency: 'Agency',
  role_freelance: 'Freelance',
}

function isAgencyOrFreelance(jobTitle) {
  return jobTitle === 'role_agency' || jobTitle === 'role_freelance'
}

function isFounderOrMD(jobTitle) {
  return jobTitle === 'role_founder' || jobTitle === 'role_md'
}

function getHeadlineCopy(brand, jobTitle) {
  if (isAgencyOrFreelance(jobTitle)) return `Here's what ${brand}'s account is leaving on the table`
  if (jobTitle === 'role_csuite') return `Here's where ${brand}'s competitive edge is leaking`
  if (jobTitle === 'role_marketing' || jobTitle === 'role_growth' || jobTitle === 'role_ecom')
    return "Here's where your paid performance is leaking"
  return `Here's what ${brand} is leaving on the table`
}

function getLaneIntro(jobTitle) {
  if (isAgencyOrFreelance(jobTitle))
    return "This calculator measures one of three levers for your client's account: meta optimisation. The other two, audience intelligence and the meta-signal stack, require a full audit to unlock."
  if (jobTitle === 'role_marketing' || jobTitle === 'role_growth' || jobTitle === 'role_ecom')
    return 'This calculator measures one of three performance levers: meta optimisation. The other two, audience intelligence and the meta-signal stack, require a full audit to unlock.'
  return 'This calculator measures one of three revenue levers: meta optimisation. The other two, audience intelligence and the meta-signal stack, require a full audit to unlock.'
}

function interpretation(answers, results) {
  const brand = answers.brandName || 'Your brand'
  const freq = FREQUENCY_LABELS[answers.refreshRate]
  const div = DIVERSITY_LABELS[answers.angleDiversity]
  const spend = SPEND_LABELS[answers.spendTier]
  const band = getRiskBand(results.score).key

  if (band === 'low')
    return `Based on your answers, ${brand} is in relatively good shape. You're refreshing creatives ${freq} and running ${div} messaging diversity. But even well-optimised brands have blind spots, and your competitors may be closer than you think.`
  if (band === 'moderate')
    return `Your brand shows moderate signs of creative fatigue. Refreshing ${freq} with ${div} diversity means some of your spend is going toward messaging that's lost its edge. The opportunity below isn't a problem. It's upside you're not capturing yet.`
  if (band === 'high')
    return `${brand} is showing strong signs of ad fatigue. At ${spend} per month with ${freq} refresh cycles, a meaningful portion of your budget isn't working optimally. The opportunity below is likely conservative.`
  return `Your answers suggest significant creative fatigue across your account. At ${spend} per month, the same messaging patterns are leaving the most on the table. The range below is the floor of what's recoverable, not the ceiling.`
}

// --- Section A: animated semicircle gauge with benchmark ---------------------

function Gauge({ score }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [drawn, setDrawn] = useState(reduced)
  const [display, setDisplay] = useState(reduced ? score : 0)
  const rafRef = useRef()

  useEffect(() => {
    if (reduced) return
    const kick = requestAnimationFrame(() => setDrawn(true))
    let start
    const tick = (t) => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / 2000, 1)
      const eased = 1 - Math.pow(1 - p, 3)
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
      <svg viewBox="0 0 220 150" width="100%" aria-hidden="true">
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
        <text x="110" y="100" textAnchor="middle" fill={`var(--risk-${band.key})`} fontFamily="var(--font-display)" fontSize="46" fontWeight="700">
          {display}
        </text>
        <text x="110" y="118" textAnchor="middle" fill="var(--faint)" fontFamily="var(--font-display)" fontSize="14">
          /100
        </text>
        <text x="110" y="142" textAnchor="middle" fill={`var(--risk-${band.key})`} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.2em" style={{ textTransform: 'uppercase' }}>
          {band.label}
        </text>
      </svg>
    </div>
  )
}

// --- Section: expandable angle cards ----------------------------------------

function AngleCards({ brandType, showCreativeHeader }) {
  const angles = getAngles(brandType)
  const [open, setOpen] = useState(0)

  return (
    <div className="angle-list">
      {showCreativeHeader && (
        <p className="card-kicker angle-kicker">TEST BRIEFS YOU CAN ACTION THIS WEEK</p>
      )}
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

// --- Loom teardown card (the conversion point) ------------------------------

function LoomCard({ answers, claimed, onClaim }) {
  const brand = answers.brandName || 'your brand'

  return (
    <section className="loom-card">
      <h2 className="loom-title">Want the full picture?</h2>
      {claimed ? (
        <p className="claim-confirm">
          Done. Your teardown is queued. We'll email {answers.email} within 48 hours with your
          Loom link and a booking link for your free consultation. Nothing else to do for now.
        </p>
      ) : (
        <>
          <p className="loom-body">
            We'll prepare a personalised Loom teardown for {brand}: a 5-minute video plus a
            30-minute free consultation. It includes:
          </p>
          <ul className="deliv-list">
            <li>Your competitor messaging analysis: what brands in your lane are saying that you're not</li>
            <li>
              Your top 3 competitors run through our Spend Decoder: what they're spending and
              how hard they're testing
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
            Get my exclusive bonus package →
          </button>
          <p className="delivery-note">
            Prepared within 48 hours of booking. We review every teardown with a human
            strategist, not just AI.
          </p>
        </>
      )}
    </section>
  )
}

// --- Email course card (warm / cold) ----------------------------------------

function CourseCard({ answers, claimed, onClaim }) {
  return (
    <section className="loom-card">
      <h2 className="loom-title">Learn to fix this yourself</h2>
      {claimed ? (
        <p className="claim-confirm">
          You're in. Lesson one lands at {answers.email} tomorrow morning.
        </p>
      ) : (
        <>
          <p className="loom-body">
            Your 5-day email course is on its way: one short lesson a day on building
            audience-first ad messaging for your skincare brand.
          </p>
          <button className="cta-btn cta-full" onClick={onClaim}>
            Get my exclusive bonus package →
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
          orders a year, worth approximately{' '}
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

// --- Section: Three-Lane Impact Stack ---------------------------------------

function ThreeLaneStack({ results, answers, showSpendDecoder }) {
  const tl = results.threeLane
  if (!tl) return null

  const jobTitle = answers.jobTitle
  const aovMid = answers.aov === 'aov_other'
    ? Number(answers.aovCustom)
    : AOV_MIDPOINTS[answers.aov]
  const hasOrders = aovMid && aovMid > 0

  const combinedOrdersLow = hasOrders ? Math.round(tl.combined.low / aovMid / 10) * 10 : null
  const combinedOrdersHigh = hasOrders ? Math.round(tl.combined.high / aovMid / 10) * 10 : null

  const respHasCro = (answers.responsibilities || []).includes('resp_cro')
  const respHasEmail = (answers.responsibilities || []).includes('resp_email')

  return (
    <div className="three-lane-stack">
      <p className="lane-intro">{getLaneIntro(jobTitle)}</p>

      <p className="lane-section-label">WHAT THE CALCULATOR COVERS TODAY</p>
      <div className="lane-card lane-card-amber lane-card-single">
        <span className="lane-card-title">Meta optimisation</span>
        <span className="lane-card-subtitle">How you spend</span>
        <span className="lane-card-value">
          ~{formatGBP(roundForDisplay(tl.lane2.low))}–{formatGBP(roundForDisplay(tl.lane2.high))} / month
        </span>
        <span className="lane-card-badge">Calculated from your answers</span>
      </div>

      {showSpendDecoder && <SpendDecoder answers={answers} results={results} />}

      <div className="lane-divider" />

      <p className="lane-section-label">THE FULL PICTURE: ALL THREE LEVERS</p>
      <div className="lane-cards-row">
        <div className="lane-card lane-card-teal">
          <span className="lane-card-title">Audience intelligence</span>
          <span className="lane-card-subtitle">Knowing what to say</span>
          <span className="lane-card-value-sm">
            ~{formatGBP(roundForDisplay(tl.lane1.low))}–{formatGBP(roundForDisplay(tl.lane1.high))} / mo
          </span>
          <span className="lane-card-badge lane-card-badge-locked">Requires audit</span>
        </div>
        <div className="lane-card lane-card-amber lane-card-highlight">
          <span className="lane-card-title">Meta optimisation</span>
          <span className="lane-card-subtitle">How you spend</span>
          <span className="lane-card-value-sm">
            ~{formatGBP(roundForDisplay(tl.lane2.low))}–{formatGBP(roundForDisplay(tl.lane2.high))} / mo
          </span>
          <span className="lane-card-badge">Calculated</span>
        </div>
        <div className="lane-card lane-card-purple">
          <span className="lane-card-title">Meta-signal stack</span>
          <span className="lane-card-subtitle">How Meta indexes your page</span>
          <span className="lane-card-value-sm">
            ~{formatGBP(roundForDisplay(tl.lane3.low))}–{formatGBP(roundForDisplay(tl.lane3.high))} / mo
          </span>
          <span className="lane-card-badge lane-card-badge-locked">Requires audit</span>
          {respHasCro && (
            <span className="lane-card-note">This one's yours. Signal quality is a CRO lever.</span>
          )}
        </div>
      </div>

      <div className="lane-converge-arrow" aria-hidden="true">↓</div>

      <div className="lane-card lane-card-green lane-card-combined">
        <span className="lane-card-title">Combined opportunity</span>
        <span className="lane-card-value">
          {formatGBP(roundForDisplay(tl.combined.low))}–{formatGBP(roundForDisplay(tl.combined.high))}{' '}/ month
        </span>
        {hasOrders && combinedOrdersLow > 0 && (
          <span className="lane-card-orders">
            ≈ {combinedOrdersLow}–{combinedOrdersHigh} orders recovered monthly
            {aovMid ? ` (at your AOV of £${aovMid})` : ''}
          </span>
        )}
        <span className="lane-card-badge">First 6 months estimated</span>
      </div>

      <div className="lane-converge-arrow" aria-hidden="true">↓</div>

      <div className="lane-card lane-card-muted">
        <span className="lane-card-title">6-month projection</span>
        <span className="lane-card-value-sm">
          ~{formatGBP(roundForDisplay(tl.sixMonth.low))}–{formatGBP(roundForDisplay(tl.sixMonth.high))}
        </span>
      </div>

      <div className="lane-converge-arrow" aria-hidden="true">↓</div>

      <div className="lane-card lane-card-green lane-card-muted">
        <span className="lane-card-title">12–18 month target</span>
        <span className="lane-card-value-sm">
          {formatGBP(roundForDisplay(tl.annualized.low))}–{formatGBP(roundForDisplay(tl.annualized.high))}+ annualised
        </span>
      </div>

      {respHasEmail && (
        <p className="lane-cross-sell">
          Every order lost on Meta is a subscriber you never captured for email.
        </p>
      )}

      <p className="lane-methodology">
        Audience intelligence and meta-signal stack estimated based on industry benchmarks for brands at your spend level. Requires full audit to confirm.
      </p>
    </div>
  )
}

// --- Section: Cost of Inaction Countdown ------------------------------------

function CostOfInaction({ results, aovMid }) {
  const coi = results.costOfInaction
  if (!coi) return null

  return (
    <div className="cost-of-inaction">
      <h3 className="coi-header">If nothing changes in the next 90 days...</h3>
      <div className="coi-cards">
        <div className="coi-card">
          <span className="coi-number">{formatGBP(roundForDisplay(coi.revenue.low))}–{formatGBP(roundForDisplay(coi.revenue.high))}</span>
          <span className="coi-label">in preventable lost revenue</span>
        </div>
        {coi.orders && coi.orders.low > 0 && (
          <div className="coi-card">
            <span className="coi-number">{coi.orders.low}–{coi.orders.high}</span>
            <span className="coi-label">orders that won't come back</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Section: Credit Stack --------------------------------------------------

function CreditStack({ isHotLead }) {
  return (
    <div className="credit-stack">
      <h3 className="credit-stack-title">You've unlocked diagnostic credit</h3>
      <div className="credit-stack-items">
        <div className="credit-stack-item credit-stack-unlocked">
          <span className="credit-stack-icon" aria-hidden="true">&#10003;</span>
          <span className="credit-stack-name">Audience Precision System</span>
          <span className="credit-stack-status">
            <span className="credit-stack-original">£47</span> FREE
          </span>
        </div>
        <div className="credit-stack-item credit-stack-unlocked">
          <span className="credit-stack-icon" aria-hidden="true">&#10003;</span>
          <span className="credit-stack-name">Atomic Audience & Ad Audit</span>
          <span className="credit-stack-status">
            <span className="credit-stack-original">£403</span> FREE
          </span>
        </div>
        <div className="credit-stack-item credit-stack-locked">
          <span className="credit-stack-icon" aria-hidden="true">&#128274;</span>
          <span className="credit-stack-name">Meta-signal Stack Guide</span>
          <span className="credit-stack-status">
            <span className="credit-stack-original">£397</span>{' '}
            {isHotLead ? <span className="credit-stack-waived">WAIVED</span> : 'IN AUDIT'}
          </span>
        </div>
      </div>
      <p className="credit-stack-total">£847 in diagnostic credit, yours free.</p>
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

// --- Section: Sigmoid Decay Curve -------------------------------------------

function SigmoidDecayCurve({ spendTier, refreshRate, fatigueScore, leakLow, leakHigh }) {
  const params = DECAY_PARAMS[spendTier]?.[refreshRate]
  if (!params) return null

  const { cliff, steepness, markerWeek } = params
  const W = 480, H = 250
  const PAD_L = 44, PAD_R = 16, PAD_T = 16, PAD_B = 34
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const points = []
  for (let w = 0; w <= 12; w += 0.1) {
    points.push({ week: w, eff: effectiveness(w, cliff, steepness) })
  }

  const x = (w) => PAD_L + (w / 12) * plotW
  const y = (eff) => PAD_T + plotH - (eff / 100) * plotH

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.week).toFixed(1)} ${y(p.eff).toFixed(1)}`)
    .join(' ')

  const markerEff = effectiveness(markerWeek, cliff, steepness)
  const weeksPastCliff = Math.max(0, markerWeek - cliff)
  const weeksToCliff = Math.max(0, cliff - markerWeek)
  const escalation = getCPAEscalation(weeksPastCliff)

  const cliffX = x(cliff)
  const safeEnd = Math.max(0, cliff - 2)
  const warnEnd = cliff

  let statusClass = 'decay-status-green'
  let statusText = ''
  if (weeksToCliff > 0.5) {
    statusText = `You're ~${Math.round(weeksToCliff)} weeks from your fatigue cliff. Budget effectiveness still at ${markerEff}%. Refresh now to stay safe.`
  } else if (weeksPastCliff <= 0.5) {
    statusClass = 'decay-status-amber'
    statusText = `You're at your fatigue cliff right now. Performance has dropped to ${markerEff}% and is about to fall fast.`
  } else {
    statusClass = 'decay-status-coral'
    statusText = `You passed your cliff ~${Math.round(weeksPastCliff)} weeks ago. Roughly ${100 - markerEff}% of your ad budget is underperforming. Every week of inaction deepens the bleed.`
  }

  const FREQ_LABELS = {
    weekly: 'weekly', every_2_3_weeks: 'bi-weekly',
    monthly_or_less: 'monthly', only_when_drops: 'reactive',
  }

  const markerAnchor = x(markerWeek) > W * 0.65 ? 'end' : x(markerWeek) < W * 0.35 ? 'start' : 'middle'
  const markerTextX = markerAnchor === 'end' ? x(markerWeek) - 10 : markerAnchor === 'start' ? x(markerWeek) + 10 : x(markerWeek)

  return (
    <div className="decay-curve">
      <p className="card-kicker">YOUR BUDGET EFFECTIVENESS CURVE</p>
      <p className="decay-intro">
        This shows how quickly your ad spend loses its impact without a creative refresh.
        The longer you run the same messaging, the harder your budget has to work for the same results.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="Budget effectiveness curve showing how your ad spend declines over weeks without a creative refresh">
        <defs>
          <clipPath id="curveClip">
            <path d={`${pathD} L ${x(12).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`} />
          </clipPath>
        </defs>

        <g clipPath="url(#curveClip)">
          <rect x={x(0)} y={PAD_T} width={x(safeEnd) - x(0)} height={plotH} fill="rgba(84, 201, 127, 0.08)" />
          <rect x={x(safeEnd)} y={PAD_T} width={x(Math.min(warnEnd, 12)) - x(safeEnd)} height={plotH} fill="rgba(240, 166, 60, 0.08)" />
          <rect x={x(Math.min(warnEnd, 12))} y={PAD_T} width={x(12) - x(Math.min(warnEnd, 12))} height={plotH} fill="rgba(226, 92, 80, 0.08)" />
        </g>

        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={y(v)} x2={PAD_L + plotW} y2={y(v)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={PAD_L - 4} y={y(v) + 3} fill="var(--faint)" fontSize="8" textAnchor="end">{v}%</text>
          </g>
        ))}

        {[0, 2, 4, 6, 8, 10, 12].map((w) => (
          <text key={w} x={x(w)} y={H - 6} fill="var(--faint)" fontSize="8" textAnchor="middle">W{w}</text>
        ))}

        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {cliff <= 12 && (
          <>
            <line x1={cliffX} y1={PAD_T} x2={cliffX} y2={PAD_T + plotH} stroke="var(--risk-critical)" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.6" />
            <text x={cliffX + 4} y={PAD_T + 12} fill="var(--risk-critical)" fontSize="8" opacity="0.7">fatigue cliff</text>
          </>
        )}

        <line x1={x(markerWeek)} y1={PAD_T + plotH} x2={x(markerWeek)} y2={y(markerEff)} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx={x(markerWeek)} cy={y(markerEff)} r="6" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />

        <rect
          x={markerTextX - (markerAnchor === 'end' ? 72 : markerAnchor === 'start' ? 0 : 36)}
          y={y(markerEff) - 32} width="72" height="20" rx="4"
          fill="var(--surface)" stroke="var(--accent)" strokeWidth="0.5" opacity="0.9"
        />
        <text x={markerTextX} y={y(markerEff) - 18} fill="var(--accent)" fontSize="9" fontWeight="600" textAnchor={markerAnchor}>
          {markerEff}% effective
        </text>
      </svg>

      <p className="decay-marker-note">Your {FREQ_LABELS[refreshRate] || ''} refresh cadence places you here on the curve</p>

      <div className="decay-zones">
        <div className="decay-zone decay-zone-safe">
          <span className="decay-zone-title">Safe zone</span>
          <span className="decay-zone-weeks">Weeks 1–{Math.max(1, Math.round(safeEnd))}</span>
          <span className="decay-zone-detail">CPA within 10–15%</span>
        </div>
        <div className="decay-zone decay-zone-warn">
          <span className="decay-zone-title">Warning zone</span>
          <span className="decay-zone-weeks">Weeks {Math.max(1, Math.round(safeEnd))}–{Math.round(warnEnd)}</span>
          <span className="decay-zone-detail">CPA up 20–50%, refresh window closing</span>
        </div>
        <div className="decay-zone decay-zone-cliff">
          <span className="decay-zone-title">Fatigue cliff</span>
          <span className="decay-zone-weeks">Weeks {Math.round(warnEnd)}+</span>
          <span className="decay-zone-detail">CPA doubles or worse, burning budget</span>
        </div>
      </div>

      <p className={`decay-status ${statusClass}`}>{statusText}</p>

      {escalation && weeksPastCliff > 0.5 && (
        <p className="decay-escalation">
          Based on your refresh cadence, your cost per acquisition has likely increased {escalation.low}–{escalation.high}% since your cliff.
        </p>
      )}

      {leakLow && leakHigh && weeksPastCliff > 0.5 && (
        <p className="decay-revenue-context">
          At your revenue level, this effectiveness drop represents approximately {formatGBP(Math.round(leakLow * (1 - markerEff / 100)))}–{formatGBP(Math.round(leakHigh * (1 - markerEff / 100)))} in monthly revenue left on the table.
        </p>
      )}

      <div className="decay-legend">
        <span className="decay-axis-label">Weeks since last creative refresh</span>
        <p className="decay-takeaway">
          Refreshing within {Math.max(1, Math.round(safeEnd))} weeks keeps your CPA stable. Beyond week {Math.round(cliff)}, performance drops fast and compounds.
        </p>
      </div>
    </div>
  )
}

// --- Section: Expanded Radar Chart (8 axes) ---------------------------------

const RADAR_LABELS_5 = ['Pain / Problem', 'Transformation', 'Social Proof', 'Science / Ingredient', 'Founder Story']

function RadarChart({ answers }) {
  const { scores, benchmark } = getRadarScores(answers.brandType, answers.angleDiversity)
  const N = 5
  const CX = 150, CY = 150, R = 100

  const angle = (i) => (Math.PI * 2 * i) / N - Math.PI / 2
  const px = (i, pct) => CX + R * (pct / 100) * Math.cos(angle(i))
  const py = (i, pct) => CY + R * (pct / 100) * Math.sin(angle(i))

  const userPath = scores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${px(i, s).toFixed(1)} ${py(i, s).toFixed(1)}`).join(' ') + ' Z'
  const benchmarkPath = benchmark.map((b, i) => `${i === 0 ? 'M' : 'L'} ${px(i, b).toFixed(1)} ${py(i, b).toFixed(1)}`).join(' ') + ' Z'

  const aboveFifty = scores.filter((s) => s > 50).length
  const weakest = scores.reduce((min, s, i) => s < min.value ? { value: s, label: RADAR_LABELS_5[i] } : min, { value: 100, label: '' })
  const strongest = scores.reduce((max, s, i) => s > max.value ? { value: s, label: RADAR_LABELS_5[i] } : max, { value: 0, label: '' })

  return (
    <div className="radar-chart">
      <p className="card-kicker">YOUR CREATIVE ANGLE COVERAGE</p>
      <p className="radar-intro">
        This maps how many distinct messaging angles your ads cover. Brands in similar tiers to
        yours should ideally hit the green benchmark. The yellow coverage is estimated from similar
        brands and your quiz answers. A full audit is needed to map this properly.
      </p>
      <div className="radar-legend">
        <span className="radar-legend-item"><span className="radar-dot radar-dot-user" /> Your estimated coverage</span>
        <span className="radar-legend-item"><span className="radar-dot radar-dot-ideal" /> Top-performing benchmark</span>
      </div>
      <svg viewBox="0 0 300 310" width="100%" aria-label="Radar chart showing creative angle coverage across 5 dimensions">
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={Array.from({ length: N }, (_, i) => `${px(i, ring).toFixed(1)},${py(i, ring).toFixed(1)}`).join(' ')}
            fill="none" stroke="var(--border)" strokeWidth={ring === 50 ? '0.8' : '0.5'}
          />
        ))}

        {Array.from({ length: N }, (_, i) => (
          <line
            key={i} x1={CX} y1={CY} x2={px(i, 100)} y2={py(i, 100)}
            stroke="var(--border)" strokeWidth="0.5"
          />
        ))}

        <path d={benchmarkPath} fill="rgba(84, 201, 127, 0.12)" stroke="var(--risk-low)" strokeWidth="1" strokeDasharray="4 3" />
        <path d={userPath} fill="rgba(240, 166, 60, 0.15)" stroke="var(--accent)" strokeWidth="2" />

        {scores.map((s, i) => (
          <g key={i}>
            <circle cx={px(i, s)} cy={py(i, s)} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.5" />
            <text
              x={px(i, s) + (px(i, s) > CX ? 8 : px(i, s) < CX ? -8 : 0)}
              y={py(i, s) + (py(i, s) > CY ? 12 : -8)}
              fill="var(--accent)" fontSize="8" fontWeight="600"
              textAnchor={px(i, s) > CX ? 'start' : px(i, s) < CX ? 'end' : 'middle'}
            >
              {s}%
            </text>
          </g>
        ))}

        {RADAR_LABELS_5.map((label, i) => {
          const labelR = R + 24
          const lx = CX + labelR * Math.cos(angle(i))
          const ly = CY + labelR * Math.sin(angle(i))
          return (
            <text key={i} x={lx} y={ly} fill="var(--muted)" fontSize="9" textAnchor="middle" dominantBaseline="middle">
              {label}
            </text>
          )
        })}
      </svg>
      <div className="radar-insight">
        <p className="radar-insight-text">
          <strong>Biggest gap:</strong> {weakest.label} ({weakest.value}%). This is likely your next creative brief.
          {strongest.label !== weakest.label && (
            <> Your strongest signal is {strongest.label} ({strongest.value}%).</>
          )}
        </p>
        <p className="radar-benchmark-text">
          Your coverage: {aboveFifty} of 5 angles above 50%. Best-in-class: 4 of 5.
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
  const jobTitle = answers.jobTitle
  const hasCreativeResp = (answers.responsibilities || []).includes('resp_creative')

  const aovMid = answers.aov === 'aov_other'
    ? Number(answers.aovCustom)
    : (AOV_MIDPOINTS[answers.aov] || null)

  const claimLoom = () => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'lead_magnet_CTA_clicked', type: 'loom_teardown' })
    window.open(bonusUrl(BONUS_LINK_QUALIFIED, 'qualified'), '_blank', 'noopener,noreferrer')
    setLoomClaimed(true)
    fireFollowupEvent('loom_claimed', { ...answers, temperature: temp })
  }

  const claimCourse = () => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'lead_magnet_CTA_clicked', type: 'email_course' })
    window.open(bonusUrl(BONUS_LINK_UNQUALIFIED, 'unqualified'), '_blank', 'noopener,noreferrer')
    setCourseClaimed(true)
    fireFollowupEvent('course_signup', { ...answers, temperature: temp })
  }

  let sectionIndex = 0
  const stagger = () => ({ '--i': sectionIndex++ })

  return (
    <main className="results">
      {/* A — Score header & gauge with benchmark overlay */}
      <section className="rsection" style={stagger()}>
        <p className="eyebrow">YOUR AD FATIGUE RISK SCORE</p>
        <Gauge score={results.score} />
        <p className="interp">{interpretation(answers, results)}</p>
      </section>

      {/* B — The number. Opportunity framing with role-conditional headline. */}
      {disqualified ? (
        <section className="rsection validation-card" style={stagger()}>
          <p className="card-kicker">GOOD NEWS</p>
          <p className="quickwin-copy">
            Your ads are holding up. Your refresh habits and messaging variety are doing their
            job. The patterns below are what brands like {brand} protect to keep it that way.
          </p>
        </section>
      ) : (
        <section className="rsection opportunity-card" style={stagger()}>
          <p className="card-kicker">{getHeadlineCopy(brand, jobTitle).toUpperCase()}</p>
          <p className="leak-number">
            {formatGBP(results.leakLow)} – {formatGBP(results.leakHigh)}
            <span className="leak-per"> / month</span>
          </p>
          <p className="leak-loss">
            And it's monthly: every month it goes unaddressed, the same range walks out the
            door again.
          </p>
          <p className="leak-sub">
            Based on your answers, that's an estimated {formatGBP(results.annualLow)} –{' '}
            {formatGBP(results.annualHigh)} a year that fresher, audience-driven ad messaging
            could capture for {brand}.
          </p>
          {aovMid && aovMid > 0 && (
            <p className="leak-orders">
              At your average order value, that's roughly ~{Math.round(results.leakLow / aovMid)}–{Math.round(results.leakHigh / aovMid)} orders a month your ads could be recovering.
            </p>
          )}
          <p className="leak-note">
            That's a {results.impLow}–{results.impHigh}% improvement on your current return,
            conservative against benchmarks for optimised skincare brands.
          </p>
          {results.strongROAS && (
            <p className="leak-note">
              Returns over £4 usually mean your paid channel has more room to scale than it's
              being given. The opportunity here is headroom, not repair.
            </p>
          )}
        </section>
      )}

      {/* C — Three-Lane Impact Stack */}
      {!disqualified && results.threeLane && results.leakLow >= 200 && (
        <section className="rsection" style={stagger()}>
          <ThreeLaneStack results={results} answers={answers} showSpendDecoder={!!(answers.aov)} />
        </section>
      )}

      {/* Cost of Inaction countdown */}
      {!disqualified && results.costOfInaction && (
        <section className="rsection" style={stagger()}>
          <CostOfInaction results={results} aovMid={aovMid} />
        </section>
      )}

      {/* Decay curve — parameterised sigmoid */}
      {!disqualified && answers.spendTier && answers.refreshRate && (
        <section className="rsection" style={stagger()}>
          <SigmoidDecayCurve
            spendTier={answers.spendTier}
            refreshRate={answers.refreshRate}
            fatigueScore={results.score}
            leakLow={results.leakLow}
            leakHigh={results.leakHigh}
          />
        </section>
      )}

      {/* Radar chart — 8-axis creative angle coverage */}
      {!disqualified && (
        <section className="rsection" style={stagger()}>
          <RadarChart answers={answers} />
        </section>
      )}

      {/* 4-part AI diagnosis */}
      {insights && insights.whats_working ? (
        <section className="rsection" style={stagger()}>
          <DiagnosisSection insights={insights} brandName={answers.brandName} />
        </section>
      ) : (
        <section className="rsection" style={stagger()}>
          <p className="insight-fallback" style={{ color: 'var(--faint)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
            Your personalised diagnosis is being prepared. Everything else on this page is calculated directly from your answers.
          </p>
        </section>
      )}

      {/* ── Light section: white background from here to end ── */}
      <div className="results-light-fade" aria-hidden="true" />
      <div className="results-light-wrap">

      {/* Credit Stack — warm+ leads only */}
      {!isCold && !disqualified && (
        <div className="rsection" style={stagger()}>
          <CreditStack isHotLead={isHot} />
        </div>
      )}

      {/* The conversion point */}
      <div className="rsection" style={stagger()}>
        {isHot ? (
          <LoomCard answers={answers} claimed={loomClaimed} onClaim={claimLoom} />
        ) : (
          <CourseCard answers={answers} claimed={courseClaimed} onClaim={claimCourse} />
        )}
      </div>

      {/* Quick win */}
      {!isCold && (
        <section className="rsection quickwin-card" style={stagger()}>
          <p className="card-kicker">⚡ ONE THING TO TRY THIS WEEK</p>
          <p className="quickwin-copy">{getQuickWin(answers.brandType)}</p>
        </section>
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
                  <span className="step-desc">Pick a 30-minute slot. We'll confirm within 2 hours.</span>
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div>
                  <span className="step-title">We build your teardown</span>
                  <span className="step-desc">
                    Our team analyses your ad account, competitor landscape, and audience data
                    using Audr. You'll get a personalised Loom video within 48 hours.
                  </span>
                </div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div>
                  <span className="step-title">Watch, ask, decide</span>
                  <span className="step-desc">
                    Free consultation. We walk through the findings and build an action plan
                    together. No obligation.
                  </span>
                </div>
              </li>
            </ol>
            <p className="compound-note">
              Worth saying: this compounds. As the messaging improves month over month, each
              cycle builds on the last. That's the conversation worth having.
            </p>
            {!loomClaimed && (
              <button className="cta-btn cta-full" onClick={claimLoom}>
                Get my exclusive bonus package →
              </button>
            )}
            <p className="powered-by">
              Powered by Audr audience intelligence + human creative strategists
            </p>
          </section>
        </>
      )}

      {/* Bottom — show the working */}
      <section className="rsection formula-foot" style={stagger()}>
        <pre className="formula-text">
          {`Your score is based on: refresh cadence × messaging variety × creative volume × return on spend.
Estimate assumes disciplined testing. Brands that spray underfunded tests will read higher than they are.
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

      </div>{/* end results-light-wrap */}
    </main>
  )
}

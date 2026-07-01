import { useEffect, useRef, useState } from 'react'
import LandingA from './LandingA.jsx'
import LandingB from './LandingB.jsx'
import { getVariant, trackVariantView, trackVariantCTA } from './utils/abTest.js'
import Quiz from './Quiz.jsx'
import Scoring from './Scoring.jsx'
import Unlock from './Unlock.jsx'
import Loading from './Loading.jsx'
import Results from './Results.jsx'
import { calculateScore, getLeadTemperature, calculateThreeLaneImpact, calculateCostOfInaction, getScenarioMatch, AOV_MIDPOINTS } from './scoring.js'
import { fireWebhook } from './webhook.js'
import { trackEvent } from './utils/tracking.js'
import { getStoredUTMs } from './utils/utm.js'
import { fetchInsights } from './api.js'

// ---------------------------------------------------------------------------
// Session persistence — survives refresh within the same tab
// ---------------------------------------------------------------------------

const SK = {
  answers: 'audr_answers',
  insights: 'audr_insights',
  pageviewFired: 'audr_pv',
  webhookFired: 'audr_wh',
}

function ssSave(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)) } catch {}
}
function ssLoad(key) {
  try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null }
}
function ssFlag(key) {
  try { return sessionStorage.getItem(key) === '1' } catch { return false }
}
function ssSetFlag(key) {
  try { sessionStorage.setItem(key, '1') } catch {}
}

// ---------------------------------------------------------------------------
// URL ↔ phase mapping (scoring/loading are transitional — no own slug)
// ---------------------------------------------------------------------------

const PHASE_PATH = {
  landing: '/', quiz: '/quiz', scoring: '/unlock',
  unlock: '/unlock', loading: '/results', results: '/results',
}

function phaseFromPath() {
  const p = window.location.pathname
  if (p === '/quiz') return 'quiz'
  if (p === '/unlock') return 'unlock'
  if (p === '/results') return 'results'
  return 'landing'
}

// ---------------------------------------------------------------------------

const INITIAL_ANSWERS = {
  brandName: '',
  websiteUrl: '',
  jobTitle: null,
  responsibilities: [],
  brandType: null,
  revenue: null,
  spendTier: null,
  aov: null,
  aovCustom: '',
  refreshRate: null,
  angleDiversity: null,
  costTrend: null,
  roasBracket: null,
  creativeVolume: null,
  bestHook: '',
  adsMadeBy: null,
  frustrations: [],
  extraContext: '',
  name: '',
  email: '',
}

function computeResults(a) {
  const inputs = toScoringInputs(a)
  const computed = calculateScore(inputs)
  const temperature = getLeadTemperature(inputs)
  const threeLane = calculateThreeLaneImpact(computed.leakLow, computed.leakHigh, a.spendTier)
  const aovMid = a.aov === 'aov_other' ? Number(a.aovCustom) : (AOV_MIDPOINTS[a.aov] || null)
  const costOfInaction = calculateCostOfInaction(computed.leakLow, computed.leakHigh, aovMid)
  const scenarioMatch = getScenarioMatch(computed.score)
  return { ...computed, temperature, threeLane, costOfInaction, scenarioMatch }
}

// Sample data for the dev panel "Preview Results" jump
const SAMPLE_ANSWERS = {
  brandName: 'Glow Theory',
  websiteUrl: 'glowtheory.co.uk',
  jobTitle: 'role_founder',
  responsibilities: ['resp_paid', 'resp_creative'],
  brandType: 'skincare',
  revenue: '80k_120k',
  spendTier: '30k_50k',
  aov: 'aov_25_40',
  aovCustom: '',
  refreshRate: 'monthly_or_less',
  angleDiversity: 'yes_same',
  costTrend: 'up_some',
  roasBracket: 'r_1_5_2_5',
  creativeVolume: 'vol_3_7',
  bestHook: 'Before/after transformation reels',
  adsMadeBy: 'agency',
  frustrations: ['stop_performing', 'same_message', 'customer_language'],
  extraContext: '',
  name: 'Sarah Chen',
  email: 'founder@glowtheory.co.uk',
}

function toScoringInputs(answers) {
  return {
    brandType: answers.brandType,
    revenue: answers.revenue,
    spendTier: answers.spendTier,
    refreshRate: answers.refreshRate,
    angleDiversity: answers.angleDiversity,
    costTrend: answers.costTrend,
    roasBracket: answers.roasBracket,
    creativeVolume: answers.creativeVolume,
    frustrations: answers.frustrations,
    frustrationCount: answers.frustrations.filter((f) => f !== 'none').length,
  }
}

export default function App() {
  const [phase, setPhaseRaw] = useState(() => {
    const url = phaseFromPath()
    const saved = ssLoad(SK.answers)
    if (url === 'results' && (!saved || !saved.email)) return 'landing'
    if (url === 'unlock' && (!saved || !saved.brandType)) return 'landing'
    return url
  })

  const [answers, setAnswersRaw] = useState(() => {
    const url = phaseFromPath()
    if (url === 'landing') return INITIAL_ANSWERS
    return ssLoad(SK.answers) || INITIAL_ANSWERS
  })

  const [results, setResults] = useState(() => {
    const url = phaseFromPath()
    if (url === 'results') {
      const saved = ssLoad(SK.answers)
      if (saved?.email) return computeResults(saved)
    }
    return null
  })

  const [insights, setInsights] = useState(() => {
    const url = phaseFromPath()
    if (url === 'results' || url === 'unlock') return ssLoad(SK.insights)
    return null
  })

  const [insightsPromise, setInsightsPromise] = useState(null)
  const webhookFired = useRef(ssFlag(SK.webhookFired))
  const variant = useRef(getVariant()).current

  const setPhase = (newPhase) => {
    setPhaseRaw(newPhase)
    const path = PHASE_PATH[newPhase] || '/'
    if (window.location.pathname !== path) {
      window.history.pushState({ phase: newPhase }, '', path)
    }
  }

  const setAnswers = (updater) => {
    setAnswersRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      ssSave(SK.answers, next)
      return next
    })
  }

  useEffect(() => {
    // Set history state for current entry so popstate works
    window.history.replaceState({ phase }, '', PHASE_PATH[phase] || '/')

    // Tracking — fire only once per session
    if (!ssFlag(SK.pageviewFired)) {
      trackEvent('PageView')
      trackVariantView(variant)
      ssSetFlag(SK.pageviewFired)
    }

    // If restored to unlock without insights, silently re-fetch
    if (phaseFromPath() === 'unlock' && !ssLoad(SK.insights)) {
      const saved = ssLoad(SK.answers)
      if (saved?.brandName) {
        fetchInsights(saved).then((result) => {
          setInsights(result)
          ssSave(SK.insights, result)
        }).catch(() => {})
      }
    }
  }, [])

  // Browser back / forward
  useEffect(() => {
    const onPop = (e) => {
      const p = e.state?.phase || phaseFromPath()
      setPhaseRaw(p)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const completeQuiz = () => {
    const promise = fetchInsights(answers)
    setInsightsPromise(promise)
    setPhase('scoring')
  }

  const unlockReport = (email, name) => {
    if (webhookFired.current) return
    webhookFired.current = true
    ssSetFlag(SK.webhookFired)

    const finalAnswers = { ...answers, email, name }
    setAnswers(finalAnswers)

    const fullResults = computeResults(finalAnswers)
    setResults(fullResults)

    const utms = getStoredUTMs()
    fireWebhook({ ...finalAnswers, ...fullResults }, utms)

    trackEvent('CalculatorCompleted', {
      score: fullResults.score,
      temperature: fullResults.temperature,
      spend_tier: finalAnswers.spendTier,
      revenue_tier: finalAnswers.revenue,
      brand_type: finalAnswers.brandType,
    })
    trackEvent('calculator_scored', {
      content_name: 'calculator_scored',
      value: fullResults.leakHigh,
      currency: 'GBP',
      status: fullResults.temperature,
    })
    trackEvent('calculator_lead', {
      content_name: 'calculator_lead',
      content_category: 'creative_fatigue',
      value: fullResults.leakHigh,
      currency: 'GBP',
    })

    setPhase('loading')
  }

  const reset = () => {
    webhookFired.current = false
    setAnswersRaw(INITIAL_ANSWERS)
    setResults(null)
    setInsights(null)
    setInsightsPromise(null)
    setPhaseRaw('landing')
    try {
      Object.values(SK).forEach((k) => sessionStorage.removeItem(k))
      sessionStorage.removeItem('audr_quiz_step')
      sessionStorage.removeItem('audr_started_fired')
      sessionStorage.removeItem('audr_qualified_fired')
    } catch {}
    window.history.replaceState({ phase: 'landing' }, '', '/')
  }

  const previewResults = () => {
    setAnswers(SAMPLE_ANSWERS)
    setResults(computeResults(SAMPLE_ANSWERS))
    setPhase('results')
  }

  return (
    <div className="shell">
      {phase === 'landing' && (
        variant === 'B'
          ? <LandingB onStart={() => { trackVariantCTA('B'); setPhase('quiz') }} />
          : <LandingA onStart={() => { trackVariantCTA('A'); setPhase('quiz') }} />
      )}
      {phase === 'quiz' && (
        <Quiz answers={answers} setAnswers={setAnswers} onComplete={completeQuiz} />
      )}
      {phase === 'scoring' && (
        <Scoring
          brandName={answers.brandName}
          insightsPromise={insightsPromise}
          onDone={(resolvedInsights) => {
            setInsights(resolvedInsights)
            ssSave(SK.insights, resolvedInsights)
            setPhase('unlock')
          }}
        />
      )}
      {phase === 'unlock' && (
        <Unlock
          brandName={answers.brandName}
          name={answers.name}
          email={answers.email}
          onSubmit={unlockReport}
          onBack={() => setPhase('quiz')}
        />
      )}
      {phase === 'loading' && (
        <Loading
          brandName={answers.brandName}
          brandType={answers.brandType}
          onDone={() => setPhase('results')}
        />
      )}
      {phase === 'results' && <Results answers={answers} results={results} insights={insights} />}

      {import.meta.env.DEV && (
        <DevPanel onPreview={previewResults} onReset={reset} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Developer tweaks panel — dev builds only (stripped from production bundle)
// ---------------------------------------------------------------------------

const ACCENTS = ['amber', 'blue', 'violet', 'emerald']

function DevPanel({ onPreview, onReset }) {
  const [open, setOpen] = useState(false)
  const [accent, setAccent] = useState('amber')

  useEffect(() => {
    document.documentElement.dataset.accent = accent
  }, [accent])

  return (
    <div className="dev-panel">
      {open && (
        <div className="dev-panel-body">
          <div className="dev-panel-label">Accent</div>
          <div className="dev-panel-row">
            {ACCENTS.map((a) => (
              <button
                key={a}
                className={`dev-accent dev-accent-${a}${a === accent ? ' active' : ''}`}
                onClick={() => setAccent(a)}
                aria-label={`${a} accent`}
              />
            ))}
          </div>
          <button className="dev-btn" onClick={onPreview}>
            Preview Results
          </button>
          <button className="dev-btn" onClick={onReset}>
            Reset
          </button>
        </div>
      )}
      <button
        className="dev-gear"
        onClick={() => setOpen((o) => !o)}
        aria-label="Developer tweaks"
      >
        ⚙
      </button>
    </div>
  )
}

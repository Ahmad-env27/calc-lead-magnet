import { useEffect, useRef, useState } from 'react'
import Landing from './Landing.jsx'
import Quiz from './Quiz.jsx'
import Scoring from './Scoring.jsx'
import Unlock from './Unlock.jsx'
import Loading from './Loading.jsx'
import Results from './Results.jsx'
import { calculateScore, getLeadTemperature, calculateThreeLaneImpact, calculateCostOfInaction, getScenarioMatch, AOV_MIDPOINTS } from './scoring.js'
import { fireWebhook, fireLeadPixel, firePageView } from './webhook.js'
import { fetchInsights } from './api.js'

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
  // landing | quiz | scoring | unlock | loading | results
  const [phase, setPhase] = useState('landing')
  const [answers, setAnswers] = useState(INITIAL_ANSWERS)
  const [results, setResults] = useState(null)
  const [insights, setInsights] = useState(null)
  const [insightsPromise, setInsightsPromise] = useState(null)
  const webhookFired = useRef(false)

  useEffect(() => {
    firePageView()
  }, [])

  const completeQuiz = () => {
    const promise = fetchInsights(answers)
    setInsightsPromise(promise)
    setPhase('scoring')
  }

  const unlockReport = (email, name) => {
    if (webhookFired.current) return
    webhookFired.current = true

    const finalAnswers = { ...answers, email, name }
    setAnswers(finalAnswers)

    const inputs = toScoringInputs(finalAnswers)
    const computed = calculateScore(inputs)
    const temperature = getLeadTemperature(inputs)

    const threeLane = calculateThreeLaneImpact(computed.leakLow, computed.leakHigh, finalAnswers.spendTier)
    const aovMid = finalAnswers.aov === 'aov_other'
      ? Number(finalAnswers.aovCustom)
      : (AOV_MIDPOINTS[finalAnswers.aov] || null)
    const costOfInaction = calculateCostOfInaction(computed.leakLow, computed.leakHigh, aovMid)
    const scenarioMatch = getScenarioMatch(computed.score)

    const fullResults = { ...computed, temperature, threeLane, costOfInaction, scenarioMatch }
    setResults(fullResults)

    fireWebhook({ ...finalAnswers, ...fullResults })
    fireLeadPixel(fullResults)

    setPhase('loading')
  }

  const reset = () => {
    webhookFired.current = false
    setAnswers(INITIAL_ANSWERS)
    setResults(null)
    setInsights(null)
    setInsightsPromise(null)
    setPhase('landing')
  }

  const previewResults = () => {
    setAnswers(SAMPLE_ANSWERS)
    const inputs = toScoringInputs(SAMPLE_ANSWERS)
    const computed = calculateScore(inputs)
    const temperature = getLeadTemperature(inputs)
    const threeLane = calculateThreeLaneImpact(computed.leakLow, computed.leakHigh, SAMPLE_ANSWERS.spendTier)
    const aovMid = AOV_MIDPOINTS[SAMPLE_ANSWERS.aov] || 32
    const costOfInaction = calculateCostOfInaction(computed.leakLow, computed.leakHigh, aovMid)
    const scenarioMatch = getScenarioMatch(computed.score)
    setResults({ ...computed, temperature, threeLane, costOfInaction, scenarioMatch })
    setPhase('results')
  }

  return (
    <div className="shell">
      {phase === 'landing' && <Landing onStart={() => setPhase('quiz')} />}
      {phase === 'quiz' && (
        <Quiz answers={answers} setAnswers={setAnswers} onComplete={completeQuiz} />
      )}
      {phase === 'scoring' && (
        <Scoring
          brandName={answers.brandName}
          insightsPromise={insightsPromise}
          onDone={(resolvedInsights) => {
            setInsights(resolvedInsights)
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

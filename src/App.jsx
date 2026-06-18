import { useEffect, useRef, useState } from 'react'
import Landing from './Landing.jsx'
import Quiz from './Quiz.jsx'
import Scoring from './Scoring.jsx'
import Unlock from './Unlock.jsx'
import Loading from './Loading.jsx'
import Results from './Results.jsx'
import { calculateScore, getLeadTemperature } from './scoring.js'
import { fireWebhook, fireLeadPixel, firePageView } from './webhook.js'

const INITIAL_ANSWERS = {
  brandName: '',
  brandType: null,
  revenue: null,
  spendTier: null,
  refreshRate: null,
  angleDiversity: null,
  costTrend: null,
  roasBracket: null,
  creativeVolume: null,
  adsMadeBy: null,
  frustrations: [],
  extraContext: '',
  email: '',
}

// Sample data for the dev panel "Preview Results" jump
const SAMPLE_ANSWERS = {
  brandName: 'Glow Theory',
  brandType: 'skincare',
  revenue: '60k_150k',
  spendTier: '15k_50k',
  refreshRate: 'monthly_or_less',
  angleDiversity: 'yes_same',
  costTrend: 'up_some',
  roasBracket: 'r_1_5_2_5',
  creativeVolume: 'vol_3_7',
  adsMadeBy: 'agency',
  frustrations: ['stop_performing', 'same_message', 'customer_language'],
  extraContext: '',
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
  const webhookFired = useRef(false)

  useEffect(() => {
    firePageView()
  }, [])

  // Quiz finished → scoring animation → then email unlock
  const completeQuiz = () => setPhase('scoring')

  const unlockReport = (email) => {
    if (webhookFired.current) return
    webhookFired.current = true

    const finalAnswers = { ...answers, email }
    setAnswers(finalAnswers)

    const inputs = toScoringInputs(finalAnswers)
    const computed = calculateScore(inputs)
    const temperature = getLeadTemperature(inputs)
    const fullResults = { ...computed, temperature }
    setResults(fullResults)

    // Fire-and-forget — never blocks the transition to results
    fireWebhook({ ...finalAnswers, ...fullResults })
    fireLeadPixel(fullResults)

    setPhase('loading')
  }

  const reset = () => {
    webhookFired.current = false
    setAnswers(INITIAL_ANSWERS)
    setResults(null)
    setPhase('landing')
  }

  const previewResults = () => {
    setAnswers(SAMPLE_ANSWERS)
    const inputs = toScoringInputs(SAMPLE_ANSWERS)
    const computed = calculateScore(inputs)
    setResults({ ...computed, temperature: getLeadTemperature(inputs) })
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
          onDone={() => setPhase('unlock')}
        />
      )}
      {phase === 'unlock' && (
        <Unlock
          brandName={answers.brandName}
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
      {phase === 'results' && <Results answers={answers} results={results} />}

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

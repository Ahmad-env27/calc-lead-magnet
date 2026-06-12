import { useEffect, useState } from 'react'
import Landing from './Landing.jsx'
import Quiz from './Quiz.jsx'
import Loading from './Loading.jsx'
import Results from './Results.jsx'
import { calculateScore, getLeadTemperature } from './scoring.js'
import { fireWebhook, fireLeadPixel, firePageView } from './webhook.js'

const INITIAL_ANSWERS = {
  email: '',
  brandName: '',
  brandType: null,
  revenue: null,
  spendTier: null,
  refreshRate: null,
  angleDiversity: null,
  frustrations: [],
  extraContext: '',
  currentROAS: '',
  bestHeadline: '',
}

// Sample data for the dev panel "Preview Results" jump
const SAMPLE_ANSWERS = {
  email: 'founder@glowtheory.co.uk',
  brandName: 'Glow Theory',
  brandType: 'skincare',
  revenue: '60k_150k',
  spendTier: '15k_50k',
  refreshRate: 'monthly_or_less',
  angleDiversity: 'yes_same',
  frustrations: ['stop_performing', 'same_message', 'customer_language'],
  extraContext: '',
  currentROAS: '2.4',
  bestHeadline: '',
}

function toScoringInputs(answers) {
  return {
    brandType: answers.brandType,
    revenue: answers.revenue,
    spendTier: answers.spendTier,
    refreshRate: answers.refreshRate,
    angleDiversity: answers.angleDiversity,
    frustrations: answers.frustrations,
    frustrationCount: answers.frustrations.filter((f) => f !== 'none').length,
    currentROAS: parseFloat(answers.currentROAS) || null,
  }
}

export default function App() {
  const [phase, setPhase] = useState('landing') // landing | quiz | loading | results
  const [answers, setAnswers] = useState(INITIAL_ANSWERS)
  const [results, setResults] = useState(null)

  useEffect(() => {
    firePageView()
  }, [])

  const submitQuiz = () => {
    const inputs = toScoringInputs(answers)
    const computed = calculateScore(inputs)
    const temperature = getLeadTemperature(inputs)
    const fullResults = { ...computed, temperature }
    setResults(fullResults)

    // Fire-and-forget — never blocks the transition to results
    fireWebhook({ ...answers, ...fullResults })
    fireLeadPixel(fullResults)

    setPhase('loading')
  }

  const reset = () => {
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
        <Quiz answers={answers} setAnswers={setAnswers} onSubmit={submitQuiz} />
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

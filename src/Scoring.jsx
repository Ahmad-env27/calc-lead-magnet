// Phase 2.75 — Pre-unlock scoring. A brief (4s) labor moment between quiz
// completion and the unlock screen. Visually distinct from the post-unlock
// loading (progress bar, not a ring) so the two never feel repetitive.
// Purpose: make the "report ready" claim on the unlock screen feel earned.

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Scoring your answers…',
  'Calculating your risk profile…',
  'Your report is ready',
]

export default function Scoring({ brandName, onDone }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }

    const pTimer = requestAnimationFrame(() => setProgress(1))

    const cycle = setInterval(
      () => setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1)),
      1300,
    )
    const done = setTimeout(onDone, 4000)
    return () => {
      cancelAnimationFrame(pTimer)
      clearInterval(cycle)
      clearTimeout(done)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="scoring" aria-live="polite">
      <div className="scoring-bar-track">
        <div
          className="scoring-bar-fill"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <p className="loading-msg" key={msgIndex}>
        {MESSAGES[msgIndex]}
      </p>
      <p className="loading-foot">Crunching data for {brandName || 'your brand'}</p>
    </main>
  )
}

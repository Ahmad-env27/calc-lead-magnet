// Phase 2.75 — Pre-unlock scoring. An 11-second labor moment between quiz
// completion and the unlock screen. Dual-gated: advances only when BOTH the
// minimum time has elapsed AND the LLM insights call has resolved (or the
// hard max of 15s is reached). The extended time is justified by the LLM
// processing happening in the background.

import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  'Scoring your answers…',
  'Analysing your ad patterns…',
  'Mapping creative refresh against benchmarks…',
  'Comparing with top skincare performers…',
  'Calculating your opportunity range…',
  'Cross-referencing competitor strategies…',
  'Generating personalised insights…',
  'Finalising your report…',
]

const MIN_DURATION = 11000
const MAX_DURATION = 15000
const MSG_INTERVAL = 1400

export default function Scoring({ brandName, insightsPromise, onDone }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const resolvedInsights = useRef(null)
  const insightsReady = useRef(false)
  const minElapsed = useRef(false)
  const fired = useRef(false)

  const tryAdvance = () => {
    if (fired.current) return
    if (minElapsed.current && insightsReady.current) {
      fired.current = true
      onDone(resolvedInsights.current)
    }
  }

  useEffect(() => {
    if (insightsPromise) {
      insightsPromise
        .then((insights) => {
          console.log('[SCORING] Insights resolved:', insights ? 'received' : 'null')
          resolvedInsights.current = insights
        })
        .catch((err) => {
          console.error('[SCORING] Insights promise rejected:', err)
          resolvedInsights.current = null
        })
        .finally(() => {
          insightsReady.current = true
          tryAdvance()
        })
    } else {
      insightsReady.current = true
    }

    if (reduced) {
      minElapsed.current = true
      const t = setTimeout(() => {
        if (!insightsReady.current) {
          insightsReady.current = true
        }
        if (!fired.current) {
          fired.current = true
          onDone(resolvedInsights.current)
        }
      }, 600)
      return () => clearTimeout(t)
    }

    const pTimer = requestAnimationFrame(() => setProgress(1))

    const cycle = setInterval(
      () => setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1)),
      MSG_INTERVAL,
    )

    const minTimer = setTimeout(() => {
      minElapsed.current = true
      tryAdvance()
    }, MIN_DURATION)

    const maxTimer = setTimeout(() => {
      if (!fired.current) {
        fired.current = true
        insightsReady.current = true
        onDone(resolvedInsights.current)
      }
    }, MAX_DURATION)

    return () => {
      cancelAnimationFrame(pTimer)
      clearInterval(cycle)
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const personalMsg = msgIndex === 1 && brandName
    ? `Analysing ${brandName}'s ad patterns…`
    : MESSAGES[msgIndex]

  return (
    <main className="scoring" aria-live="polite">
      <div className="scoring-bar-track">
        <div
          className="scoring-bar-fill"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <p className="loading-msg" key={msgIndex}>
        {personalMsg}
      </p>
      <p className="loading-foot">Crunching data for {brandName || 'your brand'}</p>
    </main>
  )
}

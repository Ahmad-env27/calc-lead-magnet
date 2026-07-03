// Phase 3 — Theatrical loading. Seven seconds of visible "work" building
// anticipation for the results reveal. Dual-gated when an insightsPromise is
// provided: advances only when BOTH the minimum time has elapsed AND the
// promise has resolved (or the hard max of 12s is reached).

import { useEffect, useRef, useState } from 'react'
import { NICHE_LABELS } from './angles-data.js'

const MIN_DURATION = 7000
const MAX_DURATION = 12000

export default function Loading({ brandName, brandType, insightsPromise, onDone }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const messages = [
    `Pulling competitor insights for ${NICHE_LABELS[brandType] || 'your niche'}…`,
    'Benchmarking against top skincare performers…',
    'Finalising personalised recommendations…',
    'Building your Revenue Leak Report…',
  ]

  const [msgIndex, setMsgIndex] = useState(0)
  const resolvedInsights = useRef(null)
  const insightsReady = useRef(!insightsPromise)
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
        .then((result) => {
          console.log('[LOADING] Retry insights resolved:', result ? 'received' : 'null')
          resolvedInsights.current = result
        })
        .catch(() => { resolvedInsights.current = null })
        .finally(() => {
          insightsReady.current = true
          tryAdvance()
        })
    }

    if (reduced) {
      minElapsed.current = true
      const t = setTimeout(() => {
        if (!fired.current) {
          fired.current = true
          onDone(resolvedInsights.current)
        }
      }, 600)
      return () => clearTimeout(t)
    }

    const cycle = setInterval(
      () => setMsgIndex((i) => Math.min(i + 1, messages.length - 1)),
      1600,
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
      clearInterval(cycle)
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="loading" aria-live="polite">
      <svg className="loading-ring" viewBox="0 0 96 96" width="88" height="88" aria-hidden="true">
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 14"
        />
      </svg>
      <p className="loading-msg" key={msgIndex}>
        {messages[msgIndex]}
      </p>
      <p className="loading-foot">Crunching data for {brandName || 'your brand'}</p>
    </main>
  )
}

// Phase 3 — Theatrical loading. Six seconds of visible "work" (Labor Illusion:
// the diagnosis feels earned, not instant). Under prefers-reduced-motion the
// wait collapses to under a second.

import { useEffect, useState } from 'react'
import { NICHE_LABELS } from './angles-data.js'

export default function Loading({ brandName, brandType, onDone }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const messages = [
    'Analysing your creative fatigue risk…',
    `Pulling competitor insights for ${NICHE_LABELS[brandType] || 'your niche'}…`,
    'Benchmarking against top skincare performers…',
    'Building your personalised report…',
  ]

  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
    const cycle = setInterval(
      () => setMsgIndex((i) => Math.min(i + 1, messages.length - 1)),
      1500,
    )
    const done = setTimeout(onDone, 6000)
    return () => {
      clearInterval(cycle)
      clearTimeout(done)
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

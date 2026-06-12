// Phase 2.5 — Email unlock. The report is built; this is the value exchange
// moment. The ask lands when investment and curiosity are at their peak —
// not at step 1 when trust is at zero.

import { useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Unlock({ brandName, email, onSubmit, onBack }) {
  const [value, setValue] = useState(email || '')
  const [error, setError] = useState(false)

  const valid = EMAIL_RE.test(value)

  const submit = () => {
    if (!valid) {
      setError(true)
      return
    }
    onSubmit(value)
  }

  return (
    <main className="unlock">
      <button className="back-btn unlock-back" onClick={onBack} aria-label="Back to the quiz">
        ←
      </button>

      <div className="unlock-body">
        <p className="eyebrow">REPORT READY</p>
        <h2 className="unlock-header">
          Your report for {brandName || 'your brand'} is built
        </h2>
        <p className="unlock-sub">
          Tell us where to send it and we’ll show it to you right now — plus you’ll get our
          5-day skincare ad messaging course as a bonus.
        </p>

        <div className="field">
          <label htmlFor="unlock-email">Email</label>
          <input
            id="unlock-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@yourbrand.co.uk"
            value={value}
            className={error ? 'invalid' : ''}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(false)
            }}
            onBlur={() => setError(value.length > 0 && !valid)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {error && <span className="field-error">That email doesn’t look right</span>}
        </div>

        <button className="btn-primary" disabled={!valid} onClick={submit}>
          Unlock my report →
        </button>

        <p className="unlock-trust">
          No spam, no pitch unless you ask. One short course email a day for five days, then we
          leave you alone.
        </p>
      </div>
    </main>
  )
}

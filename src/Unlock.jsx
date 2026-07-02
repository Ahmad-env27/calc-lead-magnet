// Phase 2.5 — Email unlock. The report is built; this is the value exchange
// moment. The ask lands when investment and curiosity are at their peak —
// not at step 1 when trust is at zero.

import { useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Unlock({ brandName, name, email, onSubmit, onBack }) {
  const [nameValue, setNameValue] = useState(name || '')
  const [emailValue, setEmailValue] = useState(email || '')
  const [emailError, setEmailError] = useState(false)
  const [nameError, setNameError] = useState(false)

  const emailValid = EMAIL_RE.test(emailValue)
  const nameValid = nameValue.trim().length >= 2

  const submit = () => {
    if (!nameValid) setNameError(true)
    if (!emailValid) setEmailError(true)
    if (!nameValid || !emailValid) return
    onSubmit(emailValue, nameValue.trim())
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
          <label htmlFor="unlock-name">Name <span className="field-required">(required)</span></label>
          <input
            id="unlock-name"
            type="text"
            autoComplete="name"
            placeholder="Your first name"
            value={nameValue}
            className={nameError ? 'invalid' : ''}
            onChange={(e) => {
              setNameValue(e.target.value)
              if (nameError) setNameError(false)
            }}
            onBlur={() => setNameError(!nameValid)}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('unlock-email').focus()}
          />
          {nameError && <span className="field-error">Please enter your name</span>}
        </div>

        <div className="field">
          <label htmlFor="unlock-email">Email <span className="field-required">(required)</span></label>
          <input
            id="unlock-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@yourbrand.co.uk"
            value={emailValue}
            className={emailError ? 'invalid' : ''}
            onChange={(e) => {
              setEmailValue(e.target.value)
              if (emailError) setEmailError(false)
            }}
            onBlur={() => setEmailError(!emailValid)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {emailError && <span className="field-error">That email doesn’t look right</span>}
        </div>

        <button className="btn-primary" disabled={!nameValid || !emailValid} onClick={submit}>
          Unlock my report →
        </button>

        <p className="unlock-trust">
          No spam. One short email a day for five days, then we leave you alone.
        </p>
      </div>
    </main>
  )
}

import { useEffect, useRef, useState } from 'react'

const DURATION = 60000
const MSG_INTERVAL = 5500
const FRUSTRATIONS_DELAY = 20000

const MESSAGES = ['Crunching numbers', 'Assessing opportunities', 'Discussing gaps']

const FRUSTRATIONS = [
  { id: 'stop_performing', label: 'My ads stop performing after a couple of weeks' },
  { id: 'same_message', label: 'We keep running variations of the same message' },
  { id: 'shrinking_returns', label: "I'm spending more but returns keep shrinking" },
  { id: 'volatile_months', label: "Good months and bad months — I can't tell why" },
  { id: 'competitor_blindspot', label: "I can't figure out what competitors are doing differently" },
  { id: 'content_not_strategic', label: 'My team produces content but none of it feels strategically different' },
  { id: 'customer_language', label: "I don't know how my customers actually talk about their skin" },
  { id: 'hit_wall', label: "We've hit a wall and can't break through" },
  { id: 'scared_to_scale', label: "I'm nervous to scale spend in case results collapse" },
  { id: 'agency_burnout', label: "I've worked with agencies before and nothing changes" },
  { id: 'none', label: '⊘ None of these — my ads are performing well' },
]

export default function Processing({ brandName, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [showFrustrations, setShowFrustrations] = useState(false)
  const [frustrations, setFrustrations] = useState([])
  const [barDone, setBarDone] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const startRef = useRef(Date.now())
  const doneRef = useRef(false)

  const canContinue = barDone && frustrations.length >= 1

  useEffect(() => {
    const start = startRef.current

    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(100, (elapsed / DURATION) * 100)
      setProgress(p)
      if (p >= 100 && !doneRef.current) {
        doneRef.current = true
        setBarDone(true)
      }
    }, 250)

    const msgCycle = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length)
    }, MSG_INTERVAL)

    const frustTimer = setTimeout(() => setShowFrustrations(true), FRUSTRATIONS_DELAY)

    return () => {
      clearInterval(tick)
      clearInterval(msgCycle)
      clearTimeout(frustTimer)
    }
  }, [])

  const toggleFrustration = (id) => {
    setFrustrations(prev => {
      if (id === 'none') return prev.includes('none') ? [] : ['none']
      const without = prev.filter(x => x !== 'none')
      if (without.includes(id)) return without.filter(x => x !== id)
      if (without.length >= 4) return prev
      return [...without, id]
    })
  }

  const handleCtaClick = () => {
    setShowEmailModal(true)
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailError('Please enter a valid email address')
      return
    }
    setEmailError('')
    onComplete(frustrations, trimmed)
  }

  const btnLabel = !barDone
    ? 'Building your report…'
    : frustrations.length < 1
      ? 'Select an option above to continue'
      : 'View my Revenue Leak Report →'

  return (
    <main className="processing">
      <div className="processing-bar-wrap">
        <div className="processing-bar-track">
          <div className="processing-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="processing-bar-pct">{Math.floor(progress)}%</span>
      </div>

      <div className="processing-scroll">
        <div className="processing-body">
          <p className="processing-msg" key={msgIndex}>{MESSAGES[msgIndex]}</p>
          <p className="processing-brand">
            Building your report{brandName ? ` for ${brandName}` : ''}…
          </p>

          {showFrustrations && (
            <div className="processing-q reveal">
              <h3 className="processing-q__title">
                While we crunch your numbers — what's your biggest frustration with your ads right now?
              </h3>
              <p className="processing-q__sub">Pick up to 4</p>

              <div className="chip-list">
                {FRUSTRATIONS.map(f => {
                  const selected = frustrations.includes(f.id)
                  const maxed = !selected && f.id !== 'none' && frustrations.filter(x => x !== 'none').length >= 4
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={`chip${selected ? ' selected' : ''}${f.id === 'none' ? ' chip-none' : ''}`}
                      disabled={maxed}
                      aria-pressed={selected}
                      onClick={() => toggleFrustration(f.id)}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>

              {frustrations.length > 0 && !frustrations.includes('none') && (
                <p className="processing-q__note">These are exactly the patterns your report digs into.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showFrustrations && (
        <div className="processing-cta-wrap">
          <button
            className="btn-primary processing-cta"
            disabled={!canContinue}
            onClick={handleCtaClick}
          >
            {btnLabel}
          </button>
        </div>
      )}

      {showEmailModal && (
        <div className="email-gate-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="email-gate" onClick={e => e.stopPropagation()}>
            <h2 className="email-gate__title">Where should we send your report?</h2>
            <p className="email-gate__sub">
              Enter your email to unlock your Revenue Leak Report. We'll also send you a copy.
            </p>
            <form className="email-gate__form" onSubmit={handleEmailSubmit} noValidate>
              <input
                type="email"
                className="email-gate__input"
                placeholder="you@yourbrand.com"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
              />
              {emailError && <p className="email-gate__error">{emailError}</p>}
              <button type="submit" className="btn-primary email-gate__submit">
                See my Revenue Leak Report →
              </button>
            </form>
            <p className="email-gate__note">No spam. Unsubscribe any time.</p>
          </div>
        </div>
      )}
    </main>
  )
}

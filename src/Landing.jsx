// Phase 1 — Landing. Hook with curiosity + loss aversion; the perceived cost
// is trivially low (8 questions, ~60 seconds). Everything above the fold.

const VALUE_CARDS = [
  {
    icon: '🎯',
    title: 'Your Risk Score',
    desc: 'How exposed your brand is to creative fatigue',
  },
  {
    icon: '💰',
    title: 'Your Revenue Leak',
    desc: 'The monthly opportunity you’re likely leaving on the table',
  },
  {
    icon: '🔍',
    title: 'Your Competitor Gaps',
    desc: 'What 3 competitors are saying that you’re not',
  },
]

export default function Landing({ onStart }) {
  return (
    <main className="landing">
      <div className="ghost-gauge reveal" style={{ '--i': 0 }} aria-hidden="true">
        <svg viewBox="0 0 120 68" width="110" height="62">
          <path
            d="M 12 60 A 48 48 0 0 1 108 60"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="2 9"
          />
          <text
            x="60"
            y="58"
            textAnchor="middle"
            fill="var(--muted)"
            fontSize="26"
            fontFamily="var(--font-display)"
          >
            ?
          </text>
        </svg>
      </div>

      <p className="eyebrow reveal" style={{ '--i': 1 }}>
        AUDR · AD INTEL
      </p>

      <h1 className="headline reveal" style={{ '--i': 2 }}>
        How much revenue is <span className="grad">silently draining</span> from
        your skincare brand?
      </h1>

      <p className="subhead reveal" style={{ '--i': 3 }}>
        Answer 12 quick questions and we’ll build you a personalised revenue
        recovery report — plus a free snapshot of what your competitors’ ads
        are saying that yours aren’t.
      </p>

      <div className="value-cards reveal" style={{ '--i': 4 }}>
        {VALUE_CARDS.map((c) => (
          <div className="value-card" key={c.title}>
            <span className="value-icon" aria-hidden="true">
              {c.icon}
            </span>
            <div>
              <span className="value-title">{c.title}</span>
              <span className="value-desc">{c.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cta-zone reveal" style={{ '--i': 5 }}>
        <button className="cta-btn" onClick={onStart}>
          Get my free report →
        </button>
      </div>

      <div className="trust-zone reveal" style={{ '--i': 6 }}>
        <p className="trust-line">
          Built for skincare brands doing{' '}
          <span className="pill">£100k+/month</span> in revenue
        </p>
        <p className="guarantee-line">
          ✓ Free personalised Loom teardown included — no pitch unless you ask
        </p>
      </div>
    </main>
  )
}

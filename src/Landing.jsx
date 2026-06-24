// Phase 1 — Landing. Hook with curiosity + loss aversion; the perceived cost
// is trivially low (8 questions, ~60 seconds). Everything above the fold.

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
        Answer 16 quick questions and get your Revenue Leak Report — your
        creative fatigue risk score and how much monthly revenue your skincare
        brand is leaving behind.
      </p>

      <div className="cta-zone reveal" style={{ '--i': 4 }}>
        <button className="cta-btn" onClick={onStart}>
          Get my free report →
        </button>
      </div>

      <div className="trust-zone reveal" style={{ '--i': 5 }}>
        <p className="trust-line">
          Built for skincare brands doing{' '}
          <span className="pill">£100k+/month</span> in revenue
        </p>
        <p className="guarantee-line">
          ✓ Free Loom teardown included — yours to keep, no strings
        </p>
      </div>
    </main>
  )
}

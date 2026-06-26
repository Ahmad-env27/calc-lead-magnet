export default function Landing({ onStart }) {
  return (
    <>
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

        <div className="scroll-hint reveal" style={{ '--i': 6 }} aria-hidden="true">
          <svg className="scroll-hint__arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3v11M4 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="scroll-hint__label">learn more</span>
        </div>
      </main>

      {/* Section 1: The Problem */}
      <section className="section">
        <p className="section__eyebrow">The problem</p>
        <h2 className="section__title">Your ads aren't fatiguing because of Meta. They're fatiguing because <span className="highlight">every brief starts from the same guesses.</span></h2>
        <div className="section__body">
          <p>Most skincare brands spending £20k+ a month on Meta hit the same wall. Performance was great for a while. Then CPAs crept up, ROAS started sliding, and no amount of "new creative" seems to fix it.</p>
          <p>The problem isn't Meta. It's not even your creative team. It's the gap between what your customers actually feel and what your ads are saying.</p>
        </div>

        <div className="pain-grid">
          <div className="pain-card">
            <div className="pain-card__icon">🔁</div>
            <div className="pain-card__text">
              <h3>Same angles, recycled</h3>
              <p>Your last 10 ads probably used the same 2–3 hooks. Your audience has seen them. So has Meta's algorithm.</p>
            </div>
          </div>
          <div className="pain-card">
            <div className="pain-card__icon">🎯</div>
            <div className="pain-card__text">
              <h3>Briefs built on assumptions</h3>
              <p>Most creative briefs are based on what the team thinks customers care about. Not what customers actually say about their skin.</p>
            </div>
          </div>
          <div className="pain-card">
            <div className="pain-card__icon">📈</div>
            <div className="pain-card__text">
              <h3>Rising costs, shrinking returns</h3>
              <p>Your CPA went from £28 to £41 since January. On £30k/month, that's roughly £9k of orders you used to get. Gone.</p>
            </div>
          </div>
          <div className="pain-card">
            <div className="pain-card__icon">👻</div>
            <div className="pain-card__text">
              <h3>Competitor blindspot</h3>
              <p>The skincare brand outperforming you isn't smarter. Their ads speak the language your customers already use. You just can't see it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Cost */}
      <section className="section">
        <p className="section__eyebrow">The cost of waiting</p>
        <h2 className="section__title">A leaking ad account doesn't cost you once. It <span className="highlight-red">compounds every month</span> you leave it.</h2>

        <div className="leak-math">
          <div className="leak-math__formula">
            <span className="leak-math__chip">£20k spend</span>
            <span className="leak-math__op">×</span>
            <span className="leak-math__chip">20% leak</span>
            <span className="leak-math__op">÷</span>
            <span className="leak-math__chip">£35 AOV</span>
          </div>
          <div className="leak-math__result">
            <div className="leak-math__result-number">~700 orders lost</div>
            <div className="leak-math__result-label">over 6 months of undetected creative fatigue</div>
          </div>
          <p className="leak-math__note">That's £24,000 in revenue. From one problem nobody flagged.</p>
        </div>

        <div className="risk-bar-wrap" style={{ marginTop: '16px' }}>
          <div className="ticker-row">
            <span className="ticker-row__label">Month 1</span>
            <span className="ticker-row__value ticker-row__value--amber">-£4,000</span>
          </div>
          <div className="ticker-row">
            <span className="ticker-row__label">Month 3</span>
            <span className="ticker-row__value ticker-row__value--red">-£12,000</span>
          </div>
          <div className="ticker-row">
            <span className="ticker-row__label">Month 6</span>
            <span className="ticker-row__value ticker-row__value--red">-£24,000</span>
          </div>
          <div className="ticker-row" style={{ borderBottom: 'none' }}>
            <span className="ticker-row__label">Orders that went to competitors</span>
            <span className="ticker-row__value ticker-row__value--red">~700</span>
          </div>
        </div>

        <div className="section__body" style={{ marginTop: '20px' }}>
          <p>Every month you spend "thinking about it" is another month of leaked revenue you don't get back. The calculator takes 3 minutes. The Loom teardown takes a week. The cost of doing nothing? That keeps growing.</p>
        </div>
      </section>

      {/* Section 3: How it works */}
      <section className="section">
        <p className="section__eyebrow">How it works</p>
        <h2 className="section__title">3 minutes to find what your dashboards won't show you</h2>

        <div className="steps">
          <div className="step">
            <div className="step__marker">
              <div className="step__number">1</div>
              <div className="step__line"></div>
            </div>
            <div className="step__content">
              <h3>Answer 16 quick questions</h3>
              <p>About your ad spend, creative process, and what's been frustrating you. No fluff, just the signals that matter.</p>
              <span className="step__time">~3 min</span>
            </div>
          </div>
          <div className="step">
            <div className="step__marker">
              <div className="step__number">2</div>
              <div className="step__line"></div>
            </div>
            <div className="step__content">
              <h3>Get your Revenue Leak Report</h3>
              <p>Instantly see your creative fatigue risk score, estimated monthly revenue leak, and the specific gaps creating it.</p>
              <span className="step__time">Instant</span>
            </div>
          </div>
          <div className="step">
            <div className="step__marker">
              <div className="step__number">3</div>
              <div className="step__line"></div>
            </div>
            <div className="step__content">
              <h3>Receive a free Loom teardown</h3>
              <p>A personalised video walkthrough of your brand's ad strategy, creative angles, and what your competitors' ads are saying that yours aren't. Delivered to your inbox.</p>
              <span className="step__time">Within 5 days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: What you get */}
      <section className="section">
        <p className="section__eyebrow">What you'll get</p>
        <h2 className="section__title">Not a generic PDF. A personalised diagnostic built from <span className="highlight">your numbers.</span></h2>

        <div className="report-grid">
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>Creative fatigue risk score</strong> based on your refresh rate, angle diversity, and volume</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>Monthly revenue leak estimate</strong> in pounds and lost orders, not vague percentages</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>6-month cost of inaction</strong> so you can see what doing nothing actually costs</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>Personalised Loom teardown</strong> with competitor ad analysis and blind spots in your current strategy</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>AI-generated insight snapshot</strong> highlighting your biggest risk factor and what to prioritise first</div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button className="cta-btn cta-full" onClick={onStart}>Get my free report →</button>
        </div>
      </section>

      {/* Section 5: Who this is for */}
      <section className="section">
        <p className="section__eyebrow">Is this for you?</p>
        <h2 className="section__title">Built for skincare brands that know their ads should be doing more</h2>

        <div className="section__body">
          <p>This calculator was designed for a specific type of brand. If the following sounds familiar, your report will be uncomfortably accurate.</p>
        </div>

        <ul className="icp-list">
          <li>You spend £10k+ per month on Meta and the results have plateaued or declined</li>
          <li>Your CPA has crept up and you're not sure why</li>
          <li>Creative gets produced regularly but nothing feels strategically different</li>
          <li>You don't really know how your customers talk about their skin concerns</li>
          <li>You've hit a wall and can't figure out what competitors do differently</li>
          <li>Your agency reports look fine but the bank account tells a different story</li>
        </ul>

        <div className="section__body" style={{ marginTop: '20px' }}>
          <p>If even two of those hit home, the calculator will show you exactly where the leak is. And the Loom teardown will show you what to do about it.</p>
        </div>
      </section>

      {/* Section 6: Built by */}
      <section className="section">
        <p className="section__eyebrow">Built by</p>
        <h2 className="section__title">We don't do discovery calls. We do audits.</h2>

        <div className="section__body">
          <p>Audr is an audience intelligence platform built by a performance marketing agency that's spent 7+ years managing Meta ads for skincare and beauty DTC brands.</p>
          <p>We built this calculator because we kept finding the same problem: brands spending serious money on ads that say what the team thinks customers want to hear, not what customers actually say.</p>
        </div>

        <div className="cred-block">
          <div className="cred-block__quote">
            "Most agencies brief creative from assumptions because they've never had access to actual audience language. It's not malice. It's a missing layer."
          </div>
          <div className="cred-block__attr">Josh Lloyd, Founder</div>
        </div>

        <div className="cred-stats">
          <div className="cred-stat">
            <div className="cred-stat__number">7+</div>
            <div className="cred-stat__label">Years in Meta ads</div>
          </div>
          <div className="cred-stat">
            <div className="cred-stat__number">DTC</div>
            <div className="cred-stat__label">Skincare focus</div>
          </div>
          <div className="cred-stat">
            <div className="cred-stat__number">100%</div>
            <div className="cred-stat__label">Proof before payment</div>
          </div>
          <div className="cred-stat">
            <div className="cred-stat__number">Free</div>
            <div className="cred-stat__label">Loom included</div>
          </div>
        </div>
      </section>

      {/* Section 7: The Missing Layer */}
      <section className="section">
        <p className="section__eyebrow">The missing layer</p>
        <h2 className="section__title">Meta didn't stop sending you customers. It started sending them to the brand whose ads <span className="highlight">speak their language.</span></h2>

        <div className="section__body">
          <p>The brands winning on Meta right now aren't running more ads. They're running ads built on what their customers actually say about their skin, their frustrations, their routines, their language.</p>
          <p>When your ad says "clinically proven hydration" but your customer says "I just want something that doesn't make my face sting after the gym," you've lost the click before it ever happened.</p>
          <p>That gap between brand language and customer language is the leak. And until you close it, every pound you spend on ads is working harder than it needs to.</p>
        </div>

        <div className="risk-bar-wrap">
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '14px', textAlign: 'center' }}>Where most skincare brands sit on the fatigue scale:</p>
          <div className="risk-bar"></div>
          <div className="risk-bar__labels">
            <span>Low risk</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Critical</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--faint)', marginTop: '12px', textAlign: 'center' }}>Most brands that take this calculator score 55–75. Where do you sit?</p>
        </div>
      </section>

      {/* Section 8: FAQ */}
      <section className="section">
        <p className="section__eyebrow">Questions</p>
        <h2 className="section__title">Before you ask</h2>

        <div className="faq-list">
          <div className="faq-item">
            <div className="faq-item__q">Is this actually free?</div>
            <div className="faq-item__a">Yes. The calculator and your Revenue Leak Report are instant and free. The Loom teardown is also free. There's no hidden paywall, no bait-and-switch. If the report is useful, great. If you want to talk after, we're here.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">How accurate is the revenue leak estimate?</div>
            <div className="faq-item__a">It's based on the data you provide: your actual spend, AOV, ROAS, and creative patterns. It uses the same logic we apply to client accounts. It won't be perfect (that requires an actual audit), but it will be directionally honest and probably uncomfortable.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">What's in the Loom teardown?</div>
            <div className="faq-item__a">A personalised video walkthrough of your brand's Meta ad strategy. We look at your live ads, your competitors' ads, your creative angles, and the gaps between what your ads say and what your customers actually care about. It's the kind of analysis most agencies charge for.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">Do I need to give you access to my ad account?</div>
            <div className="faq-item__a">No. The calculator works entirely from your answers. The Loom teardown uses publicly available ad library data and our audience intelligence tools. No logins, no access requests.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">I'm not a skincare brand. Can I still use it?</div>
            <div className="faq-item__a">The calculator is calibrated specifically for skincare and beauty DTC brands. If that's not you, the numbers won't be as relevant. We're building versions for other verticals, so check back.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">Is this a pitch for your agency?</div>
            <div className="faq-item__a">No. This is a diagnostic tool. If the report shows a problem and you want help fixing it, we can talk about that. But the report stands on its own. Most brands find it useful whether they work with us or not.</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <p className="section__eyebrow">Ready?</p>
        <h2 className="final-cta__title">Find out what your ads are costing you. <span className="highlight">In 3 minutes.</span></h2>
        <p className="final-cta__sub">16 questions. Instant results. Free Loom teardown. No strings.</p>
        <button className="cta-btn cta-full" onClick={onStart}>Get my free report →</button>
        <div className="trust-zone" style={{ marginTop: '14px' }}>
          <p className="trust-line">Built for skincare brands doing <span className="pill">£100k+/month</span> in revenue</p>
        </div>
      </section>
    </>
  )
}

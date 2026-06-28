export default function Landing({ onStart }) {
  return (
    <>
      <main className="landing">
        <img src="/audr-logo.png" alt="Audr" className="landing-logo reveal" style={{ '--i': 0 }} />

        <div className="ghost-gauge reveal" style={{ '--i': 1 }} aria-hidden="true">
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

        <p className="eyebrow reveal" style={{ '--i': 2 }}>
          AUDR · AD INTEL
        </p>

        <h1 className="headline reveal" style={{ '--i': 3 }}>
          Your customers are telling you <span className="grad">exactly what to say.</span> You just haven't heard them yet.
        </h1>

        <p className="subhead reveal" style={{ '--i': 4 }}>
          Take the 3-minute Revenue Leak Calculator. Find out how much your skincare brand is losing to creative fatigue — and get a free Loom teardown showing what your competitors' ads say that yours don't.
        </p>

        <div className="cta-zone reveal" style={{ '--i': 5 }}>
          <button className="cta-btn" onClick={onStart}>
            Find my revenue leak →
          </button>
        </div>

        <div className="trust-zone reveal" style={{ '--i': 6 }}>
          <p className="trust-line">
            Built for DTC skincare brands doing{' '}
            <span className="pill">£100k+/month</span>
          </p>
          <p className="guarantee-line">
            ✓ Free personalised Loom teardown included — no strings, yours to keep
          </p>
        </div>

        <div className="scroll-hint reveal" style={{ '--i': 7 }} aria-hidden="true">
          <svg className="scroll-hint__arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3v11M4 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="scroll-hint__label">learn more</span>
        </div>
      </main>

      {/* Section 1: The Real Problem */}
      <section className="section">
        <p className="section__eyebrow">The real problem</p>
        <h2 className="section__title">You started this brand to help people with their skin. Not to stare at a <span className="highlight">declining ROAS</span> wondering what went wrong.</h2>
        <div className="section__body">
          <p>You built something real. A product that works, customers who love it, a story that matters. But somewhere between £1M and £5M, the ads stopped working the way they used to. And no amount of new creative seems to fix it.</p>
          <p>The frustrating part? You know something's off. You just can't see what.</p>
        </div>

        <div className="pain-grid">
          <div className="pain-card">
            <div className="pain-card__icon">🪞</div>
            <div className="pain-card__text">
              <h3>"The creative all looks the same"</h3>
              <p>Content gets produced every month but nothing feels strategically different. Every brief starts from the same assumptions your team has always made.</p>
            </div>
          </div>
          <div className="pain-card">
            <div className="pain-card__icon">🔇</div>
            <div className="pain-card__text">
              <h3>"I don't know how my customers actually talk"</h3>
              <p>You have thousands of reviews. Customers describing their skin, their frustrations, what nearly stopped them buying. But nobody's turned that language into ad copy.</p>
            </div>
          </div>
          <div className="pain-card">
            <div className="pain-card__icon">🧱</div>
            <div className="pain-card__text">
              <h3>"I've hit a wall I can't break through"</h3>
              <p>Revenue has plateaued. You've tried new audiences, new creatives, even a new agency. Same result. The ceiling won't budge.</p>
            </div>
          </div>
          <div className="pain-card">
            <div className="pain-card__icon">👁️</div>
            <div className="pain-card__text">
              <h3>"Other brands are scaling and I can't see why"</h3>
              <p>Competitors in your space are growing faster, getting press, winning awards. You know something is different about what they're doing. You just can't reverse-engineer it.</p>
            </div>
          </div>
        </div>

        <div className="inline-quote">
          If even one of these keeps you up at night, this calculator was built for you.
        </div>
      </section>

      {/* Section 2: The Invisible Gap */}
      <section className="section">
        <p className="section__eyebrow">The invisible gap</p>
        <h2 className="section__title">Meta didn't stop sending you customers. It started sending them to the brand whose ads <span className="highlight">speak their language.</span></h2>

        <div className="section__body">
          <p>Here's what nobody tells you: the brands winning on Meta right now aren't spending more than you. They're not running some secret audience hack. They're running ads built on what their customers actually say — the exact words real people use to describe their skin, their frustrations, their routines.</p>
          <p>When your ad says "clinically proven hydration" but your customer says "I just want something that doesn't make my face sting after the gym," you've lost the click before it happened.</p>
          <p>That gap between <em>brand language</em> and <em>customer language</em> is the leak. And it compounds every month you don't close it.</p>
        </div>

        <div className="transform-grid">
          <div className="transform-col transform-col--before">
            <div className="transform-col__label">What your ads say</div>
            <ul>
              <li>"Clinically proven formula"</li>
              <li>"Premium natural ingredients"</li>
              <li>"Dermatologist recommended"</li>
              <li>"Transform your skincare routine"</li>
            </ul>
          </div>
          <div className="transform-col transform-col--after">
            <div className="transform-col__label">What your customers say</div>
            <ul>
              <li>"My face finally stopped stinging"</li>
              <li>"I actually trust what's in this"</li>
              <li>"It's the only thing that worked on my eczema"</li>
              <li>"I stopped dreading my morning routine"</li>
            </ul>
          </div>
        </div>

        <div className="section__body" style={{ marginTop: '20px' }}>
          <p>The right column is what makes people stop scrolling. It's sitting in your reviews right now. The calculator measures how wide this gap is for your brand — and the Loom shows you exactly how to close it.</p>
        </div>
      </section>

      {/* Section 3: The Cost of Guessing */}
      <section className="section">
        <p className="section__eyebrow">The cost of guessing</p>
        <h2 className="section__title">Every month you run ads from assumptions is another month of <span className="highlight-red">revenue walking to your competitors.</span></h2>

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
            <div className="leak-math__result-label">in 6 months from undetected creative fatigue alone</div>
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
            <span className="ticker-row__label">Customers who bought from a competitor instead</span>
            <span className="ticker-row__value ticker-row__value--red">~700</span>
          </div>
        </div>

        <div className="section__body" style={{ marginTop: '20px' }}>
          <p>These aren't strangers. They're people who <em>would have bought from you</em>. They have the skin condition your product solves. They were one scroll away from finding you. But your ad said the wrong thing — and a competitor's ad said the right one.</p>
          <p>The calculator shows you exactly how big that gap is for your brand. In pounds, in orders, in customers lost.</p>
        </div>
      </section>

      {/* Section 4: How it works */}
      <section className="section">
        <p className="section__eyebrow">How it works</p>
        <h2 className="section__title">3 minutes to see what your dashboards <span className="highlight">will never show you</span></h2>

        <div className="steps">
          <div className="step">
            <div className="step__marker">
              <div className="step__number">1</div>
              <div className="step__line"></div>
            </div>
            <div className="step__content">
              <h3>Answer 16 honest questions</h3>
              <p>About your spend, your creative process, what's frustrating you, and where you think the problem is. No login needed. No ad account access.</p>
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
              <p>Your creative fatigue risk score. Your estimated monthly revenue leak in pounds and lost orders. The specific gap that's causing it. Instant — no waiting, no gating.</p>
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
              <p>A personalised video analysing your brand's ads, your competitors' angles, and the gap between what your ads say and what your customers actually feel. The kind of work most agencies charge £2,000+ for.</p>
              <span className="step__time">Within 5 days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: What you'll get */}
      <section className="section">
        <p className="section__eyebrow">What you'll get</p>
        <h2 className="section__title">Not a generic audit. A personalised diagnosis built from <span className="highlight">your numbers and your brand.</span></h2>

        <div className="report-grid">
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>Creative fatigue risk score</strong> — where you sit on the spectrum, based on your refresh rate, angle diversity, and ad volume</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>Monthly revenue leak</strong> — in pounds and lost orders, not vague percentages. A number you can take to your next team meeting</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>6-month cost of inaction</strong> — what doing nothing actually costs your brand if you leave the gap open</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>Personalised Loom teardown</strong> — your ads vs your competitors' ads, the angles they're hitting that you're missing, and where to start</div>
          </div>
          <div className="report-item">
            <div className="report-item__check">✓</div>
            <div className="report-item__text"><strong>AI-generated insight snapshot</strong> — your single biggest risk factor and what to fix first, even if you never speak to us</div>
          </div>
        </div>

        <div className="section__body" style={{ marginTop: '20px' }}>
          <p>The goal isn't to overwhelm you with data. It's to give you <em>certainty</em>. So the next time you brief creative, approve spend, or review performance, you know exactly what's working and what's leaking.</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button className="cta-btn" onClick={onStart}>Find my revenue leak →</button>
        </div>
      </section>

      {/* Section 6: Is this you? */}
      <section className="section">
        <p className="section__eyebrow">Is this you?</p>
        <h2 className="section__title">This was built for the founder who knows their product works — but can't figure out why the <span className="highlight">ads don't.</span></h2>

        <div className="section__body">
          <p>You don't need another agency promising "scale." You need someone who actually understands what it's like to build a skincare brand from a kitchen table and a personal health condition. Someone who gets that your product isn't a commodity — it changes lives.</p>
        </div>

        <ul className="icp-list">
          <li>You founded this brand because you or someone you love had a skin condition conventional products couldn't solve</li>
          <li>You're doing £1–5M in revenue and you can feel the ceiling but can't break through it</li>
          <li>You're spending on Meta ads but the returns have plateaued or declined</li>
          <li>Creative gets produced but you secretly know it all sounds the same</li>
          <li>You've worked with agencies before and left feeling like they never really understood your brand</li>
          <li>You want to stop being the bottleneck and get back to the product, the mission, the reason you started</li>
        </ul>

        <div className="inline-quote">
          If you read that list and thought "that's me" — this is the most useful 3 minutes you'll spend this week.
        </div>
      </section>

      {/* Section 7: What changes */}
      <section className="section">
        <p className="section__eyebrow">What changes</p>
        <h2 className="section__title">From guessing what works to <span className="highlight">knowing what connects.</span></h2>

        <div className="transform-grid">
          <div className="transform-col transform-col--before">
            <div className="transform-col__label">Before</div>
            <ul>
              <li>Briefing creative from gut feeling</li>
              <li>Same 2–3 angles recycled every month</li>
              <li>Rising CPAs you can't explain</li>
              <li>Agencies that don't get your brand</li>
              <li>Competitors scaling and you can't see how</li>
              <li>Wearing every hat, including ad manager</li>
            </ul>
          </div>
          <div className="transform-col transform-col--after">
            <div className="transform-col__label">After</div>
            <ul>
              <li>Briefing creative from real customer language</li>
              <li>Fresh angles mined from thousands of reviews</li>
              <li>CPAs explained, diagnosed, and fixed</li>
              <li>A partner who understands skincare deeply</li>
              <li>Visibility into exactly what competitors do</li>
              <li>Back to the product and the mission you love</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 8: Built by */}
      <section className="section">
        <p className="section__eyebrow">Built by</p>
        <h2 className="section__title">A team that doesn't just manage ads. We understand <span className="highlight">why your brand exists.</span></h2>

        <div className="section__body">
          <p>Audr was built by Envision Digital, a performance marketing agency that works exclusively with DTC skincare and beauty brands. We've spent 7+ years inside these accounts. We've seen the same pattern hundreds of times: brilliant product, genuine mission, ads that don't do either of them justice.</p>
          <p>We built this calculator because we were tired of watching brands spend thousands on ads that say what the marketing team thinks customers want to hear — instead of what customers actually say.</p>
        </div>

        <div className="cred-block">
          <div className="cred-block__quote">
            "Every skincare founder I've worked with started the brand because of a deeply personal experience. That story is their most powerful ad asset — and almost none of them are using it properly."
          </div>
          <div className="cred-block__attr">Josh Lloyd, Founder — Envision Digital & Audr</div>
        </div>

        <div className="cred-stats">
          <div className="cred-stat">
            <div className="cred-stat__number">7+</div>
            <div className="cred-stat__label">Years in DTC skincare</div>
          </div>
          <div className="cred-stat">
            <div className="cred-stat__number">13k+</div>
            <div className="cred-stat__label">Customer reviews analysed</div>
          </div>
          <div className="cred-stat">
            <div className="cred-stat__number">100%</div>
            <div className="cred-stat__label">Proof before payment</div>
          </div>
          <div className="cred-stat">
            <div className="cred-stat__number">Free</div>
            <div className="cred-stat__label">Loom teardown included</div>
          </div>
        </div>
      </section>

      {/* Section 9: Where do you sit? */}
      <section className="section">
        <p className="section__eyebrow">Where do you sit?</p>
        <h2 className="section__title">Most skincare brands score <span className="highlight-red">55–75</span> on the fatigue scale. That's the danger zone.</h2>

        <div className="section__body">
          <p>A score of 55+ means your ad angles have narrowed, your refresh rate can't keep up with your spend, and Meta's algorithm is showing the same messages to an audience that's already tuned out. You're paying full price for half the impact.</p>
          <p>The brands scoring under 40? They're the ones eating your market share. Not because they spend more — because every brief comes from a different angle. And every angle comes from listening to their customers.</p>
        </div>

        <div className="risk-bar-wrap">
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '14px', textAlign: 'center' }}>Creative fatigue risk spectrum</p>
          <div className="risk-bar"></div>
          <div className="risk-bar__labels">
            <span>Low (0–25)</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Critical (75+)</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--faint)', marginTop: '12px', textAlign: 'center' }}>It takes 3 minutes to find out. Most people are surprised by the number.</p>
        </div>
      </section>

      {/* Section 10: FAQ */}
      <section className="section">
        <p className="section__eyebrow">Questions</p>
        <h2 className="section__title">Before you ask</h2>

        <div className="faq-list">
          <div className="faq-item">
            <div className="faq-item__q">Is this actually free?</div>
            <div className="faq-item__a">Yes, fully. The calculator, the Revenue Leak Report, and the personalised Loom teardown are all free. No credit card, no demo booking required. If the report is useful and you want to explore working together, that conversation happens on your terms. If not, the insights are yours to keep.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">How accurate is the revenue leak number?</div>
            <div className="faq-item__a">It's based on your actual spend, AOV, ROAS, and creative patterns — the same logic we apply to client accounts. It won't be perfect (a full audit is needed for exact figures), but it will be directionally honest. Most people find the number uncomfortable. That discomfort is useful.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">What exactly is in the Loom teardown?</div>
            <div className="faq-item__a">A personalised video walkthrough of your brand's Meta ad strategy. We analyse your live ads, your competitors' ads, and the gap between what your ads say and what your customers actually care about. It's the kind of analysis most agencies charge for. We give it away because the brands who see it understand why this approach works.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">Do you need access to my ad account?</div>
            <div className="faq-item__a">No. The calculator works from your answers. The Loom teardown uses publicly available data from the Meta Ad Library and our audience intelligence tools. No logins, no permissions, no access requests. You don't even need to tell us your brand name until the calculator asks.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">I've already tried working with agencies. Why is this different?</div>
            <div className="faq-item__a">Most agencies optimise your ad account. We start with your audience. We mine real customer reviews, surface the exact language people use to describe their skin and your products, and turn that into creative angles. That's the layer most agencies skip — and it's the reason your ads feel the same no matter who manages them.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">I'm not a skincare brand. Can I still use it?</div>
            <div className="faq-item__a">The calculator is calibrated specifically for DTC skincare and beauty brands. The frustrations and benchmarks are tuned to this vertical. If you're in a different space, the numbers won't be as precise — but the Loom teardown can still surface useful competitive insights. We're building versions for other verticals soon.</div>
          </div>
          <div className="faq-item">
            <div className="faq-item__q">Is this just a pitch for your services?</div>
            <div className="faq-item__a">No. The report and the teardown stand on their own. Plenty of brands take the insights and action them internally or with their existing agency. We built this because we believe proof should come before payment. If you see the report and think "I want help with this," we're here. If not, no follow-up pressure.</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <p className="section__eyebrow">Ready?</p>
        <h2 className="final-cta__title">Stop guessing. Start hearing what your customers are <span className="highlight">already telling you.</span></h2>
        <p className="final-cta__sub">3 minutes. Your numbers. A free Loom teardown that most agencies charge for. No strings.</p>
        <button className="cta-btn" onClick={onStart}>Find my revenue leak →</button>
        <div className="trust-zone" style={{ marginTop: '14px' }}>
          <p className="trust-line">Built for DTC skincare brands doing <span className="pill">£100k+/month</span></p>
          <p className="guarantee-line" style={{ marginTop: '6px' }}>You started this brand to help people. Let's make sure your ads do it justice.</p>
        </div>
      </section>
    </>
  )
}

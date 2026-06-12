# Calculator Audit Brief

**Context:** This is a distilled set of feedback from a team sync (10 Jun 2026) between Ahmad and Josh on the current calculator build. The calculator was built as a first draft using Claude Design without Fable 5 involvement. This brief is for Fable 5 to audit the current implementation against what was discussed, agreed, and flagged.

**What Fable 5 should do:** Read these as audit criteria. Check the current calculator against each point. Flag what's already handled, what's missing, and what needs reworking. Apply product psychology and UI taste — don't just check boxes.

---

## Josh's Direct Feedback on the Calculator

### 1. "Reframe from what they're spending to what they're making"
The calculator currently leads with spend. Josh wants it flipped: the emotional anchor should be opportunity, not waste. "Instead of saying what they're spending a month, I would reframe that to what they're making." The user should feel like they're discovering upside, not being told they're failing.

**Audit:** Does the current UI lead with a spend input and frame outputs as "waste"? If so, reframe. The primary output should feel like "here's what you could be making" — not "here's what you're losing."

### 2. "It's missing an emotional response"
Josh's sharpest critique. The calculator feels transactional — "give me your information so I can produce something indirectly." It should feel like a value exchange: "give me your information so I can better understand you and deliver something meaningful." The quiz-to-calculator flow needs to feel like the user is investing in their own outcome, not filling in a form.

**Audit:** Does the current UX create any moment of emotional engagement? Is there a beat where the user feels something — curiosity, recognition, surprise? If it's flat input → flat output, it needs an emotional arc. Consider: progressive reveal, a moment of tension before the number shows, or framing that mirrors the user's internal experience.

### 3. "The volume of answers is too thin"
Josh referenced Dan Priestley's Score App model: 10–12 questions minimum. The brain needs to feel that enough information has been gathered to produce credible output. If the quiz is too short, the output feels unearned and untrustworthy — even if the math is solid.

**Audit:** How many inputs does the current calculator take? If it's 3–5 sliders or fields, the output won't feel earned. The quiz (12 questions) should feed the calculator — the calculator isn't a standalone tool, it's the payoff after investment.

### 4. "We'd be guessing — and that's dangerous"
Josh flagged that the percentage logic (how much of spend is "wasted") is inherently speculative. Hard concern: someone puts in £11k spend and gets told 70% is waste. That's embarrassing and destroys trust. The formula needs guardrails so outputs never feel absurd.

**Audit:** Test the formula with edge cases:
- £10k spend / £50k revenue (5x ROAS, above benchmark) — does it still produce a meaningful but modest number?
- £10k spend / £200k revenue (20x ROAS, almost certainly wrong inputs) — does it cap or flag?
- £100k spend / £200k revenue (2x ROAS, underperforming) — does the number feel ambitious but not fantasy?
- £50k spend / £175k revenue (3.5x ROAS, healthy) — does it validate the user or accidentally insult them?

### 5. "Leave curiosity and mystery"
Josh doesn't want the calculator to tell the whole story. It should create a gap — enough insight to be valuable, not so much that there's nothing left to discuss on the call. The Loom teardown fills the gap. The calculator is the hook, not the meal.

**Audit:** Does the current output explain too much? Does it over-specify where the problems are? The ideal output is: a compelling number + enough directional context to feel real + a clear reason to want the deeper analysis. If the calculator output could replace the Loom, it's giving away too much.

### 6. "Simplify for founders who aren't in the ad account"
A founder might not know what an "angle" is. They definitely don't know how many are running. Questions like "what percentage of your ads are recycling angles" will get blank stares. Josh wants yes/no and multiple choice: "Do your ads keep leaning on one specific idea? Yes / Probably / No." That's something a founder can answer honestly.

**Audit:** Check every label, tooltip, and input description in the current calculator. Would a skincare brand founder who checks the ad account maybe once a month understand it? Jargon to kill: "angle diversification," "creative fatigue coefficient," "ROAS benchmark," "efficiency gap." Replace with felt language.

### 7. Multiple choice with a disqualifier
The frustrations question should be 10 options (pick up to 3) plus an 11th: "None of these — my ads are performing well." That 11th option is a complete disqualifier — drops them out. This prevents people who are just browsing from wasting time and polluting the lead pool.

**Audit:** Does the current quiz have a disqualifier exit? If someone selects "none of these," is there a graceful soft exit (email course offer, not a dead end)?

### 8. "Niche down — skincare brands, not D2C health brands"
The ICP label throughout the calculator must say "skincare brands." Not D2C, not health brands, not beauty broadly. "When someone's introducing themselves, they don't say 'I own a D2C healthcare brand in skincare.' They say 'I own a skincare brand.'" This also matters for Meta Andromeda indexing — the page content determines who sees the ad.

**Audit:** Search the current calculator for any instance of "D2C," "DTC," "health brand," or generic language. Replace with "skincare brand" or "skincare and beauty brand."

---

## Ahmad's Positions (Things I Pushed On)

### A. The calculator is a V1 — don't optimise for perfection
"This felt like a nice V1 to build on." The current build is a starting point. The 80% rule applies. But "not perfect" doesn't mean "not good" — the UI and the first impression matter because someone promising a million in revenue with a shoddy-looking tool undermines the whole pitch.

**For Fable 5:** The bar isn't perfection. It's "does this feel premium and credible enough that a founder spending £50k/month on ads takes it seriously?" If the answer is no, that's a design/taste problem, not a feature problem.

### B. Numbers should anchor fees
The calculator output should be inflated within reason — not to deceive, but to frame the service cost. "You have a leak of this amount — we optimise and increase revenue — we're paying for ourselves." If the monthly recoverable number is £8–25k and the service fee is £5k/month, the mental math works. If the number is £2k, the fee feels expensive.

**For Fable 5:** Check that the formula's output for the sweet spot ICP (£30–80k spend, 2–3.5x ROAS, low creative diversity) produces numbers that meaningfully exceed the £5k/month service fee. The outputs should feel like a catch, not a stretch.

### C. Immediate value delivery is the point
People need to get something the moment they complete the quiz. Even if it's small. "This gives them immediate value. It leaves an impression." The calculator output IS the first impression — if it feels generic or empty, the lead is lost regardless of what the Loom teardown delivers later.

**For Fable 5:** Does the current output feel personalised or generic? Can the user tell that their specific inputs shaped the result? If swapping all inputs produces roughly the same output, it will feel hollow. The delta between different input combinations needs to be visible and meaningful.

### D. Loom teardown must be visually prominent
The Loom CTA is the primary conversion mechanism. 31–35% close rate when a Loom is involved (cited from agency owner community data). The current design needs the Loom offer to dominate the post-calculator page — not be buried below paragraphs of explanation.

**For Fable 5:** On the results/report page, is the Loom CTA the most visually prominent element after the revenue number? Does the page hierarchy go: your number → what you'll get in the teardown → CTA → social proof? If the CTA is below the fold or competing with other elements, restructure.

### E. Design credibility matters
"If this person who's promising me amazing stuff — a million in 18 months — I feel design will come into it." The Sentry/Dean example: a conversion optimisation company with a bad website CTA is a credibility problem. The same logic applies here. The calculator/funnel is the first product experience. It is the proof of competence.

**For Fable 5:** This is your domain. Apply taste. The current build was made without your involvement. Does it look like something built by people who understand premium brand experiences? Does it feel like the kind of tool a £100k/month skincare brand founder would take seriously? If not, what's the gap — and how much effort to close it?

---

## What We Agreed On (Settled Decisions)

These are not suggestions. These are agreed between both parties. The audit should confirm these are implemented, not question whether they should be.

1. **Move revenue + spend qualifiers into the quiz.** Not on the landing page. The landing page is benefit-led, not gate-led.

2. **Meta pixel fires ONLY after Q2 (revenue) + Q3 (spend) with qualifying answers.** Not on page load. Not on calculator interaction. After qualification only. This trains Andromeda to optimise for similar qualified profiles.

3. **12 questions minimum.** Feeds the calculator, qualifies the lead, and creates the psychological investment needed for the output to feel earned.

4. **Multiple choice with set answers.** No free-text inputs for qualitative questions. Prevents garbage data and forces the user to self-identify.

5. **10 frustrations + 1 disqualifier.** "None of these" drops them out with a soft exit to email course.

6. **One funnel, no A/B split.** Merge calculator + quiz + email course into a single flow. Don't split traffic. (Fable's own advice.)

7. **Email unlock before report.** User must provide email to see calculator output. Email triggers 5-day course as bonus.

8. **Loom CTA + call booking in the same attention span.** Don't redirect to a separate page for booking. Inline calendar or modal on the same page as the calculator report.

9. **"No pitch unless you ask"** — this line must appear near the Loom CTA. It's the de-risk statement that converts people who wouldn't book a "sales call."

10. **80% quality, ship next week.** The audit is for catching gaps that matter, not for polishing to 100%.

---

## Industry Data for Formula Grounding

Use these if the calculator needs recalibration:

- Average ecommerce ROAS: 2.87x (2025, dropped 4% YoY)
- Skincare Meta CPMs: $14.20 Q4 2025 (+38% YoY)
- Skincare DTC gross margins: ~65% typical
- Beauty/skincare AOV: ~$68.50
- Purchase frequency: 2.7 orders/year
- Customer LTV: ~$185
- Brands shipping 8–12 net-new assets/month outperform those recycling 2–3 hero videos at the same spend
- Top 10% performers run 20+ creative tests monthly
- Email + SMS should drive 25–35% of total revenue for DTC skincare
- UGC drives 2.3x higher CTR than brand-produced content

---

*End of audit brief. Fable 5: read, assess the current build against these points, and flag what needs attention. Prioritise by impact on conversion and credibility, not effort.*

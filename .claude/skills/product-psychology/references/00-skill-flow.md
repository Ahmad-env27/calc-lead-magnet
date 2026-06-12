# Product Psychology — 12-Skill Connected Flow

> **Design principle:** Every skill has a defined input, output, and explicit handoff to the next node. The flow is a connected diagnostic system, not an isolated list. Skipping a skill is allowed but produces a gap warning.

## Table of Contents
1. [Skill 1: 6P Story](#skill-1)
2. [Skill 2: BMAP](#skill-2)
3. [Skill 3: NPV / Psych Framework](#skill-3)
4. [Skill 4: Block](#skill-4)
5. [Skill 5: Interpret](#skill-5)
6. [Skill 6: Act](#skill-6)
7. [Skill 7: Store](#skill-7)
8. [Skill 8: Journey Map](#skill-8)
9. [Skill 9: Journey Improve](#skill-9)
10. [Skill 10: Communicate](#skill-10)
11. [Skill 11: Ethics](#skill-11)
12. [Skill 12: Iterate](#skill-12)

---

<a id="skill-1"></a>
## Skill 1: Build the User's 6P Story

**Phase:** Empathize
**Answers:** "Who is this user, and what does their situation *feel* like — not just look like?"

**Input:** Raw user research (interviews, surveys, GEQ responses, support tickets, session recordings)
**Output:** A narrative portrait using the 6P structure: Person → Problem → Pursuit → Pitfall → Pivot → Payoff
**Handoff → Skill 2:** The 6P story provides the emotional context that BMAP needs to identify which motivation dyad is dominant

### The 6P Framework

| Element | Question | Constraint |
|---|---|---|
| **Person** | Who is this specific human? | One individual, not a segment |
| **Problem** | What's actually wrong in their life? | The felt problem, not the product problem |
| **Pursuit** | What are they trying to do about it? | Their words, not your feature name |
| **Pitfall** | What goes wrong when they try? | The failure that creates the opening for your product |
| **Pivot** | What changes when they encounter your solution? | The moment of shift — not the feature list |
| **Payoff** | What does their life look like after? | Emotional state, not metrics |

### Constraints
- One user, one story. Aggregated personas dilute the signal.
- The 6P is a narrative arc, not a form to fill. If it doesn't read like a story someone would care about, it's not done.
- The Singularity Effect is the engine: one person's story drives more empathy than a thousand data points.
- Use General Empathy Questions (GEQs) as the structured input method: "What do you hope to achieve?", "What's your biggest frustration?", "What stops you from solving this?"

### Connected principles
- Narrative Bias — humans process information as stories, not data
- Singularity Effect — one person > statistics for driving empathy
- Character Identification — reader must be able to project themselves into the person
- Pareidolia — humans see human patterns even in abstract data; leverage this
- Miller's Law — keep the story to 7±2 elements to prevent cognitive overload

---

<a id="skill-2"></a>
## Skill 2: Map the Behavior (BMAP)

**Phase:** Empathize
**Answers:** "Which behavioral variable is broken — motivation, ability, or prompt?"

**Input:** 6P Story (from Skill 1) + the specific behavior you want to trigger
**Output:** A BMAP position (quadrant A/B/C/D) + identification of the weakest variable
**Handoff → Skill 3:** The BMAP position tells NPV where to focus the scoring — if Ability is the bottleneck, friction costs will dominate the NPV ledger

### The Formula
**B = M × A × P** (Behavior = Motivation × Ability × Prompt)

This is conjunctive, not additive. All three must be present simultaneously. A brilliant prompt delivered to a user below the Activation Threshold does nothing.

### The Activation Threshold
On the BMAP graph (Motivation on Y-axis, Ability on X-axis), a curved trade-off line divides the space:
- **Above the line (Green Zone):** High M or high A compensates for the other. Prompts work here.
- **Below the line (Red Zone):** Neither M nor A is sufficient. No prompt will trigger the behavior.

### The Four Diagnostic Zones
| Zone | Motivation | Ability | Diagnosis |
|---|---|---|---|
| **A** | High | High | Ideal. Prompt triggers behavior reliably. |
| **B** | High | Low | User wants to but can't. Reduce friction. |
| **C** | Low | High | User could but won't. Increase motivation. |
| **D** | Low | Low | Fundamental problem. Reconsider the ask entirely. |

### Motivation Levers — Three Dyads (BJ Fogg)
| Dyad | Lever | Example |
|---|---|---|
| **Sensation** | Pleasure ↔ Pain | Uber Eats notification at lunchtime activates hunger-pain |
| **Anticipation** | Hope ↔ Fear | Fitness app showing projected results activates hope |
| **Social** | Acceptance ↔ Rejection | Social proof ("12,000 people joined today") activates acceptance |

### Five Ability Resource Constraints
Ability is limited by the scarcest of these five resources. Like a chain, it breaks at the weakest link:
1. **Time** — How long does it take?
2. **Money** — How much does it cost?
3. **Physical Effort** — How hard is the physical action?
4. **Mental Capacity** — How much thinking is required?
5. **Social Deviation** — Does this feel weird or outside social norms?

### Connected principles
- Power of Defaults — removes Mental Capacity cost of starting
- Breaking the Script / Bizarreness Effect — activates Sensation/Pleasure lever
- Banner Blindness — blocks the Prompt before deliberate evaluation can occur

---

<a id="skill-3"></a>
## Skill 3: Score the Psych Budget (NPV)

**Phase:** Empathize
**Answers:** "Where is the user's psychological budget going negative?"

**Input:** BMAP position (from Skill 2) + the specific flow/experience to score
**Output:** A scored Psych Ledger showing NPV at each touchpoint — where the user goes into "psychological debt"
**Handoff → Skill 4:** The Psych Ledger tells the B.I.A.S. audit (Skills 4–7) exactly which touchpoints to investigate first — start with the deepest negative scores

### The Formula
**NPV = Motivation − Friction** (at each touchpoint)

Psych is a finite cognitive resource. Every interaction either deposits into or withdraws from the user's psychological budget. When the running balance goes negative, the user leaves.

### Scoring Tables

**Positive Psych Variations (Deposits)**
| Score | Trigger | Example |
|---|---|---|
| +5 | Exceeds expectations dramatically | Unexpected free upgrade |
| +4 | Solves a feared problem proactively | "Your data is backed up automatically" |
| +3 | Confirms a hope | Progress indicator showing 80% complete |
| +2 | Reduces anticipated effort | Pre-filled form fields |
| +1 | Meets basic expectations | Page loads quickly |

**Negative Psych Variations (Withdrawals)**
| Score | Trigger | Example |
|---|---|---|
| -1 | Minor friction | Extra click to reach desired content |
| -2 | Unmet expectation | Feature works differently than expected |
| -3 | Anxiety or confusion | Unclear pricing, hidden fees |
| -4 | Wasted effort | Form data lost on back-navigation |
| -5 | Betrayal of trust | Spam after email signup |

### Key Nuances
- **Asymmetry:** Motivation and Ability are not equal levers. Reducing friction (removing -3) is often more impactful than adding motivation (+3) because negative experiences carry more psychological weight than positive ones.
- **Good friction exists:** Some friction increases commitment (IKEA Effect), provides reassurance (Labor Illusion), or filters for quality users. Don't reflexively remove all friction.
- **Context-dependent starting Psych:** A referred user starts at +2 (trust from referrer). A user who just had a bad experience with a competitor starts at -2 (transferred frustration). Map the starting point before scoring.
- **Micro-experience compounding:** Individually small frictions (-1 each) compound into abandonment when they accumulate without any deposit.

### Connected principles
- Loss Aversion — negative scores feel ~2x worse than equivalent positive scores feel good
- Sunk Cost — users who've already invested (positive balance) tolerate more friction
- Endowment Effect — once users feel ownership, their starting Psych shifts upward

---

<a id="skill-4"></a>
## Skill 4: Audit Block (Can They See It?)

**Phase:** Diagnose (B.I.A.S. — Block)
**Answers:** "Is the message even reaching the brain?"

**Input:** Psych Ledger (from Skill 3) — focus on the lowest-scoring touchpoints
**Output:** A list of Block failures with specific elements identified + fix directions
**Handoff → Skill 5:** Once Block failures are resolved (user can physically see and process the element), move to Interpret (can they understand it?)

### Three Cognitive Filters (what blocks information)

**1. Hick's Law**
Decision time increases logarithmically with the number of choices. More options → slower decisions → higher abandonment. The diagnostic metric is DPP (Decisions Per Page): above 3–4 is a red flag.

**2. Selective Attention**
The brain filters out information that doesn't match current goals. Elements outside the user's task-focus become invisible regardless of visual prominence. The gorilla experiment: 50% of participants miss a gorilla walking through a basketball game because they're counting passes.

**3. Banner/Edge Blindness**
Users learn to ignore content in positions associated with ads (top banners, right rails, bottom bars) and content at the edges of their scan path. Critical CTAs placed in these zones may as well not exist.

### Three Attention Breakers (what gets through)

**1. Priming**
Prior exposure to a stimulus influences response to subsequent stimuli. If you mention "speed" three times before showing a loading screen, the user is primed to notice (and judge) load time. Use deliberately.

**2. Baader-Meinhof Effect (Frequency Illusion)**
Once users notice something, they see it everywhere. A user who just learned about a feature will suddenly notice all references to it. Use to reinforce new concepts across the experience.

**3. Pattern Breaks & Personalization**
The brain's novelty detector fires when something violates an expected pattern. Personalized elements ("Hi Sarah" in a sea of generic text) break patterns and recapture attention. But novelty habituates — the same pattern break used twice stops working.

---

<a id="skill-5"></a>
## Skill 5: Audit Interpret (Do They Understand It?)

**Phase:** Diagnose (B.I.A.S. — Interpret)
**Answers:** "Is the user understanding what we intend them to understand?"

**Input:** Block audit results (from Skill 4) — elements the user *can* see but may misread
**Output:** A list of Interpret failures with specific misinterpretation risks + reframed alternatives
**Handoff → Skill 6:** Once Interpret is resolved (user understands the value correctly), move to Act (can they do the thing?)

### Seven Interpret Principles

**1. Familiarity (Jakob's Law)**
Users spend most of their time on *other* products. They expect yours to work the same way. Novel UI patterns carry a learning cost that must be justified by significant benefit.

**2. Cognitive Load**
Every piece of information on screen competes for processing. Reduce load by: chunking related items, using progressive disclosure, establishing visual hierarchy, removing decorative elements that don't convey information.

**3. Clear Benefits (not features)**
Users don't care what a feature *does*. They care what it does *for them*. "512GB SSD" is a feature. "Store 100,000 photos without slowing down" is a benefit. Every piece of copy should pass the "So what?" test.

**4. Anchoring**
The first number or reference point a user sees sets their expectation for everything that follows. "$720 of extras" only works as an anchor when connected to the user's goal. Anchoring without context is just a number.

**5. Loss Aversion**
Losses feel approximately twice as bad as equivalent gains feel good. "Don't lose your progress" hits harder than "Keep your progress." But timing matters: loss framing is most effective at high investment. At low investment, it feels like nagging. Use convenience framing early, loss framing late.

**6. Discoverability**
If users don't know a feature exists, it doesn't exist for them. Key actions must be visible in the primary scan path, not buried in menus or behind hover states. The most common UI failure: teams build a powerful feature and hide it behind three clicks.

**7. Labor Illusion**
When a system does significant work, showing that work in progress (even theatrically) increases perceived value. A search that returns instantly feels less valuable than one that shows "Analyzing 10,000 options..." for two seconds. Use when computational output might feel "too easy."

### Named Technique: The 2-Step Commitment Pattern
Surfaces a small, easy request first (email for a free resource), then follows with the larger ask (paid subscription) after the user has invested. Works because Commitment and Consistency makes the second step feel aligned with identity: "I'm already someone who uses this."

---

<a id="skill-6"></a>
## Skill 6: Audit Act (Can They Do It?)

**Phase:** Diagnose (B.I.A.S. — Act)
**Answers:** "Can the user do the thing easily enough?"

**Input:** Interpret audit results (from Skill 5) — elements the user understands but may struggle to act on
**Output:** A list of Act failures with specific friction points + simplification directions
**Handoff → Skill 7:** Once Act is resolved (user can complete the action), move to Store (will they remember and return?)

### Two Strategies
1. **Reduce friction** — make the existing action easier (always try this first)
2. **Apply nudges** — add psychological leverage to encourage the action (only after friction is minimized)

The Upstream Principle applies here: nudging a user toward an action they don't understand (Interpret failure) or can't see (Block failure) is wasted effort.

### Core Act Principles

**Hick's Law (applied)**
Reduce choices per decision. The ideal: one primary CTA per screen, with secondary options visually subordinated. DPP > 4 is almost always fixable.

**Valid Defaults**
Pre-select the option most users would choose. This removes the Mental Capacity cost of deciding. But defaults carry ethical weight: a default that benefits the company at the user's expense is a dark pattern. The test: would 80% of informed users choose this option?

**Cognitive Load & Miller's Law**
7±2 items is the working memory limit. Chunk information into groups. Use progressive disclosure: show only what's needed for the current step, reveal complexity as the user advances.

**Commitment and Consistency (Cialdini)**
Once a user takes a small step (creates an account, fills out a form), they're more likely to take the next step to remain consistent with their self-image as "someone who uses this product."

**Progressive Disclosure**
Don't front-load complexity. Show the minimum viable interface first. Let users request depth when they need it. This is Hick's Law applied across time, not just space.

**Social Proof**
"12,847 therapists use this" is more persuasive than "Trusted by thousands." Specificity signals authenticity. But social proof must be verifiable — fake numbers destroy trust faster than real numbers build it.

**Curiosity Gap**
"We found 3 issues with your profile" is more engaging than "Optimize your profile." The gap between what the user knows and what they want to know drives clicks. But overuse (clickbait) destroys trust.

**Scarcity**
"Only 2 spots left" creates urgency. Real scarcity is powerful. Manufactured scarcity is manipulation. The test: is this actually scarce, or are we lying?

**Reactance**
When users feel their freedom is threatened, they do the opposite of what you want. "You MUST complete this step" triggers reactance. "Skip this for now →" provides an escape hatch that paradoxically increases completion.

### Diagnostic Tool: DPP (Decisions Per Page)
Count every decision a user must make on a single screen. Include: button clicks, form fields, menu selections, toggle choices, reading decisions ("should I read this?"). A DPP above 3–4 means the page is asking the user to do too much at once.

---

<a id="skill-7"></a>
## Skill 7: Audit Store (Will They Come Back?)

**Phase:** Diagnose (B.I.A.S. — Store)
**Answers:** "What psychological residue does this experience leave? Will the user return?"

**Input:** Act audit results (from Skill 6) — the completed action and its immediate aftermath
**Output:** A Store quality assessment identifying what the user will remember, what they'll forget, and what needs amplification
**Handoff → Skill 8:** The Store audit feeds into Journey Mapping because peaks, pits, and endpoints ARE the stored memories

### Four Positive Psychological Storers (priority order)

**1. Clear Feedback**
The user must know: did it work? Clear, immediate confirmation reduces anxiety and deposits positive Psych. "Your order is confirmed" with a confirmation number is a storer. A page that just refreshes is a missed storer.

**2. Reassurance**
Proactively address the anxiety that follows a commitment. "You can cancel anytime" after a signup. "We'll email you a receipt" after a purchase. Reassurance costs nothing to provide and prevents the "did I just make a mistake?" withdrawal.

**3. Feeling of Caring**
Small, unexpected gestures that signal "we thought about you specifically." Birthday emails that aren't discount codes. Error messages that apologize and offer a specific fix. These register as System 1 storers — they bypass deliberate evaluation and go straight to emotional memory.

**4. Delighters (Kano Model)**
Features the user didn't expect that create disproportionate positive response. A status bar that shows a tiny animation at 100%. A thank-you page that includes a personalized recommendation. Delighters have diminishing returns: once expected, they become baseline (the Kano decay curve).

### The Kano Model for Feature Classification
| Category | Absent | Present | Over time |
|---|---|---|---|
| **Must-haves** | Angry | Neutral | Stay neutral |
| **Performance** | Dissatisfied | Satisfied proportionally | Stable |
| **Delighters** | Neutral | Disproportionately happy | Decay to expected |

The strategic insight: invest in delighters to create memorable peaks, but never at the expense of must-haves. A delightful loading animation means nothing if the page crashes.

### Anti-storers (negative residue)
- **Banner Blindness (habituated):** Repeated exposure to the same positive signal makes it invisible. Rotate delighters.
- **Peak-End violations:** A great experience with a terrible ending (unclear cancellation, confusing confirmation) overwrites everything good.
- **Manipulation regret:** Users who realize they were tricked (fake scarcity, dark patterns) store deep negative residue and share it.

---

<a id="skill-8"></a>
## Skill 8: Map the Customer Journey

**Phase:** Redesign
**Answers:** "Where are the emotional highs and lows across the full experience?"

**Input:** Store audit (from Skill 7) + the full user journey from first touch to retention
**Output:** A journey map plotting Psych Level at 5–6 emotionally pivotal moments, with elements typed as Peak, Pit, Jump, Drop, or Transition
**Handoff → Skill 9:** The map tells Skill 9 exactly where to invest improvement effort

### The Framework
Plot **Psych Level** (Y-axis) over the **Customer Journey** (X-axis). Identify exactly 5–6 emotionally pivotal moments. Not every touchpoint — only the ones that move the needle.

### Five Element Types
| Element | Description | Example |
|---|---|---|
| **Peak** | Highest emotional positive | The "aha" moment when a feature clicks |
| **Pit** | Lowest emotional negative | The frustration of a failed action |
| **Jump** | Sharp positive increase | Unexpected delight, a solved problem |
| **Drop** | Sharp negative decrease | Surprising friction, broken expectation |
| **Transition** | Gradual shift between states | Onboarding ramp from confusion to confidence |

### Three Categories
| Category | Contains | Focus |
|---|---|---|
| **High-impact moments** | Peaks and Pits | These are what users remember (Peak-End Rule) |
| **Momentum shifts** | Jumps and Drops | These change the trajectory of the experience |
| **Connective tissue** | Transitions | These are where most friction hides unnoticed |

### Build Sequence
1. List all touchpoints chronologically
2. Score each on Psych Level (-5 to +5)
3. Identify the 5–6 that matter most (Miller's Law constraint)
4. Type each as Peak/Pit/Jump/Drop/Transition
5. Connect them on the graph
6. Identify: Where is the biggest pit? Where is the peak? How does it end?

### The Postal Clerk Analogy (diagnostic heuristic)
Think of each touchpoint as a counter at a post office. The user is standing in line. At each counter, someone either helps them efficiently (Jump) or makes them fill out another form (Drop). The user's patience is finite. If they hit three consecutive "fill out another form" counters, they leave the building — even if the next counter would have solved everything.

### Connected principles
- Peak-End Rule — users judge the whole experience by the most intense moment and the final moment
- Miller's Law — 5–6 elements is the cognitive maximum for a useful map
- Zeigarnik Effect — incomplete sequences create psychological tension that can be leveraged (open loops) or must be resolved (exit points)

---

<a id="skill-9"></a>
## Skill 9: Improve the Journey

**Phase:** Redesign
**Answers:** "What's the highest-leverage change to the experience sequence?"

**Input:** Journey Map (from Skill 8) — the 5–6 plotted moments with their types
**Output:** A prioritized list of journey changes with expected Psych Level impact
**Handoff → Skill 10:** The improvement recommendations need to be communicated to stakeholders; Skill 10 provides the playbook

### Three Improvement Targets
1. **Fix pits** — eliminate or reduce the most negative moments (highest ROI)
2. **Amplify peaks** — make the best moments even better (create memorability)
3. **Smooth transitions** — reduce friction in the connective tissue (prevent compound fatigue)

### Primary Method: Reorder / Shorten
Before adding anything new, ask: can we fix this by changing the order or removing steps?

The ActiveCampaign case is canonical: users sending their first email campaign had to configure settings (pit) before seeing success (peak). Reordering to show a quick-win first (peak) before asking for configuration (pit, now tolerable) transformed the experience — same features, different sequence, dramatically different outcome.

### Key principles for improvement
- **Hyperbolic Discounting:** Users disproportionately value immediate rewards over future rewards. Front-load the peak. A benefit experienced now is worth more than a bigger benefit experienced later.
- **Pareto Principle:** 80% of the emotional impact comes from 20% of the touchpoints. Find and fix those 20%.
- **Labor Illusion:** When the user has done work, show them the result of that work immediately. Don't defer the payoff.

### The reorder decision matrix
| Current sequence | Problem | Fix |
|---|---|---|
| Pit → Peak | User might quit before reaching the peak | Swap: Peak → Pit |
| Pit → Pit | Compound negative — high abandonment risk | Insert a jump between them |
| Peak → Drop | "Bait and switch" feeling | Smooth the transition or remove the drop |
| Long Transition → Peak | User fatigues before the payoff | Shorten the transition or add a micro-peak |

---

<a id="skill-10"></a>
## Skill 10: Communicate Product Decisions

**Phase:** Communicate
**Answers:** "How do I get this design approved without losing the intent?"

**Input:** Journey improvement recommendations (from Skill 9) + organizational context (who needs to approve, what do they value?)
**Output:** A communication strategy with framed arguments, anticipated objections, and stakeholder-specific messaging
**Handoff → Skill 11:** Before shipping, apply ethics checks (Skill 11)

### Core Thesis
The same psychological toolkit used to understand users (B.I.A.S., BMAP, empathy mapping) applies to understanding stakeholders. A design that's technically superior but poorly communicated dies in the meeting room.

### Named Technique: B.I.A.S. for Relationships
Apply the four B.I.A.S. phases to your stakeholder:
1. **Block:** What information is the stakeholder not seeing? (Their data, their constraints)
2. **Interpret:** How will they read your proposal? (Through their KPIs, their fears)
3. **Act:** What's the smallest action you can get them to take? (Review, not approve)
4. **Store:** What will they remember from this meeting? (One key insight, not twelve slides)

### Named Technique: Turn "Likes" into "Works"
When a stakeholder says "I don't like the blue," don't defend the blue. Ask: "What about the blue isn't working for the goal of this page?" This shifts from subjective preference (unarguable) to objective effectiveness (resolvable).

### Named Technique: 3-Step Feedback Formula
1. **Acknowledge** — show you heard the concern ("I see why the spacing feels off")
2. **Explain the reasoning** — connect to the user's need ("We used that spacing because users were missing the CTA at tighter spacing")
3. **Offer a bounded alternative** — give them a choice that doesn't break the design ("We could try X or Y — both keep the CTA visible")

### The HiPPO Problem
The Highest-Paid Person's Opinion often overrides research-backed design. Counter with:
- **Data framing:** "In our testing, this version converted 23% higher" beats "I think this is better"
- **User voice:** "Here's what three users said when they saw this" beats "Users will probably..."
- **Risk reframing:** "The risk of not changing is [specific metric impact]" beats "We should change this"

### Five Communication Pitfalls
| Pitfall | Symptom | Remedy |
|---|---|---|
| Presenting without framing | Meeting starts with "Here's what we did" | Start with the problem you're solving |
| Defending instead of exploring | "No, that won't work because..." | "Help me understand the concern behind that" |
| Too many options | "Here are 8 variations" | "Here are 2, here's why, here's my recommendation" |
| Missing the stakeholder's real concern | Design feedback about colors when the real worry is timeline | Ask: "What would make you comfortable shipping this?" |
| Treating approval as binary | "Do you approve this?" (invites "no") | "Which of these two directions should we pursue?" |

### Difficult-person archetypes
| Archetype | Signal | Script |
|---|---|---|
| **The Redesigner** | "What if we moved everything around?" | "I want to make sure we're solving the same problem. What's the user outcome you're optimizing for?" |
| **The Feature Requester** | "Can we add X, Y, and Z?" | "All valid ideas. Let me show you where each fits on the user priority map so we can sequence them." |
| **The Skeptic** | "This doesn't feel right" | "I'd love to understand what feels off. Is it the direction, the execution, or something about the data?" |

---

<a id="skill-11"></a>
## Skill 11: Ethics Check

**Phase:** Validate
**Answers:** "Is this design helping the user or exploiting them?"

**Input:** The redesigned experience (from Skills 8–9) + any nudges or persuasion patterns used
**Output:** An ethics assessment with pass/fail on three tests + a Manipulation Matrix position + recommendations
**Handoff → Skill 12:** Ethical issues must be resolved before iterating — they compound if ignored

### The Keystone: Second-Order Effects
Every principle in this skill system can be used for the user or against them. The difference is not the technique — it's the second-order effect. Loss aversion can protect users from genuine loss or manufacture fake urgency. Social proof can inform or create conformity pressure. The ethical question is never "did we use a technique?" — it's "what happens to the user after they experience it?"

### Three Diagnostic Tests

**1. The Regret Test**
"If the user fully understood what's happening, would they still make this choice?"
- If yes → ethical design. The technique is aligned with the user's genuine interest.
- If no → manipulation. The technique exploits an information asymmetry.

**2. The Manipulation Matrix (Nir Eyal)**
| | User benefits | User doesn't benefit |
|---|---|---|
| **Maker uses own product** | **Facilitator** (ethical) | **Dealer** (addictive) |
| **Maker doesn't use own product** | **Entertainer** (neutral) | **Exploiter** (unethical) |

The goal is the Facilitator quadrant: you use the product yourself, and it genuinely helps the user. If you wouldn't use your own product, that's a signal.

**3. The Black Mirror Test**
"If this design were scaled to a billion users over ten years, what breaks?"
This is the long-horizon stress test. A notification that's helpful for one user becomes a societal attention drain at scale. A default opt-in that's reasonable for one form becomes a mass consent violation at scale.

### Three Humane Design Principles
1. **Save the user's time** — every interaction should be shorter than the user expects, not longer
2. **Value their attention** — never take more attention than the task requires
3. **Reflect human values** — the design should make users feel more human, not more like a product

### Named Technique: The Humane Notification Reset
Audit every notification your product sends. For each one, ask: (1) Does the user need this? (2) Does the user want this? (3) Does this serve the user or our engagement metric? If the answer to #3 is "our metric," cut it.

### Ethics as long-horizon NPV
Ethics and the NPV framework (Skill 3) are not separate systems. Ethics is NPV extended across time and population:
- **Short-horizon NPV:** Does this touchpoint help or hurt *this user right now*?
- **Long-horizon NPV:** Does this pattern help or hurt *all users over years*?

A dark pattern might generate short-horizon positive NPV (user converts!) but deep long-horizon negative NPV (user churns, warns others, regulatory action).

---

<a id="skill-12"></a>
## Skill 12: Iterate (Did It Work?)

**Phase:** Validate
**Answers:** "Did the fix actually work, and did we fix the right thing?"

**Input:** The shipped change + metrics from the change
**Output:** A sequencing validation — was the fix applied at the right level of the B.I.A.S. hierarchy? Is the metric movement real?
**Handoff → Skill 1:** Loop back. New data from the change feeds new empathy research. The cycle is continuous.

### The Sequencing Rule (revisited)
After every change, check: did we fix the right B.I.A.S. phase?

| If you fixed... | But the real problem was... | You'll see... |
|---|---|---|
| Act (button size) | Block (user can't see it) | No change in conversion |
| Interpret (copy clarity) | Act (too many choices) | Higher comprehension, same abandonment |
| Store (confirmation email) | Interpret (confusing pricing) | Better post-purchase sentiment, same conversion |

### The V0 → V3 Pattern
The canonical improvement arc from iterative case studies:
- **V0:** Baseline. Known problems but no systematic diagnosis.
- **V1:** First fix. Usually targets the most obvious problem. Conversion improves.
- **V2:** Second fix. Often causes a *dip* because fixing Block reveals hidden Interpret problems. **This dip is expected and healthy.**
- **V3:** Third fix. Targets the newly-visible problem. Real breakthrough.

Teams that panic at V2 and revert lose the diagnostic signal. The V2 dip is the cost of seeing clearly.

### Iteration checklist
1. What B.I.A.S. phase did the change target?
2. Did the intended metric move? By how much?
3. Did any adjacent metric move unexpectedly? (Positive or negative)
4. Run the Sequencing Rule: was there an upstream failure we skipped?
5. If the metric didn't move, was the fix at the wrong level?
6. What new data does this result give us for the next cycle's empathy research?
7. Has the Kano classification shifted? (Were delighters absorbed into expectations?)

### Source Map
| Skill | Primary Source | Supporting Sources |
|---|---|---|
| Skill 1: 6P Story | M1L1 — Stories | Cheatsheet: User Empathy |
| Skill 2: BMAP | M1L2 — Behavioral Maps | Cheatsheet: User Empathy, Checklist Phase 1 |
| Skill 3: NPV | M1L3 — Psych Framework | Checklist Phase 2 |
| Skill 4: Block | M2L2 — Block | Cheatsheet: B.I.A.S., 106 Principles (Information) |
| Skill 5: Interpret | M2L3 — Interpret | 106 Principles (Meaning) |
| Skill 6: Act | M2L4 — Act | Checklist Phase 3 |
| Skill 7: Store | M2L5 — Store | 106 Principles (Memory), Checklist Phase 4 |
| Skill 8: Journey Map | M3L1 — Map Customer Journey | Cheatsheet: User Journeys, M2L6 |
| Skill 9: Journey Improve | M3L2 — Improving Journey | M1L3, M2L6, 106 Principles (Time) |
| Skill 10: Communicate | M4L1 — Communicate Decisions | Cheatsheet: Communicate, Checklist Phase 5 |
| Skill 11: Ethics | M5L1 — Ethics & Humane Design | Cheatsheet: Ethics |
| Skill 12: Iterate | M2L6 — BIAS Recap | M1L2 (V0–V3 pattern) |

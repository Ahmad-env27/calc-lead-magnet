# Psychological Principles Encyclopedia

Deep explanations of every principle used across the skill system. Organized by B.I.A.S. phase + special categories.

## Table of Contents
- [Block Principles](#block-principles)
- [Interpret Principles](#interpret-principles)
- [Act Principles](#act-principles)
- [Store Principles](#store-principles)
- [Empathy Principles](#empathy-principles)
- [Journey Principles](#journey-principles)
- [Ethics Principles](#ethics-principles)
- [Cross-cutting Principles](#cross-cutting)

---

<a id="block-principles"></a>
## Block Principles

### Hick's Law
**Mechanism:** Decision time = a + b × log₂(n), where n = number of equally probable choices.
**In practice:** More options → longer decisions → higher abandonment. Not just about fewer buttons — about fewer *decisions*. A page with one button but three paragraphs of conflicting information still violates Hick's Law because the user must decide which information to trust.
**Diagnostic:** Count DPP. If above 3–4, reduce.

### Selective Attention
**Mechanism:** The brain filters incoming information based on current goals. Information that doesn't match the active task is literally not perceived — not ignored, not processed.
**In practice:** A user focused on "find the checkout button" will not see a banner about a new feature, no matter how visually prominent. Design for the user's current task, not your marketing priority.
**Diagnostic:** Ask: "What is the user's primary task on this screen?" If your most important element doesn't serve that task, it's invisible.

### Banner Blindness / Edge Blindness
**Mechanism:** Learned pattern recognition causes users to skip content in positions historically associated with ads or irrelevant information: top banners, right rails, bottom bars, pop-up-shaped containers.
**In practice:** Placing critical CTAs in banner-position elements guarantees low interaction. Even non-ad content in these positions gets filtered.
**Diagnostic:** Is your critical element in a position the user has learned to ignore?

### Priming
**Mechanism:** Exposure to stimulus A influences the response to subsequent stimulus B. The effect is subconscious and automatic.
**In practice:** If the three screens before a pricing page all mention "value" and "investment," the user is primed to evaluate price through a value lens. If they all mention "cost" and "budget," the same price feels more expensive.
**Diagnostic:** What are the last 3 things the user saw before this screen? Are they priming for or against your goal?

### Baader-Meinhof Effect (Frequency Illusion)
**Mechanism:** After first noticing something, the brain flags subsequent encounters, creating a feeling that it's suddenly everywhere.
**In practice:** A user who just learned about a feature will notice every reference to it across the product. Use this to reinforce new concepts by distributing subtle references.
**Diagnostic:** After introducing a concept, do you reference it again within 2–3 subsequent interactions?

### Pattern Breaks
**Mechanism:** The brain's novelty detector fires when expected patterns are violated, recapturing automatic attention.
**In practice:** Personalization ("Hi Sarah"), unexpected formatting, unusual interactions all break patterns and recapture attention. But novelty habituates — the same break used repeatedly becomes the new pattern.
**Diagnostic:** Where has the user's attention become habituated? What single break would recapture it?

---

<a id="interpret-principles"></a>
## Interpret Principles

### Familiarity / Jakob's Law
**Mechanism:** Users transfer expectations from other products. Novel patterns carry learning costs.
**In practice:** Users spend 90% of their time on other sites. Your navigation, form patterns, and interaction models should match conventions unless you have an overwhelming reason to deviate. Every deviation must earn its learning cost.

### Cognitive Load
**Mechanism:** Working memory has finite capacity. Every element on screen competes for processing resources.
**In practice:** Reduce by chunking (group related items), visual hierarchy (make the important thing obvious), and removal (cut anything that doesn't serve the current task). Progressive disclosure is cognitive load management applied across time.

### Clear Benefits Framing
**Mechanism:** Users process "what this does for me" faster than "what this is." Benefits are user-centered; features are product-centered.
**In practice:** "512GB SSD" → "Store 100,000 photos." "Real-time sync" → "Changes appear on all your devices instantly." Every piece of copy should survive the "So what?" test.
**Diagnostic:** Read every piece of copy. After each one, ask "So what?" If you can't answer from the user's perspective, rewrite.

### Anchoring
**Mechanism:** The first number or reference point sets expectations for all subsequent evaluations. Once set, adjustments from the anchor are insufficient (anchoring bias).
**In practice:** "$720 of extras" is only powerful when connected to the user's goal. "$720 of extras that help clients find you" is stronger than "$720 of extras including SEO, domain, and email." The anchor must be contextually meaningful, not just large.

### Loss Aversion
**Mechanism:** Losses feel approximately 2× worse than equivalent gains feel good (Kahneman & Tversky).
**In practice:** "Don't lose your progress" is stronger than "Keep your progress." BUT: loss framing is most effective at high investment. A user who has invested 30 seconds doesn't feel loss — they feel nagged. A user who has invested 20 minutes feels genuine loss. Match frame intensity to investment level.
**Escalation pattern:** Low investment → convenience framing ("Pick up anywhere"). Medium investment → soft loss framing ("Your changes are waiting"). High investment → direct loss framing ("Don't lose your work").

### Discoverability
**Mechanism:** If users don't know a feature exists, it doesn't exist for them. Hidden features have zero usage regardless of quality.
**In practice:** Key actions must be in the primary scan path. The most common failure: building a powerful feature and burying it behind three clicks. Every "hidden gem" is an engineering investment with zero return.

### Labor Illusion
**Mechanism:** When users see the system working (even theatrically), they assign higher value to the output. Instant results feel cheap; visible effort feels valuable.
**In practice:** A search that shows "Analyzing 10,000 options..." for 2 seconds before returning results feels more thorough than an instant return. Use when computational output might feel "too easy." Counterexample: don't add fake delay to a page load — that's just friction.

---

<a id="act-principles"></a>
## Act Principles

### Valid Defaults (Power of Defaults)
**Mechanism:** Users disproportionately accept pre-selected options. Defaults remove the decision cost entirely.
**Ethics test:** Would 80% of informed users choose this default? If yes → helpful reduction of friction. If no → dark pattern.

### Progressive Disclosure
**Mechanism:** Hick's Law applied across time. Show minimum viable interface first, reveal complexity progressively as the user needs it.
**In practice:** A form with 20 fields shown all at once has a DPP of 20. The same form broken into 4 steps of 5 fields has a DPP of 5 at each step. Same total effort, dramatically different perceived effort.

### Commitment and Consistency (Cialdini)
**Mechanism:** Once a person takes a small action consistent with an identity, they're more likely to take larger actions consistent with that identity. "I signed up" → "I'm someone who uses this" → "I should complete my profile."
**In practice:** The 2-Step Commitment Pattern leverages this: small ask first (email for a resource), larger ask second (subscription after engagement).

### Social Proof
**Mechanism:** Uncertainty drives people to look at what others are doing. Specific numbers signal authenticity. Vague claims ("thousands") signal marketing.
**In practice:** "12,847 therapists use this" > "Trusted by thousands" > "Popular choice." But social proof must be verifiable — fake numbers destroy trust faster than real numbers build it. Named testimonials > anonymous quotes > number-only claims.

### Curiosity Gap
**Mechanism:** The gap between what the user knows and what they want to know drives engagement. "We found 3 issues" is more engaging than "Optimize your profile" because it opens a specific, bounded gap.
**Ethics:** Curiosity gaps that deliver on their promise are engagement. Curiosity gaps that don't are clickbait.

### Scarcity
**Mechanism:** Perceived limited availability increases perceived value. Deadlines ("offer ends Friday"), quantities ("only 2 left"), and exclusivity ("invite only") all trigger scarcity.
**Ethics test:** Is this actually scarce? Real scarcity → powerful and ethical. Manufactured scarcity → manipulation.

### Reactance
**Mechanism:** When people feel their freedom to choose is being restricted, they desire the restricted option more. Mandatory steps, aggressive modals, and "you must" language trigger reactance.
**In practice:** "Skip this for now →" as an escape hatch paradoxically increases completion because it preserves the feeling of autonomy.

---

<a id="store-principles"></a>
## Store Principles

### Peak-End Rule
**Mechanism:** Users judge an experience based on two moments: the most intense (peak or pit) and the final moment. Everything in between fades from memory.
**In practice:** A 10-step experience with one brilliant moment and a smooth ending is remembered more positively than a uniformly good 10-step experience. Design for the peak and the end.

### Kano Decay
**Mechanism:** Delighters decay into expected features over time. What surprised and delighted users last year is baseline this year. The Kano curve slides left.
**In practice:** Continuous investment in new delighters is required. The iterate loop (Skill 12) must include refreshing the Store layer, not just fixing Block/Interpret/Act.

### Banner Blindness (as anti-storer)
**Mechanism:** In the Store context, this means repeated positive signals become invisible. The same "great job!" toast after every action stops registering.
**In practice:** Rotate delighters. Vary positive feedback patterns. If you show the same animation at 100% completion every time, it becomes wallpaper.

---

<a id="empathy-principles"></a>
## Empathy Principles

### Narrative Bias
**Mechanism:** Humans process information structured as stories more effectively than information structured as data, lists, or arguments. The 6P framework leverages this by structuring user research as a narrative arc.

### Singularity Effect
**Mechanism:** One identifiable individual creates more empathy than statistics about many. "Maria, a 34-year-old therapist who spent 3 hours trying to build a website" moves stakeholders more than "34% of therapists report difficulty with web presence."

### Character Identification
**Mechanism:** The audience must be able to project themselves into the person in the story. The more specific and human the 6P portrait, the stronger the identification — paradoxically, specific detail creates more identification than generic description.

---

<a id="journey-principles"></a>
## Journey Principles

### Hyperbolic Discounting
**Mechanism:** People disproportionately prefer immediate rewards over future rewards, even when the future reward is objectively larger. This is the psychological engine behind "front-load the peak."
**In practice:** Showing a user their completed site immediately (reward now) before asking them to configure settings (cost now, benefit later) leverages hyperbolic discounting. The reverse order — configure first, see result later — fights against the brain's reward wiring.

### Zeigarnik Effect
**Mechanism:** Incomplete tasks create psychological tension that persists until resolution. People remember unfinished tasks better than finished ones.
**In practice:** Progress bars ("3 of 5 complete") leverage Zeigarnik by making the incompleteness visible. Checklists with checked items create an itch to check the remaining ones. But be careful: too many open loops simultaneously creates anxiety, not motivation.

### Goal Gradient Effect
**Mechanism:** Effort increases as users approach completion. A progress bar at 80% drives more urgency than the same bar at 20%.
**In practice:** Start users closer to the end when possible ("Your site is 70% set up" rather than "You have 4 tasks to do"). Concrete estimates ("90 seconds") outperform vague ones ("a few minutes") because they make the finish line specific.

---

<a id="ethics-principles"></a>
## Ethics Principles

### Second-Order Effect
**Mechanism:** The keystone principle of ethics in this system. Every technique has a first-order effect (what happens to the user immediately) and a second-order effect (what happens to users at scale, over time). Ethical design requires checking both.
**Diagnostic:** "This nudge increases conversion by 15%. If we used this nudge on every screen for every user for five years, what would the cumulative effect be?"

### Reactance (ethics application)
**Mechanism:** In the ethics context, reactance is both a risk and a signal. If users push back against a design pattern (closing modals aggressively, leaving negative reviews about nagging), the pattern is likely crossing the line from persuasion into coercion.

---

<a id="cross-cutting"></a>
## Cross-cutting Principles

### Endowment Effect
**Mechanism:** People value things more once they feel ownership. "Make it yours" (future instruction) is weaker than "It's yours" (present declaration). The shift from observer to owner is psychological, not transactional.
**Across skills:** Affects Interpret (ownership language in copy), Act (investment-driven commitment), Store (ownership increases return probability), and Ethics (manufactured endowment is manipulation).

### IKEA Effect
**Mechanism:** People overvalue things they helped create. Even minor customization ("choose your color") increases perceived value.
**Across skills:** Affects Interpret (frame tasks as creative acts, not corrections), Act (include a customization step to increase investment), Store (customized outputs are more likely to be saved and shared).

### Jobs-to-be-Done
**Mechanism:** Users don't want products. They want outcomes. The task label should name the outcome, not the action. "Adjust your specialties" (action) → "Attract the right clients" (outcome).
**Across skills:** Affects every skill where copy is involved. The universal rewrite rule: find the verb (the action) and replace it with the noun (the user's goal).

### Sunk Cost
**Mechanism:** Investment already made increases willingness to continue, even when the investment is irrational to consider. Users who've filled out 4 of 5 form fields will complete the 5th even if they'd never have started at field 5 alone.
**Across skills:** Closely connected to Goal Gradient (approaching completion) and Commitment/Consistency (identity-aligned continuation).

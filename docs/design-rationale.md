# Design rationale — how the frameworks were applied

This page exists so future iterations don't accidentally undo deliberate decisions. Every choice below maps to the two course frameworks installed at `.claude/skills/` (C.L.E.A.R. UI Framework and Product Psychology). When changing the design, re-run the relevant pillar/skill before shipping.

## C.L.E.A.R. pillar decisions

### Copywriting (C)
- **Feedforward CTAs everywhere:** "Get my free score →", "See my results →", "Claim your free Loom teardown →" — every button says what happens next. No "Submit", no "Continue" without an arrow and destination.
- **Proactive reassurance:** "No pitch unless you ask" appears on the landing page *and* the Loom card — it neutralises the "this is a sales trap" objection before it forms. "Prepared within 48 hours… a human strategist — not just AI" answers the unvoiced "is this just AI slop?" anxiety.
- **VoC language:** quiz option subtexts are written as the founder would say them ("If it ain't broke...", "Hard to tell from the inside") — passes the Barstool Test, and doubles as Andromeda targeting signal.
- **Copy Swap Test:** the page says "skincare" eight times above the fold by design. A generic DTC founder should land here and feel it's *not* for them — that's Meta exclusion working.

### Layout (L)
- **Proximity over borders:** sections are separated by whitespace and a single hairline before the formula footer — no border bloat. Tinted backgrounds (red leak / green quick win / purple CTA) do the Common Region work only where the semantic grouping matters.
- **One centered 520px column:** content never crams edge-to-edge ("let the UI breathe"), and the single column keeps the F-pattern trivial on mobile where ~95% of Instagram traffic lands.
- **Varied visual weight:** the brief explicitly bans "every section is an identical card." The gauge section is open/uncontained, the leak card is heavy and tinted, angles are bordered list items, the formula footer is bare monospace. Each weight signals its role.

### Emphasis (E)
- **One unmistakable #1 per phase:** landing = headline; quiz = the current question; loading = the cycling message; results = the leak number (largest type on the page, the screenshot target). Foggy Glasses Test passes on each phase.
- **Single accent colour discipline:** amber is reserved for action and key numbers (CTAs, progress bar, gauge, stat values, hook labels). Risk colours appear only on the gauge band. Nothing else is coloured — when everything screams, nothing does.
- **Motion dial used once:** the 2s gauge fill is the only theatrical animation, reserved for the diagnosis moment (the loudest dial spent on the most important event). Everything else is ≤500ms entrance easing.

### Accessibility (A)
- All tap targets ≥ 44px (option cards, chips, back button, even text links get 44px min-height).
- Risk is never colour-only: the gauge pairs colour with a text label ("High risk") and a numeric score.
- `prefers-reduced-motion` kills all animation **and** collapses the 6s loading wait to ~600ms.
- Keyboard: everything interactive is a real `<button>` or input; focus-visible outline in accent; `aria-expanded` on collapsibles, `role="progressbar"` on the quiz bar; error messages say what's wrong, not just "invalid."

### Reward (R)
- **30-second reward test:** the progress bar moves on every step, card selection gives an immediate 400ms highlighted state before advancing, and the results page opens with the animated score (competence: "I completed the diagnostic").
- **Recognition:** the loading phase names their brand ("Crunching data for Glow Theory"), the interpretation paragraph and Loom card reuse the brand name and their actual answers.
- **Post-action reassurance:** claiming the Loom/course swaps the CTA for a concrete confirmation ("We'll email you within 48 hours… nothing else to do for now") — closes the post-commitment anxiety loop instead of dead-ending.

## Product Psychology decisions

- **BMAP:** cold ad traffic has moderate motivation and one prompt (the ad promise). The quiz protects Ability — zero typing on steps 2–6 (tap, auto-advance), email asked once at step 1, everything on step 8 optional. The whole flow really is ~60 seconds.
- **NPV / Psych Ledger:** every step deposits before it withdraws — the landing promises three concrete artefacts before asking for anything; step 8's heavy asks (ROAS, headline) are hidden behind an optional collapsible so they never read as a wall.
- **Curiosity Gap + Loss Aversion (Interpret):** "silently draining" frames the leak as an ongoing loss; the ghost gauge with "?" opens a loop only the results page closes. Tone stays on the brief's rule: "you could be making £X more," never "you're bad at your job."
- **Labor Illusion:** the 6-second loading phase with niche-specific messages makes the diagnosis feel computed, not canned. Instant results would *reduce* perceived value here.
- **Peak-End Rule:** the peak is the gauge + leak number reveal (front-loaded, per Hyperbolic Discounting); the end is the transparent formula footer — the last thing a sceptical founder reads is the most honest thing on the page.
- **Commitment & Consistency:** email is captured at step 1 (small ask), the Loom claim comes after they've invested 8 steps and received value — the classic 2-Step Commitment Pattern.
- **Show the working (trust mechanic):** the formula footer admits its own limits ("brands that spray underfunded tests will read higher than they are"). One line of honesty against interest outperforms social-proof badges this brand doesn't have yet.
- **Ethics / Regret Test:** scarcity and countdown patterns were deliberately *not* used — there is no real scarcity, and a fake one fails the Regret Test with an audience this sophisticated. The £700/month floor and the >8x-ROAS honesty note keep the calculator a Facilitator, not an Exploiter.

## Things intentionally NOT done

- No gradient blobs, glassmorphism, or icon libraries (template signals).
- No corner radius above 8px.
- No JS-driven entrance animations — all CSS, GPU-accelerated, zero render blocking.
- No fake urgency, no fake social proof numbers, no confetti.

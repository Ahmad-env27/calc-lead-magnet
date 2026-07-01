# Pickup later / team discussion items

Items flagged during Josh's review (July 2026) that aren't blocking launch but need addressing.

## Ask Josh

- **What does "skip" mean on the CTA cards? (09:04–09:25)**
  Josh mentioned adding a "skip" option so some users can go straight to the lead magnet. Three possible interpretations:
  1. **Skip inside the LoomCard:** Hot leads see the Loom teardown CTA but also a smaller "skip" link that takes them to the lighter bonus (email course) instead. Lets qualified leads self-select out of the sales path.
  2. **Skip the whole CTA section:** A link somewhere on the results page that bypasses the Loom/Course card entirely and jumps straight to the lead magnet download. For people who just want the free thing.
  3. **Skip in the pre-results flow:** A button on the email unlock or loading screen that lets users jump ahead to the lead magnet without waiting for the full results. Different embedded URLs per route (qualified vs. underqualified).
  Each option needs a different URL embedded. Currently we have two: `BONUS_LINK_QUALIFIED` and `BONUS_LINK_UNQUALIFIED`. Ask Josh which route "skip" sends people to and where the button lives.

- **Do we keep the competitor angles section? (10:29)**
  Josh said "I kind of don't know if this is necessary" about a section. Likely the generic three-card competitor angles section ("What competitors are saying that you're not"). It's static content per brand type, not personalised. Options:
  1. Keep it (it's social proof and gives actionable hooks)
  2. Cut it entirely
  3. Move it behind the CTA so it's below the fold

## Medium priority

- **Revisit the LoomCard section** — We made copy changes (CTA text, em dashes). Needs a full pass to make sure tone, deliverables list, and the locked angles teaser all still land. Check the "Want the full picture?" framing and whether the Loom teardown + consultation offer reads right after the other changes.

- **"Fatigue cliff" label on the chart SVG** (07:09) — Josh said it needs to be bigger. The small text label next to the dashed cliff line on the sigmoid curve is hard to read. Bump its font size and make sure it visually aligns with the zone descriptions underneath.

- **CSS sizing: Budget Effectiveness Curve** (07:09) — Josh wanted the whole chart section to have more visual weight. Consider bumping the SVG container height or the surrounding padding.

- **CSS sizing: Lever card text** (04:49) — The three-card row (Audience intelligence / Meta optimisation / Meta-signal stack) has small text. Josh said "make this a little bit bigger so it can be read properly." Bump `.lane-card-title`, `.lane-card-value-sm`, and `.lane-card-subtitle` font sizes in the row cards.

- **Review diagnosis fallback copy** (Results.jsx:901) — Currently says "Your personalised diagnosis is being prepared. Everything else on this page is calculated directly from your answers." This shows when the AI insights endpoint fails or returns empty. Revisit to make sure the tone and framing feel right, not like an error state.

- **Rewrite "Every order lost on Meta is a subscriber you never captured for email"** (Results.jsx:417) — Josh flagged this as confusing. The intended meaning: every order your ads fail to capture is also a lost email subscriber — someone you'll never upsell, cross-sell, or retain through email marketing. The line needs rewriting to make that connection obvious. Only shown to users with email responsibilities.

## Needs conversation

- **Six-month / twelve-month projection numbers** (04:08) — Josh said "this is wrong as well, because it doesn't really make sense against the offer." The 6-month projection and 12-18 month target cards need to align with the actual offer (e.g. £1M annualised revenue claim). Numbers discussion with Ahmad later today.

- **Heatmap tool** (12:01) — Josh wants a free heatmap/session recording tool (like Sentry but for visual engagement) on the calculator post-launch. Research options and implement after launch.

## Low priority

- **Rename internal "lane" references to "levers"** — CSS class names and component names still say `lane-card`, `lane-intro`, `ThreeLaneStack`, etc. User-facing copy already says "levers." Pure code cleanup, zero user impact.

# Pickup later / team discussion items

Items flagged during Josh's review (July 2026) that aren't blocking launch but need addressing.

## Ask Josh

- **What does "skip" mean on the CTA cards? (09:04–09:25)**
  Josh mentioned adding a "skip" option so some users can go straight to the lead magnet. Three possible interpretations:
  1. **Skip inside the LoomCard:** Hot leads see the Loom teardown CTA but also a smaller "skip" link that takes them to the lighter bonus (email course) instead. Lets qualified leads self-select out of the sales path.
  2. **Skip the whole CTA section:** A link somewhere on the results page that bypasses the Loom/Course card entirely and jumps straight to the lead magnet download. For people who just want the free thing.
  3. **Skip in the pre-results flow:** A button on the email unlock or loading screen that lets users jump ahead to the lead magnet without waiting for the full results. Different embedded URLs per route (qualified vs. underqualified).
  Each option needs a different URL embedded. Currently we have two: `BONUS_LINK_QUALIFIED` and `BONUS_LINK_UNQUALIFIED`. Ask Josh which route "skip" sends people to and where the button lives.

## Josh — `CalculatorCompleted` payload mismatch (code vs cheat sheet vs GTM)

The code, the cheat sheet, and the GTM tags all disagree on what fields `CalculatorCompleted` carries. The Meta tag for calculator completed is already showing a "fails to load properties from variable" error — likely because the DataLayer Variable names in GTM don't match what the code actually pushes.

**What the cheat sheet documents:**
```
score · temperature · spend_tier · revenue_tier · brand_type
```

**What the code actually sends (`src/App.jsx:123-128`):**
```js
trackEvent('CalculatorCompleted', {
  score: computed.score,
  risk_level: temperature,       // ← "risk_level" not "temperature"
  revenue_tier: finalAnswers.revenue,
  brand_type: finalAnswers.brandType,
                                 // ← spend_tier is missing entirely
})
```

**The two mismatches:**

| Field | Cheat sheet says | Code sends | Impact |
|---|---|---|---|
| Temperature tier | `temperature` | `risk_level` | GTM DataLayer Variable looking for `temperature` gets empty |
| Spend tier | `spend_tier` | *(not sent)* | GTM DataLayer Variable looking for `spend_tier` gets empty |
| Score | `score` | `score` | OK |
| Revenue tier | `revenue_tier` | `revenue_tier` | OK |
| Brand type | `brand_type` | `brand_type` | OK |

**Code fix applied (1 Jul 2026):** `risk_level` renamed to `temperature`, `spend_tier` added. The code now matches the cheat sheet:
```js
trackEvent('CalculatorCompleted', {
  score, temperature, spend_tier, revenue_tier, brand_type
})
```

**What Josh still needs to do in GTM:**
1. **GA4 tag ("GA4 - calculator completed"):** Verify or create DataLayer Variables for `temperature` and `spend_tier`, and map them as event parameters on the tag. `score`, `revenue_tier`, and `brand_type` should already work if they were set up — confirm they're wired.
2. **Meta tag ("Meta - calc complete"):** "Load Properties From Variable" is currently set to **False**, meaning the event fires but sends zero parameters to Meta. To pass lead quality data, set this to True and point it at a DataLayer Variable that contains the event properties — or manually add custom data parameters (`temperature`, `spend_tier`, `revenue_tier`, `brand_type`) so Meta can use them for optimisation and audience building.

---

## Josh — `quiz_step` name slug is off by one

The `name` field on every `quiz_step` event currently describes the step being **entered**, not the step just **answered**. E.g. answering revenue (step 5) fires `{ step: 6, name: 'spend_tier' }`. The `step` number is correct as a progress marker; the `name` is shifted by one position.

**Current behaviour:** `goTo(n)` fires `trackStepProgress(n, STEP_NAMES[n])` — the name of the destination step.

**Impact:** Any GA4 report or GTM trigger that filters by `name` is looking at the wrong question. The existing GTM trigger "Quiz step 6 - revenue" filters by `step` number, so it's unaffected. Cheat sheet has been updated to document this and recommend filtering by `step` number only.

**Fix when ready:** In `src/Quiz.jsx:153`, change `STEP_NAMES[n]` to `STEP_NAMES[n - 1]` so the name describes the step just completed. One-line change, but Josh should confirm no existing GA4 reports or GTM config rely on the current (shifted) name values before switching.

---

## Josh — Add `ab_variant` to remaining GA4 tags (GTM only)

The DataLayer Variable "Calculator design variant" (reads `ab_variant`) exists and works. It's currently attached to:
- **GA4 - calculator completed** — yes
- **Google Tag** (initialization) — yes

But it's **missing from these 3 tags:**
- **GA4 - calculator step** (`quiz_step`)
- **GA4 - lead magnet cta clicked** (`lead_magnet_CTA_clicked`)
- **GA4 - start calculator** (`start_calculator`)

Without it, you can segment completions by A/B variant but NOT quiz drop-off, CTA clicks, or calculator starts. Add "Calculator design variant" as an event parameter (param name: `ab_variant`) on all three tags. No code change needed.

---

- **Do we keep the competitor angles section? (10:29)**
  Josh said "I kind of don't know if this is necessary" about a section. Likely the generic three-card competitor angles section ("What competitors are saying that you're not"). It's static content per brand type, not personalised. Options:
  1. Keep it (it's social proof and gives actionable hooks)
  2. Cut it entirely
  3. Move it behind the CTA so it's below the fold

## Josh — GTM: Wire `QualifiedLead` event to Meta Pixel

The code fires a `QualifiedLead` event to `window.dataLayer` but **no GTM trigger catches it**, so it never reaches Meta. This is the high-value signal that tells Meta "send us more people like this."

**What fires it:** `maybeFireQualificationPixel()` in `src/Quiz.jsx:156-169`. Runs once per session (guarded by a ref) when the user answers step 6 (spend tier) and all three conditions are met:

| Condition | Code | Qualifying values |
|---|---|---|
| Brand type | `['skincare', 'beauty'].includes(a.brandType)` | `skincare` or `beauty` |
| Revenue | `['80k_120k', '120k_plus'].includes(a.revenue)` | `80k_120k` or `120k_plus` |
| Spend | `a.spendTier && a.spendTier !== 'under_10k'` | anything except `under_10k` |

**dataLayer payload:**
```js
{ event: 'QualifiedLead', brand_type: '...', revenue_tier: '...', spend_tier: '...' }
```

**What Josh needs to do in GTM:**
1. Create a Custom Event trigger matching `QualifiedLead`
2. Create a Meta Pixel tag (e.g. "Meta - qualified lead") firing on that trigger — map it to a Meta custom event or `Lead` standard event with quality parameters
3. Optionally pass `brand_type`, `revenue_tier`, `spend_tier` as event parameters so Meta can optimise on lead quality

**Note on the existing "Meta - quiz step 6 - revenue signal" tag:** This trigger fires on `quiz_step` where `step equals 6`, which means "user arrived at the spend-tier question" (they just answered revenue). It fires for ALL users who reach that point, not just qualified ones. It's a mid-funnel reach signal, not a qualification signal. Both are useful — the step-6 tag tells Meta "this user is engaged enough to reach step 6"; the `QualifiedLead` tag would tell Meta "this user is actually our ICP." Keep both.

---

## Josh — GTM: Check for History Change trigger (page slugs added)

The calculator now uses `pushState` to update the URL as the user moves through phases (`/` → `/quiz` → `/unlock` → `/results`). This means GTM's built-in **History Change** trigger will fire on every phase transition.

**What we saw in testing:** GTM fires `gtm.historyChange-v2` on each `pushState`/`replaceState` call. If Josh has a "History Change" trigger wired to a GA4 pageview tag, it would create phantom pageviews on every phase change (landing → quiz → unlock → results = 4 "pageviews" for one actual visit).

**What Josh should check:**
1. Open GTM container `GTM-KTJ34V2X` → Triggers → look for any trigger of type "History Change"
2. If one exists and fires a GA4 pageview tag: either remove it, or add an exception so it doesn't fire on `pushState` (e.g. filter by `Page Path` not matching `/quiz`, `/unlock`, `/results`)
3. If no History Change trigger exists: nothing to do — the `gtm.historyChange-v2` events just sit in the dataLayer harmlessly

**Code context:** `src/App.jsx` calls `history.pushState` when `setPhase` runs, and `history.replaceState` once on mount to seed the initial entry. The `PageView` and `ab_variant_view` dataLayer events are guarded with `sessionStorage` flags so they fire exactly once per session, regardless of refreshes or `pushState` calls.

---

## Verify — Session persistence & URL slugs (added 1 Jul 2026)

Page slug routing and sessionStorage persistence were added to prevent mid-quiz data loss on refresh. The code changes are in `src/App.jsx` and `src/Quiz.jsx`. The following scenarios need manual end-to-end verification on the live deployment (not just dev):

**Refresh resilience (critical path):**
- [ ] Start quiz, answer 5+ questions, refresh browser → should land on same quiz step with all answers preserved
- [ ] Complete full flow through to results, refresh → results page should re-render with scores and insights intact
- [ ] Refresh during unlock screen → should stay on unlock, not drop to landing

**Tracking deduplication (critical — prevents inflated analytics):**
- [ ] Open GA4 DebugView or GTM Preview mode
- [ ] Complete a full flow: landing → quiz → scoring → unlock → loading → results
- [ ] Count events: exactly 1× `PageView`, 1× `ab_variant_view`, 1× `CalculatorStarted`, at most 1× `QualifiedLead`, exactly 1× `CalculatorCompleted`
- [ ] Refresh the results page — confirm NONE of those events fire again
- [ ] Refresh mid-quiz — confirm `CalculatorStarted` does not re-fire on next step change

**Browser navigation:**
- [ ] On quiz, press browser back → should go to landing page
- [ ] Press browser forward → should return to quiz with answers
- [ ] On results page, press back → behaviour is acceptable (may go to landing since unlock/loading share URLs)

**Edge cases:**
- [ ] Open `leak.audr.app` in a new tab (no sessionStorage) → should show landing page normally
- [ ] Close tab and reopen `leak.audr.app/quiz` → should show fresh quiz (sessionStorage clears on tab close)
- [ ] Navigate directly to `leak.audr.app/results` with no prior session → should redirect to landing (guard: no saved email)
- [ ] Complete flow in incognito (sessionStorage may be restricted in some browsers) → should still work, just without persistence

**GTM History Change (Josh):**
- [ ] In GTM Preview, check whether `gtm.historyChange-v2` events fire on phase transitions
- [ ] Confirm no History Change trigger is wired to a GA4 pageview tag (would create phantom pageviews)
- [ ] If one exists, add exception filter — see the "GTM: Check for History Change trigger" section above

---

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

- **Duplicate `QuizStepCompleted` event fires alongside every `quiz_step`** — Every time a user moves forward in the quiz, the code fires TWO events to `dataLayer`: `quiz_step` (the one documented in the cheat sheet and wired in GTM) and `QuizStepCompleted` (undocumented, not wired in GTM). They carry the same data in slightly different shapes: `quiz_step` sends `{ step, name }` while `QuizStepCompleted` sends `{ step, step_name, total_steps }`. This happens in `src/Quiz.jsx:117-124` — the `trackStepProgress` function pushes both. Right now it's harmless because no GTM trigger catches `QuizStepCompleted`, so it just sits in the dataLayer doing nothing. The only risk is if someone later creates a GTM trigger for it and accidentally double-counts funnel steps. Options when cleaning up: either remove the `QuizStepCompleted` push entirely (since `quiz_step` covers it), or document it in the cheat sheet and keep it as a secondary signal. No urgency.

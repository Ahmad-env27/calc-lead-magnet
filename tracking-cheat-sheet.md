# Audr — GTM / GA4 Tracking Cheat Sheet

**GTM Container:** GTM-KTJ34V2X
**Tracking method:** All events push to `window.dataLayer`

---

## A/B Test

| Event | When it fires | Parameters |
|---|---|---|
| `ab_variant_view` | Page load (once per visitor) | `ab_variant`: A or B · `ab_test`: homepage_v1_vs_v2 |
| `ab_cta_click` | Homepage CTA clicked (via App.jsx handler) | `ab_variant`: A or B · `ab_test`: homepage_v1_vs_v2 |

**Variant assignment:** Stored in `localStorage` key `audr_ab_variant`. Same visitor always sees the same variant.
**Force a variant for testing:** Open browser console → `localStorage.setItem('audr_ab_variant', 'B')` → reload.

---

## Homepage CTAs

Event name: `start_calculator`

| Location value | Where the button is |
|---|---|
| `hero` | Hero section (above the fold) |
| `what_youll_get` | "What you'll get" section |
| `final_cta` | Bottom of page final CTA section |

**Example push:**
```
{ event: 'start_calculator', location: 'hero' }
```

---

## Calculator / Quiz

| Event | When it fires | Parameters |
|---|---|---|
| `CalculatorStarted` | First forward navigation inside the quiz | `source` · `medium` · `campaign` (from UTM params) |
| `quiz_step` | Every forward step (steps 2–16) | `step`: number · `name`: step slug (see table below) — **note: `name` describes the step being entered, not the step just answered** |
| `QualifiedLead` | When brand type + revenue + spend meet qualification criteria | `brand_type` · `revenue_tier` · `spend_tier` |

### Step name reference

| Step | Name slug | Question |
|---|---|---|
| 2 | `brand_name` | What's your brand name? |
| 3 | `job_title` | What best describes your role? |
| 4 | `responsibilities` | Which areas do you own or manage? |
| 5 | `brand_type` | What type of brand are you? |
| 6 | `revenue` | Monthly revenue tier |
| 7 | `spend_tier` | Monthly Meta ad spend |
| 8 | `aov` | Average order value |
| 9 | `refresh_rate` | How often do you refresh creatives? |
| 10 | `angle_diversity` | Do ads lean on the same ideas? |
| 11 | `cost_trend` | Has it got more expensive to win a customer? |
| 12 | `roas_bracket` | ROAS bracket |
| 13 | `creative_volume` | New ads launched per month |
| 14 | `best_hook` | Best-performing hook or angle |
| 15 | `ads_made_by` | Who makes your ads? |
| 16 | `frustrations` | Biggest ad frustrations |

**Important — `name` is off by one:** The `name` slug describes the step the user is **entering**, not the step they just **answered**. For example, when a user answers the revenue question (step 5) and moves forward, the event fires as `{ step: 6, name: 'spend_tier' }` — because `spend_tier` is the step they're now on. **Filter funnels by `step` number, not by `name`**, to avoid confusion. This is a known issue being tracked for a future fix.

**Note:** Step 1 (brand name text field) does not fire a `quiz_step` event — it fires `CalculatorStarted` on first forward navigation instead.

---

## Email / Unlock screen

| Event | When it fires | Parameters |
|---|---|---|
| `CalculatorCompleted` | Email + name submitted, report unlocked | `score` · `temperature` · `spend_tier` · `revenue_tier` · `brand_type` |
| `calculator_scored` | Same trigger as above | Score and result details |
| `calculator_lead` | Same trigger as above | Lead details for CRM/ads |

---

## Report page CTAs

Event name: `lead_magnet_CTA_clicked`

| `type` value | Button |
|---|---|
| `loom_teardown` | "Get your free Loom teardown" / personalised teardown CTA |
| `email_course` | "Start the free course" / email course CTA |

**Example push:**
```
{ event: 'lead_magnet_CTA_clicked', type: 'loom_teardown' }
```

---

## Recommended GA4 Funnel (Funnel Exploration)

| Step | Event | Filter |
|---|---|---|
| 1 | `start_calculator` | — |
| 2 | `quiz_step` | `step = 2` |
| 3 | `quiz_step` | `step = 3` |
| 4 | `quiz_step` | `step = 4` |
| 5 | `quiz_step` | `step = 5` |
| 6 | `quiz_step` | `step = 6` |
| 7 | `quiz_step` | `step = 7` |
| 8 | `quiz_step` | `step = 8` |
| 9 | `quiz_step` | `step = 9` |
| 10 | `quiz_step` | `step = 10` |
| 11 | `quiz_step` | `step = 11` |
| 12 | `quiz_step` | `step = 12` |
| 13 | `quiz_step` | `step = 13` |
| 14 | `quiz_step` | `step = 14` |
| 15 | `quiz_step` | `step = 15` |
| 16 | `quiz_step` | `step = 16` |
| 17 | `CalculatorCompleted` | — |
| 18 | `lead_magnet_CTA_clicked` | — |

**Tip:** Segment the funnel by `ab_variant` (A or B) to see if one homepage design drives people further through the quiz.

---

## Session Persistence & URL Slugs (added 1 Jul 2026)

The calculator uses `pushState` to update the URL as the user moves through phases, and `sessionStorage` to preserve answers and quiz progress across page refreshes within the same tab.

### URL slugs

| Phase | URL path | Notes |
|---|---|---|
| Landing | `/` | Starting fresh — no answers restored |
| Quiz | `/quiz` | Answers + quiz step restored from sessionStorage |
| Scoring | `/unlock` | Transitional (11s animation) — shares URL with unlock |
| Unlock | `/unlock` | Answers restored; insights re-fetched silently if lost |
| Loading | `/results` | Transitional (4s animation) — shares URL with results |
| Results | `/results` | Answers restored, scores re-computed, insights restored |

### sessionStorage keys

| Key | Contents | Purpose |
|---|---|---|
| `audr_answers` | Full quiz answers object (JSON) | Restore answers on refresh |
| `audr_insights` | AI diagnosis object (JSON) | Restore LLM insights on results page |
| `audr_quiz_step` | Current quiz step number | Restore quiz position on refresh |
| `audr_pv` | `"1"` flag | Prevent duplicate `PageView` / `ab_variant_view` on refresh |
| `audr_wh` | `"1"` flag | Prevent duplicate webhook + `CalculatorCompleted` on refresh |
| `audr_started_fired` | `"1"` flag | Prevent duplicate `CalculatorStarted` on refresh |
| `audr_qualified_fired` | `"1"` flag | Prevent duplicate `QualifiedLead` on refresh |

### Tracking deduplication

Every event that should fire exactly once per session is guarded by a `sessionStorage` flag. On refresh, the flag is still set, so the event does not re-fire. The guards:

| Event | Guard key | Without guard, would... |
|---|---|---|
| `PageView` | `audr_pv` | Fire on every page load including refreshes |
| `ab_variant_view` | `audr_pv` | Same — fires alongside PageView |
| `CalculatorStarted` | `audr_started_fired` | Fire again on first quiz interaction after refresh |
| `QualifiedLead` | `audr_qualified_fired` | Fire again if user re-passes step 6 qualification check |
| `CalculatorCompleted` | `audr_wh` | Fire again on re-submit (also blocks duplicate webhook) |

Events that fire on real user actions (`quiz_step`, `ab_cta_click`, `lead_magnet_CTA_clicked`) are NOT guarded — they should fire every time the user takes that action, even after a refresh.

### GTM interaction

`pushState` and `replaceState` trigger GTM's built-in `gtm.historyChange-v2` event. If the GTM container has a **History Change** trigger wired to a GA4 pageview tag, it will create phantom pageviews on every phase transition. See pickup-later doc for Josh's verification steps.

---

## GTM Setup Checklist

- [ ] GA4 Configuration tag live in GTM-KTJ34V2X (Measurement ID: G-XXXXXXXXX)
- [ ] Custom Event trigger: `start_calculator` → GA4 event, pass `location` as event parameter
- [ ] Custom Event trigger: `quiz_step` → GA4 event, pass `step` and `name` as event parameters
- [ ] Custom Event trigger: `ab_variant_view` → GA4 event, pass `ab_variant` and `ab_test`
- [ ] Custom Event trigger: `CalculatorCompleted` → GA4 event (mark as conversion)
- [ ] Custom Event trigger: `lead_magnet_CTA_clicked` → GA4 event (mark as conversion), pass `type`
- [ ] DataLayer Variable: `ab_variant` — use in any report to segment by homepage design
- [ ] DataLayer Variable: `location` — use with `start_calculator` to see which section drives clicks

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
| `quiz_step` | Every forward step (steps 2–16) | `step`: number · `name`: step slug (see table below) |
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

## GTM Setup Checklist

- [ ] GA4 Configuration tag live in GTM-KTJ34V2X (Measurement ID: G-XXXXXXXXX)
- [ ] Custom Event trigger: `start_calculator` → GA4 event, pass `location` as event parameter
- [ ] Custom Event trigger: `quiz_step` → GA4 event, pass `step` and `name` as event parameters
- [ ] Custom Event trigger: `ab_variant_view` → GA4 event, pass `ab_variant` and `ab_test`
- [ ] Custom Event trigger: `CalculatorCompleted` → GA4 event (mark as conversion)
- [ ] Custom Event trigger: `lead_magnet_CTA_clicked` → GA4 event (mark as conversion), pass `type`
- [ ] DataLayer Variable: `ab_variant` — use in any report to segment by homepage design
- [ ] DataLayer Variable: `location` — use with `start_calculator` to see which section drives clicks

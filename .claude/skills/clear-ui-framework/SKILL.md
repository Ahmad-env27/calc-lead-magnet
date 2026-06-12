---
name: clear-ui-framework
description: >
  Apply the C.L.E.A.R. UI Framework (Copywriting, Layout, Emphasis, Accessibility, Reward)
  to audit, redesign, or build user interfaces. Use this skill whenever the user asks to
  review a UI, improve a screen, audit a dashboard, redesign a form, evaluate copy, fix
  layout problems, improve visual hierarchy, check accessibility, add reward/delight
  patterns, score a UI, or apply UX psychology principles. Also trigger when the user
  mentions CLEAR, C.L.E.A.R., growth.design, UI scorecard, Gestalt principles applied to
  UI, emphasis dials, feedforward, cognitive miser, WIIFM, or any of the named tests
  (blur test, barstool test, foggy glasses test, 30-second reward test). Trigger even for
  partial requests like "make this CTA better" or "this dashboard feels cluttered."
---

# C.L.E.A.R. UI Framework Skill

## What This Skill Does

Applies a five-pillar iterative UI design framework to any interface — screens, dashboards, emails, forms, landing pages, calculator tools, mobile apps. Each pillar is a lens; the framework is a loop, not a waterfall. One pillar pass will surface problems belonging to another pillar. This is expected and generative.

The five pillars, in order:

1. **Copywriting (C)** — Is the text necessary, specific, and benefit-oriented?
2. **Layout (L)** — Is the structure clear, grouped logically, and scannable?
3. **Emphasis (E)** — Does the most important element grab attention first?
4. **Accessibility (A)** — Is it forgiving of user limitations and context?
5. **Reward (R)** — Does the interface acknowledge, reassure, and motivate?

## Core Operating Principles

- **C.L.E.A.R. is an iterative loop, not a waterfall.** A Layout pass may reveal a Copy problem. An Emphasis pass may create an Accessibility issue. This cross-pillar surfacing is the framework working correctly.
- **The scorecard is a redesign priority map, not a grade.** Score each pillar 1–5 (25 max). The lowest score tells you where to start. The operating question: "How can we improve this pillar by 1 point?" The north star: "What would make this a 5?"
- **Every pixel has to be earned.** If an element doesn't help the user understand, decide, or act, it competes with what matters. Clarity comes from subtraction.
- **The purpose of a dashboard is to do the heavy-lifting for you.** Don't show raw data — surface the insight and the next action.

## When to Use Each Pillar

Read the relevant reference file before applying each pillar. The references contain the full heuristic sets, named psychology concepts, canonical tests, and worked examples.

| Pillar | Read This Reference | Core Question |
|--------|-------------------|---------------|
| Copywriting | `references/pillar-copywriting.md` | Is every word earning its place? |
| Layout | `references/pillar-layout.md` | Can the user parse the structure in 2 seconds? |
| Emphasis | `references/pillar-emphasis.md` | Does the #1 priority element grab attention first? |
| Accessibility | `references/pillar-accessibility.md` | Does the UI forgive user limitations? |
| Reward | `references/pillar-reward.md` | Does the interface make the user feel competent and valued? |

## How to Run a CLEAR Audit

### Step 1: Score (diagnostic)
Score each pillar 1–5 using the questions in `references/scorecard.md`. Record the total (out of 25) and note the lowest-scoring pillars.

### Step 2: Prioritize
Start with the lowest-scoring pillar. If two tie, start with the one earlier in the C→L→E→A→R sequence — it often unblocks the other.

### Step 3: Redesign Pass
Apply the pillar's heuristics from the relevant reference file. For each change, state:
- **What** changed (before → after)
- **Why** (which heuristic or principle)
- **Cross-pillar flag** if the change surfaces a problem in another pillar

### Step 4: Re-score
After each pass, re-score to verify improvement. A good redesign typically moves a pillar 2–3 points.

### Step 5: Iterate
Move to the next-lowest pillar. Repeat until the score stabilizes or the user is satisfied. Expect 2–3 full passes through the loop for a meaningful redesign.

## Output Formats

When producing audit results, use this structure:

```markdown
## CLEAR Audit: [Screen/Component Name]

### Scorecard
| Pillar | Score | Key Issue |
|--------|-------|-----------|
| C | 3/5 | Labels clear but CTAs generic |
| L | 2/5 | No visual grouping, sloppy spacing |
| E | 1/5 | Everything same size and weight |
| A | 4/5 | Contrast OK, touch targets adequate |
| R | 2/5 | No feedback after key actions |
| **Total** | **12/25** | |

### Priority: Layout (lowest score, earliest in sequence)
[Specific changes with before → after and rationale]

### Cross-Pillar Flags
- Layout fix revealed a Copy problem: [description]
```

## Quick-Reference: Named Tests

These tests appear across multiple pillars. Use them as fast diagnostic tools:

- **Blur Test** (Copy) — Blur the screen to 5px. Can you still identify the primary action? If not, the hierarchy is broken.
- **Barstool Test** (Copy) — Read the copy aloud as if explaining to a friend at a bar. If it sounds robotic, rewrite it.
- **Copy Swap Test** (Copy) — Replace the copy with a competitor's name. If it still makes sense, the copy is too generic.
- **Foggy Glasses Test** (Emphasis) — Squint at the screen. The first thing your eye lands on should be the most important element. If it isn't, emphasis is miscalibrated.
- **30-Second Reward Test** (Reward) — Use the interface for 30 seconds. Did you receive any positive feedback? If not, the experience lacks reward.
- **F-Pattern Scan** (Layout) — Trace an F across the screen. Critical content should land on the F's horizontal bars.

## Cross-References

- Full psychology concept index with academic sources: `references/psychology-index.md`
- All named heuristics and canonical phrases: `references/heuristics-and-tests.md`
- Case study index (17+ worked examples): `references/case-study-index.md`
- Scorecard mechanics and scoring rubric: `references/scorecard.md`

For the `clear_audit.py` CLI script that generates a structured audit template, see `scripts/clear_audit.py`.

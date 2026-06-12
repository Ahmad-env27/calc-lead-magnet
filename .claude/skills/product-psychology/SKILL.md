---
name: product-psychology
description: >
  Apply behavioral psychology frameworks to diagnose and fix product UX problems.
  Use this skill whenever the user wants to: audit a product flow for psychological friction,
  diagnose why users drop off or don't convert, improve onboarding or activation sequences,
  evaluate copy/CTAs/microcopy against behavioral principles, map and improve customer journeys,
  apply cognitive biases to product decisions, communicate design decisions to stakeholders,
  run ethics checks on dark patterns or manipulative nudges, reframe feature lists as user benefits,
  write copy grounded in named psychological principles, or build a behavioral design strategy.
  Also trigger when the user mentions: BMAP, B.I.A.S., psych framework, cognitive bias,
  endowment effect, loss aversion, anchoring, goal gradient, IKEA effect, Hick's Law,
  progressive disclosure, peak-end rule, nudge, friction audit, psych level, journey mapping,
  Jobs-to-be-done, dark patterns, humane design, or any named UX psychology concept.
  This skill covers the full diagnostic cycle: empathize → diagnose → redesign → communicate → validate → iterate.
---

# Product Psychology

A connected diagnostic system for finding and fixing the psychological failures in any product experience. Not a checklist — a flow where each skill's output feeds the next skill's input, and skipping upstream work produces gap warnings downstream.

## When to read reference files

This skill uses progressive disclosure. The SKILL.md body covers the methodology and decision logic. Reference files contain the deep content:

| If you need... | Read this file |
|---|---|
| The full 12-skill connected flow | `references/00-skill-flow.md` |
| A specific framework's formula or structure | `references/01-frameworks.md` |
| Deep explanation of a psychological principle | `references/02-principles.md` |
| Diagnostic questions for a specific problem | `references/03-diagnostics.md` |
| A named reusable technique | `references/04-named-techniques.md` |
| A real-world case study or before/after | `references/05-real-world-anchors.md` |
| The 106 cognitive biases taxonomy | `references/06-106-biases-taxonomy.md` |
| Typed input/output schemas for automation | `references/07-executable-nodes.md` |
| Cross-references between concepts | `references/08-cross-references.md` |

Read only what the task requires. Most tasks need 1–3 reference files, not all of them.

## Core methodology

The system operates across five phases with twelve skills. Every skill has a defined input, a defined output, and a handoff to the next node. The Upstream Principle is structural, not advisory: if a user asks to fix copy (Skill 5: Interpret) without having identified who the user is (Skill 1: 6P Story) or what behavior they're targeting (Skill 2: BMAP), flag the gap before proceeding.

### Phase 1: Empathize
- **Skill 1 — 6P Story:** Build a narrative portrait of the user using the 6P framework (Person, Problem, Pursuit, Pitfall, Pivot, Payoff). Answers: "Who is this user, and what does their situation *feel* like?"
- **Skill 2 — BMAP:** Map the target behavior using B = M × A × P (Motivation × Ability × Prompt). Plot the user on the activation threshold. Answers: "Which behavioral variable is broken?"
- **Skill 3 — NPV / Psych Framework:** Score each touchpoint's psychological cost and benefit using Net Perceived Value (NPV = Motivation − Friction). Answers: "Where is the user's psychological budget going negative?"

### Phase 2: Diagnose
- **Skill 4 — Block:** Audit what the user literally cannot see or process. Signal-to-noise, selective attention, banner blindness, pattern breaks. Answers: "Is the message even reaching the brain?"
- **Skill 5 — Interpret:** Audit how the user assigns meaning. Familiarity, cognitive load, benefits framing, anchoring, loss aversion, discoverability. Answers: "Is the user understanding what we intend?"
- **Skill 6 — Act:** Audit the action layer. Hick's Law, DPP (Decisions Per Page), valid defaults, progressive disclosure, commitment patterns, social proof, nudges. Answers: "Can the user do the thing easily enough?"
- **Skill 7 — Store:** Audit what sticks after the session ends. Clear feedback, reassurance, feeling of caring, delighters. Kano Model for feature classification. Answers: "Will the user come back?"

### Phase 3: Redesign
- **Skill 8 — Journey Map:** Plot 5–6 emotionally pivotal moments as Psych Level over the customer journey. Identify peaks, pits, jumps, drops, and transitions. Answers: "Where are the emotional highs and lows?"
- **Skill 9 — Journey Improve:** Apply three improvement targets (fix pits, amplify peaks, smooth transitions) using the primary method of reorder/shorten. Answers: "What's the highest-leverage change to the experience sequence?"

### Phase 4: Communicate
- **Skill 10 — Communicate Decisions:** Use B.I.A.S. for Relationships, the 3-Step Feedback Formula, stakeholder empathy mapping, and the difficult-person playbook. Answers: "How do I get this approved without losing the design intent?"

### Phase 5: Validate & Iterate
- **Skill 11 — Ethics:** Apply the Regret Test, Manipulation Matrix, and Black Mirror Test. Three humane design principles: save user time, value attention, reflect human values. Answers: "Is this design helping or exploiting?"
- **Skill 12 — Iterate:** Run the full B.I.A.S. loop on the redesigned experience. Check the Sequencing Rule (upstream before downstream). Track the V0→V3 improvement pattern. Answers: "Did the fix actually work, and did we fix the right thing?"

## The Upstream Principle (structural enforcement)

This is the single most important rule in the system. It is not a suggestion.

**Rule:** Fixing downstream problems while upstream problems remain unresolved wastes effort. The B.I.A.S. phases are sequential: Block → Interpret → Act → Store. If Block is broken (user can't see the element), fixing Interpret (how they read it) is meaningless. If Interpret is broken (user misreads the value), fixing Act (making the button easier to click) optimizes the wrong thing.

**Enforcement:** When a user asks to work on a downstream skill, check whether the upstream skills have been addressed. If not, produce a `gap_warning` that names the unresolved upstream dependency and recommends starting there. Do not block entirely — the user may have good reasons — but make the gap visible.

**The Sequencing Rule:** Fixing order matters more than fixing quality. The canonical example is the V2 dip pattern from iterative case studies: a team improves conversion rate from V0→V1 (Block fix), sees a *dip* at V2 (Interpret fix that surfaces a previously-hidden friction), then achieves the real breakthrough at V3 (Act fix that resolves the newly-visible friction). The V2 dip is *expected and healthy*. Teams that panic at V2 and revert lose the diagnostic signal.

## Quick diagnostic: where to start

| Symptom | Start at |
|---|---|
| "We don't know what users actually want" | Skill 1 (6P Story) + Skill 2 (BMAP) |
| "Users sign up but don't come back" | Skill 7 (Store) → Skill 8 (Journey Map) |
| "We have a feature nobody uses" | Skill 4 (Block) — it might be invisible |
| "Users get to the page but don't convert" | Skill 5 (Interpret) → Skill 6 (Act) |
| "Conversion is fine but NPS is low" | Skill 7 (Store) + Skill 11 (Ethics) |
| "Stakeholders keep overriding design decisions" | Skill 10 (Communicate) |
| "We fixed it but it didn't move the metric" | Skill 12 (Iterate) — check Sequencing Rule |
| "The whole experience feels mediocre" | Skill 8 (Journey Map) — you probably have no peak |
| "We don't know what to prioritize" | Skill 8 (Journey Map) — find the biggest pit |
| "Feature works but feels manipulative" | Skill 11 (Ethics) — Facilitator/Manipulator Matrix |
| "Engagement is high but user sentiment is declining" | Skill 11 (Ethics) — long-horizon NPV check |

## Output format

When applying this skill, structure outputs as:

1. **Diagnosis** — name the skill(s) applied, the principle(s) identified, and the specific failure found
2. **Evidence** — quote or describe the specific UI element, copy string, or flow step that demonstrates the failure
3. **Fix direction** — describe the change, grounded in the named principle, with a before/after contrast when possible
4. **Upstream check** — note any upstream dependencies that should be verified
5. **Ethics flag** — if the fix could be perceived as manipulative, note the Manipulation Matrix quadrant

Keep language direct and diagnostic. Name principles explicitly. Use before/after contrasts to make recommendations concrete. When multiple principles apply to the same element, stack them — real product problems are rarely single-principle.

## Key vocabulary

These terms have specific meanings in this system. Use them precisely:

- **Psych Level:** The user's cumulative psychological state (positive or negative) at any point in the experience. Not mood — resource balance.
- **NPV (Net Perceived Value):** Motivation minus Friction at a given touchpoint. The running score.
- **Activation Threshold:** The curved line on a BMAP graph above which a prompt can trigger behavior. Below it, no prompt works.
- **DPP (Decisions Per Page):** Count of choices a user must make on a single screen. Above 3–4 is a diagnostic red flag.
- **Peak-End Rule:** Users remember the most intense moment and the final moment. Everything in between fades. Design for the peak and the end.
- **Sequencing Rule:** Fix order (Block → Interpret → Act → Store) before fixing quality within any phase. The V2 dip is expected.
- **Gap Warning:** A flag produced when downstream work is requested while upstream dependencies remain unresolved.

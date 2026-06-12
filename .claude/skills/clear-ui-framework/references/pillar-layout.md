# Pillar 2: Layout (L)

> "Structured information feels faster and safer."

## Core Thesis
Layout is invisible infrastructure. A user never thinks "great layout" — they think "this was easy." The six Gestalt principles are the structural backbone. A layout pass doesn't add content; it organizes existing content so the brain can parse it effortlessly.

## The Six Gestalt Principles (Applied to UI)

### 1. Similarity
**Rule:** Same role → same look. Elements that do the same thing must share visual treatment (font, size, color, spacing, icon style).

**Violation signal:** Inconsistent link styles, mixed icon sizes, date format variations, label typography drift.

**Fix:** Audit for visual consistency across role groups. If two labels serve the same function, they must be visually identical.

### 2. Proximity
**Rule:** Snug within blocks. Spacious between blocks. Items that belong together should be closer together than items that don't.

**Violation signal:** Equal spacing everywhere ("sloppy spacing"). Elements from different categories sitting at the same distance as elements from the same category.

**Fix:** Reduce intra-group spacing, increase inter-group spacing. Minimum 2:1 ratio between group gap and item gap.

**Named mistake: Sloppy Spacing** (Amazon.ca survey case study) — uniform spacing destroys implicit grouping.

### 3. Simplicity (Law of Prägnanz)
**Rule:** Remove elements until removing the next one would destroy meaning. Borders, dividers, background fills, and decorative elements are guilty until proven innocent.

**Violation signal:** Heavy borders on every container, redundant dividers between already-spaced groups, decorative elements with no semantic purpose.

**Fix:** Replace borders with whitespace. Replace fills with alignment. Let proximity do the grouping work.

**Named mistake: Border Bloat** (Canada.ca case study) — borders on every element make the page feel like a prison grid.

### 4. Alignment
**Rule:** Vertical and horizontal edges should line up across related elements. Misalignment creates a "zig-zag scan" that breaks reading flow.

**Violation signal:** Labels and values in the same column starting at different horizontal positions. Cards or blocks with inconsistent padding.

**Fix:** Use a consistent grid. Label above, value below (not side-by-side if it causes staggering). Align to a single vertical axis within each section.

### 5. Continuity
**Rule:** The eye follows smooth lines and paths. Use headers, dividers, or visual rails to guide vertical scanning.

**Violation signal:** Long scrolling panels with no section headers. No visual cue for where one section ends and another begins.

**Fix:** Add section headers as "handrails for the eye." Collapsible sections implement Progressive Disclosure — show essential info first, reveal details on demand.

### 6. Common Region
**Rule:** Elements inside a shared boundary (border, background, card) are perceived as a group.

**Violation signal:** Semantically related items living outside any visual container while unrelated items share one.

**Fix:** Use Interface Wells — slightly inset surfaces with subtle backgrounds that hold related items. Frame with a centered container. Avoid overuse (Border Bloat is Common Region gone wrong).

## Named Layout Concepts

- **F-Reading Pattern** — users scan in an F shape: top horizontal bar, second horizontal bar, left vertical rail. Place the most important content at the F's hotspots.
- **Interface Wells** — inset surfaces (subtle bg + depth cue) implementing Common Region without borders. "Tidy shelves" for long panels.
- **Progressive Disclosure** (IxD + NN/g) — show essential info first, reveal details on demand. Collapsible sections = table of contents.
- **Content Cramming** (AWS Billing case study) — cramming content edge-to-edge destroys readability. Fix: centered container with max-width.

## Named Psychology Concepts

- **Cognitive Load** (Wagemans et al., 2012) — clutter forces re-interpretation. Layout turns pixels into predictable structure.
- **Gestalt Principles** (Wertheimer, 1923 / Koffka, 1935) — the brain groups visual elements by proximity, similarity, continuity, closure, common region, and simplicity.
- **Pattern-Break Tax** — every inconsistency forces the brain to re-evaluate "is this intentional?" Each re-evaluation is a micro-cost.
- **Chunking** (Miller, 1956) — breaking information into groups of 5±2 items makes it parseable.
- **Law of Prägnanz** — the brain prefers the simplest possible interpretation. Simpler layouts are perceived as more trustworthy.
- **Identifiable Person Effect** (J. Behavioral Science, 2005; Oxford Academic, 2014) — people engage more with identifiable individuals (name, photo) than abstract IDs or numbers.

## Key Case Studies
- **ParcelXpress Email** — full redesign applying all 6 Gestalt principles sequentially
- **Amazon.ca Survey** — Sloppy Spacing (Mistake #1): uniform spacing destroys grouping
- **Canada.ca** — Border Bloat (Mistake #2): borders on every element
- **AWS Billing** — Content Cramming (Mistake #3): edge-to-edge content, no centered container
- **FrontApp Widget** — 6-step practice redesign: Similarity → Proximity → Simplicity → Common Region → Alignment → Continuity
- **EmployHR** — Layout pass: semantic grouping, Interface Wells, collapsible sections

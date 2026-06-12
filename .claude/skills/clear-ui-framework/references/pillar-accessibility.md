# Pillar 4: Accessibility (A)

> "Accessibility is the corrective lens for over-emphasis."

## Core Thesis
Emphasis creates hierarchy, but hierarchy can exclude. Accessibility ensures the interface works for users with different abilities, contexts, and devices. It's not just about disability compliance — it's about designing interfaces that forgive user limitations: tired eyes, bright sunlight, one-handed use, cognitive overload, and unfamiliarity.

## The POUR Principles (WCAG Foundation)

### Perceivable
Information must be presentable in ways users can perceive. Not everyone can see, hear, or process information the same way.

- Sufficient color contrast (WCAG 2.1 AA minimum: 4.5:1 for text, 3:1 for large text)
- Text alternatives for images
- Captions for video/audio
- Don't rely on color alone to convey meaning

### Operable
Users must be able to interact with all controls and navigation.

- Keyboard accessible (all interactive elements reachable without a mouse)
- Adequate touch target sizes (minimum 44×44px, per Apple HIG / WCAG)
- No time-dependent interactions without user control
- Clear focus indicators

### Understandable
Content and operation must be predictable and comprehensible.

- Consistent navigation patterns
- Clear error messages with recovery guidance
- Labels that match their controls
- Readable text (plain language, appropriate reading level)

### Robust
Content must work across technologies and degrade gracefully.

- Semantic HTML
- ARIA labels where native semantics are insufficient
- Progressive enhancement

## Four Disability Categories (Context for Design)

1. **Visual** — blindness, low vision, color blindness. Design for: screen readers, high contrast, not using color as sole indicator.
2. **Auditory** — deafness, hard of hearing. Design for: captions, visual notifications, text alternatives for audio.
3. **Motor** — limited fine motor control, single-hand use. Design for: large touch targets, keyboard navigation, minimal precision requirements.
4. **Cognitive** — attention disorders, memory issues, learning disabilities. Design for: simple language, consistent patterns, minimal cognitive load, clear feedback.

## Accessibility as Emphasis Corrector

The Emphasis lesson's dials create hierarchy. But some dial settings create accessibility failures:

- **Color dial turned up** → fails users with color blindness if color is the sole indicator
- **Size dial turned down** (for secondary elements) → text becomes unreadable for low vision users
- **Motion dial** → triggers vestibular issues, seizure risk, or cognitive overwhelm
- **Screaming dials** → ironically reduces accessibility for cognitively overloaded users

The Accessibility pass explicitly checks every Emphasis decision for exclusion risk.

## Practical Checklist

- [ ] Contrast ratios meet WCAG 2.1 AA (4.5:1 text, 3:1 large text, 3:1 UI components)
- [ ] Color is never the sole indicator of state (add icons, labels, or patterns)
- [ ] Touch targets are minimum 44×44px
- [ ] All interactive elements are keyboard-reachable
- [ ] Text is minimum 16px body on mobile
- [ ] Error states include recovery instructions, not just "invalid"
- [ ] Focus order matches visual order
- [ ] Animations respect prefers-reduced-motion
- [ ] Labels are descriptive (not "Click here" or icon-only without aria-label)

## Named Concepts

- **Discoverability Debt** — novel gestures or interactions without onboarding create invisible functionality. If the user can't find it, it doesn't exist. (Flagged as high-risk for Audr: novel competitor scan gestures need onboarding.)
- **Color Semantic Contracts** — when a color consistently means something (red = danger, green = safe), changing that mapping breaks trust. Applies to competitor status indicators across a dashboard.
- **Forgiving Design** — interfaces that work even when the user makes mistakes. Large targets, undo options, confirmation dialogs.

## Key Case Studies
- **EmployHR** — Accessibility pass: contrast fixes, touch target expansion, label additions for icon-only elements
- **FrontApp Widget** — Accessibility flag: icon-only links need labels/tooltips
- **Shield+ Dashboard** — Remaining accessibility issues at 21/25: "Labels, click targets, body text still small in some places"

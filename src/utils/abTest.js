const STORAGE_KEY = 'audr_ab_variant'
const SPLIT = 0.5 // 50% A, 50% B

/**
 * Returns the A/B variant for this visitor ('A' or 'B').
 * Assignment is random on first visit and then persisted in localStorage
 * so the same visitor always sees the same design.
 *
 * To force a variant during testing, set localStorage manually:
 *   localStorage.setItem('audr_ab_variant', 'A')  // or 'B'
 *   location.reload()
 *
 * To reset (pick a new random variant):
 *   localStorage.removeItem('audr_ab_variant')
 *   location.reload()
 */
export function getVariant() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'A' || stored === 'B') return stored

    const assigned = Math.random() < SPLIT ? 'A' : 'B'
    localStorage.setItem(STORAGE_KEY, assigned)
    return assigned
  } catch {
    return Math.random() < SPLIT ? 'A' : 'B'
  }
}

/**
 * Push a dataLayer event so GA4 / GTM can segment by variant.
 * Call this once on landing mount.
 */
export function trackVariantView(variant) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'ab_variant_view',
    ab_variant: variant,
    ab_test: 'homepage_v1_vs_v2',
  })
}

/**
 * Call when the primary CTA is clicked.
 * This is your main conversion signal for the test.
 */
export function trackVariantCTA(variant) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'ab_cta_click',
    ab_variant: variant,
    ab_test: 'homepage_v1_vs_v2',
  })
}

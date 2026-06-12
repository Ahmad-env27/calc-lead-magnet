// ============================================
// GHL WEBHOOK — COMMENTED OUT FOR LOCAL DEV
// ACTIVATE: Uncomment the fetch() call below
// and replace the URL with your GHL Inbound
// Webhook URL from GoHighLevel > Automations
// ============================================

const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL_HERE' // Ahmad: paste GHL URL here

export async function fireWebhook(data) {
  const payload = {
    email: data.email,
    brand_name: data.brandName,
    brand_type: data.brandType,
    revenue_tier: data.revenue,
    spend_tier: data.spendTier,
    refresh_rate: data.refreshRate,
    angle_diversity: data.angleDiversity,
    frustrations: data.frustrations,
    extra_context: data.extraContext,
    current_roas: data.currentROAS,
    best_headline: data.bestHeadline,
    // Computed values
    fatigue_score: data.score,
    revenue_leak_low: data.leakLow,
    revenue_leak_high: data.leakHigh,
    lead_temperature: data.temperature,
    // Meta
    source: 'calculator_v1',
    timestamp: new Date().toISOString(),
  }

  // ACTIVATE: Uncomment the block below when GHL is ready
  /*
  try {
    await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // Silent fail — user still sees results
    console.error('Webhook failed:', e);
  }
  */

  // DEV MODE: Log payload to console so Ahmad can verify the data shape
  console.log('[DEV] Webhook payload:', JSON.stringify(payload, null, 2))
}

// Fires when someone clicks "Claim your free Loom teardown" or the email-course
// CTA on the results page. Lets GHL distinguish "completed the quiz" from
// "raised their hand" without a second form.
export async function fireFollowupEvent(eventType, data) {
  const payload = {
    event: eventType, // 'loom_claimed' | 'course_signup'
    email: data.email,
    brand_name: data.brandName,
    lead_temperature: data.temperature,
    source: 'calculator_v1',
    timestamp: new Date().toISOString(),
  }

  // ACTIVATE: Uncomment the block below when GHL is ready
  /*
  try {
    await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('Webhook failed:', e);
  }
  */

  console.log('[DEV] Followup event:', JSON.stringify(payload, null, 2))
}

// ============================================
// META PIXEL — COMMENTED OUT FOR LOCAL DEV
// ACTIVATE:
//   1. Uncomment the Meta Pixel base code in index.html <head>
//   2. Replace YOUR_PIXEL_ID with your actual pixel ID
//   3. Uncomment the fbq() calls below
// ============================================

// Standard PageView — fires on landing page load
export function firePageView() {
  // ACTIVATE: uncomment when pixel is installed
  // if (typeof fbq !== 'undefined') {
  //   fbq('track', 'PageView');
  // }
  console.log('[DEV] Pixel: PageView fired')
}

// Qualification event — fires ONLY after qualified combo
// Condition: Brand type is Skincare or Beauty AND Revenue is £60k+ AND Spend is £5k+
// Called after Step 4 (spend) once all three are known.
export function fireQualificationPixel(inputs) {
  // ACTIVATE: uncomment when pixel is installed
  // if (typeof fbq !== 'undefined') {
  //   fbq('trackCustom', 'QualifiedLead', {
  //     brand_type: inputs.brandType,
  //     revenue_tier: inputs.revenue,
  //     spend_tier: inputs.spendTier
  //   });
  // }
  console.log('[DEV] Pixel: QualifiedLead fired', inputs)
}

// Lead event — fires on form completion
export function fireLeadPixel(data) {
  // ACTIVATE: uncomment when pixel is installed
  // if (typeof fbq !== 'undefined') {
  //   fbq('track', 'Lead', {
  //     content_name: 'calculator_completion',
  //     lead_temperature: data.temperature
  //   });
  // }
  console.log('[DEV] Pixel: Lead fired', data.temperature)
}

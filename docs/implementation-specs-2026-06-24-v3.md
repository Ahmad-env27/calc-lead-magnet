# Implementation Specs v3 — 25 Jun 2026

Two changes: revenue tier update and insights debugging.

---

## 8. Update revenue tiers to 4 new brackets

### Current state (`src/Quiz.jsx` lines 38–43)
```js
const REVENUE_TIERS = [
  { id: 'under_30k', title: 'Under £30k' },
  { id: '30k_60k', title: '£30k–£60k' },
  { id: '60k_150k', title: '£60k–£150k' },
  { id: '150k_plus', title: '£150k+' },
]
```

### New tiers
```js
const REVENUE_TIERS = [
  { id: 'under_30k', title: 'Under £30k' },
  { id: '30k_80k', title: '£30k–£80k' },
  { id: '80k_120k', title: '£80k–£120k' },
  { id: '120k_plus', title: '£120k+' },
]
```

### All files that reference revenue tier IDs

**1. `src/Quiz.jsx` lines 38–43** — Update `REVENUE_TIERS` as above.

**2. `src/scoring.js` lines 18–23** — Update `REVENUE_MIDPOINTS`:
```js
export const REVENUE_MIDPOINTS = {
  under_30k: 20000,
  '30k_80k': 55000,
  '80k_120k': 100000,
  '120k_plus': 180000,
}
```
The midpoints feed the guardrail cap at line 100: `Math.min(recoverableMonthly, revenueMid * 0.15)`. Changing these changes the cap. After this change, run the sweet-spot lead test: a lead with £30–80k spend, ~2x ROAS, low diversity must still output £8–25k/month for the Meta lane.

**3. `server/insights.js` line 5** — Update `LABEL_MAP.revenue`:
```js
revenue: { under_30k: 'Under £30k', '30k_80k': '£30k-£80k', '80k_120k': '£80k-£120k', '120k_plus': '£120k+' },
```

**4. `src/webhook.js`** — Search for any revenue tier ID references (`under_30k`, `30k_60k`, `60k_150k`, `150k_plus`) and update. The webhook sends raw answers, so it likely doesn't hardcode these, but verify.

**5. `src/App.jsx`** — Check `SAMPLE_ANSWERS` (used for dev preview) for a `revenue` field referencing old tier IDs. Update to a valid new ID.

### What NOT to change
- The `SPEND_TIERS` are unchanged (still 5 tiers: under_5k through 100k_plus)
- The scoring formula coefficients stay the same — only the revenue midpoints change
- The 15% revenue cap percentage stays at 0.15

---

## 9. Add debug logging across the entire insights pipeline

There are 6 places where failures are currently silent. Add console output at every single one so you can trace exactly where things break by looking at the browser console + server terminal.

### The pipeline and where to add logging

#### A. Client: `src/api.js` (browser console)

Current code (entire file):
```js
export function fetchInsights(answers) {
  return fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
    .then((res) => {
      if (!res.ok) return null          // SILENT — no idea what status code
      return res.json()
    })
    .then((data) => data?.insights || null)  // SILENT — no idea if data was empty
    .catch(() => null)                       // SILENT — swallows network errors
}
```

Replace with:
```js
export function fetchInsights(answers) {
  console.log('[INSIGHTS] Sending request to /api/insights…')
  return fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
    .then((res) => {
      if (!res.ok) {
        console.warn(`[INSIGHTS] Server returned ${res.status} ${res.statusText}`)
        return null
      }
      return res.json()
    })
    .then((data) => {
      if (!data?.insights) {
        console.warn('[INSIGHTS] Server returned OK but insights is null/empty:', data)
        return null
      }
      console.log('[INSIGHTS] Received insights:', Object.keys(data.insights))
      return data.insights
    })
    .catch((err) => {
      console.error('[INSIGHTS] Network/fetch error:', err.message)
      return null
    })
}
```

This will show in the **browser console** (DevTools → Console):
- `[INSIGHTS] Sending request…` — confirms the call was made
- `[INSIGHTS] Server returned 404` — means Express server isn't running or route doesn't exist
- `[INSIGHTS] Server returned OK but insights is null/empty` — means the API key is missing or validation failed server-side
- `[INSIGHTS] Network/fetch error: Failed to fetch` — means the server isn't running at all
- `[INSIGHTS] Received insights: ["whats_working", "the_leak", ...]` — success

#### B. Client: `src/Scoring.jsx` line 47 (browser console)

The promise resolution also swallows errors. Add logging inside the `.then` and `.catch`:

Current (lines 46–49):
```js
insightsPromise
  .then((insights) => { resolvedInsights.current = insights })
  .catch(() => { resolvedInsights.current = null })
```

Replace with:
```js
insightsPromise
  .then((insights) => {
    console.log('[SCORING] Insights resolved:', insights ? 'received' : 'null')
    resolvedInsights.current = insights
  })
  .catch((err) => {
    console.error('[SCORING] Insights promise rejected:', err)
    resolvedInsights.current = null
  })
```

#### C. Server: `server/index.js` route handler (server terminal)

Current (lines 33–40):
```js
app.post('/api/insights', rateLimit, async (req, res) => {
  const { answers } = req.body
  if (!answers || !answers.brandName) {
    return res.status(400).json({ error: 'Missing answers' })
  }
  const insights = await generateInsights(answers)
  res.json({ insights })
})
```

Replace with:
```js
app.post('/api/insights', rateLimit, async (req, res) => {
  console.log('[ROUTE] POST /api/insights received')
  const { answers } = req.body
  if (!answers || !answers.brandName) {
    console.warn('[ROUTE] Missing answers or brandName in request body')
    return res.status(400).json({ error: 'Missing answers' })
  }
  console.log('[ROUTE] Calling generateInsights for brand:', answers.brandName)
  const insights = await generateInsights(answers)
  console.log('[ROUTE] generateInsights returned:', insights ? 'valid object' : 'null')
  res.json({ insights })
})
```

#### D. Server: `server/insights.js` — API key check (server terminal)

Already has a console.warn at line 147. No change needed here — but confirm `[INSIGHTS] No ANTHROPIC_API_KEY set` appears in your server terminal. If you see this, that's the problem.

#### E. Server: `server/insights.js` — LLM response parsing (server terminal)

Current (lines 167–178): if JSON parsing fails or regex extraction fails, it silently returns null.

Add logging after line 167:
```js
const text = response.content?.[0]?.text || ''
console.log('[INSIGHTS] Raw LLM response length:', text.length)
console.log('[INSIGHTS] Raw LLM response preview:', text.substring(0, 200))
```

And in the catch blocks (lines 170, 175):
```js
// line 170 catch
catch (parseErr) {
  console.warn('[INSIGHTS] Direct JSON parse failed:', parseErr.message)
  // ... existing regex fallback
}

// line 175 inner catch
catch (regexErr) {
  console.warn('[INSIGHTS] Regex JSON extraction also failed:', regexErr.message)
}
```

And before the final `return null` at line 177:
```js
console.warn('[INSIGHTS] All parsing attempts failed. Raw text:', text.substring(0, 300))
return null
```

#### F. Server: `server/insights.js` — validateDiagnosis (server terminal)

Current (lines 131–142): returns null with zero indication of why.

Replace with:
```js
function validateDiagnosis(obj) {
  if (!obj || typeof obj !== 'object') {
    console.warn('[VALIDATE] Input is not an object:', typeof obj)
    return null
  }
  const keys = ['whats_working', 'the_leak', 'missing_angle', 'test_brief']
  const result = {}
  for (const key of keys) {
    const val = obj[key]
    if (typeof val !== 'string') {
      console.warn(`[VALIDATE] Key "${key}" is not a string:`, typeof val)
      return null
    }
    if (val.length < 10) {
      console.warn(`[VALIDATE] Key "${key}" too short (${val.length} chars):`, val)
      return null
    }
    if (val.length > 400) {
      console.warn(`[VALIDATE] Key "${key}" too long (${val.length} chars)`)
      return null
    }
    const hit = PROHIBITED_TERMS.find((t) => val.toLowerCase().includes(t))
    if (hit) {
      console.warn(`[VALIDATE] Key "${key}" contains prohibited term "${hit}"`)
      return null
    }
    result[key] = val
  }
  console.log('[VALIDATE] Diagnosis passed validation — all 4 keys OK')
  return result
}
```

### Also: create `.env.example` in project root

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Add `.env` to `.gitignore` if not already present.

### Also: add fallback state to results page

In `src/Results.jsx`, find the insights rendering guard (around line 892):
```jsx
{insights && insights.whats_working && (
  <section className="rsection" style={stagger()}>
    <DiagnosisSection insights={insights} brandName={answers.brandName} />
  </section>
)}
```

Add an else case when insights is null/missing:
```jsx
{insights && insights.whats_working ? (
  <section className="rsection" style={stagger()}>
    <DiagnosisSection insights={insights} brandName={answers.brandName} />
  </section>
) : (
  <section className="rsection" style={stagger()}>
    <p className="insight-fallback" style={{ color: 'var(--faint)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
      Personalised diagnosis unavailable — results based on quiz data only.
    </p>
  </section>
)}
```

This way you'll always see SOMETHING in the results page where insights should be, instead of a silent gap.

---

## 10. Remove benchmark tick and label from the gauge

The "Top brands: 32" label and tick mark on the risk score gauge look odd and don't add value.

### File: `src/Results.jsx` (Gauge component, lines ~118–172)

**Remove these elements:**

1. Lines 122–126 — the benchmark calculation variables (`benchmark`, `benchmarkFraction`, `benchmarkAngle`, `bx`, `by`). These are only used by the tick and label, so they can go entirely.

2. Lines 148–157 — the SVG `<line>` (tick mark on the arc) and `<text>` ("Top brands: 32") elements.

3. Lines 168–172 — the conditional `<p className="gauge-benchmark-gap">` that shows "Gap: X points above top performers at your spend level".

**Keep:** The `BENCHMARK_SCORES` import from scoring.js is still used — check if anything else references it before removing. If nothing else uses it after this change, leave the import for now (it's harmless and may be useful later).

The `spendTier` prop to `Gauge` can also be removed from the component signature and the call site if `benchmark` was its only use. Check whether `spendTier` is used elsewhere in the component before removing.

---

## Testing

1. After revenue tier changes, run `npm run build` — must succeed
2. Run the sweet-spot lead scoring test from `docs/audit-2026-06-12.md`
3. **Without API key:** Start server, run quiz, check:
   - Server terminal shows `[INSIGHTS] No ANTHROPIC_API_KEY set`
   - Browser console shows `[INSIGHTS] Server returned OK but insights is null/empty`
   - Results page shows "Personalised diagnosis unavailable" fallback text
4. **With API key:** `ANTHROPIC_API_KEY=sk-ant-... node server/index.js`, run quiz, check:
   - Server terminal shows `[ROUTE] POST /api/insights received` → `[INSIGHTS] Raw LLM response length: XXX` → `[VALIDATE] Diagnosis passed validation` → `[ROUTE] generateInsights returned: valid object`
   - Browser console shows `[INSIGHTS] Received insights: ["whats_working", "the_leak", ...]`
   - Results page shows the 4-card diagnosis grid
5. Check the browser console and server logs show useful debug output on every failure path

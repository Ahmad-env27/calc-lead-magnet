# Implementation Specs v5 — 25 Jun 2026

Two items: fix the insights pipeline (accounting for Replit deployment), and add Firecrawl website scraping with screenshot + visual analysis.

---

## 14. Fix insights pipeline — end-to-end (Replit-aware)

### Architecture recap

```
Browser (Vite :5000)
  → fetchInsights() in api.js
    → POST /api/insights (proxied via Vite → localhost:3001)
      → Express server/index.js
        → generateInsights() in server/insights.js
          → Anthropic API (Claude Haiku)
            → returns 4-part JSON diagnosis
```

### The two independent blockers

**Blocker 1: Express server not running.**

`npm run dev` starts Vite only. The Vite proxy forwards `/api` → `localhost:3001`, but nothing is listening. `api.js` gets `ECONNREFUSED` and `.catch()` returns `null`. This is the most likely cause on Replit.

**Blocker 2: ANTHROPIC_API_KEY not reaching the Express process.**

Even if the key is in Replit Secrets, it only reaches the process that Replit launches. If Replit launches Vite (port 5000), the Express server (started by `concurrently` as a child process) may or may not inherit the env. On local dev, there's no `.env` file at all — only `.env.example`.

### Fixes

#### a) Create `.replit` file to run both servers

If no `.replit` file exists (confirmed: it doesn't in this folder), create one:

```toml
run = "npm run dev:full"

[env]
PORT = "5000"
```

This ensures Replit starts both Vite AND Express via the existing `concurrently` script. `concurrently` inherits the parent process's environment, so Replit Secrets (ANTHROPIC_API_KEY, FIRECRAWL_API_KEY) will be available to the Express child process.

#### b) Add FIRECRAWL_API_KEY to Replit Secrets

In Replit sidebar → Secrets (padlock icon), add:

```
FIRECRAWL_API_KEY = fc-7b0286c9e0bb47f397b380557e1b03ab
```

Verify ANTHROPIC_API_KEY is also present. Both must exist as Replit Secrets.

#### c) For local development: create `.env`

```bash
cp .env.example .env
```

Edit `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
FIRECRAWL_API_KEY=fc-7b0286c9e0bb47f397b380557e1b03ab
```

The server already has `import 'dotenv/config'` at the top of `server/index.js`.

#### d) Add `.env` to `.gitignore`

Check `.gitignore` — it should already have `.env` listed. If not, add it:
```
.env
```

NEVER commit the `.env` file. The `.env.example` stays committed as a template.

#### e) Verification checklist

1. Start with `npm run dev:full`. Terminal must show BOTH:
   ```
   VITE vX.X.X ready in Xms
   [SERVER] Listening on port 3001
   ```

2. Test the endpoint directly:
   ```bash
   curl -X POST http://localhost:3001/api/insights \
     -H "Content-Type: application/json" \
     -d '{"answers":{"brandName":"TestBrand","brandType":"skincare_mass","revenue":"30k_80k","spendTier":"30k_50k","refreshRate":"monthly_or_less","angleDiversity":"yes_same","costTrend":"up_some","roasBracket":"r_1_5_2_5","creativeVolume":"vol_3_7","adsMadeBy":"agency","frustrations":["stop_performing","same_message"],"aov":"aov_40_60"}}'
   ```
   Expected: `{"insights":{"whats_working":"...","the_leak":"...","missing_angle":"...","test_brief":"..."}}`.

3. If `curl` returns `{"insights":null}`, read the server terminal output. The debug logging (added in v3) will show exactly which step failed:
   - `[INSIGHTS] No ANTHROPIC_API_KEY set` → key not in env
   - `[INSIGHTS] API error: ...` → key invalid or model access issue
   - `[INSIGHTS] API call timed out (8s)` → network/cold start, bump timeout to 12s
   - `[VALIDATE] Key "X" is not a string` → LLM returned malformed JSON
   - `[INSIGHTS] Direct JSON parse failed` → LLM wrapped JSON in markdown

4. Run through the full quiz. On the results page, the 4-card diagnosis section appears between the radar chart and the Loom CTA card.

#### f) Troubleshooting if it still fails

| Server log | Cause | Fix |
|---|---|---|
| No `[ROUTE]` log at all | Express not running OR Vite proxy broken | Check `.replit` uses `dev:full`. Check `vite.config.js` has `proxy: { '/api': 'http://localhost:3001' }` |
| `[INSIGHTS] No ANTHROPIC_API_KEY set` | Key not in environment | On Replit: check Secrets. Locally: check `.env` |
| `[INSIGHTS] API error: 401` | Invalid API key | Regenerate key at console.anthropic.com |
| `[INSIGHTS] API error: 404` | Model not available | Change model to `claude-haiku-4-5-20251001` (verify exact string at docs.anthropic.com) |
| `[INSIGHTS] API call timed out (8s)` | Slow network or cold start | Change timeout from 8000 to 12000 in `insights.js` line 173 |
| `[INSIGHTS] Direct JSON parse failed` | LLM wrapped JSON in ```json blocks | The regex fallback at line 193 handles this — check if it's also failing |
| `TypeError: signal is not supported` | SDK version doesn't support AbortController signal | Remove `, { signal: controller.signal }` from the `.create()` call (line 182). Keep the timeout as a manual safety net. |

---

## 15. Add Firecrawl website scraping with screenshot + visual analysis

### What this adds

When a user enters a website URL in quiz step 1, we:
1. **Scrape the page** with Firecrawl → get markdown content (product descriptions, messaging, brand voice)
2. **Take a screenshot** of the page → get a rendered image URL
3. **Pass both to Claude** as a multimodal message → the LLM sees the actual website visually AND reads the copy

This turns the "hyper-personalised results" label from hollow into real. The LLM can reference specific products, creative style, messaging tone, and visual brand identity in its diagnosis.

### Implementation

#### a) Install Firecrawl SDK

```bash
npm install firecrawl
```

The package name is `firecrawl` (not `@mendable/firecrawl-js`).

#### b) Create `server/scrape.js`

```js
import { Firecrawl } from 'firecrawl'

const SCRAPE_TIMEOUT_MS = 6000

export async function scrapeWebsite(url) {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    console.warn('[SCRAPE] No FIRECRAWL_API_KEY set — skipping website scrape')
    return { markdown: null, screenshotUrl: null }
  }

  if (!url || typeof url !== 'string' || url.length < 5) {
    console.warn('[SCRAPE] No valid URL provided')
    return { markdown: null, screenshotUrl: null }
  }

  // Normalise URL
  let cleanUrl = url.trim()
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl
  }

  try {
    const firecrawl = new Firecrawl({ apiKey })

    console.log(`[SCRAPE] Scraping ${cleanUrl} (markdown + screenshot)…`)

    const result = await Promise.race([
      firecrawl.scrape(cleanUrl, {
        formats: ['markdown', 'screenshot'],
        onlyMainContent: true,
        location: { country: 'GB', languages: ['en'] },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firecrawl timeout')), SCRAPE_TIMEOUT_MS)
      ),
    ])

    if (!result.success) {
      console.warn('[SCRAPE] Firecrawl returned failure:', result.error || 'unknown')
      return { markdown: null, screenshotUrl: null }
    }

    const markdown = result.markdown || ''
    const screenshotUrl = result.screenshot || null

    console.log(`[SCRAPE] Got ${markdown.length} chars markdown`)
    if (screenshotUrl) {
      console.log(`[SCRAPE] Got screenshot URL: ${screenshotUrl.substring(0, 80)}…`)
    }

    // Truncate markdown to ~3000 chars to stay within prompt budget
    // (we're also sending a screenshot, so keep text portion reasonable)
    const truncatedMarkdown = markdown.length > 3000
      ? markdown.substring(0, 3000) + '\n[… truncated]'
      : markdown

    return {
      markdown: truncatedMarkdown || null,
      screenshotUrl,
    }
  } catch (err) {
    console.warn('[SCRAPE] Error:', err.message)
    return { markdown: null, screenshotUrl: null }
  }
}
```

**Key decisions:**
- `formats: ['markdown', 'screenshot']` — gets both text content AND a rendered page image in one call (1 credit)
- `location: { country: 'GB' }` — UK proxy so the site renders UK-specific content/pricing (these are UK skincare brands)
- `onlyMainContent: true` — strips nav, footer, cookie banners — we want product/messaging copy
- Screenshot URLs expire after 24 hours, but we use them immediately in the LLM call so this is fine
- Returns an object with both `markdown` and `screenshotUrl` so the caller can use either or both

#### c) Update `server/insights.js` — scrape before LLM, multimodal message

Add import at the top:
```js
import { scrapeWebsite } from './scrape.js'
```

**Change `buildUserPrompt` signature** to accept website content:
```js
function buildUserPrompt(answers, websiteContent) {
```

**Add website section** after the `websiteLine` variable (around line 43):
```js
  const websiteSection = websiteContent
    ? `\nSCRAPED WEBSITE CONTENT (from ${answers.websiteUrl}):\n${websiteContent}\n\nIMPORTANT: Use this real website content to ground your diagnosis. Reference specific products, claims, messaging, and brand positioning you can see. Don't make generic statements — cite what's actually on their site.`
    : ''
```

**Insert** `${websiteSection}` into the template string after `${extraLine}${roleContext}`.

**Update `generateInsights()` function** — add scraping and multimodal message:

Replace the section after the API key check (starting around line 170) with:

```js
  // Scrape website if URL provided
  let websiteData = { markdown: null, screenshotUrl: null }
  if (answers.websiteUrl) {
    console.log('[INSIGHTS] Scraping website:', answers.websiteUrl)
    websiteData = await scrapeWebsite(answers.websiteUrl)
  }

  const client = new Anthropic({ apiKey })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)  // bumped to 10s for multimodal

  try {
    // Build message content — text-only or multimodal depending on screenshot
    const promptText = buildUserPrompt(answers, websiteData.markdown)
    let messageContent

    if (websiteData.screenshotUrl) {
      // Multimodal: screenshot image + text prompt
      console.log('[INSIGHTS] Sending multimodal request (screenshot + text)')
      messageContent = [
        {
          type: 'image',
          source: {
            type: 'url',
            url: websiteData.screenshotUrl,
          },
        },
        {
          type: 'text',
          text: promptText + '\n\nA screenshot of the brand\'s website is attached above. Use the visual design, product photography, layout, and creative style you can see to inform your diagnosis — especially the "missing_angle" and "test_brief" fields. Note their colour palette, imagery style, and how they present their products visually.',
        },
      ]
    } else {
      // Text-only (no website URL provided, or scrape failed)
      messageContent = promptText
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: websiteData.markdown ? 800 : 600,  // more tokens when we have website context
      temperature: 0.7,
      system: REFERENCE_DOC,
      messages: [{ role: 'user', content: messageContent }],
    }, { signal: controller.signal })

    clearTimeout(timeout)
    // ... rest of parsing logic stays the same
```

**The JSON parsing block after this stays exactly as-is** — the `response.content?.[0]?.text` extraction, the `validateDiagnosis`, the regex fallback. No changes needed there.

#### d) Update `.env.example`

Add the Firecrawl key placeholder:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
FIRECRAWL_API_KEY=fc-your-key-here
```

#### e) Timing budget

The scrape + LLM call must fit within the 11–15 second scoring window:

```
Quiz complete → fetchInsights() fires
                ├── Firecrawl scrape: 2–4s (timeout at 6s)
                └── then Claude API: 2–5s (timeout at 10s)
                    Total worst case: 6 + 10 = 16s
                    Typical case: 3 + 3 = 6s ✓
```

If the scrape fails or times out, the LLM call still proceeds with text-only (URL-as-string fallback). The scoring screen's MAX_DURATION is 15s.

**If total consistently exceeds 15s**, bump MAX_DURATION in `Scoring.jsx` from 15000 to 20000:
```js
const MAX_DURATION = 20000
```
And add one more loading message to cover the extra time:
```js
'Analysing your website…',
```

But test first — the typical path should be well under 11s.

#### f) Graceful degradation

The entire Firecrawl integration is fail-safe:

| Scenario | What happens |
|---|---|
| No FIRECRAWL_API_KEY | `scrapeWebsite()` returns `{markdown: null, screenshotUrl: null}`, LLM gets text-only prompt |
| URL not provided by user | Same — scrape skipped entirely |
| Firecrawl API down | 6s timeout → returns nulls → LLM proceeds text-only |
| Firecrawl returns error | Logged, returns nulls → LLM proceeds text-only |
| Screenshot URL but no markdown | LLM gets image only + quiz data (still useful) |
| Markdown but no screenshot | LLM gets text content + quiz data (still useful) |
| Both available | Full multimodal: screenshot + markdown + quiz data |

The user never sees an error from Firecrawl. The diagnosis quality degrades gracefully.

### Files changed

- `server/scrape.js` — **NEW FILE**
- `server/insights.js` — import scrape, call before LLM, multimodal message construction, updated prompt
- `.env.example` — add FIRECRAWL_API_KEY placeholder
- `package.json` — add `firecrawl` dependency
- `.replit` — **NEW FILE** (if deploying on Replit)

### Files NOT changed

- No UI changes. The results page renders whatever the LLM returns.
- No quiz changes. The website URL field already exists at step 1.
- `src/api.js` — no changes. It sends the same `answers` object which already includes `websiteUrl`.

---

## Execution order

1. Create `.replit` file (item 14a)
2. Verify ANTHROPIC_API_KEY is in Replit Secrets (item 14b)
3. Start with `npm run dev:full` and run the curl test (item 14e)
4. Confirm the 4-card diagnosis appears on the results page
5. Once insights work WITHOUT Firecrawl, install `firecrawl` and create `server/scrape.js` (item 15a-b)
6. Add FIRECRAWL_API_KEY to Replit Secrets (item 14b)
7. Update `server/insights.js` with scrape integration + multimodal message (item 15c)
8. Test with a real skincare brand URL (e.g. `balmonds.co.uk`) — verify the diagnosis references actual products/messaging from the site
9. Check timing — if scoring screen hits 15s timeout before insights resolve, bump MAX_DURATION

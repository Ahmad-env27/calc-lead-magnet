import Firecrawl from 'firecrawl'

const MARKDOWN_TIMEOUT_MS = 10000
const SCREENSHOT_TIMEOUT_MS = 20000

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

  let cleanUrl = url.trim()
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl
  }

  const firecrawl = new Firecrawl({ apiKey })

  // Stage 1 — markdown only (fast, always attempted)
  let markdown = null
  try {
    console.log(`[SCRAPE] Stage 1: scraping markdown from ${cleanUrl}…`)
    const result = await Promise.race([
      firecrawl.scrape(cleanUrl, {
        formats: ['markdown'],
        onlyMainContent: true,
        location: { country: 'GB', languages: ['en'] },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firecrawl markdown timeout')), MARKDOWN_TIMEOUT_MS)
      ),
    ])

    if (result.success && result.markdown) {
      markdown = result.markdown.length > 3000
        ? result.markdown.substring(0, 3000) + '\n[… truncated]'
        : result.markdown
      console.log(`[SCRAPE] Stage 1 OK — ${markdown.length} chars markdown`)
    } else {
      console.warn('[SCRAPE] Stage 1 returned no markdown:', result.error || 'unknown')
    }
  } catch (err) {
    console.warn('[SCRAPE] Stage 1 failed:', err.message)
  }

  // Stage 2 — screenshot (only if markdown succeeded)
  let screenshotUrl = null
  if (markdown) {
    try {
      console.log(`[SCRAPE] Stage 2: scraping screenshot from ${cleanUrl}…`)
      const result = await Promise.race([
        firecrawl.scrape(cleanUrl, {
          formats: ['screenshot'],
          onlyMainContent: true,
          location: { country: 'GB', languages: ['en'] },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firecrawl screenshot timeout')), SCREENSHOT_TIMEOUT_MS)
        ),
      ])

      if (result.success && result.screenshot) {
        screenshotUrl = result.screenshot
        console.log(`[SCRAPE] Stage 2 OK — screenshot URL: ${screenshotUrl.substring(0, 80)}…`)
      } else {
        console.warn('[SCRAPE] Stage 2 returned no screenshot:', result.error || 'unknown')
      }
    } catch (err) {
      console.warn('[SCRAPE] Stage 2 failed (non-fatal):', err.message)
    }
  }

  return { markdown: markdown || null, screenshotUrl }
}

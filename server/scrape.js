import Firecrawl from 'firecrawl'

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

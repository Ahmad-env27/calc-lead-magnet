import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { generateInsights } from './insights.js'
import { generatePdf } from './generate-pdf.js'
import { sendReportEmail } from './send-report.js'
import { buildWebhookPayload, GHL_WEBHOOK_URL } from '../src/webhook.js'

let StorageClient = null
const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID
  || process.env.REPLIT_DEFAULT_BUCKET_ID
  || process.env.OBJECT_STORAGE_BUCKET_ID
  || null

try {
  const mod = await import('@replit/object-storage')
  StorageClient = mod.Client
  if (BUCKET_ID) {
    console.log('[SERVER] Object Storage module loaded, bucket:', BUCKET_ID.slice(0, 12) + '…')
  } else {
    console.log('[SERVER] Object Storage module loaded but NO bucket env var found')
    console.log('[SERVER] Available REPLIT/OBJECT env vars:', Object.keys(process.env).filter(k => /replit|object|bucket|storage/i.test(k)).join(', ') || 'NONE')
  }
} catch {
  console.log('[SERVER] Object Storage not available — PDFs will be email-attached only')
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.EXPRESS_PORT || 3002

app.use(express.json())

// Rate limiting: 1 request per IP per 10 seconds
const rateMap = new Map()
function rateLimit(req, res, next) {
  const ip = req.ip
  const now = Date.now()
  const last = rateMap.get(ip) || 0
  if (now - last < 10_000) {
    return res.status(429).json({ error: 'Too many requests' })
  }
  rateMap.set(ip, now)
  next()
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 60_000
  for (const [ip, ts] of rateMap) {
    if (ts < cutoff) rateMap.delete(ip)
  }
}, 300_000)

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

app.post('/api/send-report', async (req, res) => {
  const { answers, results, insights } = req.body
  if (!answers?.email || !results) {
    return res.status(400).json({ error: 'Missing data' })
  }
  const host = req.get('x-forwarded-host') || req.get('host')
  res.json({ queued: true })

  try {
    console.log('[REPORT] Generating PDF for:', answers.brandName)
    const pdf = await generatePdf(answers, results, insights)
    console.log('[REPORT] PDF generated (%d bytes), sending to: %s', pdf.length, answers.email)

    let pdfUrl = null
    if (StorageClient && BUCKET_ID) {
      try {
        const storage = new StorageClient({ bucketId: BUCKET_ID })
        const safeBrand = (answers.brandName || 'report').replace(/[^a-zA-Z0-9]/g, '')
        const pdfKey = `${Date.now()}-${safeBrand}.pdf`
        await storage.uploadFromBytes(pdfKey, pdf)
        pdfUrl = `https://${host}/api/report/${pdfKey}`
        console.log('[REPORT] PDF uploaded:', pdfKey)

        if (GHL_WEBHOOK_URL) {
          const data = { ...answers, ...results }
          const payload = buildWebhookPayload(data, {}, { report_url: pdfUrl })
          fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(r => console.log('[REPORT] GHL updated with report_url, status:', r.status))
            .catch(e => console.error('[REPORT] GHL update failed:', e.message))
        }
      } catch (err) {
        console.error('[REPORT] Storage upload failed:', err.message, '— sending email with attachment instead')
      }
    }

    await sendReportEmail(answers, pdf, pdfUrl)
  } catch (err) {
    console.error('[REPORT] Pipeline failed:', err.message)
  }
})

app.get('/api/report/:filename', async (req, res) => {
  if (!StorageClient || !BUCKET_ID) return res.status(404).send('Not found')
  try {
    const storage = new StorageClient({ bucketId: BUCKET_ID })
    const result = await storage.downloadAsBytes(req.params.filename)
    if (!result.ok) return res.status(404).send('Report not found')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.send(Buffer.from(result.value))
  } catch {
    res.status(404).send('Report not found')
  }
})

// In production, serve the Vite-built static files
const distPath = join(__dirname, '..', 'dist')

// Funnel routes get their own prerendered shell (noindex, canonical -> '/')
// so they resolve directly without an extra directory redirect.
const FUNNEL_ROUTES = ['/quiz', '/unlock', '/results']
for (const route of FUNNEL_ROUTES) {
  app.get(route, (_req, res) => {
    res.sendFile(join(distPath, route, 'index.html'))
  })
}

app.use(express.static(distPath))
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'))
})

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER] Port ${PORT} is already in use. Kill the old process: fuser -k ${PORT}/tcp`)
    process.exit(1)
  } else {
    throw err
  }
})

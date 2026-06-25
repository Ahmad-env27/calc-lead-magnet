import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { generateInsights } from './insights.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

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

// In production, serve the Vite-built static files
const distPath = join(__dirname, '..', 'dist')
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

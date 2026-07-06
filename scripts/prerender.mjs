import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')
const distServerDir = join(rootDir, 'dist-server')

const entryPath = join(distServerDir, 'entry-server.js')
if (!existsSync(entryPath)) {
  console.error('[prerender] Missing dist-server/entry-server.js — did the SSR build run?')
  process.exit(1)
}

const { renderLanding } = await import(entryPath)
const landingMarkup = renderLanding()

const templatePath = join(distDir, 'index.html')
const template = readFileSync(templatePath, 'utf-8')

// 1. Home page ('/') — bake the real landing-page markup into the initial
//    HTML so crawlers (and the first paint) see the H1, copy, and FAQ
//    content without needing to execute JavaScript.
const homeHtml = template.replace(
  '<div id="root"></div>',
  `<div id="root">${landingMarkup}</div>`
)
writeFileSync(templatePath, homeHtml)
console.log('[prerender] Injected landing markup into dist/index.html')

// 2. Funnel routes ('/quiz', '/unlock', '/results') — these are transient
//    app states, not intended as independent search landing pages. They
//    keep the same app shell (so the SPA can still resume from
//    sessionStorage) but get their own noindex directive so they don't
//    compete with '/' for indexing. Canonical already points at '/' in
//    the shared template, so it's left untouched.
const funnelRoutes = ['quiz', 'unlock', 'results']
const noindexTemplate = template.replace(
  '<meta name="robots" content="index, follow" />',
  '<meta name="robots" content="noindex, follow" />'
)

for (const route of funnelRoutes) {
  const dir = join(distDir, route)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), noindexTemplate)
}
console.log(`[prerender] Wrote noindex shells for: ${funnelRoutes.map((r) => '/' + r).join(', ')}`)

// Clean up the temporary SSR build output — it's only needed at build time.
rmSync(distServerDir, { recursive: true, force: true })

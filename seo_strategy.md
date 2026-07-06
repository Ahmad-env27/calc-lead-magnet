# SEO Strategy

## In scope
- Public landing page at `/`
- Public client-side funnel paths exposed by the SPA shell: `/quiz`, `/unlock`, `/results`
- Static crawl files under `public/` (`robots.txt`, `sitemap.xml`)
- Social sharing and AI-crawler visibility for the public marketing experience

## Out of scope
- Internal API endpoints under `/api/**`
- Development-only tooling and diagnostics in `server/diagnose.js`
- Authenticated/internal surfaces (none found in this repo)

## Target audience
- UK DTC skincare and beauty brands
- Founders, marketers, and paid social operators evaluating Meta ad performance

## Primary keywords
- revenue leak calculator for skincare brands
- skincare Meta ads audit
- creative fatigue calculator
- Meta ad performance audit for skincare brands

## Notes
- The public experience is a single Vite + React SPA with a static HTML head and client-rendered body content.
- `/` is the intended canonical/indexable marketing URL.
- `/quiz`, `/unlock`, and `/results` are funnel states, not primary search landing pages.

## Dismissed categories
- None yet

import { renderToStaticMarkup } from 'react-dom/server'
import LandingA from './LandingA.jsx'

// Renders the default (variant A) landing page to static markup.
// Used only at build time to bake real, crawlable content into the
// initial HTML response for '/'. The client still takes over on load
// and may swap in variant B for the A/B test — this prerendered markup
// exists purely so crawlers (and the first paint) see real copy.
export function renderLanding() {
  return renderToStaticMarkup(<LandingA onStart={() => {}} />)
}

export function sendReport(answers, results, insights) {
  fetch('/api/send-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, results, insights }),
  }).catch(err => {
    console.warn('[REPORT] Send request failed:', err.message)
  })
}

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

export function fetchInsights(answers) {
  return fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
    .then((res) => {
      if (!res.ok) return null
      return res.json()
    })
    .then((data) => data?.insights || null)
    .catch(() => null)
}

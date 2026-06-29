export function captureUTMs() {
  const params = new URLSearchParams(window.location.search);
  const utms = {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
  };

  if (Object.values(utms).some(v => v)) {
    sessionStorage.setItem('audr_utms', JSON.stringify(utms));
  }

  return utms;
}

export function getStoredUTMs() {
  try {
    return JSON.parse(sessionStorage.getItem('audr_utms') || '{}');
  } catch {
    return {};
  }
}

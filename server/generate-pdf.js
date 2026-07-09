import PDFDocument from 'pdfkit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  getRiskBand, formatGBP, calculateSpendDecoder, AOV_MIDPOINTS,
  getRadarScores, DECAY_PARAMS, effectiveness, getCPAEscalation, roundForDisplay,
} from '../src/scoring.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGO_PATH = join(__dirname, '..', 'public', 'audr-logo.png')

const PAGE_W = 595.28
const PAGE_H = 841.89
const M = 40
const CW = PAGE_W - 2 * M

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  muted: '#94a3b8',
  faint: '#64748b',
  accent: '#3b82f6',
  border: '#334155',
  green: '#22c55e',
  amber: '#f59e0b',
  orange: '#f97316',
  red: '#ef4444',
  teal: '#2dd4bf',
  purple: '#a78bfa',
  white: '#ffffff',
}

const RISK_COLORS = { low: C.green, moderate: C.amber, high: C.orange, critical: C.red }

const FREQ_LABELS = {
  weekly: 'every week', every_2_3_weeks: 'every 2–3 weeks',
  monthly_or_less: 'monthly or less', only_when_drops: 'only when performance drops',
}
const DIVERSITY_LABELS = { yes_same: 'low', probably: 'limited', no_varied: 'high' }
const SPEND_LABELS = {
  under_10k: 'under £10k', '10k_30k': '£10k–£30k', '30k_50k': '£30k–£50k',
  '50k_100k': '£50k–£100k', '100k_plus': '£100k+',
}
const RADAR_LABELS = ['Pain / Problem', 'Transformation', 'Social Proof', 'Science / Ingredient', 'Founder Story']

function isAgencyOrFreelance(jt) { return jt === 'role_agency' || jt === 'role_freelance' }

function getHeadlineCopy(brand, jt) {
  if (isAgencyOrFreelance(jt)) return `Here's what ${brand}'s account is leaving on the table`
  if (jt === 'role_csuite') return `Here's where ${brand}'s competitive edge is leaking`
  if (['role_marketing', 'role_growth', 'role_ecom'].includes(jt))
    return "Here's where your paid performance is leaking"
  return `Here's what ${brand} is leaving on the table`
}

function getLaneIntro(jt) {
  if (isAgencyOrFreelance(jt))
    return "This calculator measures one of three levers for your client's account: meta optimisation. The other two, audience intelligence and the meta-signal stack, require a full audit to unlock."
  if (['role_marketing', 'role_growth', 'role_ecom'].includes(jt))
    return 'This calculator measures one of three performance levers: meta optimisation. The other two, audience intelligence and the meta-signal stack, require a full audit to unlock.'
  return 'This calculator measures one of three revenue levers: meta optimisation. The other two, audience intelligence and the meta-signal stack, require a full audit to unlock.'
}

function interpretation(answers, results) {
  const brand = answers.brandName || 'Your brand'
  const freq = FREQ_LABELS[answers.refreshRate]
  const div = DIVERSITY_LABELS[answers.angleDiversity]
  const spend = SPEND_LABELS[answers.spendTier]
  const band = getRiskBand(results.score).key
  if (band === 'low')
    return `Based on your answers, ${brand} is in relatively good shape. You're refreshing creatives ${freq} and running ${div} messaging diversity. But even well-optimised brands have blind spots, and your competitors may be closer than you think.`
  if (band === 'moderate')
    return `Your brand shows moderate signs of creative fatigue. Refreshing ${freq} with ${div} diversity means some of your spend is going toward messaging that's lost its edge. The opportunity below isn't a problem. It's upside you're not capturing yet.`
  if (band === 'high')
    return `${brand} is showing strong signs of ad fatigue. At ${spend} per month, a meaningful portion of your budget is leaking. The opportunity below is likely conservative.`
  return `Your answers suggest significant creative fatigue across your account. At ${spend} per month, the same messaging patterns are leaving the most on the table. The range below is the floor of what's recoverable, not the ceiling.`
}

// --- Drawing helpers ---

function fillBg(doc) {
  doc.save().rect(0, 0, PAGE_W, PAGE_H).fill(C.bg).restore()
}

function newPage(doc) {
  doc.addPage()
  fillBg(doc)
  return M
}

function ensureSpace(doc, needed, y) {
  return y + needed > PAGE_H - M ? newPage(doc) : y
}

function drawCard(doc, x, y, w, h, borderColor) {
  doc.save()
  doc.roundedRect(x, y, w, h, 6).fill(C.card)
  if (borderColor) doc.roundedRect(x, y, w, h, 6).lineWidth(1).strokeColor(borderColor).stroke()
  doc.restore()
}

function kicker(doc, text, y) {
  doc.fontSize(9).fillColor(C.accent).font('Helvetica-Bold')
  doc.text(text, M, y, { width: CW, characterSpacing: 1.5 })
  return y + 16
}

function divider(doc, y, inset) {
  const ins = inset || 0
  doc.save()
  doc.moveTo(M + ins, y).lineTo(PAGE_W - M - ins, y).lineWidth(0.5).strokeColor(C.border).stroke()
  doc.restore()
  return y + 16
}

// --- Sections ---

function drawHeader(doc, answers) {
  let y = M
  try { doc.image(LOGO_PATH, M, y, { width: 80 }) } catch { /* skip */ }
  y += 45

  doc.fontSize(22).fillColor(C.white).font('Helvetica-Bold')
  doc.text('Ad Fatigue Diagnostic Report', M, y, { width: CW })
  y += 30

  const brand = answers.brandName || 'Your brand'
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.fontSize(11).fillColor(C.muted).font('Helvetica')
  doc.text(`Prepared for ${brand}  ·  ${date}`, M, y, { width: CW })
  y += 8

  return divider(doc, y + 12) + 4
}

function drawGauge(doc, score, y) {
  y = ensureSpace(doc, 160, y)
  y = kicker(doc, 'YOUR AD FATIGUE RISK SCORE', y)

  const band = getRiskBand(score)
  const color = RISK_COLORS[band.key]
  const cx = PAGE_W / 2
  const cy = y + 80
  const r = 65

  doc.save().lineCap('round')
  doc.path(`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`)
    .lineWidth(10).strokeOpacity(0.3).strokeColor(C.border).stroke()
  doc.strokeOpacity(1)

  if (score > 0) {
    if (score >= 99) {
      doc.path(`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`)
        .lineWidth(10).strokeColor(color).stroke()
    } else {
      const a = (score / 100) * Math.PI
      const ex = (cx - r * Math.cos(a)).toFixed(1)
      const ey = (cy - r * Math.sin(a)).toFixed(1)
      doc.path(`M ${cx - r} ${cy} A ${r} ${r} 0 ${score > 50 ? 1 : 0} 1 ${ex} ${ey}`)
        .lineWidth(10).strokeColor(color).stroke()
    }
  }
  doc.restore()

  doc.fontSize(38).fillColor(color).font('Helvetica-Bold')
  doc.text(String(score), cx - 40, cy - 30, { width: 80, align: 'center' })
  doc.fontSize(12).fillColor(C.faint).font('Helvetica')
  doc.text('/100', cx - 25, cy + 8, { width: 50, align: 'center' })
  doc.fontSize(10).fillColor(color).font('Helvetica-Bold')
  doc.text(band.label.toUpperCase(), cx - 60, cy + 24, { width: 120, align: 'center', characterSpacing: 1 })

  return cy + 50
}

function drawInterpretation(doc, answers, results, y) {
  y += 8
  doc.fontSize(10).fillColor(C.muted).font('Helvetica')
  doc.text(interpretation(answers, results), M, y, { width: CW, lineGap: 3 })
  return doc.y + 20
}

function drawOpportunity(doc, answers, results, y) {
  const disqualified = (answers.frustrations || []).includes('none')
  const brand = answers.brandName || 'your brand'
  y = ensureSpace(doc, 120, y)

  if (disqualified) {
    y = kicker(doc, 'GOOD NEWS', y)
    drawCard(doc, M, y, CW, 60, C.green)
    doc.fontSize(10).fillColor(C.text).font('Helvetica')
    doc.text(
      `Your ads are holding up. Your refresh habits and messaging variety are doing their job. The patterns below are what brands like ${brand} protect to keep it that way.`,
      M + 16, y + 14, { width: CW - 32, lineGap: 3 },
    )
    return y + 70
  }

  y = kicker(doc, getHeadlineCopy(brand, answers.jobTitle).toUpperCase(), y)

  doc.fontSize(28).fillColor(C.accent).font('Helvetica-Bold')
  doc.text(`${formatGBP(results.leakLow)} – ${formatGBP(results.leakHigh)} / month`, M, y, { width: CW })
  y = doc.y + 10

  doc.fontSize(10).fillColor(C.muted).font('Helvetica')
  doc.text(
    `Based on your answers, that's an estimated ${formatGBP(results.annualLow)} – ${formatGBP(results.annualHigh)} a year that fresher, audience-driven ad messaging could capture for ${brand}.`,
    M, y, { width: CW, lineGap: 3 },
  )
  y = doc.y + 8

  const aovMid = answers.aov === 'aov_other' ? Number(answers.aovCustom) : (AOV_MIDPOINTS[answers.aov] || null)
  if (aovMid && aovMid > 0) {
    doc.text(
      `At your average order value, that's roughly ~${Math.round(results.leakLow / aovMid)}–${Math.round(results.leakHigh / aovMid)} orders a month your ads could be recovering.`,
      M, y, { width: CW, lineGap: 3 },
    )
    y = doc.y + 8
  }

  doc.text(`That's a ${results.impLow}–${results.impHigh}% improvement on your current ROAS.`, M, y, { width: CW })
  y = doc.y + 6

  if (results.strongROAS) {
    doc.text(
      'Returns over £4 usually mean your paid channel has more room to scale than it\'s being given. The opportunity here is headroom, not repair.',
      M, y, { width: CW, lineGap: 3 },
    )
    y = doc.y + 6
  }

  return y + 12
}

function drawThreeLane(doc, answers, results, y) {
  const disqualified = (answers.frustrations || []).includes('none')
  if (disqualified || !results.threeLane || results.leakLow < 200) return y

  const tl = results.threeLane
  const aovMid = answers.aov === 'aov_other' ? Number(answers.aovCustom) : (AOV_MIDPOINTS[answers.aov] || null)

  y = ensureSpace(doc, 200, y)
  doc.fontSize(10).fillColor(C.muted).font('Helvetica')
  doc.text(getLaneIntro(answers.jobTitle), M, y, { width: CW, lineGap: 3 })
  y = doc.y + 14

  y = kicker(doc, 'WHAT THE CALCULATOR COVERS TODAY', y)
  drawCard(doc, M, y, CW, 50, C.amber)
  doc.fontSize(11).fillColor(C.text).font('Helvetica-Bold')
  doc.text('Meta optimisation', M + 14, y + 10)
  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text('How you spend', M + 14, y + 24)
  doc.fontSize(11).fillColor(C.amber).font('Helvetica-Bold')
  doc.text(
    `~${formatGBP(roundForDisplay(tl.lane2.low))}–${formatGBP(roundForDisplay(tl.lane2.high))} / month`,
    PAGE_W - M - 200, y + 16, { width: 186, align: 'right' },
  )
  y += 62

  if (answers.aov && aovMid && aovMid > 0) {
    y = kicker(doc, 'SPEND DECODER', y)
    const sd = calculateSpendDecoder(results.recoverableMonthly, aovMid)
    doc.fontSize(22).fillColor(C.accent).font('Helvetica-Bold')
    doc.text(`~${sd.ordersPerMonth.toLocaleString('en-GB')}`, M, y)
    doc.fontSize(10).fillColor(C.muted).font('Helvetica')
    doc.text('orders a month your brand is leaving on the table', M + 4, y + 24, { width: CW - 8 })
    y += 48
    doc.fontSize(16).fillColor(C.text).font('Helvetica-Bold')
    doc.text(`~${sd.ordersPerYear.toLocaleString('en-GB')}`, M, y)
    doc.fontSize(10).fillColor(C.muted).font('Helvetica')
    doc.text(
      `orders a year, worth approximately ${formatGBP(sd.revenuePerYear)} in revenue your ads could be recovering`,
      M + 4, y + 18, { width: CW - 8 },
    )
    y += 44
    doc.fontSize(8).fillColor(C.faint).font('Helvetica')
    doc.text('Based on your average order value and the opportunity range above.', M + 4, y, { width: CW - 8 })
    y += 14
  }

  y = divider(doc, y, 40)
  y = kicker(doc, 'THE FULL PICTURE: ALL THREE LEVERS', y)
  y = ensureSpace(doc, 110, y)

  const cardW = (CW - 16) / 3
  const lanes = [
    { name: 'Audience intelligence', sub: 'Knowing what to say', range: tl.lane1, color: C.teal, badge: 'Requires audit' },
    { name: 'Meta optimisation', sub: 'How you spend', range: tl.lane2, color: C.amber, badge: 'Calculated' },
    { name: 'Meta-signal stack', sub: 'How Meta indexes your page', range: tl.lane3, color: C.purple, badge: 'Requires audit' },
  ]

  lanes.forEach((lane, i) => {
    const lx = M + i * (cardW + 8)
    drawCard(doc, lx, y, cardW, 90, lane.color)
    doc.fontSize(8).fillColor(lane.color).font('Helvetica-Bold')
    doc.text(lane.name, lx + 8, y + 8, { width: cardW - 16 })
    doc.fontSize(7).fillColor(C.faint).font('Helvetica')
    doc.text(lane.sub, lx + 8, y + 20, { width: cardW - 16 })
    doc.fontSize(9).fillColor(C.text).font('Helvetica-Bold')
    doc.text(
      `~${formatGBP(roundForDisplay(lane.range.low))}–${formatGBP(roundForDisplay(lane.range.high))} / mo`,
      lx + 8, y + 42, { width: cardW - 16 },
    )
    doc.fontSize(7).fillColor(C.faint).font('Helvetica')
    doc.text(lane.badge, lx + 8, y + 60, { width: cardW - 16 })
  })
  y += 104

  y = ensureSpace(doc, 80, y)
  const combinedH = (aovMid && aovMid > 0) ? 68 : 50
  drawCard(doc, M, y, CW, combinedH, C.green)
  doc.fontSize(11).fillColor(C.text).font('Helvetica-Bold')
  doc.text('Combined opportunity', M + 14, y + 8)
  doc.fontSize(14).fillColor(C.green).font('Helvetica-Bold')
  doc.text(
    `${formatGBP(roundForDisplay(tl.combined.low))}–${formatGBP(roundForDisplay(tl.combined.high))} / month`,
    M + 14, y + 26,
  )
  if (aovMid && aovMid > 0) {
    const ordLo = Math.round(tl.combined.low / aovMid)
    const ordHi = Math.round(tl.combined.high / aovMid)
    doc.fontSize(9).fillColor(C.muted).font('Helvetica')
    doc.text(
      `~ ${ordLo.toLocaleString('en-GB')}–${ordHi.toLocaleString('en-GB')} orders recovered monthly (at your AOV of ${formatGBP(aovMid)})`,
      M + 14, y + 46, { width: CW - 28 },
    )
  }
  y += combinedH + 12

  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text(`6-month projection: ~${formatGBP(roundForDisplay(tl.sixMonth.low))}–${formatGBP(roundForDisplay(tl.sixMonth.high))}`, M, y)
  y = doc.y + 4
  doc.text(`12–18 month target: ${formatGBP(roundForDisplay(tl.annualized.low))}–${formatGBP(roundForDisplay(tl.annualized.high))}+ annualised`, M, y)
  y = doc.y + 6
  doc.fontSize(8).fillColor(C.faint)
  doc.text('Audience intelligence and meta-signal stack estimated based on industry benchmarks. Requires full audit to confirm.', M, y, { width: CW, lineGap: 2 })
  return doc.y + 16
}

function drawCostOfInaction(doc, results, aovMid, y) {
  if (!results.costOfInaction) return y
  y = ensureSpace(doc, 80, y)

  const coi = results.costOfInaction
  doc.fontSize(14).fillColor(C.text).font('Helvetica-Bold')
  doc.text('If nothing changes in the next 90 days...', M, y, { width: CW })
  y += 24

  const hasOrders = coi.orders && coi.orders.low > 0
  const halfW = (CW - 12) / 2
  const revCardW = hasOrders ? halfW : CW

  drawCard(doc, M, y, revCardW, 50, C.red)
  doc.fontSize(16).fillColor(C.red).font('Helvetica-Bold')
  doc.text(`${formatGBP(roundForDisplay(coi.revenue.low))}–${formatGBP(roundForDisplay(coi.revenue.high))}`, M + 12, y + 8, { width: revCardW - 24 })
  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text('in preventable lost revenue', M + 12, y + 30, { width: revCardW - 24 })

  if (hasOrders) {
    drawCard(doc, M + halfW + 12, y, halfW, 50, C.red)
    doc.fontSize(16).fillColor(C.red).font('Helvetica-Bold')
    doc.text(`${coi.orders.low}–${coi.orders.high}`, M + halfW + 24, y + 8, { width: halfW - 24 })
    doc.fontSize(9).fillColor(C.muted).font('Helvetica')
    doc.text("orders that won't come back", M + halfW + 24, y + 30, { width: halfW - 24 })
  }

  return y + 65
}

function drawDecayCurve(doc, answers, results, y) {
  if (!answers.spendTier || !answers.refreshRate) return y
  const params = DECAY_PARAMS[answers.spendTier]?.[answers.refreshRate]
  if (!params) return y

  y = ensureSpace(doc, 200, y)
  y = kicker(doc, 'YOUR BUDGET EFFECTIVENESS CURVE', y)

  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text(
    'This shows how quickly your ad spend loses its impact without a creative refresh. The longer you run the same messaging, the harder your budget has to work for the same results.',
    M, y, { width: CW, lineGap: 2 },
  )
  y = doc.y + 12

  const { cliff, steepness, markerWeek } = params
  const markerEff = effectiveness(markerWeek, cliff, steepness)
  const weeksPastCliff = Math.max(0, markerWeek - cliff)
  const weeksToCliff = Math.max(0, cliff - markerWeek)
  const escalation = getCPAEscalation(weeksPastCliff)

  const labelW = 28
  const chartX = M + labelW, chartY = y, chartW = CW - labelW, chartH = 100
  const safeEnd = Math.max(0, cliff - 2)
  const warnEnd = cliff

  // Y-axis labels + grid lines
  for (const pct of [0, 25, 50, 75, 100]) {
    const ly = chartY + chartH - (pct / 100) * chartH
    doc.fontSize(7).fillColor(C.faint).font('Helvetica')
    doc.text(`${pct}%`, M, ly - 4, { width: labelW - 4, align: 'right' })
    doc.save()
    doc.moveTo(chartX, ly).lineTo(chartX + chartW, ly).lineWidth(0.3).strokeColor(C.border).stroke()
    doc.restore()
  }

  // Colored zones
  doc.save()
  doc.fillOpacity(0.08)
  doc.rect(chartX, chartY, (safeEnd / 12) * chartW, chartH).fill(C.green)
  doc.rect(chartX + (safeEnd / 12) * chartW, chartY, ((warnEnd - safeEnd) / 12) * chartW, chartH).fill(C.amber)
  doc.rect(chartX + (warnEnd / 12) * chartW, chartY, ((12 - warnEnd) / 12) * chartW, chartH).fill(C.red)
  doc.fillOpacity(1)
  doc.restore()

  const px = (w) => chartX + (w / 12) * chartW
  const py = (eff) => chartY + chartH - (eff / 100) * chartH

  // Curve line
  const first = { x: px(0), y: py(effectiveness(0, cliff, steepness)) }
  doc.moveTo(first.x, first.y)
  for (let w = 0.2; w <= 12; w += 0.2) {
    doc.lineTo(px(w), py(effectiveness(w, cliff, steepness)))
  }
  doc.lineWidth(2).strokeColor(C.accent).stroke()

  // Cliff marker
  if (cliff <= 12) {
    doc.save()
    doc.moveTo(px(cliff), chartY).lineTo(px(cliff), chartY + chartH)
    doc.lineWidth(0.5).strokeColor(C.red).dash(3, { space: 3 }).stroke()
    doc.undash().restore()
    doc.fontSize(7).fillColor(C.red).font('Helvetica')
    doc.text('fatigue cliff', px(cliff) + 3, chartY + 3)
  }

  // Marker dot + pill label
  const mx = px(markerWeek), my = py(markerEff)
  doc.save()
  doc.moveTo(mx, chartY + chartH).lineTo(mx, my)
  doc.lineWidth(0.5).strokeColor(C.accent).dash(3, { space: 3 }).stroke()
  doc.undash().restore()
  doc.circle(mx, my, 4).fill(C.accent)

  const pillW = 68, pillH = 16
  const pillX = Math.min(Math.max(mx - pillW / 2, chartX), chartX + chartW - pillW)
  const pillY = my - pillH - 8
  doc.save()
  doc.roundedRect(pillX, pillY, pillW, pillH, 4).fill(C.card)
  doc.roundedRect(pillX, pillY, pillW, pillH, 4).lineWidth(0.5).strokeColor(C.accent).stroke()
  doc.restore()
  doc.fontSize(8).fillColor(C.accent).font('Helvetica-Bold')
  doc.text(`${markerEff}% effective`, pillX, pillY + 4, { width: pillW, align: 'center' })

  // Week labels
  doc.fontSize(7).fillColor(C.faint).font('Helvetica')
  for (let w = 0; w <= 12; w += 2) {
    doc.text(`W${w}`, px(w) - 8, chartY + chartH + 4, { width: 16, align: 'center' })
  }

  y = chartY + chartH + 18

  // Cadence caption
  const FREQ_SHORT = {
    weekly: 'weekly', every_2_3_weeks: 'bi-weekly',
    monthly_or_less: 'monthly', only_when_drops: 'reactive',
  }
  doc.fontSize(8).fillColor(C.faint).font('Helvetica')
  doc.text(
    `Your ${FREQ_SHORT[answers.refreshRate] || ''} refresh cadence places you here on the curve`,
    M, y, { width: CW, align: 'center' },
  )
  y += 16

  // Zone legend
  y = ensureSpace(doc, 55, y)
  const zoneW = (CW - 16) / 3
  const zones = [
    { title: 'Safe zone', color: C.green, weeks: `Weeks 1–${Math.max(1, Math.round(safeEnd))}`, detail: 'CPA within 10–15%' },
    { title: 'Warning zone', color: C.amber, weeks: `Weeks ${Math.max(1, Math.round(safeEnd))}–${Math.round(warnEnd)}`, detail: 'CPA up 20–50%, refresh window closing' },
    { title: 'Fatigue cliff', color: C.red, weeks: `Weeks ${Math.round(warnEnd)}+`, detail: 'CPA doubles or worse, burning budget' },
  ]
  zones.forEach((z, i) => {
    const zx = M + i * (zoneW + 8)
    doc.fontSize(8).fillColor(z.color).font('Helvetica-Bold')
    doc.text(z.title, zx, y, { width: zoneW })
    doc.fontSize(7).fillColor(C.faint).font('Helvetica')
    doc.text(z.weeks, zx, y + 11, { width: zoneW })
    doc.fontSize(7).fillColor(C.muted).font('Helvetica')
    doc.text(z.detail, zx, y + 22, { width: zoneW, lineGap: 1 })
  })
  y += 42

  // Status text
  let statusColor = C.green
  let statusText = ''
  if (weeksToCliff > 0.5) {
    statusText = `You're ~${Math.round(weeksToCliff)} weeks from your fatigue cliff. Budget effectiveness still at ${markerEff}%. Refresh now to stay safe.`
  } else if (weeksPastCliff <= 0.5) {
    statusColor = C.amber
    statusText = `You're at your fatigue cliff right now. Performance has dropped to ${markerEff}% and is about to fall fast.`
  } else {
    statusColor = C.red
    statusText = `You passed your cliff ~${Math.round(weeksPastCliff)} weeks ago. Roughly ${100 - markerEff}% of your ad budget is underperforming. Every week of inaction deepens the bleed.`
  }

  doc.fontSize(9).fillColor(statusColor).font('Helvetica')
  doc.text(statusText, M, y, { width: CW, lineGap: 2 })
  y = doc.y + 6

  // Escalation
  if (escalation && weeksPastCliff > 0.5) {
    doc.fontSize(9).fillColor(C.muted)
    doc.text(`Based on your refresh cadence, your cost per acquisition has likely increased ${escalation.low}–${escalation.high}% since your cliff.`, M, y, { width: CW })
    y = doc.y + 6
  }

  // Revenue context
  if (results.leakLow && results.leakHigh && weeksPastCliff > 0.5) {
    doc.fontSize(9).fillColor(C.muted)
    doc.text(
      `At your revenue level, this effectiveness drop represents approximately ${formatGBP(Math.round(results.leakLow * (1 - markerEff / 100)))}–${formatGBP(Math.round(results.leakHigh * (1 - markerEff / 100)))} in monthly revenue left on the table.`,
      M, y, { width: CW, lineGap: 2 },
    )
    y = doc.y + 6
  }

  // Takeaway
  doc.fontSize(9).fillColor(C.muted)
  doc.text(
    `Refreshing within ${Math.max(1, Math.round(safeEnd))} weeks keeps your CPA stable. Beyond week ${Math.round(cliff)}, performance drops fast and compounds.`,
    M, y, { width: CW, lineGap: 2 },
  )

  return doc.y + 16
}

function drawRadar(doc, answers, y) {
  if ((answers.frustrations || []).includes('none')) return y
  y = ensureSpace(doc, 280, y)
  y = kicker(doc, 'YOUR CREATIVE ANGLE COVERAGE', y)

  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text(
    'This maps how many distinct messaging angles your ads cover. Brands in similar tiers to yours should ideally hit the green benchmark. The yellow coverage is estimated from similar brands and your quiz answers. A full audit is needed to map this properly.',
    M, y, { width: CW, lineGap: 2 },
  )
  y = doc.y + 10

  const { scores, benchmark } = getRadarScores(answers.brandType, answers.angleDiversity)
  const N = 5, cx = PAGE_W / 2, cy = y + 100, r = 80
  const ang = (i) => (Math.PI * 2 * i) / N - Math.PI / 2
  const ptx = (i, pct) => cx + r * (pct / 100) * Math.cos(ang(i))
  const pty = (i, pct) => cy + r * (pct / 100) * Math.sin(ang(i))

  // Grid rings
  for (const ring of [25, 50, 75, 100]) {
    doc.moveTo(ptx(0, ring), pty(0, ring))
    for (let i = 1; i < N; i++) doc.lineTo(ptx(i, ring), pty(i, ring))
    doc.closePath().lineWidth(ring === 50 ? 0.6 : 0.3).strokeColor(C.border).stroke()
  }
  for (let i = 0; i < N; i++) {
    doc.moveTo(cx, cy).lineTo(ptx(i, 100), pty(i, 100))
    doc.lineWidth(0.3).strokeColor(C.border).stroke()
  }

  // Benchmark polygon
  doc.save()
  doc.moveTo(ptx(0, benchmark[0]), pty(0, benchmark[0]))
  for (let i = 1; i < N; i++) doc.lineTo(ptx(i, benchmark[i]), pty(i, benchmark[i]))
  doc.closePath().lineWidth(1).dash(3, { space: 3 }).strokeColor(C.green).stroke()
  doc.undash().restore()

  // User polygon fill
  doc.save().fillOpacity(0.15)
  doc.moveTo(ptx(0, scores[0]), pty(0, scores[0]))
  for (let i = 1; i < N; i++) doc.lineTo(ptx(i, scores[i]), pty(i, scores[i]))
  doc.closePath().fill(C.amber)
  doc.restore()
  // User polygon stroke
  doc.moveTo(ptx(0, scores[0]), pty(0, scores[0]))
  for (let i = 1; i < N; i++) doc.lineTo(ptx(i, scores[i]), pty(i, scores[i]))
  doc.closePath().lineWidth(2).strokeColor(C.amber).stroke()

  // Dots + percentage labels + axis labels
  for (let i = 0; i < N; i++) {
    const dx = ptx(i, scores[i])
    const dy = pty(i, scores[i])
    doc.circle(dx, dy, 3).fill(C.amber)

    // Percentage label offset outward from data point
    const offX = Math.cos(ang(i)) * 14
    const offY = Math.sin(ang(i)) * 14
    doc.fontSize(7).fillColor(C.amber).font('Helvetica-Bold')
    doc.text(`${scores[i]}%`, dx + offX - 14, dy + offY - 4, { width: 28, align: 'center' })

    // Axis label
    const lx = cx + (r + 18) * Math.cos(ang(i))
    const ly = cy + (r + 18) * Math.sin(ang(i))
    doc.fontSize(7).fillColor(C.muted).font('Helvetica')
    doc.text(RADAR_LABELS[i], lx - 40, ly - 4, { width: 80, align: 'center' })
  }

  y = cy + r + 30

  // Legend
  doc.circle(M + 4, y, 3).fill(C.amber)
  doc.fontSize(8).fillColor(C.muted).font('Helvetica')
  doc.text('Your estimated coverage', M + 12, y - 4)
  doc.save()
  doc.circle(M + CW / 2 + 4, y, 3).lineWidth(1).dash(2, { space: 2 }).strokeColor(C.green).stroke()
  doc.undash().restore()
  doc.text('Top-performing benchmark', M + CW / 2 + 12, y - 4)
  y += 14

  // Insights
  const weakest = scores.reduce((min, s, i) => s < min.v ? { v: s, l: RADAR_LABELS[i] } : min, { v: 100, l: '' })
  const strongest = scores.reduce((max, s, i) => s > max.v ? { v: s, l: RADAR_LABELS[i] } : max, { v: 0, l: '' })
  const aboveFifty = scores.filter(s => s > 50).length

  doc.fontSize(9).fillColor(C.text).font('Helvetica')
  doc.text(`Biggest gap: ${weakest.l} (${weakest.v}%). This is likely your next creative brief.`, M, y, { width: CW })
  y = doc.y + 4
  if (strongest.l !== weakest.l) {
    doc.text(`Your strongest signal is ${strongest.l} (${strongest.v}%).`, M, y, { width: CW })
    y = doc.y + 4
  }
  doc.text(`Your coverage: ${aboveFifty} of 5 angles above 50%. Best-in-class: 4 of 5.`, M, y, { width: CW })
  return doc.y + 16
}

function drawDiagnosis(doc, insights, brandName, y) {
  if (!insights || !insights.whats_working) return y
  y = ensureSpace(doc, 100, y)

  doc.fontSize(14).fillColor(C.text).font('Helvetica-Bold')
  doc.text(`What this means for ${brandName || 'your brand'}`, M, y, { width: CW })
  y += 22

  const cards = [
    { key: 'whats_working', label: "What's working", color: C.green },
    { key: 'the_leak', label: 'Where the leak is', color: C.amber },
    { key: 'missing_angle', label: "The angle you're missing", color: C.accent },
    { key: 'test_brief', label: 'Test this week', color: C.purple },
  ]

  for (const card of cards) {
    const text = insights[card.key]
    if (!text) continue
    y = ensureSpace(doc, 70, y)

    doc.font('Helvetica')
    const textH = doc.heightOfString(text, { width: CW - 44, fontSize: 9 })
    const cardH = Math.max(50, textH + 36)
    drawCard(doc, M, y, CW, cardH, card.color)

    doc.fontSize(10).fillColor(card.color).font('Helvetica-Bold')
    doc.text(card.label, M + 14, y + 10, { width: CW - 28 })
    doc.fontSize(9).fillColor(C.text).font('Helvetica')
    doc.text(text, M + 14, y + 26, { width: CW - 28, lineGap: 3 })
    y += cardH + 10
  }

  return y
}

// --- New sections: Facts CTA, Credit Stack, Loom Card, How It Works ---

function drawFactsCTA(doc, y) {
  y = ensureSpace(doc, 90, y)
  drawCard(doc, M, y, CW, 78)
  doc.fontSize(14).fillColor(C.white).font('Helvetica-Bold')
  doc.text('Get all of the facts', M + 14, y + 10, { width: CW - 28, align: 'center' })
  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text(
    'Schedule your FREE custom Loom teardown to get all the details.',
    M + 30, y + 30, { width: CW - 60, align: 'center' },
  )
  doc.text(
    'Absolutely no commitment; just all the actions you need to improve your ROAS.',
    M + 30, doc.y + 4, { width: CW - 60, align: 'center' },
  )
  return y + 90
}

function drawCreditStack(doc, isHot, y) {
  y = ensureSpace(doc, 160, y)

  doc.fontSize(20).fillColor(C.accent).font('Helvetica-Bold')
  doc.text("You've Got £847 to Spend", M, y, { width: CW, align: 'center' })
  y = doc.y + 16

  const items = [
    { unlocked: true, name: 'Audience Precision System', price: '£47', status: 'FREE', statusColor: C.green },
    { unlocked: true, name: 'Atomic Audience & Ad Audit', price: '£403', status: 'FREE', statusColor: C.green },
    { unlocked: false, name: 'Meta-signal Stack Guide', price: '£397', status: isHot ? 'WAIVED' : 'IN AUDIT', statusColor: isHot ? C.amber : C.faint },
  ]

  const stackH = 14 + items.length * 22 + 24
  drawCard(doc, M, y, CW, stackH)
  doc.fontSize(11).fillColor(C.text).font('Helvetica-Bold')
  doc.text("You've unlocked diagnostic credit", M + 14, y + 10, { width: CW - 28 })
  let iy = y + 30

  items.forEach((item) => {
    const dotColor = item.unlocked ? C.green : C.faint
    doc.circle(M + 22, iy + 4, 3).fill(dotColor)
    doc.fontSize(10).fillColor(C.text).font('Helvetica')
    doc.text(item.name, M + 32, iy, { width: CW - 150 })
    doc.fontSize(9).fillColor(C.faint).font('Helvetica')
    doc.text(item.price, PAGE_W - M - 82, iy, { width: 30, align: 'right', strike: true })
    doc.fontSize(9).fillColor(item.statusColor).font('Helvetica-Bold')
    doc.text(item.status, PAGE_W - M - 48, iy, { width: 46 })
    iy += 22
  })

  doc.fontSize(10).fillColor(C.accent).font('Helvetica')
  doc.text('£847 in diagnostic credit, yours free.', M + 14, iy, { width: CW - 28, align: 'center' })

  return y + stackH + 16
}

function drawLoomCard(doc, answers, y) {
  y = ensureSpace(doc, 200, y)
  const brand = answers.brandName || 'your brand'

  doc.fontSize(14).fillColor(C.text).font('Helvetica-Bold')
  doc.text('Want the full picture?', M, y, { width: CW })
  y += 22

  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text(
    `We'll prepare a personalised Loom teardown for ${brand}: a 5-minute video plus a 30-minute free consultation. It includes:`,
    M, y, { width: CW, lineGap: 2 },
  )
  y = doc.y + 10

  const deliverables = [
    "Your competitor messaging analysis: what brands in your lane are saying that you're not",
    "Your top 3 competitors run through our Spend Decoder: what they're spending and how hard they're testing",
    'A concrete plan for your next creative batch',
  ]

  deliverables.forEach((d) => {
    doc.fontSize(9).fillColor(C.muted).font('Helvetica')
    doc.text(`— ${d}`, M + 8, y, { width: CW - 16, lineGap: 2 })
    y = doc.y + 6
  })

  y += 4
  const angleNums = ['04', '05']
  angleNums.forEach((num) => {
    y = ensureSpace(doc, 30, y)
    drawCard(doc, M, y, CW, 24, C.border)
    doc.fontSize(8).fillColor(C.accent).font('Helvetica-Bold')
    doc.text(num, M + 10, y + 7, { width: 20 })
    doc.fontSize(9).fillColor(C.faint).font('Helvetica')
    doc.text('Angle held back for your walkthrough', M + 34, y + 7, { width: CW - 130 })
    doc.fontSize(7).fillColor(C.faint).font('Helvetica-Bold')
    doc.text('IN TEARDOWN', PAGE_W - M - 78, y + 8, { width: 64, align: 'right', characterSpacing: 0.5 })
    y += 30
  })

  doc.fontSize(9).fillColor(C.text).font('Helvetica-Bold')
  doc.text('The insights are yours whether we work together or not.', M, y, { width: CW })
  y = doc.y + 8

  doc.fontSize(8).fillColor(C.faint).font('Helvetica')
  doc.text('Prepared within 48 hours of booking. We review every teardown with a human strategist, not just AI.', M, y, { width: CW, lineGap: 2 })

  return doc.y + 16
}

function drawHowItWorks(doc, y) {
  y = ensureSpace(doc, 180, y)

  doc.fontSize(14).fillColor(C.text).font('Helvetica-Bold')
  doc.text('How it works', M, y, { width: CW })
  y += 22

  const steps = [
    { num: '1', title: 'Book a time', desc: "Pick a 30-minute slot. We'll confirm within 2 hours." },
    { num: '2', title: 'We build your teardown', desc: "Our team analyses your ad account, competitor landscape, and audience data using Audr. You'll get a personalised Loom video within 48 hours." },
    { num: '3', title: 'Watch, ask, decide', desc: 'Free consultation. We walk through the findings and build an action plan together. No obligation.' },
  ]

  steps.forEach((step) => {
    y = ensureSpace(doc, 44, y)
    doc.save()
    doc.roundedRect(M, y, 20, 20, 4).lineWidth(0.5).strokeColor(C.border).stroke()
    doc.restore()
    doc.fontSize(10).fillColor(C.text).font('Helvetica-Bold')
    doc.text(step.num, M, y + 5, { width: 20, align: 'center' })
    doc.fontSize(10).fillColor(C.text).font('Helvetica-Bold')
    doc.text(step.title, M + 28, y, { width: CW - 28 })
    doc.fontSize(9).fillColor(C.muted).font('Helvetica')
    doc.text(step.desc, M + 28, doc.y + 2, { width: CW - 28, lineGap: 2 })
    y = doc.y + 12
  })

  doc.fontSize(9).fillColor(C.muted).font('Helvetica')
  doc.text(
    "Worth saying: this compounds. As the messaging improves month over month, each cycle builds on the last. That's the conversation worth having.",
    M, y, { width: CW, lineGap: 2 },
  )

  return doc.y + 16
}

// --- CTA ---

function drawCTA(doc, isHot, y) {
  y = ensureSpace(doc, 150, y)
  y = divider(doc, y, 60) + 8

  doc.fontSize(18).fillColor(C.white).font('Helvetica-Bold')
  doc.text(isHot ? 'Ready to see the full picture?' : 'Want to dig deeper?', M, y, { width: CW, align: 'center' })
  y += 28

  const ctaBody = isHot
    ? "Schedule your free custom Loom teardown to get all the details. We'll prepare a personalised video walkthrough of your account, plus a 30-minute consultation. Absolutely no commitment."
    : "When you're ready to turn these insights into action, book a free consultation. We'll walk through your results and build a plan together."
  doc.fontSize(10).fillColor(C.muted).font('Helvetica')
  doc.text(ctaBody, M + 30, y, { width: CW - 60, align: 'center', lineGap: 3 })
  y = doc.y + 16

  const btnW = 220, btnH = 36, btnX = (PAGE_W - btnW) / 2
  const ctaUrl = 'https://www.growth.audr.app/the-offer?utm_source=calc&utm_content=pdf_report'
  doc.save()
  doc.roundedRect(btnX, y, btnW, btnH, 6).fill(C.accent)
  doc.restore()
  doc.fontSize(11).fillColor(C.white).font('Helvetica-Bold')
  doc.text('Book Your Free Consultation', btnX, y + 11, { width: btnW, align: 'center', link: ctaUrl })
  y += btnH + 12

  doc.fontSize(8).fillColor(C.faint).font('Helvetica')
  doc.text('growth.audr.app/the-offer', M, y, { width: CW, align: 'center', link: ctaUrl })
  y += 24
  doc.text('Powered by Audr audience intelligence + human creative strategists', M, y, { width: CW, align: 'center' })
  return y + 20
}

// --- Main ---

export async function generatePdf(answers, results, insights) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: M,
      info: {
        Title: `Ad Fatigue Diagnostic Report — ${answers.brandName || 'Your Brand'}`,
        Author: 'Audr',
      },
    })

    const chunks = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    fillBg(doc)
    let y = drawHeader(doc, answers)
    y = drawGauge(doc, results.score, y)
    y = drawInterpretation(doc, answers, results, y)

    const temp = results.temperature
    const isHot = temp === 'super_hot' || temp === 'hot'
    const isCold = temp === 'cold'
    const disqualified = (answers.frustrations || []).includes('none')

    if (isHot) y = drawFactsCTA(doc, y)

    y = drawOpportunity(doc, answers, results, y)

    if (!disqualified) {
      y = drawThreeLane(doc, answers, results, y)
      if (isHot) y = drawFactsCTA(doc, y)

      const aovMid = answers.aov === 'aov_other' ? Number(answers.aovCustom) : (AOV_MIDPOINTS[answers.aov] || null)
      y = drawCostOfInaction(doc, results, aovMid, y)
      y = drawDecayCurve(doc, answers, results, y)
      y = drawRadar(doc, answers, y)
    }

    y = drawDiagnosis(doc, insights, answers.brandName, y)

    if (!isCold && !disqualified) {
      y = drawCreditStack(doc, isHot, y)
    }

    if (isHot) {
      y = drawLoomCard(doc, answers, y)
      y = drawHowItWorks(doc, y)
    }

    drawCTA(doc, isHot, y)

    doc.end()
  })
}

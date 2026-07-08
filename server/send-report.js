import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReportEmail(answers, pdfBuffer, pdfUrl) {
  const from = process.env.EMAIL_FROM || 'report@audr.app'
  const to = answers.email
  const brand = answers.brandName || 'your brand'
  const firstName = (answers.name || '').split(' ')[0] || 'there'

  const subject = `Your Ad Fatigue Diagnostic Report — ${brand}`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1e293b;">
      <p style="font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Your personalised Ad Fatigue Diagnostic Report for <strong>${brand}</strong> is ${pdfUrl ? 'ready' : 'attached'}.
      </p>
      ${pdfUrl ? `<a href="${pdfUrl}"
         style="display: inline-block; background: #1e293b; color: #f1f5f9; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 0 16px; border: 1px solid #334155;">
        Download Your Report (PDF)
      </a>` : ''}
      <p style="font-size: 15px; line-height: 1.6;">
        Inside you'll find your fatigue risk score, revenue opportunity breakdown,
        creative angle coverage, and personalised recommendations.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Ready to turn these insights into action?
      </p>
      <a href="https://www.growth.audr.app/the-offer?utm_source=calc&utm_content=report_email"
         style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 0 16px;">
        Book Your Free Consultation
      </a>
      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
        — The Audr Team
      </p>
    </div>
  `

  try {
    const emailOpts = {
      from: `Audr <${from}>`,
      to: [to],
      subject,
      html,
    }
    if (!pdfUrl && pdfBuffer) {
      emailOpts.attachments = [{
        filename: `${brand.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-')}-ad-fatigue-report.pdf`,
        content: pdfBuffer,
      }]
    }

    const { data, error } = await resend.emails.send(emailOpts)

    if (error) {
      console.error('[REPORT] Resend error:', error)
      return false
    }
    console.log('[REPORT] Email sent:', data?.id, 'to:', to)
    return true
  } catch (err) {
    console.error('[REPORT] Send failed:', err.message)
    return false
  }
}

import 'server-only'
import { Resend } from 'resend'
import type { ReactElement } from 'react'

export const resend = new Resend(process.env['RESEND_API_KEY']!)

const FROM = 'KILLERCLO <no-reply@killerclo.com>'
const REPLY_TO = 'hola@killerclo.com'

type SendEmailParams = {
  to: string | string[]
  subject: string
  react: ReactElement
  tags?: Array<{ name: string; value: string }>
}

type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      reply_to: REPLY_TO,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      react: params.react,
      tags: params.tags,
    })

    if (error) {
      console.error('[Resend] Send error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data?.id ?? 'unknown' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Resend] Exception:', message)
    return { ok: false, error: message }
  }
}

/**
 * Sends a broadcast email to a list of subscribers.
 * Resend batch API — max 100 recipients per call.
 */
export async function sendBroadcast(params: {
  recipients: string[]
  subject: string
  react: ReactElement
}): Promise<{ ok: true; sent: number } | { ok: false; error: string }> {
  const BATCH_SIZE = 100
  const { recipients, subject, react } = params
  let totalSent = 0

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)

    try {
      const { error } = await resend.batch.send(
        batch.map((email) => ({
          from: FROM,
          reply_to: REPLY_TO,
          to: [email],
          subject,
          react,
          tags: [{ name: 'type', value: 'broadcast' }],
        })),
      )

      if (error) {
        console.error('[Resend] Batch error:', error)
        return { ok: false, error: error.message }
      }

      totalSent += batch.length
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { ok: false, error: message }
    }
  }

  return { ok: true, sent: totalSent }
}

import 'server-only'

const WA_API_VERSION = 'v20.0'
const WA_API_BASE = `https://graph.facebook.com/${WA_API_VERSION}`

type TemplateLanguage = 'es_ES' | 'es' | 'en_US'

type TemplateComponent = {
  type: 'header' | 'body' | 'button'
  sub_type?: 'quick_reply' | 'url'
  index?: number
  parameters: Array<{ type: 'text'; text: string }>
}

type SendTemplateParams = {
  to: string
  templateName: string
  language?: TemplateLanguage
  components?: TemplateComponent[]
}

type WhatsAppApiResponse = {
  messaging_product: string
  contacts: Array<{ input: string; wa_id: string }>
  messages: Array<{ id: string; message_status?: string }>
}

async function sendTemplate({
  to,
  templateName,
  language = 'es_ES',
  components = [],
}: SendTemplateParams): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  const phoneId = process.env['WHATSAPP_PHONE_ID']
  const token = process.env['WHATSAPP_TOKEN']

  if (!phoneId || !token) {
    console.error('[WhatsApp] Missing WHATSAPP_PHONE_ID or WHATSAPP_TOKEN')
    return { ok: false, error: 'WhatsApp not configured.' }
  }

  // Normalize to E.164 without +
  const normalizedTo = to.replace(/\D/g, '')

  const body = {
    messaging_product: 'whatsapp',
    to: normalizedTo,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      ...(components.length > 0 ? { components } : {}),
    },
  }

  try {
    const res = await fetch(`${WA_API_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[WhatsApp] API error:', res.status, errText)
      return { ok: false, error: `WhatsApp API ${res.status}: ${errText}` }
    }

    const data = (await res.json()) as WhatsAppApiResponse
    const messageId = data.messages[0]?.id ?? 'unknown'
    return { ok: true, messageId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WhatsApp] Fetch error:', message)
    return { ok: false, error: message }
  }
}

// ─── TYPED TEMPLATE FUNCTIONS ────────────────────────────────────────────────

/**
 * Notifies the admin of a new paid order.
 * Template: "nuevo_pedido_admin"
 * Body variables: {{1}} order_number · {{2}} total · {{3}} items_count
 */
export async function notifyAdminNewOrder(params: {
  orderNumber: string
  totalFormatted: string
  itemsCount: number
}) {
  const adminNumber = process.env['WHATSAPP_ADMIN_NUMBER']
  if (!adminNumber) return

  await sendTemplate({
    to: adminNumber,
    templateName: 'nuevo_pedido_admin',
    language: 'es_ES',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.orderNumber },
          { type: 'text', text: params.totalFormatted },
          { type: 'text', text: String(params.itemsCount) },
        ],
      },
    ],
  })
}

/**
 * Notifies the customer that their order shipped.
 * Template: "pedido_enviado_cliente"
 * Body variables: {{1}} order_number · {{2}} tracking_url
 * Only sent if the customer has whatsapp_consent = true.
 */
export async function notifyCustomerShipped(params: {
  customerPhone: string
  orderNumber: string
  trackingUrl: string
  hasWhatsappConsent: boolean
}) {
  if (!params.hasWhatsappConsent) return

  await sendTemplate({
    to: params.customerPhone,
    templateName: 'pedido_enviado_cliente',
    language: 'es_ES',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.orderNumber },
          { type: 'text', text: params.trackingUrl },
        ],
      },
    ],
  })
}

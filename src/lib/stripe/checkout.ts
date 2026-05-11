import 'server-only'
import { stripe } from './client'
import type Stripe from 'stripe'
import type { CartItem } from '@/lib/cart/store'

// Free shipping threshold in cents
const FREE_SHIPPING_THRESHOLD_CENTS = 6000 // €60.00

export type CreateCheckoutParams = {
  items: CartItem[]
  customerEmail?: string
  userId?: string
  successUrl: string
  cancelUrl: string
}

export type CheckoutResult =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error: string }

export async function createCheckoutSession(
  params: CreateCheckoutParams,
): Promise<CheckoutResult> {
  const { items, customerEmail, userId, successUrl, cancelUrl } = params

  if (items.length === 0) {
    return { ok: false, error: 'El carrito está vacío.' }
  }

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  )

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: item.priceCents,
        product_data: {
          name: item.name,
          description: item.variantLabel,
          images: item.imageUrl ? [item.imageUrl] : [],
          // Stored in metadata so the webhook can map back to our variant
          metadata: {
            variant_id: item.variantId,
            product_id: item.productId,
            sku: item.sku,
          },
        },
      },
    }),
  )

  const shippingOptions = buildShippingOptions(subtotalCents)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      currency: 'eur',

      line_items: lineItems,

      // Spanish payment methods
      payment_method_types: ['card', 'paypal', 'sepa_debit', 'klarna'],

      // Tax (requires Stripe Tax activated in dashboard)
      automatic_tax: { enabled: true },

      // Shipping
      shipping_address_collection: {
        allowed_countries: ['ES', 'PT', 'FR', 'IT', 'DE', 'AD', 'GB'],
      },
      shipping_options: shippingOptions,

      // Customer
      customer_email: customerEmail,

      // Billing address (needed for tax calculation)
      billing_address_collection: 'auto',

      // Phone number for shipping updates
      phone_number_collection: { enabled: true },

      // URLs
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,

      // Metadata for webhook processing
      metadata: {
        user_id: userId ?? '',
        items_count: String(items.length),
        subtotal_cents: String(subtotalCents),
      },

      // Allow promotion codes
      allow_promotion_codes: true,
    })

    if (!session.url) {
      return { ok: false, error: 'Stripe no devolvió URL de pago.' }
    }

    return { ok: true, url: session.url, sessionId: session.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido en Stripe.'
    return { ok: false, error: message }
  }
}

function buildShippingOptions(
  subtotalCents: number,
): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const standardIsFree = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS

  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: standardIsFree ? 0 : 499,
          currency: 'eur',
        },
        display_name: standardIsFree
          ? 'Envío estándar — GRATIS'
          : 'Envío estándar (3-5 días hábiles)',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 3 },
          maximum: { unit: 'business_day', value: 5 },
        },
        tax_behavior: 'inclusive',
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 999, currency: 'eur' },
        display_name: 'Envío express (24-48h)',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 1 },
          maximum: { unit: 'business_day', value: 2 },
        },
        tax_behavior: 'inclusive',
      },
    },
  ]
}

/** Verify and parse an incoming Stripe webhook event. */
export function constructStripeEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const secret = process.env['STRIPE_WEBHOOK_SECRET']!
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

/** Retrieve a completed checkout session with line items and product metadata expanded. */
export async function getCompletedSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: [
      'line_items.data.price.product',
      'shipping_cost.shipping_rate',
      'customer_details',
    ],
  })
}

/** Issue a full or partial refund for a payment intent. */
export async function refundPaymentIntent(
  paymentIntentId: string,
  amountCents?: number,
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents !== undefined ? { amount: amountCents } : {}),
    reason: 'requested_by_customer',
  })
}

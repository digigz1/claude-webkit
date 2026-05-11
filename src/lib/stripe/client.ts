import 'server-only'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
  appInfo: {
    name: 'KILLERCLO',
    version: '1.0.0',
    url: process.env['NEXT_PUBLIC_SITE_URL'],
  },
})

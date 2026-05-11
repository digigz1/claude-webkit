import 'server-only'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

const ORDER_NUMBER_REGEX = /^KLR-\d{4}-\d{4}$/

/**
 * Generates the next order number by calling the PostgreSQL sequence function.
 * Format: "KLR-2026-0001"
 *
 * Uses the database sequence to guarantee uniqueness across concurrent requests.
 */
export async function generateOrderNumber(): Promise<string> {
  const result = await db.execute(
    sql`SELECT generate_order_number() AS order_number`,
  )

  const row = result.rows[0] as Record<string, unknown>
  const orderNumber = row['order_number']

  if (typeof orderNumber !== 'string') {
    throw new Error('generate_order_number() returned unexpected type')
  }

  return orderNumber
}

/**
 * Validates that a string matches the KLR-YYYY-NNNN format.
 */
export function isValidOrderNumber(value: string): boolean {
  return ORDER_NUMBER_REGEX.test(value)
}

/**
 * Extracts the year from an order number.
 * "KLR-2026-0042" → 2026
 */
export function extractOrderYear(orderNumber: string): number | null {
  const match = orderNumber.match(/^KLR-(\d{4})-\d{4}$/)
  if (!match?.[1]) return null
  return parseInt(match[1], 10)
}

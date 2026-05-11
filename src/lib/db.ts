import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@db/schema'

// Single postgres client — reused across requests in the same process
const client = postgres(process.env['DATABASE_URL']!, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false, // required for Supabase transaction pooler
})

export const db = drizzle(client, {
  schema,
  logger: process.env['NODE_ENV'] === 'development',
})

export type DB = typeof db

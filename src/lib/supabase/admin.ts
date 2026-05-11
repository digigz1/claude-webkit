import 'server-only'
import { createClient } from '@supabase/supabase-js'

let _adminClient: ReturnType<typeof createClient> | null = null

/**
 * Supabase client with service_role key — bypasses RLS entirely.
 * Use ONLY in:
 *  - /api/webhooks/* (Stripe, WhatsApp)
 *  - Server Actions that require cross-user writes (order creation)
 *  - Cron jobs
 * Never expose to the browser or pass to Client Components.
 */
export function getAdminClient() {
  if (_adminClient) return _adminClient

  _adminClient = createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  )

  return _adminClient
}

/**
 * Promote a user to admin by setting app_metadata.role.
 * Run once for the store owner's UID.
 */
export async function setAdminRole(userId: string): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'admin' },
  })
  if (error) throw new Error(`setAdminRole failed: ${error.message}`)
}

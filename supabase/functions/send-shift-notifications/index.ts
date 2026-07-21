// Supabase Edge Function: send-shift-notifications
//
// Invoked server-to-server by two places, both in supabase/sql/push_notifications.sql:
//   - the `shifts_notify_trigger` trigger (on every INSERT/UPDATE/DELETE), and
//   - the `check_long_shift_reminders()` function, scheduled via pg_cron.
//
// Both callers pass a fresh event_id (uuid) generated at the source. The
// FIRST thing this function does is an atomic insert-or-skip into
// notification_log keyed on that event_id — that's the whole duplicate
// -prevention mechanism: if this function somehow gets invoked twice for
// the same logical event (network retry, etc.), the second call's insert
// hits a unique-constraint conflict and returns immediately without
// sending anything.
//
// Deploy with: supabase functions deploy send-shift-notifications
// (default JWT verification is fine — the caller authenticates with the
// service_role key, which is a validly-signed project JWT).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const APP_TIMEZONE = Deno.env.get('APP_TIMEZONE') ?? 'Europe/Madrid'

type ShiftEventPayload = {
  event_id: string
  event_type:
    | 'clock_in'
    | 'clock_out'
    | 'shift_edited'
    | 'shift_deleted'
    | 'admin_finalized'
    | 'long_shift_reminder'
  shift_id: string | null
  family_id: string | null
  worker_id: string
  worker_name: string
  started_at: string | null
  ended_at: string | null
}

type MessageGroup = {
  title: string
  body: string
  userIds: string[]
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: APP_TIMEZONE
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

async function getAdminAndFamilyUserIds(
  supabase: ReturnType<typeof createClient>,
  familyId: string | null
): Promise<string[]> {
  if (!familyId) return []

  const { data, error } = await supabase
    .from('family_members')
    .select('user_id')
    .eq('family_id', familyId)
    .in('role', ['admin', 'family'])

  if (error) {
    console.error('getAdminAndFamilyUserIds error:', error)
    return []
  }

  return (data ?? []).map((row: { user_id: string }) => row.user_id)
}

async function buildMessageGroups(
  supabase: ReturnType<typeof createClient>,
  payload: ShiftEventPayload
): Promise<MessageGroup[]> {
  const title = 'FichApp'
  const adminFamilyIds = await getAdminAndFamilyUserIds(supabase, payload.family_id)

  switch (payload.event_type) {
    case 'clock_in':
      return [
        {
          title,
          body: `${payload.worker_name} ha fichado la entrada a las ${formatTime(payload.started_at)}.`,
          userIds: adminFamilyIds
        }
      ]

    case 'clock_out':
      return [
        {
          title,
          body: `${payload.worker_name} ha fichado la salida.`,
          userIds: adminFamilyIds
        }
      ]

    case 'admin_finalized':
      return [
        {
          title,
          body: 'Un administrador ha finalizado tu turno.',
          userIds: [payload.worker_id]
        }
      ]

    case 'shift_edited':
      return [
        {
          title,
          body: `Se ha modificado un turno de ${payload.worker_name}.`,
          userIds: adminFamilyIds.filter((id) => id !== payload.worker_id)
        },
        {
          title,
          body: 'Uno de tus turnos ha sido modificado.',
          userIds: [payload.worker_id]
        }
      ]

    case 'shift_deleted':
      return [
        {
          title,
          body: `Se ha eliminado un turno de ${payload.worker_name}.`,
          userIds: adminFamilyIds.filter((id) => id !== payload.worker_id)
        },
        {
          title,
          body: 'Uno de tus turnos ha sido eliminado.',
          userIds: [payload.worker_id]
        }
      ]

    case 'long_shift_reminder':
      return [
        {
          title,
          body: 'Tu turno lleva más de 10 horas activo. ¿Has olvidado fichar la salida?',
          userIds: [payload.worker_id]
        }
      ]

    default:
      return []
  }
}

async function sendExpoPushBatch(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<{ sent: number; invalidTokens: string[] }> {
  if (tokens.length === 0) {
    return { sent: 0, invalidTokens: [] }
  }

  const messages = tokens.map((to) => ({ to, title, body, sound: 'default', data }))
  const chunks: (typeof messages)[] = []
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100))
  }

  let sent = 0
  const invalidTokens: string[] = []

  for (const chunk of chunks) {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(chunk)
      })

      const json = await res.json()
      const results: { status: string; details?: { error?: string } }[] =
        json?.data ?? []

      results.forEach((result, idx) => {
        if (result.status === 'ok') {
          sent += 1
        } else if (result.details?.error === 'DeviceNotRegistered') {
          invalidTokens.push(chunk[idx].to)
        } else {
          console.error('Expo push error for token', chunk[idx].to, result)
        }
      })
    } catch (error) {
      console.error('sendExpoPushBatch fetch error:', error)
    }
  }

  return { sent, invalidTokens }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authHeader = req.headers.get('Authorization') ?? ''

  if (!serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let payload: ShiftEventPayload

  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  if (!payload?.event_id || !payload?.event_type) {
    return new Response(
      JSON.stringify({ error: 'Missing event_id or event_type' }),
      { status: 400 }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Atomic idempotency claim — see file header comment.
  const { error: claimError } = await supabase
    .from('notification_log')
    .insert({
      event_id: payload.event_id,
      event_type: payload.event_type,
      shift_id: payload.shift_id,
      family_id: payload.family_id,
      worker_id: payload.worker_id
    })

  if (claimError) {
    if (claimError.code === '23505') {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'duplicate event_id' }),
        { status: 200 }
      )
    }
    console.error('notification_log claim error:', claimError)
    return new Response(JSON.stringify({ error: claimError.message }), { status: 500 })
  }

  const groups = await buildMessageGroups(supabase, payload)

  const allUserIds = Array.from(new Set(groups.flatMap((g) => g.userIds)))

  if (allUserIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  const { data: tokenRows, error: tokensError } = await supabase
    .from('push_tokens')
    .select('token, user_id')
    .in('user_id', allUserIds)
    .eq('is_valid', true)

  if (tokensError) {
    console.error('push_tokens lookup error:', tokensError)
  }

  const tokensByUser = new Map<string, string[]>()
  for (const row of tokenRows ?? []) {
    const list = tokensByUser.get(row.user_id) ?? []
    list.push(row.token)
    tokensByUser.set(row.user_id, list)
  }

  let totalSent = 0
  const allInvalidTokens: string[] = []

  for (const group of groups) {
    const tokens = group.userIds.flatMap((userId) => tokensByUser.get(userId) ?? [])

    if (tokens.length === 0) continue

    const { sent, invalidTokens } = await sendExpoPushBatch(tokens, group.title, group.body, {
      event_type: payload.event_type,
      shift_id: payload.shift_id
    })

    totalSent += sent
    allInvalidTokens.push(...invalidTokens)
  }

  if (allInvalidTokens.length > 0) {
    await supabase
      .from('push_tokens')
      .update({ is_valid: false })
      .in('token', allInvalidTokens)
  }

  await supabase
    .from('notification_log')
    .update({ recipients_count: totalSent })
    .eq('event_id', payload.event_id)

  return new Response(JSON.stringify({ sent: totalSent }), { status: 200 })
})

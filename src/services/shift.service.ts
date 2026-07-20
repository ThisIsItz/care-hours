import { supabase } from '@/src/lib/supabase'
import type { Shift } from '@/src/types/shift'

async function getCurrentUserId() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user?.id) {
    throw new Error('No hay un usuario autenticado.')
  }

  return user.id
}

async function getCurrentShiftFromTable(userId: string): Promise<Shift | null> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('worker_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getCurrentShiftFromTable error:', error)
    throw error
  }

  return (data as Shift | null) ?? null
}

async function getCurrentShiftFromRpc(): Promise<Shift | null> {
  const { data, error } = await supabase.rpc('get_current_shift')

  if (error) {
    throw error
  }

  return (data as Shift | null) ?? null
}

async function startShiftFromRpc(): Promise<Shift> {
  const { data, error } = await supabase.rpc('start_shift')

  if (error) {
    throw error
  }

  return data as Shift
}

async function endShiftFromRpc(): Promise<Shift | null> {
  const { data, error } = await supabase.rpc('end_shift')

  if (error) {
    throw error
  }

  return (data as Shift | null) ?? null
}

export async function getCurrentShift(): Promise<Shift | null> {
  const userId = await getCurrentUserId()

  try {
    return await getCurrentShiftFromTable(userId)
  } catch {
    return getCurrentShiftFromRpc()
  }
}

export async function startShift(): Promise<Shift | null> {
  const userId = await getCurrentUserId()

  try {
    const activeShift = await getCurrentShiftFromTable(userId)

    if (activeShift) {
      return activeShift
    }

    const { data, error } = await supabase
      .from('shifts')
      .insert([
        {
          worker_id: userId,
          started_at: new Date().toISOString(),
          ended_at: null,
          note: null
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('startShift table insert error:', error)
      throw error
    }

    return data as Shift
  } catch (error) {
    console.error('startShift error:', error)
    return startShiftFromRpc()
  }
}

export async function getShiftHistory(): Promise<Shift[]> {
  const { data, error } = await supabase.rpc('get_family_shift_history')
  if (error) throw error
  return (data ?? []) as Shift[]
}

export async function getActiveShifts(): Promise<Shift[]> {
  const { data, error } = await supabase.rpc('get_active_family_shifts')
  if (error) throw error
  return (data ?? []) as Shift[]
}

export async function adminEditShift(
  shiftId: string,
  startedAt: string,
  endedAt: string | null,
  reason: string | null
): Promise<Shift> {
  const { data, error } = await supabase.rpc('admin_edit_shift', {
    p_shift_id:   shiftId,
    p_started_at: startedAt,
    p_ended_at:   endedAt,
    p_reason:     reason ?? null
  })
  if (error) throw error
  return data as Shift
}

export async function adminDeleteShift(shiftId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_shift', {
    p_shift_id: shiftId
  })
  if (error) throw error
}

export async function endShift(): Promise<Shift | null> {
  const userId = await getCurrentUserId()

  let activeShift: Shift | null = null
  try {
    activeShift = await getCurrentShiftFromTable(userId)
  } catch {
    // table read failed, fall back to RPC
  }

  if (!activeShift) {
    return endShiftFromRpc()
  }

  const endedAt = new Date().toISOString()

  try {
    const { data, error } = await supabase
      .from('shifts')
      .update({ ended_at: endedAt })
      .eq('id', activeShift.id)
      .select()
      .single()

    if (error) {
      console.error('endShift update error:', error)
      throw error
    }

    return data as Shift
  } catch (error) {
    console.error('endShift error:', error)
    try {
      const fallback = await endShiftFromRpc()

      if (fallback) {
        return fallback
      }
    } catch {
      // fall through to the original error
    }

    throw error
  }
}

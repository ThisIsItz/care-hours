import { supabase } from '@/src/lib/supabase'
import type { Shift } from '@/src/types/shift'

export async function getCurrentShift(): Promise<Shift | null> {
  const { data, error } = await supabase.rpc('get_current_shift')

  if (error) {
    throw error
  }

  return (data as Shift | null) ?? null
}

export async function startShift(): Promise<Shift> {
  const { data, error } = await supabase.rpc('start_shift')

  if (error) {
    throw error
  }

  return data as Shift
}

export async function endShift(): Promise<Shift> {
  const { data, error } = await supabase.rpc('end_shift')

  if (error) {
    throw error
  }

  return data as Shift
}

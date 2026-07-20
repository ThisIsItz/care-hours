import type { RealtimeChannel } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { supabase } from '@/src/lib/supabase'
import { activeShiftsBaseKey } from '@/src/hooks/useActiveShifts'
import { currentShiftQueryKey } from '@/src/hooks/useCurrentShift'
import { shiftHistoryQueryKey } from '@/src/hooks/useShiftHistory'

const isDev = process.env.NODE_ENV !== 'production'

const CHANNEL_NAME = 'shifts-realtime'

// Module-level guard: this hook is meant to be mounted exactly once (in the
// authenticated app layout). If it's ever mounted a second time — a mistake,
// e.g. adding it to a screen — this flags it loudly in dev instead of
// silently doubling up invalidations.
let activeInstanceCount = 0

export function useRealtimeShifts() {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    activeInstanceCount += 1

    if (isDev && activeInstanceCount > 1) {
      console.warn(
        '[useRealtimeShifts] Multiple instances mounted at once ' +
          `(${activeInstanceCount}). This hook should be mounted once, in the ` +
          'authenticated app layout — not per-screen or per-component.'
      )
    }

    function invalidateShiftQueries(reason: string) {
      if (isDev) {
        console.log(`[useRealtimeShifts] invalidating shift queries (${reason})`)
      }
      void queryClient.invalidateQueries({ queryKey: activeShiftsBaseKey })
      void queryClient.invalidateQueries({ queryKey: currentShiftQueryKey })
      void queryClient.invalidateQueries({ queryKey: shiftHistoryQueryKey })
    }

    const channel = supabase
      .channel(CHANNEL_NAME)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shifts' },
        () => invalidateShiftQueries('INSERT')
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'shifts' },
        () => invalidateShiftQueries('UPDATE')
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'shifts' },
        () => invalidateShiftQueries('DELETE')
      )
      .subscribe((status) => {
        if (!isDev) return

        switch (status) {
          case 'SUBSCRIBED':
            console.log('[useRealtimeShifts] subscribed to shifts changes')
            break
          case 'CHANNEL_ERROR':
            console.log('[useRealtimeShifts] channel error — realtime updates unavailable, falling back to polling')
            break
          case 'TIMED_OUT':
            console.log('[useRealtimeShifts] subscription timed out — falling back to polling')
            break
          case 'CLOSED':
            console.log('[useRealtimeShifts] channel closed')
            break
        }
      })

    channelRef.current = channel

    return () => {
      activeInstanceCount = Math.max(0, activeInstanceCount - 1)

      const currentChannel = channelRef.current
      channelRef.current = null

      if (currentChannel) {
        void supabase.removeChannel(currentChannel)
      }
    }
  }, [queryClient])
}

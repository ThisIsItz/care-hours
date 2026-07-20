import { useQuery } from '@tanstack/react-query'

import { getCurrentShift } from '@/src/services/shift.service'

export const currentShiftQueryKey = ['current-shift'] as const

// Realtime (see useRealtimeShifts) is the primary update path; this interval
// is only a fallback — e.g. so a worker whose shift was remotely finalized by
// an admin still sees it reflected even if their realtime subscription drops.
const FALLBACK_POLL_INTERVAL = 5 * 60_000

export function useCurrentShift(enabled = true) {
  return useQuery({
    queryKey: currentShiftQueryKey,
    queryFn: getCurrentShift,
    enabled,
    refetchInterval: FALLBACK_POLL_INTERVAL,
    refetchOnWindowFocus: true
  })
}

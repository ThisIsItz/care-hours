import { useQuery } from '@tanstack/react-query'

import { getActiveShifts } from '@/src/services/shift.service'

export const activeShiftsBaseKey = ['active-shifts']

// Realtime (see useRealtimeShifts) is the primary update path; this interval
// is only a fallback in case a subscription drops or misses an event.
const FALLBACK_POLL_INTERVAL = 5 * 60_000

export function useActiveShifts() {
  return useQuery({
    queryKey: activeShiftsBaseKey,
    queryFn: getActiveShifts,
    refetchInterval: FALLBACK_POLL_INTERVAL,
    refetchOnWindowFocus: true
  })
}

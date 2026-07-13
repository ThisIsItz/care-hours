import { useQuery } from '@tanstack/react-query'

import { getCurrentShift } from '@/src/services/shift.service'

export const currentShiftQueryKey = ['current-shift'] as const

export function useCurrentShift(enabled = true) {
  return useQuery({
    queryKey: currentShiftQueryKey,
    queryFn: getCurrentShift,
    enabled,
    refetchOnWindowFocus: true
  })
}

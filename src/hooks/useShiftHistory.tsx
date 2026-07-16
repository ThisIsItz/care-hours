import { useQuery } from '@tanstack/react-query'

import { getShiftHistory } from '@/src/services/shift.service'

export const shiftHistoryQueryKey = ['shift-history']

export function useShiftHistory() {
  return useQuery({
    queryKey: shiftHistoryQueryKey,
    queryFn: getShiftHistory
  })
}

import { useQuery } from '@tanstack/react-query'

import { getActiveShifts } from '@/src/services/shift.service'

export const activeShiftsBaseKey = ['active-shifts']

export function useActiveShifts() {
  return useQuery({
    queryKey: activeShiftsBaseKey,
    queryFn: getActiveShifts,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true
  })
}

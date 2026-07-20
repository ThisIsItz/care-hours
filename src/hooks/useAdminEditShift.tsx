import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminEditShift } from '@/src/services/shift.service'
import { activeShiftsBaseKey } from '@/src/hooks/useActiveShifts'
import { shiftHistoryQueryKey } from '@/src/hooks/useShiftHistory'

export function useAdminEditShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      shiftId,
      startedAt,
      endedAt,
      reason
    }: {
      shiftId: string
      startedAt: string
      endedAt: string | null
      reason: string | null
    }) => adminEditShift(shiftId, startedAt, endedAt, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shiftHistoryQueryKey })
      void queryClient.invalidateQueries({ queryKey: activeShiftsBaseKey })
    }
  })
}

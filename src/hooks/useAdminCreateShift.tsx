import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminCreateShift } from '@/src/services/shift.service'
import { shiftHistoryQueryKey } from '@/src/hooks/useShiftHistory'

export function useAdminCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workerId,
      startedAt,
      endedAt,
      reason
    }: {
      workerId: string
      startedAt: string
      endedAt: string
      reason: string | null
    }) => adminCreateShift(workerId, startedAt, endedAt, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shiftHistoryQueryKey })
    }
  })
}

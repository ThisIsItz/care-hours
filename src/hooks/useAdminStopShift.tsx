import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminStopShift } from '@/src/services/shift.service'
import { activeShiftsBaseKey } from '@/src/hooks/useActiveShifts'
import { currentShiftQueryKey } from '@/src/hooks/useCurrentShift'
import { shiftHistoryQueryKey } from '@/src/hooks/useShiftHistory'

export function useAdminStopShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      shiftId,
      reason
    }: {
      shiftId: string
      reason: string | null
    }) => adminStopShift(shiftId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shiftHistoryQueryKey })
      void queryClient.invalidateQueries({ queryKey: activeShiftsBaseKey })
      void queryClient.invalidateQueries({ queryKey: currentShiftQueryKey })
    }
  })
}

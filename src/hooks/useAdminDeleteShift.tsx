import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminDeleteShift } from '@/src/services/shift.service'
import { activeShiftsBaseKey } from '@/src/hooks/useActiveShifts'
import { currentShiftQueryKey } from '@/src/hooks/useCurrentShift'
import { shiftHistoryQueryKey } from '@/src/hooks/useShiftHistory'

export function useAdminDeleteShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shiftId }: { shiftId: string }) => adminDeleteShift(shiftId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shiftHistoryQueryKey })
      void queryClient.invalidateQueries({ queryKey: activeShiftsBaseKey })
      void queryClient.invalidateQueries({ queryKey: currentShiftQueryKey })
    }
  })
}

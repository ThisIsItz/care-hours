import { useMutation, useQueryClient } from '@tanstack/react-query'

import { registerForPushNotificationsAsync } from '@/src/services/notifications.service'
import { startShift } from '@/src/services/shift.service'

import { activeShiftsBaseKey } from './useActiveShifts'
import { currentShiftQueryKey } from './useCurrentShift'

export function useStartShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startShift,

    onSuccess: async (shift) => {
      queryClient.setQueryData(currentShiftQueryKey, shift)

      await queryClient.invalidateQueries({
        queryKey: currentShiftQueryKey
      })

      await queryClient.invalidateQueries({
        queryKey: activeShiftsBaseKey
      })

      // A worker with an active shift is exactly when notifications become
      // useful (an admin might finalize it, edit it, etc.) — ask here too,
      // in case they never got prompted at sign-in (e.g. account predates
      // this feature). No-ops if already granted/denied.
      void registerForPushNotificationsAsync()
    }
  })
}

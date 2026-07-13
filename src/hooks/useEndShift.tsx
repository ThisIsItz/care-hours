import { useMutation, useQueryClient } from '@tanstack/react-query'

import { endShift } from '@/src/services/shift.service'

import { currentShiftQueryKey } from './useCurrentShift'

export function useEndShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: endShift,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: currentShiftQueryKey
      })
    }
  })
}

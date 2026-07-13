import { useMutation, useQueryClient } from '@tanstack/react-query'

import { startShift } from '@/src/services/shift.service'

import { currentShiftQueryKey } from './useCurrentShift'

export function useStartShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startShift,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: currentShiftQueryKey
      })
    }
  })
}

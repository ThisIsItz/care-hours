import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/src/contexts/AuthContext'
import { createFamily } from '@/src/services/family.service'

import { currentFamilyQueryKey } from './useCurrentFamily'

export function useCreateFamily() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: createFamily,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: currentFamilyQueryKey(session?.user.id)
      })
    }
  })
}

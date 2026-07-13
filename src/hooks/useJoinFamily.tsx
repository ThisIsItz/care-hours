import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/src/contexts/AuthContext'
import { joinFamilyByCode } from '@/src/services/family.service'

import { currentFamilyQueryKey } from './useCurrentFamily'

export function useJoinFamily() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: joinFamilyByCode,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: currentFamilyQueryKey(session?.user.id)
      })
    }
  })
}

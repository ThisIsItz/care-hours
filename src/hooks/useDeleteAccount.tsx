import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteOwnAccount } from '@/src/services/account.service'

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOwnAccount,
    onSuccess: () => {
      queryClient.clear()
    }
  })
}

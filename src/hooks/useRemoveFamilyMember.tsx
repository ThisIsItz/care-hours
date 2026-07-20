import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeFamilyMember } from '@/src/services/family.service'
import { familyMembersQueryKey } from '@/src/hooks/useFamilyMembers'

export function useRemoveFamilyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => removeFamilyMember(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: familyMembersQueryKey })
    }
  })
}

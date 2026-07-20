import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateMemberRole } from '@/src/services/family.service'
import { familyMembersQueryKey } from '@/src/hooks/useFamilyMembers'
import type { MemberRole } from '@/src/types/family'

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      role
    }: {
      userId: string
      role: Extract<MemberRole, 'admin' | 'family'>
    }) => updateMemberRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: familyMembersQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['current-family'] })
    }
  })
}

import { useQuery } from '@tanstack/react-query'

import { getFamilyMembers } from '@/src/services/family.service'

export const familyMembersQueryKey = ['family-members'] as const

export function useFamilyMembers(enabled = true) {
  return useQuery({
    queryKey: familyMembersQueryKey,
    queryFn: getFamilyMembers,
    enabled
  })
}

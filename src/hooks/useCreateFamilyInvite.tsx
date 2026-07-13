import { useMutation } from '@tanstack/react-query'

import { createFamilyInvite } from '@/src/services/family.service'

export function useCreateFamilyInvite() {
  return useMutation({
    mutationFn: createFamilyInvite
  })
}

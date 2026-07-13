import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/src/contexts/AuthContext'
import { getCurrentFamily } from '@/src/services/family.service'

export const currentFamilyQueryKey = (userId: string | undefined) =>
  ['current-family', userId] as const

export function useCurrentFamily() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: currentFamilyQueryKey(userId),
    queryFn: () => getCurrentFamily(userId!),
    enabled: Boolean(userId)
  })
}

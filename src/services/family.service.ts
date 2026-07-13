import { supabase } from '@/src/lib/supabase'
import type {
  CurrentFamily,
  Family,
  FamilyMembership
} from '@/src/types/family'

export async function getCurrentFamily(
  userId: string
): Promise<CurrentFamily | null> {
  const { data: membership, error: membershipError } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<FamilyMembership>()

  if (membershipError) {
    throw membershipError
  }

  if (!membership) {
    return null
  }

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', membership.family_id)
    .single<Family>()

  if (familyError) {
    throw familyError
  }

  return {
    membership,
    family
  }
}

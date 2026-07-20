import { supabase } from '@/src/lib/supabase'
import type {
  CurrentFamily,
  Family,
  FamilyInvite,
  FamilyMember,
  FamilyMembership,
  InviteRole,
  MemberRole
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

export async function createFamily(name: string): Promise<Family> {
  const { data, error } = await supabase.rpc('create_family', {
    family_name: name
  })

  if (error) {
    throw error
  }

  return data as Family
}

export async function createFamilyInvite(
  role: InviteRole
): Promise<FamilyInvite> {
  const { data, error } = await supabase.rpc('create_family_invite', {
    target_role: role
  })

  if (error) {
    throw error
  }

  return data as FamilyInvite
}

export async function joinFamilyByCode(
  code: string
): Promise<FamilyMembership> {
  const { data, error } = await supabase.rpc('join_family_by_code', {
    invite_code: code
  })

  if (error) {
    throw error
  }

  return data as FamilyMembership
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase.rpc('get_current_family_members')

  if (error) {
    throw error
  }

  return (data ?? []) as FamilyMember[]
}

export async function removeFamilyMember(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_remove_family_member', {
    p_member_user_id: userId
  })

  if (error) {
    throw error
  }
}

export async function updateMemberRole(
  userId: string,
  role: Extract<MemberRole, 'admin' | 'family'>
): Promise<FamilyMembership> {
  const { data, error } = await supabase.rpc('admin_update_member_role', {
    p_member_user_id: userId,
    p_new_role: role
  })

  if (error) {
    throw error
  }

  return data as FamilyMembership
}

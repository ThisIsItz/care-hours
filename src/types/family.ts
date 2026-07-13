export type MemberRole = 'admin' | 'family' | 'worker'

export type Family = {
  id: string
  name: string
  created_by: string
  created_at: string
}

export type FamilyMembership = {
  id: string
  family_id: string
  user_id: string
  role: MemberRole
  created_at: string
}

export type CurrentFamily = {
  membership: FamilyMembership
  family: Family
}

export type InviteRole = Exclude<MemberRole, 'admin'>

export type FamilyInvite = {
  id: string
  family_id: string
  code: string
  role: InviteRole
  created_by: string
  expires_at: string
  used_at: string | null
  used_by: string | null
  created_at: string
}

export type FamilyMember = {
  id: string
  user_id: string
  full_name: string
  role: MemberRole
  created_at: string
}

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

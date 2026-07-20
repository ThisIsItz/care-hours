export type AdminShiftAction = 'created' | 'stopped' | null

export type Shift = {
  id: string
  family_id: string
  worker_id: string
  started_at: string
  ended_at: string | null
  note: string | null
  created_at: string
  edited_at: string | null
  edited_by: string | null
  edit_reason: string | null
  admin_action: AdminShiftAction
}

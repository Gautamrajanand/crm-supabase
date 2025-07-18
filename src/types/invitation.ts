import { Database } from './database'

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Invitation {
  id: string
  email: string
  role: string
  token: string
  status: InvitationStatus
  stream_id: string
  expires_at: string
  created_at: string
  invited_by: string
}

export type InvitationResponse = {
  success: boolean
  error?: string
  message?: string
  invitationId?: string
  inviteLink?: string
  stream_id?: string
  stream_name?: string
}

export type InviteFormData = {
  email: string
  role: string
  name: string
}

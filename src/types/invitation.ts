import { Database } from './database'

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Invitation {
  id: string
  email: string
  role: string
  token: string
  stream_id: string
  status: InvitationStatus
  expires_at: string
  created_at: string
}

export type InvitationResponse = {
  success: boolean
  error?: string
  message?: string
  invitationId?: string
  inviteLink?: string
}

export type InviteFormData = {
  email: string
  role: string
  name: string
}

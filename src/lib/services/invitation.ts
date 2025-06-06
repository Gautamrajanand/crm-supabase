import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../../types/database'
import { Invitation, InvitationResponse, InviteFormData } from '../../types/invitation'
import { toast } from 'sonner'

export class InvitationService {
  private supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  private mapRoleToAccessLevel(role: string): 'admin' | 'member' | 'viewer' {
    const role_lower = role.toLowerCase()
    
    if (role_lower.includes('admin') || role_lower.includes('manager') || role_lower.includes('head')) {
      return 'admin'
    }
    if (role_lower.includes('view') || role_lower.includes('read')) {
      return 'viewer'
    }
    return 'member'
  }

  async createInvitation(streamId: string, data: InviteFormData): Promise<InvitationResponse> {
    try {
      console.log('Creating invitation:', { streamId, data })

      // Check if an invitation already exists
      const { data: existingInvite, error: existingError } = await this.supabase
        .from('invites')
        .select('id, status')
        .eq('stream_id', streamId)
        .eq('email', data.email)
        .maybeSingle()

      if (existingError) {
        console.error('Error checking existing invitation:', existingError)
        throw new Error(`Failed to check existing invitation: ${existingError.message}`)
      }

      if (existingInvite) {
        console.log('Found existing invitation:', existingInvite)
        // If invitation exists and is pending, return it
        if (existingInvite.status === 'pending') {
          const inviteLink = this.generateInviteLink(existingInvite.id)
          return {
            success: true,
            message: 'Using existing invitation',
            invitationId: existingInvite.id,
            inviteLink
          }
        }
      }

      // Create new invitation
      console.log('Getting current user...')
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      if (userError) {
        console.error('Error getting user:', userError)
        throw new Error(`Failed to get user: ${userError.message}`)
      }
      if (!user) throw new Error('User not found')

      console.log('Creating new invitation...')
      // Create invitation
      const { data: invitation, error: createError } = await this.supabase
        .from('invites')
        .insert({
          stream_id: streamId,
          email: data.email,
          role: this.mapRoleToAccessLevel(data.role),
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          invited_by: user.id
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating invitation:', createError)
        throw new Error(`Failed to create invitation: ${createError.message}`)
      }

      const inviteLink = this.generateInviteLink(invitation.id)
      return { 
        success: true, 
        message: 'Invitation sent successfully',
        invitationId: invitation.id,
        inviteLink
      }
    } catch (error: any) {
      console.error('Error creating invitation:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An error occurred while creating the invitation')
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  }

  async acceptInvitation(invitationId: string, password: string): Promise<InvitationResponse> {
    try {
      // Get invitation with stream info
      const { data: invite, error: inviteError } = await this.supabase
        .from('invites')
        .select(`
          *,
          stream:revenue_streams!invites_stream_id_fkey (id, name)
        `)
        .eq('id', invitationId)
        .single()

      if (inviteError || !invite) {
        throw new Error('Invitation not found')
      }

      // Check if invitation is expired
      if (new Date(invite.expires_at) < new Date()) {
        throw new Error('Invitation has expired')
      }

      // Check if invitation is already accepted
      if (invite.status === 'accepted') {
        throw new Error('Invitation has already been accepted')
      }

      // Sign in user
      const response = await this.supabase.auth.signInWithPassword({
        email: invite.email,
        password,
      })

      if (response.error) {
        throw new Error('Invalid credentials')
      }

      // Get user ID
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // Check if user already exists in the stream
      const { data: existingMember } = await this.supabase
        .from('people')
        .select('id')
        .eq('stream_id', invite.stream_id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existingMember) {
        // Create person record for this stream
        const { error: createError } = await this.supabase
          .from('people')
          .insert({
            name: invite.email.split('@')[0], // Use email prefix as name
            email: invite.email,
            role: invite.role || 'member',
            access_level: invite.role || 'member',
            status: 'active',
            avatar_url: null,
            people_access: 'none',
            deals_access: 'none',
            customers_access: 'none',
            tasks_access: 'none',
            calendar_access: 'none',
            outreach_access: 'none',
            stream_id: invite.stream_id
          })

        if (createError) {
          throw new Error('Failed to create person record')
        }
      }

      // Update invitation status
      const { error: updateError } = await this.supabase
        .from('invites')
        .update({ status: 'accepted' })
        .eq('id', invitationId)

      if (updateError) {
        throw new Error('Failed to update invitation status')
      }

      return {
        success: true,
        message: 'Invitation accepted successfully',
        invitationId,
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      return { success: false, error: error.message }
    }
  }

  async getInvitation(token: string): Promise<Invitation | null> {
    try {
      const { data, error } = await this.supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .single()

      if (error) throw error
      return data as Invitation | null
    } catch (error) {
      console.error('Error getting invitation:', error)
      return null
    }
  }

  async revokeInvitation(invitationId: string): Promise<InvitationResponse> {
    try {
      const { error } = await this.supabase
        .from('invites')
        .delete()
        .eq('id', invitationId)

      if (error) throw error
      return { success: true, message: 'Invitation revoked successfully' }
    } catch (error: any) {
      console.error('Error revoking invitation:', error)
      return { success: false, error: error.message }
    }
  }

  generateInviteLink(token: string): string {
    if (typeof window === 'undefined') {
      throw new Error('generateInviteLink must be called in browser context')
    }
    return `${window.location.origin}/invite/${token}`
  }
}

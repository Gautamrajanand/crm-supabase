import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../../types/database'
import { Invitation, InvitationResponse, InviteFormData } from '../../types/invitation'
import { toast } from 'sonner'

type InvitationStatus = 'pending' | 'accepted' | 'expired'

export class InvitationService {
  private handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred')
  }

  private handleInvitationError(error: unknown): InvitationResponse {
    console.error('Error handling invitation:', error)
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }
    return {
      success: false,
      error: 'An unknown error occurred while processing the invitation'
    }
  }
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
        .from('team_invitations')
        .select('id, status')
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
          .from('team_invitations')
          .insert({
            email: data.email,
            role: this.mapRoleToAccessLevel(data.role),
            status: 'pending',
            stream_id: streamId,
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
    console.log('Starting invitation acceptance for:', invitationId);
    try {
      // Get invitation details
      console.log('Fetching invitation details...');
      const { data: invite, error: inviteError } = await this.supabase
        .from('team_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()
      
      console.log('Invitation details:', invite, 'Error:', inviteError);

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

      // Create user account first
      console.log('Creating user account for:', invite.email);
      const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (signUpError) {
        console.error('Error signing up:', signUpError)
        throw new Error(signUpError.message)
      }

      if (!signUpData.user) {
        throw new Error('Failed to create user account')
      }

      // Use the newly created user
      const user = signUpData.user
      if (!user) throw new Error('User not found')

      // Get the invitation details again to ensure we have the latest data
      console.log('Fetching latest invitation data...');
      const { data: latestInvite, error: latestInviteError } = await this.supabase
        .from('team_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (latestInviteError || !latestInvite) {
        console.error('Error getting latest invitation:', latestInviteError)
        throw new Error('Failed to get invitation details')
      }

      // Set current stream_id
      console.log('Setting current stream ID:', latestInvite.stream_id);
      const { error: streamError } = await this.supabase.rpc('set_current_stream_id', { 
        stream_id: latestInvite.stream_id 
      })
      
      if (streamError) {
        console.error('Error setting stream ID:', streamError)
        throw streamError
      }

      // Check if user already exists in the stream
      console.log('Checking for existing membership...');
      const { data: existingMember } = await this.supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('stream_id', latestInvite.stream_id)
        .maybeSingle()

      if (!existingMember) {
        // Create person record for this stream
        console.log('No existing membership found, creating team member with:', {
          user_id: user.id,
          email: latestInvite.email,
          full_name: user.user_metadata?.full_name || latestInvite.email.split('@')[0],
          role: latestInvite.role || 'member',
          stream_id: latestInvite.stream_id
        })

        console.log('Inserting team member record...');
        const { data: member, error: createError } = await this.supabase
          .from('team_members')
          .insert({
            user_id: user.id,
            email: latestInvite.email,
            full_name: user.user_metadata?.full_name || latestInvite.email.split('@')[0],
            role: latestInvite.role || 'member',
            stream_id: latestInvite.stream_id
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating team member:', createError)
          throw new Error(`Failed to create person record: ${createError.message}`)
        }
      }

      // Update invitation status
      console.log('Updating invitation status to accepted...');
      const { error: updateError } = await this.supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId)

      if (updateError) {
        throw new Error('Failed to update invitation status')
      }

      // Get the stream details
      const { data: stream, error: streamFetchError } = await this.supabase
        .from('revenue_streams')
        .select('*')
        .eq('id', latestInvite.stream_id)
        .single()

      if (streamFetchError) {
        console.error('Error fetching stream:', streamFetchError)
        throw new Error('Failed to fetch stream details')
      }

      // Save stream_id to localStorage and cookie
      localStorage.setItem('currentStreamId', latestInvite.stream_id)
      document.cookie = `currentStreamId=${latestInvite.stream_id}; path=/; max-age=31536000`

      // Add small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Refresh page to load new stream
      window.location.href = `/dashboard?stream=${latestInvite.stream_id}`

      return {
        success: true,
        message: 'Invitation accepted successfully',
        invitationId,
        stream_id: latestInvite.stream_id,
        stream_name: stream.name
      }
    } catch (error: any) {
      console.error('Error handling invitation:', error)
      return this.handleInvitationError(error)
    }
  }

  async getInvitation(token: string): Promise<Invitation | null> {
    try {
      const { data, error } = await this.supabase
        .from('team_invitations')
        .select('*')
        .eq('id', token)
        .single()

      if (error) this.handleError(error)
      if (!data) return null
      return {
        id: data.id,
        email: data.email,
        role: data.role,
        token: data.id, // Use ID as token for now
        status: data.status as InvitationStatus,
        stream_id: data.stream_id,
        created_at: data.created_at,
        expires_at: data.expires_at,
        invited_by: data.invited_by
      }
    } catch (error: any) {
      console.error('Error getting invitation:', error)
      return null
    }
  }

  async revokeInvitation(invitationId: string): Promise<InvitationResponse> {
    try {
      const { error } = await this.supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId)

      if (error) this.handleError(error)
      return { success: true, message: 'Invitation revoked successfully' }
    } catch (error: any) {
      console.error('Error revoking invitation:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      console.error('Unknown error revoking invitation:', error)
      return { success: false, error: 'An unknown error occurred' }
    }
  }

  generateInviteLink(token: string): string {
    if (typeof window === 'undefined') {
      throw new Error('generateInviteLink must be called in browser context')
    }
    return `${window.location.origin}/invite/${token}`
  }
}

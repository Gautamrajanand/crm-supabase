'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { InviteFormData, InvitationResponse } from '@/types/invitation'

export async function createInvitation(streamId: string, data: InviteFormData): Promise<InvitationResponse> {
  'use server'

  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get current user
    const { data: { user: currentUser }, error: getCurrentUserError } = await supabase.auth.getUser()
    if (getCurrentUserError || !currentUser) {
      return { success: false, error: 'Failed to get current user' }
    }

    // Validate input
    if (!data.email || !data.role) {
      return { success: false, error: 'Email and role are required' }
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('people')
      .select('id')
      .eq('stream_id', streamId)
      .eq('email', data.email)
      .maybeSingle()

    if (existingMember) {
      return { success: false, error: 'User is already a member of this stream' }
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('invites')
      .insert({
        stream_id: streamId,
        email: data.email,
        role: mapRoleToAccessLevel(data.role),
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        invited_by: currentUser.id
      })
      .select('id')
      .single()

    if (error) throw error

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.id}`

    return { 
      success: true, 
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
      inviteLink
    }
  } catch (error: any) {
    console.error('Error creating invitation:', error)
    return { success: false, error: error.message }
  }
}

function mapRoleToAccessLevel(role: string): 'admin' | 'member' | 'viewer' {
  const role_lower = role.toLowerCase()
  
  if (role_lower.includes('admin') || role_lower.includes('manager') || role_lower.includes('head')) {
    return 'admin'
  }
  if (role_lower.includes('view') || role_lower.includes('read')) {
    return 'viewer'
  }
  return 'member'
}

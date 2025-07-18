import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', params.id)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 400 }
      )
    }

    if (invitation.email !== session.user.email) {
      return NextResponse.json(
        { error: 'This invitation is for a different email address' },
        { status: 403 }
      )
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

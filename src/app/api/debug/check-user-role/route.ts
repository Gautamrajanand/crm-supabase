import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('Not authenticated')

    // Check team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
    if (membersError) throw membersError

    // Check if user is owner
    const isOwner = members?.some(m => m.user_id === user.id && m.role === 'OWNER')

    return NextResponse.json({ 
      user_id: user.id,
      email: user.email,
      members,
      isOwner
    })
  } catch (error) {
    console.error('Error checking user role:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createServerSupabase()

    // First check if the user is authorized
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear existing data
    await supabase.from('team_invitations').delete().neq('id', 'none')
    await supabase.from('team_members').delete().neq('id', 'none')

    // Add the current user as OWNER
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        user_id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || session.user.email,
        role: 'OWNER'
      })

    if (insertError) {
      console.error('Error inserting owner:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reset route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

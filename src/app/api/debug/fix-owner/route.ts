import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(
      'https://zvmpreuzflksnqutpjiw.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bXByZXV6Zmxrc25xdXRwaml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzE4NTgyOCwiZXhwIjoyMDU4NzYxODI4fQ.PylvreLlK-yDkcYTn84f5Dq6ErMmi1euymPjHn-WmEo'
    )

    // Get the user's ID from their email using auth admin API
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // First, delete existing data
    const { error: deleteError } = await supabase.from('team_members').delete().neq('id', 'none')
    if (deleteError) {
      console.error('Error deleting team members:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    const { error: deleteInvitesError } = await supabase.from('team_invitations').delete().neq('id', 'none')
    if (deleteInvitesError) {
      console.error('Error deleting invitations:', deleteInvitesError)
      return NextResponse.json({ error: deleteInvitesError.message }, { status: 500 })
    }

    // Add current user as OWNER
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        user_id: user.id,
        email: email,
        full_name: email,
        role: 'OWNER'
      })

    if (insertError) {
      console.error('Error setting owner:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in fix owner route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

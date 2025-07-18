import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Update team_members schema
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.team_members
          ALTER COLUMN role TYPE text,
          ALTER COLUMN role SET DEFAULT 'member',
          ADD CONSTRAINT IF NOT EXISTS team_members_role_check 
            CHECK (role IN ('owner', 'admin', 'member', 'viewer'));
      `
    })

    // Drop existing team_members policies
    await supabase.rpc('drop_all_policies', { table_name: 'team_members' })

    // Create new team_members policies
    await supabase.rpc('create_policy', {
      policy_name: 'Team members can be viewed by anyone',
      table_name: 'team_members',
      operation: 'SELECT',
      using_expression: 'TRUE',
      with_check_expression: null
    })

    await supabase.rpc('create_policy', {
      policy_name: 'Team members can be created by owners',
      table_name: 'team_members',
      operation: 'INSERT',
      using_expression: null,
      with_check_expression: `(
        EXISTS (
          SELECT 1 FROM team_members 
          WHERE user_id = auth.uid() 
          AND role = 'owner'
        )
        OR
        NOT EXISTS (SELECT 1 FROM team_members)
      )`
    })

    await supabase.rpc('create_policy', {
      policy_name: 'Team members can be updated by owners',
      table_name: 'team_members',
      operation: 'UPDATE',
      using_expression: `EXISTS (
        SELECT 1 FROM team_members 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
      )`,
      with_check_expression: null
    })

    await supabase.rpc('create_policy', {
      policy_name: 'Team members can be deleted by owners',
      table_name: 'team_members',
      operation: 'DELETE',
      using_expression: `EXISTS (
        SELECT 1 FROM team_members 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
      )`,
      with_check_expression: null
    })

    // Drop existing team_invitations policies
    await supabase.rpc('drop_all_policies', { table_name: 'team_invitations' })

    // Create new team_invitations policies
    await supabase.rpc('create_policy', {
      policy_name: 'Team invitations can be viewed by anyone',
      table_name: 'team_invitations',
      operation: 'SELECT',
      using_expression: 'TRUE',
      with_check_expression: null
    })

    await supabase.rpc('create_policy', {
      policy_name: 'Team invitations can be created by owners',
      table_name: 'team_invitations',
      operation: 'INSERT',
      using_expression: null,
      with_check_expression: `EXISTS (
        SELECT 1 FROM team_members 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
      )`
    })

    await supabase.rpc('create_policy', {
      policy_name: 'Team invitations can be updated by owners',
      table_name: 'team_invitations',
      operation: 'UPDATE',
      using_expression: `EXISTS (
        SELECT 1 FROM team_members 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
      )`,
      with_check_expression: null
    })

    await supabase.rpc('create_policy', {
      policy_name: 'Team invitations can be deleted by owners',
      table_name: 'team_invitations',
      operation: 'DELETE',
      using_expression: `EXISTS (
        SELECT 1 FROM team_members 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
      )`,
      with_check_expression: null
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error fixing team policies:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

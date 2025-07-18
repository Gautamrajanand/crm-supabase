import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

export async function GET() {
  try {
    // Read and execute migrations in order
    const migrations = [
      '20250708_fix_team_member_policies.sql',
      '20250709_fix_team_invitations_policies.sql',
      '20250710_create_policy_functions.sql',
      '20250711_update_team_invitations_schema.sql'
    ]

    for (const migration of migrations) {
      const filePath = path.join(process.cwd(), 'supabase', 'migrations', migration)
      const sql = fs.readFileSync(filePath, 'utf8')

      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error running migrations:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

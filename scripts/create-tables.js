const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  try {
    // Create boards table
    const { error: boardsError } = await supabase.rpc('create_boards_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.boards (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('outreach', 'revenue')),
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })
    
    if (boardsError) {
      console.error('Error creating boards table:', boardsError)
    } else {
      console.log('Boards table created successfully')
    }

    // Insert sample board
    const { data: board, error: insertError } = await supabase
      .from('boards')
      .insert([
        {
          name: 'SDR Pipeline',
          type: 'outreach',
          description: 'Sales Development Representatives outreach pipeline'
        }
      ])
      .select()

    if (insertError) {
      console.error('Error inserting board:', insertError)
    } else {
      console.log('Sample board created:', board)
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

createTables()

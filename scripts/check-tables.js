const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    // Check boards
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
    
    console.log('\nBoards:', boards || 'No boards found')
    if (boardsError) console.error('Boards error:', boardsError)

    // Check columns
    const { data: columns, error: columnsError } = await supabase
      .from('board_columns')
      .select('*')
    
    console.log('\nColumns:', columns || 'No columns found')
    if (columnsError) console.error('Columns error:', columnsError)

    // Check entries
    const { data: entries, error: entriesError } = await supabase
      .from('board_entries')
      .select('*')
    
    console.log('\nEntries:', entries || 'No entries found')
    if (entriesError) console.error('Entries error:', entriesError)

  } catch (error) {
    console.error('Error checking tables:', error)
  }
}

checkTables()

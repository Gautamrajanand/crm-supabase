const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    // Create boards
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .insert([
        {
          name: 'SDR Pipeline',
          type: 'outreach',
          description: 'Sales Development Representatives outreach pipeline'
        },
        {
          name: 'Revenue Streams',
          type: 'revenue',
          description: 'Active revenue opportunities and streams'
        }
      ])
      .select()

    if (boardsError) throw boardsError
    console.log('Created boards:', boards)

    // Create columns
    const { error: columnsError } = await supabase
      .from('board_columns')
      .insert([
        { board_id: boards[0].id, name: 'New Leads', position: 1000 },
        { board_id: boards[0].id, name: 'Contacted', position: 2000 },
        { board_id: boards[0].id, name: 'Meeting Scheduled', position: 3000 },
        { board_id: boards[0].id, name: 'Qualified', position: 4000 },
        { board_id: boards[1].id, name: 'Opportunities', position: 1000 },
        { board_id: boards[1].id, name: 'Negotiation', position: 2000 },
        { board_id: boards[1].id, name: 'Contract Sent', position: 3000 },
        { board_id: boards[1].id, name: 'Closed Won', position: 4000 }
      ])

    if (columnsError) throw columnsError
    console.log('Created columns')

    // Get columns for reference
    const { data: columns, error: getColumnsError } = await supabase
      .from('board_columns')
      .select('*')
      .order('position')

    if (getColumnsError) throw getColumnsError

    // Create entries
    const { error: entriesError } = await supabase
      .from('board_entries')
      .insert([
        {
          board_id: boards[0].id,
          column_id: columns[0].id,
          title: 'Acme Corp Lead',
          description: 'Enterprise software company, interested in our API solution',
          priority: 'High',
          revenue_potential: 50000,
          position: 1000,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          board_id: boards[0].id,
          column_id: columns[1].id,
          title: 'TechStart Inc',
          description: 'Startup looking for AI integration',
          priority: 'Medium',
          revenue_potential: 25000,
          position: 1000,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          board_id: boards[1].id,
          column_id: columns[4].id,
          title: 'Enterprise License Deal',
          description: 'Annual enterprise license for 1000+ users',
          priority: 'High',
          revenue_potential: 500000,
          position: 1000,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])

    if (entriesError) throw entriesError
    console.log('Created entries')

    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase()

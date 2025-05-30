import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    // Create boards table
    const { error: boardsError } = await supabase.rpc('create_boards_table')
    if (boardsError) throw boardsError

    // Create board_columns table
    const { error: columnsError } = await supabase.rpc('create_board_columns_table')
    if (columnsError) throw columnsError

    // Create board_entries table
    const { error: entriesError } = await supabase.rpc('create_board_entries_table')
    if (entriesError) throw entriesError

    // Insert sample data
    const { error: sampleDataError } = await supabase
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
    if (sampleDataError) throw sampleDataError

    // Get the created boards
    const { data: boards } = await supabase
      .from('boards')
      .select('id, name')
      .order('created_at', { ascending: true })
    
    if (!boards || boards.length < 2) throw new Error('Failed to create boards')

    // Insert columns for SDR Pipeline
    const { error: sdrColumnsError } = await supabase
      .from('board_columns')
      .insert([
        { board_id: boards[0].id, name: 'New Leads', position: 1000 },
        { board_id: boards[0].id, name: 'Contacted', position: 2000 },
        { board_id: boards[0].id, name: 'Meeting Scheduled', position: 3000 },
        { board_id: boards[0].id, name: 'Qualified', position: 4000 }
      ])
    if (sdrColumnsError) throw sdrColumnsError

    // Insert columns for Revenue Streams
    const { error: revenueColumnsError } = await supabase
      .from('board_columns')
      .insert([
        { board_id: boards[1].id, name: 'Opportunities', position: 1000 },
        { board_id: boards[1].id, name: 'Negotiation', position: 2000 },
        { board_id: boards[1].id, name: 'Contract Sent', position: 3000 },
        { board_id: boards[1].id, name: 'Closed Won', position: 4000 }
      ])
    if (revenueColumnsError) throw revenueColumnsError

    // Get the created columns
    const { data: columns } = await supabase
      .from('board_columns')
      .select('id, board_id, name')
      .order('position', { ascending: true })

    if (!columns) throw new Error('Failed to create columns')

    // Insert sample entries
    const sdrColumns = columns.filter(c => c.board_id === boards[0].id)
    const revenueColumns = columns.filter(c => c.board_id === boards[1].id)

    const { error: entriesInsertError } = await supabase
      .from('board_entries')
      .insert([
        {
          board_id: boards[0].id,
          column_id: sdrColumns[0].id,
          title: 'Acme Corp Lead',
          description: 'Enterprise software company, interested in our API solution',
          priority: 'High',
          revenue_potential: 50000,
          position: 1000,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          board_id: boards[0].id,
          column_id: sdrColumns[1].id,
          title: 'TechStart Inc',
          description: 'Startup looking for AI integration',
          priority: 'Medium',
          revenue_potential: 25000,
          position: 1000,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          board_id: boards[1].id,
          column_id: revenueColumns[0].id,
          title: 'Enterprise License Deal',
          description: 'Annual enterprise license for 1000+ users',
          priority: 'High',
          revenue_potential: 500000,
          position: 1000,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])
    if (entriesInsertError) throw entriesInsertError

    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase()

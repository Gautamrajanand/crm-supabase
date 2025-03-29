import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type User = {
  id: string
  email: string
  created_at: string
  updated_at: string
  full_name: string
  avatar_url?: string
  role: 'admin' | 'member'
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
}

export type Project = {
  id: string
  name: string
  description: string
  status: string
  customer_id: string
}

export type Task = {
  id: string
  created_at: string
  title: string
  description: string
  status: 'Todo' | 'In Progress' | 'Done'
  project_id?: string
  assigned_to?: string
  due_date?: string
  priority: 'Low' | 'Medium' | 'High'
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: string
}

export type Event = {
  id: string
  title: string
  start: string
  end: string
  all_day: boolean
  project_id?: string
  customer_id?: string
  team_member_id?: string
}

// Helper function to get user's full profile
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return profile
}

// Helper function to check if user is admin
export const isUserAdmin = async () => {
  const profile = await getCurrentUser()
  return profile?.role === 'admin'
}

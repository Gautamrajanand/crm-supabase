import { Database } from './database'

export type Customer = Database['public']['Tables']['customers']['Row'] & {
  id: string
  name: string
  email: string | null
  company: string | null
  phone: string | null
  website: string | null
  industry: string | null
  annual_revenue: number | null
  employee_count: number | null
  last_contacted: string | null
  notes: string | null
  tags: string[]
  address: string | null
  lifetime_value: number | null
  status: string
  linkedin: string | null
  deals: Database['public']['Tables']['deals']['Row'][]
  dealValue: number
  dealsCount: number
  created_at: string
  updated_at: string
  stream_id: string
  user_id: string
}

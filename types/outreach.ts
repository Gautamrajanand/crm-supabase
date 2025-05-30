export type ProspectStatus = 'new' | 'contacted' | 'qualified' | 'disqualified'

export type ProspectPriority = 'low' | 'medium' | 'high'

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'

export type LeadSource = 'website' | 'linkedin' | 'referral' | 'conference' | 'cold_outreach' | 'other'

export type Prospect = {
  id: string
  name: string
  email?: string
  company?: string
  title?: string
  phone?: string
  linkedin_url?: string
  website?: string
  industry?: string
  company_size?: CompanySize
  source?: LeadSource
  priority?: ProspectPriority
  status: ProspectStatus
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
  added_by?: string
  last_contacted_at?: string
  next_follow_up?: string
}

export type ProspectWithActivities = Prospect & {
  activities?: Activity[]
  deal_value: number
  customer_id?: string
}

export type ActivityType = 'email' | 'call' | 'linkedin' | 'meeting' | 'note'

export type Activity = {
  id: string
  prospect_id: string
  type: ActivityType
  notes: string
  scheduled_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  user_id: string
}

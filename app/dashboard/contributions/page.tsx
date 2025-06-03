'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import {
  Users,
  DollarSign,
  Bell,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TeamMember = {
  name: string
  email: string
  prospects_added: number
  prospects_assigned: number
  leads_converted: number
  total_deal_value: number
  avg_deal_size: number
  deals_by_stage: Record<string, number>
  conversion_rate: number
  response_time_avg: number
}

type TeamPerformance = {
  total_prospects: number
  total_leads: number
  total_deal_value: number
  avg_deal_size: number
  conversion_rate: number
  deals_by_stage: Record<string, number>
  top_performers: {
    prospects: TeamMember
    conversion: TeamMember
    deal_size: TeamMember
  }
}

type Contribution = {
  id: string
  created_at: string
  type: string
  description: string
  user: string
  value?: number
}

function ContributionsPage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d')
  const [performance, setPerformance] = useState<TeamPerformance | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadTeamPerformance()
    loadContributions()
  }, [timeframe])

  const loadContributions = async () => {
    try {
      setLoading(true)

      // Get date range
      const endDate = new Date()
      const startDate = timeframe === '7d' ? subDays(endDate, 7)
        : timeframe === '30d' ? subDays(endDate, 30)
        : startOfMonth(endDate)

      // Get contributions data
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      setContributions(data || [])
    } catch (error) {
      console.error('Error loading contributions:', error)
      toast.error('Failed to load contributions')
    } finally {
      setLoading(false)
    }
  }

  const loadTeamPerformance = async () => {
    try {
      setLoading(true)

      // Get date range
      const endDate = new Date()
      const startDate = timeframe === '7d' ? subDays(endDate, 7)
        : timeframe === '30d' ? subDays(endDate, 30)
        : startOfMonth(endDate)

      // Get prospects data
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (prospectsError) throw prospectsError

      // Get deals data
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (dealsError) throw dealsError

      // Calculate team member stats
      const memberMap = new Map<string, TeamMember>()
      
      // Process prospects
      prospects.forEach(prospect => {
        if (prospect.added_by) {
          const member = memberMap.get(prospect.added_by) || {
            name: prospect.added_by,
            email: '',
            prospects_added: 0,
            prospects_assigned: 0,
            leads_converted: 0,
            total_deal_value: 0,
            avg_deal_size: 0,
            deals_by_stage: {} as Record<string, number>,
            conversion_rate: 0,
            response_time_avg: 0
          }
          member.prospects_added++
          memberMap.set(prospect.added_by, member)
        }

        if (prospect.assigned_to) {
          const member = memberMap.get(prospect.assigned_to) || {
            name: prospect.assigned_to,
            email: '',
            prospects_added: 0,
            prospects_assigned: 0,
            leads_converted: 0,
            total_deal_value: 0,
            avg_deal_size: 0,
            deals_by_stage: {} as Record<string, number>,
            conversion_rate: 0,
            response_time_avg: 0
          }
          member.prospects_assigned++
          memberMap.set(prospect.assigned_to, member)
        }
      })

      // Process deals
      deals.forEach(deal => {
        if (deal.owner) {
          const member = memberMap.get(deal.owner) || {
            name: deal.owner,
            email: '',
            prospects_added: 0,
            prospects_assigned: 0,
            leads_converted: 0,
            total_deal_value: 0,
            avg_deal_size: 0,
            deals_by_stage: {} as Record<string, number>,
            conversion_rate: 0,
            response_time_avg: 0
          }
          member.leads_converted++
          member.total_deal_value += deal.value || 0
          if (deal.stage) {
            member.deals_by_stage[deal.stage] = (member.deals_by_stage[deal.stage] || 0) + 1
          }
          memberMap.set(deal.owner, member)
        }
      })

      // Calculate metrics for each member
      const teamMembers = Array.from(memberMap.values())
      teamMembers.forEach(member => {
        member.avg_deal_size = member.leads_converted > 0 
          ? member.total_deal_value / member.leads_converted 
          : 0
        member.conversion_rate = member.prospects_assigned > 0 
          ? (member.leads_converted / member.prospects_assigned) * 100 
          : 0
      })

      // Calculate team performance
      const performance: TeamPerformance = {
        total_prospects: prospects.length,
        total_leads: deals.length,
        total_deal_value: teamMembers.reduce((sum, m) => sum + m.total_deal_value, 0),
        avg_deal_size: deals.length > 0 
          ? teamMembers.reduce((sum, m) => sum + m.total_deal_value, 0) / deals.length 
          : 0,
        conversion_rate: prospects.length > 0 
          ? (deals.length / prospects.length) * 100 
          : 0,
        deals_by_stage: deals.reduce((acc, deal) => {
          acc[deal.stage] = (acc[deal.stage] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        top_performers: {
          prospects: teamMembers.reduce((a, b) => 
            a.prospects_added > b.prospects_added ? a : b
          ),
          conversion: teamMembers.reduce((a, b) => 
            a.conversion_rate > b.conversion_rate ? a : b
          ),
          deal_size: teamMembers.reduce((a, b) => 
            a.avg_deal_size > b.avg_deal_size ? a : b
          )
        }
      }

      setTeamMembers(teamMembers)
      setPerformance(performance)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load team performance data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-8 w-full bg-muted rounded animate-pulse" />
                        <div className="h-8 w-full bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="h-2 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate metrics
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
  const recentContributions = contributions.filter(c => new Date(c.created_at) >= thirtyDaysAgo)

  const metrics = {
    totalContributors: stats.length,
    totalContributions: contributions.length,
    recentContributions: recentContributions.length,
    contributionsPerDay: recentContributions.length / 30
  }

  const stats30Days = {
    name: 'Last 30 Days',
    value: metrics.recentContributions,
    change: ((metrics.contributionsPerDay - (contributions.length - metrics.recentContributions) / 30) / (contributions.length - metrics.recentContributions) / 30) * 100,
    changeType: metrics.contributionsPerDay > (contributions.length - metrics.recentContributions) / 30 ? 'positive' : 'negative'
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Team Performance</h2>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalContributors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalContributions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last 30 Days
            </CardTitle>
            <div
              className={cn(
                'flex items-center text-sm font-medium',
                stats30Days.changeType === 'positive'
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-red-600 dark:text-red-500'
              )}
            >
              {stats30Days.change > 0 ? '+' : ''}{stats30Days.change.toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats30Days.value}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest contributions from team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributions.slice(0, 10).map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'p-2 rounded-full bg-muted',
                        getContributionColor(contribution.contribution_type)
                      )}
                    >
                      {getContributionIcon(contribution.contribution_type)}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {contribution.user_name}{' '}
                        <span className="text-muted-foreground">
                          {contribution.contribution_type.split('_').map((word) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {contribution.entity_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(contribution.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Member Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Member Performance</CardTitle>
            <CardDescription>
              Detailed performance metrics for each team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {teamMembers.map(member => (
                <div 
                  key={member.name}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{member.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      Conversion Rate: {member.conversion_rate.toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <div className="text-sm font-medium">Prospects</div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-2xl font-bold">{member.prospects_added}</span>
                        <span className="text-sm text-muted-foreground">Added</span>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-2xl font-bold">{member.prospects_assigned}</span>
                        <span className="text-sm text-muted-foreground">Assigned</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Leads</div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-2xl font-bold">{member.leads_converted}</span>
                        <span className="text-sm text-muted-foreground">Converted</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Deal Value</div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-2xl font-bold">
                          ${member.total_deal_value.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">Total</span>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-2xl font-bold">
                          ${member.avg_deal_size.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">Average</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Deals by Stage</div>
                      <div className="mt-1 space-y-1">
                        {Object.entries(member.deals_by_stage).map(([stage, count]) => (
                          <div key={stage} className="flex justify-between">
                            <span className="text-sm">{stage}:</span>
                            <span className="text-sm font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Progress
                    value={member.conversion_rate}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default ContributionsPage;

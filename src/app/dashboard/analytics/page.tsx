'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrentStream } from '@/hooks/use-current-stream'

type CustomerStats = {
  month: string
  total: number
  active: number
}

type ProjectStats = {
  status: string
  count: number
}

export default function AnalyticsPage() {
  const { streamId } = useCurrentStream()
  const [customerStats, setCustomerStats] = useState<CustomerStats[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Fetch customer statistics by month
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('created_at, status')

      if (customerError) throw customerError

      // Process customer data by month
      const monthlyStats = processCustomerData(customerData)
      setCustomerStats(monthlyStats)

      // Fetch project statistics by status
      const { data: projectData, error: projectError } = await supabase
        .from('deals')
        .select('*')
        .eq('stream_id', streamId || '')

      if (projectError) throw projectError

      // Process project data by status
      const projectStats = processProjectData(projectData)
      setProjectStats(projectStats)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function processCustomerData(data: any[]): CustomerStats[] {
    // Group customers by month and count
    const months: { [key: string]: { total: number; active: number } } = {}
    
    data.forEach((customer) => {
      const month = new Date(customer.created_at).toLocaleString('default', { month: 'short' })
      if (!months[month]) {
        months[month] = { total: 0, active: 0 }
      }
      months[month].total++
      if (customer.status === 'Active') {
        months[month].active++
      }
    })

    return Object.entries(months).map(([month, stats]) => ({
      month,
      ...stats
    }))
  }

  function processProjectData(data: any[]): ProjectStats[] {
    // Count projects by status
    const stats: { [key: string]: number } = {}
    
    data.forEach((project) => {
      if (!stats[project.status]) {
        stats[project.status] = 0
      }
      stats[project.status]++
    })

    return Object.entries(stats).map(([status, count]) => ({
      status,
      count
    }))
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            View insights about your customers, projects, and business performance.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Customer Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4f46e5" name="Total Customers" />
                  <Bar dataKey="active" fill="#34d399" name="Active Customers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

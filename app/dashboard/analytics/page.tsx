'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '@/utils/supabase'

type ChartData = {
  name: string
  value: number
}

type ProjectStatus = {
  status: string
  count: number
}

type TaskPriority = {
  priority: string
  count: number
}

type MonthlyStats = {
  month: string
  customers: number
  projects: number
  tasks: number
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([])
  const [taskPriorities, setTaskPriorities] = useState<TaskPriority[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [customersByCompany, setCustomersByCompany] = useState<ChartData[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch project statuses
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('status')

      if (projectError) throw projectError

      const statusCounts = projectData.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})

      setProjectStatuses(
        Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count: count as number,
        }))
      )

      // Fetch task priorities
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('priority')

      if (taskError) throw taskError

      const priorityCounts = taskData.reduce((acc: any, curr) => {
        acc[curr.priority] = (acc[curr.priority] || 0) + 1
        return acc
      }, {})

      setTaskPriorities(
        Object.entries(priorityCounts).map(([priority, count]) => ({
          priority,
          count: count as number,
        }))
      )

      // Fetch monthly stats
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return date.toISOString().slice(0, 7) // YYYY-MM format
      }).reverse()

      const monthlyData = await Promise.all(
        last6Months.map(async (month) => {
          const startDate = `${month}-01`
          const endDate = `${month}-31`

          // Count customers created in this month
          const { count: customerCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .gte('created_at', startDate)
            .lt('created_at', endDate)

          // Count projects created in this month
          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact' })
            .gte('created_at', startDate)
            .lt('created_at', endDate)

          // Count tasks created in this month
          const { count: taskCount } = await supabase
            .from('tasks')
            .select('*', { count: 'exact' })
            .gte('created_at', startDate)
            .lt('created_at', endDate)

          return {
            month: new Date(startDate).toLocaleString('default', {
              month: 'short',
            }),
            customers: customerCount || 0,
            projects: projectCount || 0,
            tasks: taskCount || 0,
          }
        })
      )

      setMonthlyStats(monthlyData)

      // Fetch customers by company
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('company')

      if (customerError) throw customerError

      const companyCounts = customerData.reduce((acc: any, curr) => {
        if (curr.company) {
          acc[curr.company] = (acc[curr.company] || 0) + 1
        }
        return acc
      }, {})

      setCustomersByCompany(
        Object.entries(companyCounts)
          .map(([name, value]) => ({
            name,
            value: value as number,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      )
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-2 text-sm text-gray-700">
          Key metrics and insights about your CRM data.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Monthly Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Activity
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#4F46E5"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#10B981"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#F59E0B"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Project Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectStatuses}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Task Priority Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskPriorities}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {taskPriorities.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Top Companies
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={customersByCompany}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4F46E5" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {projectStatuses.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {
              projectStatuses.find((item) => item.status === 'In Progress')
                ?.count || 0
            }
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {taskPriorities.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">High Priority Tasks</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {taskPriorities.find((item) => item.priority === 'High')?.count || 0}
          </p>
        </div>
      </div>
    </div>
  )
}

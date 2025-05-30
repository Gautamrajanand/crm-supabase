'use client'

import {
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Customers', stat: '71,897', icon: UsersIcon },
  { name: 'Active Projects', stat: '58', icon: FolderIcon },
  { name: 'Pending Tasks', stat: '24', icon: InboxIcon },
  { name: 'Revenue', stat: '$405,091', icon: ChartBarIcon },
]

const recentActivity = [
  {
    id: 1,
    name: 'Meeting with Acme Corp',
    href: '#',
    date: 'Mar 30, 2025',
    type: 'calendar',
    icon: CalendarIcon,
  },
  {
    id: 2,
    name: 'New lead from TechStart Inc',
    href: '#',
    date: 'Mar 29, 2025',
    type: 'lead',
    icon: UsersIcon,
  },
  {
    id: 3,
    name: 'Project milestone completed',
    href: '#',
    date: 'Mar 28, 2025',
    type: 'project',
    icon: FolderIcon,
  },
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Follow up with Enterprise client',
    dueDate: 'Tomorrow',
    priority: 'High',
  },
  {
    id: 2,
    title: 'Prepare quarterly report',
    dueDate: 'Next week',
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Review new leads',
    dueDate: 'Today',
    priority: 'High',
  },
]

export default function DashboardContent() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-6 flow-root">
              <ul role="list" className="-mb-8">
                {recentActivity.map((item, itemIdx) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {itemIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                            <item.icon
                              className="h-5 w-5 text-indigo-600"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              {item.name}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={item.date}>{item.date}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Upcoming Tasks
            </h3>
            <div className="mt-6 flow-root">
              <ul role="list" className="divide-y divide-gray-200">
                {upcomingTasks.map((task) => (
                  <li
                    key={task.id}
                    className="relative flex items-center space-x-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {task.title}
                        </p>
                        <div className="ml-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              task.priority === 'High'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        Due {task.dueDate}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

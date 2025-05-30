'use client'

import { Database } from '@/types/database'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from '@/lib/utils'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskStatsProps {
  tasks: Task[]
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const stats = [
    {
      name: 'Total Tasks',
      value: tasks.length,
      icon: ListBulletIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Completed',
      value: tasks.filter(task => task.completed).length,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Due Soon',
      value: tasks.filter(task => {
        if (!task.due_date || task.completed) return false
        const dueDate = new Date(task.due_date)
        const today = new Date()
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(today.getDate() + 3)
        return dueDate <= threeDaysFromNow && dueDate >= today
      }).length,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'High Priority',
      value: tasks.filter(task => !task.completed && task.priority === 'high').length,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.name}
            </CardTitle>
            <div className={cn(
              'p-2 rounded-md',
              stat.bgColor.replace('bg-', 'bg-opacity-20 ')
            )}>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

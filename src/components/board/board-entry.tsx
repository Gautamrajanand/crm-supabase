'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CalendarIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface BoardEntryProps {
  entry: {
    id: string
    title: string
    description?: string
    priority: 'Low' | 'Medium' | 'High'
    revenue_potential?: number
    company?: string
    contact_name?: string
    contact_email?: string
    contact_phone?: string
    last_contacted?: string
    next_followup?: string
    source?: string
    tags?: string[]
    team_member?: {
      id: string
      full_name: string
      avatar_url?: string
    } | null
  }
}

export function BoardEntry({ entry }: BoardEntryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityColors = {
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    High: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          {entry.title}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 pt-2 space-y-2">
        {entry.description && (
          <p className="text-xs text-gray-600">{entry.description}</p>
        )}
        <div className="flex items-center gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[entry.priority]}`}>
            {entry.priority}
          </span>
          {entry.revenue_potential && (
            <span className="inline-flex items-center text-xs text-gray-600">
              <CurrencyDollarIcon className="h-3.5 w-3.5 mr-0.5" />
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
              }).format(entry.revenue_potential)}
            </span>
          )}
        </div>
        {entry.company && (
          <div className="flex items-center text-xs text-gray-600">
            <BuildingOfficeIcon className="h-3.5 w-3.5 mr-1.5" />
            {entry.company}
          </div>
        )}
        {entry.contact_name && (
          <div className="flex items-center text-xs text-gray-600">
            <UserCircleIcon className="h-3.5 w-3.5 mr-1.5" />
            {entry.contact_name}
          </div>
        )}
        {entry.contact_email && (
          <div className="flex items-center text-xs text-gray-600">
            <EnvelopeIcon className="h-3.5 w-3.5 mr-1.5" />
            {entry.contact_email}
          </div>
        )}
        {entry.contact_phone && (
          <div className="flex items-center text-xs text-gray-600">
            <PhoneIcon className="h-3.5 w-3.5 mr-1.5" />
            {entry.contact_phone}
          </div>
        )}
        {(entry.last_contacted || entry.next_followup) && (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {entry.last_contacted && (
              <div className="flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Last: {new Date(entry.last_contacted).toLocaleDateString()}
              </div>
            )}
            {entry.next_followup && (
              <div className="flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Next: {new Date(entry.next_followup).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
        {entry.team_member && (
          <div className="flex items-center gap-2 mt-2">
            {entry.team_member.avatar_url ? (
              <img
                src={entry.team_member.avatar_url}
                alt={entry.team_member.full_name}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-xs text-gray-600">{entry.team_member.full_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

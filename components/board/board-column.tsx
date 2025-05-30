'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BoardEntry } from './board-entry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Entry {
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
  assigned_to?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
}

interface BoardColumnProps {
  id: string
  name: string
  entries: Entry[]
}

export function BoardColumn({ id, name, entries }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <Card className="w-80 flex-shrink-0">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900">{name}</CardTitle>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {entries.length}
          </span>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-2" ref={setNodeRef}>
        <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {entries.map((entry) => (
              <BoardEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}

'use client'

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { BoardColumn } from './board-column'
import { BoardEntry } from './board-entry'

interface Column {
  id: string
  name: string
  entries: any[]
}

interface BoardProps {
  columns: Column[]
  onEntryMove: (entryId: string, fromColumnId: string, toColumnId: string) => void
}

export function Board({ columns, onEntryMove }: BoardProps) {
  const [activeEntry, setActiveEntry] = useState<any | null>(null)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    setActiveEntry(columns
      .flatMap(col => col.entries)
      .find(entry => entry.id === active.id))
    setActiveColumn(columns.find(col => 
      col.entries.some(entry => entry.id === active.id))?.id || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const fromColumnId = activeColumn
      const toColumnId = over.id.toString()

      if (fromColumnId && fromColumnId !== toColumnId) {
        onEntryMove(active.id.toString(), fromColumnId, toColumnId)
      }
    }

    setActiveEntry(null)
    setActiveColumn(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SortableContext
          items={columns.map(col => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map(column => (
            <BoardColumn
              key={column.id}
              id={column.id}
              name={column.name}
              entries={column.entries}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeEntry ? (
          <BoardEntry entry={activeEntry} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

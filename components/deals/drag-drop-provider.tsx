'use client'

import { ReactNode } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'

interface DragDropProviderProps {
  children: ReactNode
  onDragEnd: (result: DropResult) => void
}

export function DragDropProvider({ children, onDragEnd }: DragDropProviderProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  )
}

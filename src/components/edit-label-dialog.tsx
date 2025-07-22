'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EditLabelDialogProps {
  open: boolean
  onClose: () => void
  onUpdate: (label: string) => void
  defaultLabel: string
  currentLabel: string
}

export function EditLabelDialog({
  open,
  onClose,
  onUpdate,
  defaultLabel,
  currentLabel,
}: EditLabelDialogProps) {
  const [label, setLabel] = useState(currentLabel)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onUpdate(label)
      toast.success('Label updated successfully')
      onClose()
    } catch (error) {
      console.error('Error updating label:', error)
      toast.error('Failed to update label')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setLabel(defaultLabel)
    toast.success('Label reset to default')
    onUpdate(defaultLabel)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Menu Label</DialogTitle>
          <DialogDescription>
            Customize the label for this menu item. You can always reset it to the default.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={defaultLabel}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !label.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

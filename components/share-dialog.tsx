'use client'

import { useState } from 'react'
import { Copy, RefreshCw, Share2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type ShareDialogProps = {
  streamId: string
  open: boolean
  onClose: () => void
}

export function ShareDialog({ streamId, open, onClose }: ShareDialogProps) {
  const [accessType] = useState<'edit'>('edit')
  const [loading, setLoading] = useState(false)
  const [viewLink, setViewLink] = useState('')
  const [editLink, setEditLink] = useState('')
  const [expiryEnabled, setExpiryEnabled] = useState(false)
  const supabase = createClientComponentClient()

  const generateLink = async (type: 'view' | 'edit') => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: shareLink, error } = await supabase
        .from('share_links')
        .insert({
          stream_id: streamId,
          access_type: type,
          created_by: user.email,
          expires_at: expiryEnabled ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 days
        })
        .select()
        .single()

      if (error) throw error

      const link = `${window.location.origin}/share/${shareLink.id}`
      if (type === 'view') {
        setViewLink(link)
      } else {
        setEditLink(link)
      }
      
      toast.success(`${type} link generated`)
    } catch (error: any) {
      toast.error('Error generating link')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Revenue Stream</DialogTitle>
          <DialogDescription>
            Create shareable links to give others access to this revenue stream.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="access">Access Type</Label>
            <div className="text-sm text-muted-foreground">Edit access</div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="expiry"
              checked={expiryEnabled}
              onCheckedChange={setExpiryEnabled}
            />
            <Label htmlFor="expiry">Link expires after 7 days</Label>
          </div>

          <div className="grid gap-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={editLink}
                placeholder="Generate a share link"
                readOnly
              />
              {editLink ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyLink(editLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => generateLink('edit')}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

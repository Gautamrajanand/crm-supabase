'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { useRouter, usePathname } from 'next/navigation'
import { PlusCircle, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { EditStreamDialog } from './edit-stream-dialog'
import { toast } from 'sonner'
import { STREAM_CHANGE_EVENT } from '@/hooks/use-current-stream'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type RevenueStream = {
  id: string
  name: string
  description: string | null
  role: string
  can_edit: boolean
  can_manage_members: boolean
}

export default function RevenueSwitcher() {
  const [streams, setStreams] = useState<RevenueStream[]>([])
  const [currentStream, setCurrentStream] = useState<RevenueStream | null>(null)
  const [isNewStreamOpen, setIsNewStreamOpen] = useState(false)
  const [editingStream, setEditingStream] = useState<RevenueStream | null>(null)
  const [newStreamName, setNewStreamName] = useState('')
  const [newStreamDesc, setNewStreamDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const loadInitialStream = async () => {
      try {
        setLoading(true)
        const { data: streams, error } = await supabase
          .from('revenue_streams')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error loading streams:', error)
          toast.error('Failed to load revenue streams')
          return
        }

        setStreams(streams || [])

        // Try to get current stream from URL or localStorage
        const params = new URLSearchParams(window.location.search)
        const urlStreamId = params.get('stream')
        const storedStreamId = localStorage.getItem('currentStreamId')

        if (streams?.length) {
          const targetStream = streams.find(s => s.id === urlStreamId) || 
                             streams.find(s => s.id === storedStreamId) || 
                             streams[0]
          setCurrentStream(targetStream)
          localStorage.setItem('currentStreamId', targetStream.id)
        }
      } catch (error) {
        console.error('Error loading streams:', error)
        toast.error('Failed to load revenue streams')
      } finally {
        setLoading(false)
      }
    }

    loadInitialStream()
  }, [])

  useEffect(() => {
    const handleStreamNameChange = () => {
      console.log('Stream name changed, reloading streams')
      loadStreams()
    }

    window.addEventListener('stream-name-changed', handleStreamNameChange)
    return () => {
      window.removeEventListener('stream-name-changed', handleStreamNameChange)
      setStreams([])
      setCurrentStream(null)
      setLoading(true)
    }
  }, [router.asPath])

  const loadStreams = async () => {
    try {
      setLoading(true)
      const { data: streams, error } = await supabase
        .from('revenue_streams')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      setStreams(streams || [])

      // Get stream ID from URL or localStorage
      const params = new URLSearchParams(window.location.search)
      const urlStreamId = params.get('stream')
      const storedStreamId = localStorage.getItem('currentStreamId')
      const cookieStreamId = document.cookie
        .split('; ')
        .find(row => row.startsWith('currentStreamId='))
        ?.split('=')?.[1]

      // Priority: URL > Cookie > LocalStorage > First Stream
      let targetStreamId = urlStreamId || cookieStreamId || storedStreamId
      let targetStream = streams?.find(s => s.id === targetStreamId)

      // Fallback to first stream if target not found or no streams exist
      if (!targetStream && streams?.length) {
        targetStream = streams[0]
        targetStreamId = targetStream.id
      }

      if (targetStream) {
        // Update all storage mechanisms
        localStorage.setItem('currentStreamId', targetStream.id)
        document.cookie = `currentStreamId=${targetStream.id};path=/`
        setCurrentStream(targetStream)

        // Update URL if needed (without triggering navigation)
        if (!urlStreamId || urlStreamId !== targetStream.id) {
          const searchParams = new URLSearchParams(window.location.search)
          searchParams.set('stream', targetStream.id)
          router.replace(`${pathname}?${searchParams.toString()}`)
        }
      } else {
        // No streams available - clear everything
        localStorage.removeItem('currentStreamId')
        document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        setCurrentStream(null)
      }
    } catch (error) {
      console.error('Error loading streams:', error)
      toast.error('Failed to load revenue streams')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStream = async (stream: RevenueStream) => {
    if (!confirm(`Are you sure you want to delete the revenue stream "${stream.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('revenue_streams')
        .delete()
        .eq('id', stream.id)

      if (error) throw error

      toast.success('Revenue stream deleted successfully')
      
      // Remove the stream from state
      const updatedStreams = streams.filter(s => s.id !== stream.id)
      setStreams(updatedStreams)

      // If this was the current stream, switch to another one
      if (currentStream?.id === stream.id) {
        const nextStream = updatedStreams.find(s => s.id !== stream.id)
        if (nextStream) {
          switchStream(nextStream)
        } else {
          // No streams left
          setCurrentStream(null)
          localStorage.removeItem('currentStreamId')
          document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Error deleting revenue stream:', error)
      toast.error('Failed to delete revenue stream')
    }
  }

  const handleUpdateStream = (updatedStream: RevenueStream) => {
    setStreams(prev => prev.map(s => s.id === updatedStream.id ? updatedStream : s))
    if (currentStream?.id === updatedStream.id) {
      setCurrentStream(updatedStream)
    }
  }

  const handleCreateStream = async () => {
    if (!newStreamName) {
      toast.error('Please enter a stream name')
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Close the new stream dialog first
      setIsNewStreamOpen(false)

      const { data: stream, error } = await supabase
        .from('revenue_streams')
        .insert({
          name: newStreamName,
          description: newStreamDesc || null,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      console.log('Created stream:', stream.name)

      // Add creator as member
      const { error: memberError } = await supabase
        .from('revenue_stream_members')
        .insert({
          stream_id: stream.id,
          user_id: user.id,
          role: 'owner',
          can_edit: true
        })

      if (memberError) throw memberError

      // Reset form
      setNewStreamName('')
      setNewStreamDesc('')

      toast.success('Revenue stream created successfully!')

      // Add a small delay before updating streams
      await new Promise(resolve => setTimeout(resolve, 100))

      // Update streams list and switch to new stream
      const { data: updatedStreams } = await supabase
        .from('revenue_streams')
        .select('*')
        .order('created_at')

      if (updatedStreams) {
        const newStream = updatedStreams.find(s => s.id === stream.id)
        if (newStream) {
          // Save the new stream ID before refresh
          localStorage.setItem('currentStreamId', newStream.id)
          document.cookie = `currentStreamId=${newStream.id};path=/`
          
          // Add a small delay then refresh the page
          setTimeout(() => {
            window.location.reload()
          }, 100)
        }
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error creating revenue stream')
    }
  }

  const switchStream = async (stream: RevenueStream | null) => {
    if (!stream || stream.id === currentStream?.id) return
  
    try {
      // Update localStorage and cookie first
      localStorage.setItem('currentStreamId', stream.id)
      document.cookie = `currentStreamId=${stream.id};path=/`

      // Update UI state
      setCurrentStream(stream)
      setDropdownOpen(false)

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent(STREAM_CHANGE_EVENT, { detail: stream.id }))

      // Update URL last (this will trigger a soft navigation)
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('stream', stream.id)
      await router.replace(`${pathname}?${searchParams.toString()}`)

    } catch (error) {
      console.error('Error switching stream:', error)
      toast.error('Failed to switch revenue stream')
      
      // Revert all state changes on error
      setCurrentStream(currentStream)
      if (currentStream) {
        localStorage.setItem('currentStreamId', currentStream.id)
        document.cookie = `currentStreamId=${currentStream.id};path=/`
      } else {
        localStorage.removeItem('currentStreamId')
        document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    }
  }

  if (loading) {
    return (
      <Button variant="outline" className="w-52 justify-start">
        <span className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        Loading...
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-52 justify-start font-normal"
          >  
            <span className="truncate">{currentStream?.name || 'Select Revenue Stream'}</span>
            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52 text-sm" align="start">
          {streams.map((stream) => (
            <div key={stream.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
              <span
                className="flex-1 truncate cursor-pointer"
                onClick={() => switchStream(stream)}
              >
                {stream.name}
              </span>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingStream(stream)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteStream(stream)
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-sm" onSelect={() => setIsNewStreamOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Revenue Stream
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isNewStreamOpen} onOpenChange={setIsNewStreamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Revenue Stream</DialogTitle>
            <DialogDescription>
              Add a new revenue stream to your organization. You'll be able to invite team members and manage permissions later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="E.g., Consulting Services"
                value={newStreamName}
                onChange={(e) => setNewStreamName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this revenue stream..."
                value={newStreamDesc}
                onChange={(e) => setNewStreamDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewStreamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStream}>
              Create Revenue Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingStream && (
        <EditStreamDialog
          stream={editingStream}
          open={true}
          onClose={() => setEditingStream(null)}
          onUpdate={handleUpdateStream}
        />
      )}
    </>
  )
}

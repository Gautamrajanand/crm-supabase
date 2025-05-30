import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

type Stream = {
  id: string
  name: string
  description: string | null
  created_at: string
  role: string
  can_edit: boolean
  can_manage_members: boolean
}

export function useCurrentStream() {
  const [currentStream, setCurrentStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadCurrentStream()
  }, [])

  const loadCurrentStream = async () => {
    try {
      setLoading(true)

      // Get all streams for the user
      const { data: streams, error } = await supabase
        .from('user_streams')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // If no streams, redirect to create stream page
      if (!streams || streams.length === 0) {
        router.push('/dashboard/settings')
        return
      }

      // Get current stream ID from URL or local storage
      let currentStreamId = params?.streamId as string || 
        localStorage.getItem('currentStreamId')

      // If no stream ID in URL or storage, use first stream
      if (!currentStreamId) {
        currentStreamId = streams[0].id
      }

      // Find the current stream
      const currentStream = streams.find(s => s.id === currentStreamId)

      // If stream not found, use first stream
      if (!currentStream) {
        currentStreamId = streams[0].id
        setCurrentStream(streams[0])
      } else {
        setCurrentStream(currentStream)
      }

      // Save current stream ID
      localStorage.setItem('currentStreamId', currentStreamId)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load revenue stream')
    } finally {
      setLoading(false)
    }
  }

  const switchStream = async (streamId: string) => {
    try {
      setLoading(true)

      const { data: stream, error } = await supabase
        .from('user_streams')
        .select('*')
        .eq('id', streamId)
        .single()

      if (error) throw error

      setCurrentStream(stream)
      localStorage.setItem('currentStreamId', streamId)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to switch revenue stream')
    } finally {
      setLoading(false)
    }
  }

  return {
    currentStream,
    loading,
    switchStream,
    loadCurrentStream
  }
}

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

const supabase = createClient()

// Create a custom event for stream changes
export const STREAM_CHANGE_EVENT = 'streamChange'

type Stream = Database['public']['Tables']['revenue_streams']['Row']
type StreamMember = {
  stream: Stream
}

export function useCurrentStream() {
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('currentStreamId') : null
  )
  const [loading, setLoading] = useState(true)
  const [stream, setStream] = useState<Stream | null>(null)

  // Sync with localStorage
  useEffect(() => {
    if (currentStreamId) {
      localStorage.setItem('currentStreamId', currentStreamId)
    }
  }, [currentStreamId])

  // Load initial stream if none selected
  useEffect(() => {
    const loadInitialStream = async () => {
      try {
        const { data: streams, error } = await supabase
          .from('revenue_stream_members')
          .select('stream:revenue_streams(*)')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .order('created_at')
          .limit(1) as { data: StreamMember[] | null, error: any }

        if (error) throw error
        if (streams && streams.length > 0) {
          const firstStream = streams[0]?.stream
          setCurrentStreamId(firstStream.id)
          localStorage.setItem('currentStreamId', firstStream.id)
          document.cookie = `currentStreamId=${firstStream.id};path=/`
        } else {
          // No streams available
          setCurrentStreamId(null)
          localStorage.removeItem('currentStreamId')
          document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      } catch (error) {
        console.error('Error loading initial stream:', error)
      }
    }

    loadInitialStream()
  }, [])

  useEffect(() => {
    const handleStreamChange = (e: CustomEvent) => {
      const newStreamId = e.detail
      setCurrentStreamId(newStreamId)
      
      // Update cookie and localStorage
      if (newStreamId) {
        localStorage.setItem('currentStreamId', newStreamId)
        document.cookie = `currentStreamId=${newStreamId};path=/`
      } else {
        localStorage.removeItem('currentStreamId')
        document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    }

    // Listen for custom stream change events
    window.addEventListener(STREAM_CHANGE_EVENT, handleStreamChange as EventListener)
    return () => window.removeEventListener(STREAM_CHANGE_EVENT, handleStreamChange as EventListener)
  }, [])

  useEffect(() => {
    const loadStream = async () => {
      if (!currentStreamId) {
        setLoading(false)
        setStream(null)
        return
      }

      try {
        const { data: stream, error } = await supabase
          .from('revenue_streams')
          .select('*')
          .eq('id', currentStreamId)
          .single()

        if (error) throw error
        setStream(stream)
      } catch (error) {
        console.error('Error loading stream:', error)
        setStream(null)
      } finally {
        setLoading(false)
      }
    }

    loadStream()
  }, [currentStreamId])

  return { stream, streamId: currentStreamId, loading }
}

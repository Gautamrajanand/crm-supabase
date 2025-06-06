import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import type { Database } from '../types/supabase'

const supabase = createClient()

type CustomStreamEvent = CustomEvent<string>

// Custom event name for stream changes
export const STREAM_CHANGE_EVENT = 'streamChange' as const

type Stream = Database['public']['Tables']['revenue_streams']['Row']
type StreamMember = {
  stream: Stream
}

export function useCurrentStream() {
  const searchParams = useSearchParams()
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('currentStreamId') : null
  )
  const [loading, setLoading] = useState(true)
  const [stream, setStream] = useState<Stream | null>(null)
  const urlStreamId = searchParams.get('stream')

  // Initial load and URL sync
  useEffect(() => {
    const loadInitialStream = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Try URL stream first
        if (urlStreamId) {
          const { data: streamData, error } = await supabase
            .from('revenue_streams')
            .select('*')
            .eq('id', urlStreamId)
            .single()

          if (!error && streamData) {
            setCurrentStreamId(streamData.id)
            setStream(streamData)
            localStorage.setItem('currentStreamId', streamData.id)
            document.cookie = `currentStreamId=${streamData.id};path=/`
            setLoading(false)
            return
          }
        }

        // Try localStorage/cookie stream
        const storedId = currentStreamId
        if (storedId) {
          const { data: streamData, error } = await supabase
            .from('revenue_streams')
            .select('*')
            .eq('id', storedId)
            .single()

          if (!error && streamData) {
            setCurrentStreamId(streamData.id)
            setStream(streamData)
            localStorage.setItem('currentStreamId', streamData.id)
            document.cookie = `currentStreamId=${streamData.id};path=/`
            setLoading(false)
            return
          }
        }

        // Fall back to first available stream
        const { data: streams, error } = await supabase
          .from('revenue_stream_members')
          .select('stream:revenue_streams(*)')
          .eq('user_id', user.id)
          .order('created_at')
          .limit(1) as { data: StreamMember[] | null, error: any }

        if (!error && streams && streams.length > 0) {
          const firstStream = streams[0].stream
          setCurrentStreamId(firstStream.id)
          setStream(firstStream)
          localStorage.setItem('currentStreamId', firstStream.id)
          document.cookie = `currentStreamId=${firstStream.id};path=/`
        } else {
          // No streams available
          setCurrentStreamId(null)
          setStream(null)
          localStorage.removeItem('currentStreamId')
          document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      } catch (error) {
        console.error('Error loading initial stream:', error)
        setCurrentStreamId(null)
        setStream(null)
      } finally {
        setLoading(false)
      }
    }

    loadInitialStream()
  }, [urlStreamId])

  // Listen for stream changes
  useEffect(() => {
    const handleStreamChange = async (e: CustomStreamEvent) => {
      const newStreamId = e.detail
      if (!newStreamId) {
        setCurrentStreamId(null)
        setStream(null)
        localStorage.removeItem('currentStreamId')
        document.cookie = 'currentStreamId=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
        return
      }

      try {
        const { data: streamData, error } = await supabase
          .from('revenue_streams')
          .select('*')
          .eq('id', newStreamId)
          .single()

        if (error) throw error

        setCurrentStreamId(newStreamId)
        setStream(streamData)
        localStorage.setItem('currentStreamId', newStreamId)
        document.cookie = `currentStreamId=${newStreamId};path=/`
      } catch (error) {
        console.error('Error handling stream change:', error)
      }
    }

    window.addEventListener(STREAM_CHANGE_EVENT, handleStreamChange as unknown as EventListener)
    return () => {
      window.removeEventListener(STREAM_CHANGE_EVENT, handleStreamChange as unknown as EventListener)
    }
  }, [])

  return { stream, streamId: currentStreamId, loading }
}

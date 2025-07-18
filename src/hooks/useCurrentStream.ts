import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabase } from '../lib/supabase/client'
import type { Database } from '../types/supabase'
import { STREAM_CHANGE_EVENT } from '../lib/constants'

const supabase = createBrowserSupabase()

type Stream = Database['public']['Tables']['revenue_streams']['Row']

export function useCurrentStream() {
  const searchParams = useSearchParams()
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const urlStreamId = searchParams.get('stream')

  useEffect(() => {
    const loadStream = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // If we have a stream ID, try to load it
        if (urlStreamId) {
          const { data: streamData, error } = await supabase
            .from('revenue_streams')
            .select('*')
            .eq('id', urlStreamId)
            .single()

          if (!error && streamData) {
            setStream(streamData)
            localStorage.setItem('currentStreamId', streamData.id)
            return
          }
        }

        // Try stored stream ID
        const storedId = localStorage.getItem('currentStreamId')
        if (storedId) {
          const { data: streamData, error } = await supabase
            .from('revenue_streams')
            .select('*')
            .eq('id', storedId)
            .single()

          if (!error && streamData) {
            setStream(streamData)
            return
          }
        }

        // Fall back to first stream
        const { data: streams, error } = await supabase
          .from('revenue_streams')
          .select('*')
          .order('created_at', { ascending: true })

        if (!error && streams?.length > 0) {
          setStream(streams[0])
          localStorage.setItem('currentStreamId', streams[0].id)
        }
      } catch (error) {
        console.error('Error loading stream:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStream()

    const handleStreamChange = (e: CustomEvent) => {
      const newStreamId = e.detail
      if (newStreamId) {
        localStorage.setItem('currentStreamId', newStreamId)
        supabase
          .from('revenue_streams')
          .select('*')
          .eq('id', newStreamId)
          .single()
          .then(({ data }) => {
            if (data) setStream(data)
          })
      }
    }

    window.addEventListener(STREAM_CHANGE_EVENT, handleStreamChange as EventListener)
    return () => {
      window.removeEventListener(STREAM_CHANGE_EVENT, handleStreamChange as EventListener)
    }
  }, [urlStreamId])

  return { 
    stream,
    streamId: stream?.id || '',
    loading 
  }
}

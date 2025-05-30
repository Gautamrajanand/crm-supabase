import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { STREAM_CHANGE_EVENT } from '@/lib/constants'

const supabase = createClient()

type Stream = Database['public']['Tables']['revenue_streams']['Row']

export function useCurrentStream() {
  const searchParams = useSearchParams()
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)

  const urlStreamId = searchParams.get('stream')
  const [streamId, setStreamId] = useState(urlStreamId || '')

  useEffect(() => {
    const loadStream = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // If no stream ID in URL, get user's default stream
        if (!urlStreamId) {
          const { data: streams, error: streamsError } = await supabase
            .from('revenue_streams')
            .select('id, name')
            .order('created_at', { ascending: true })
            .limit(1)

          if (streamsError) throw streamsError

          if (streams && streams.length > 0) {
            setStreamId(streams[0].id)
          } else {
            // Create a default stream if none exists
            const { data: newStream, error: createError } = await supabase
              .from('revenue_streams')
              .insert([{ 
                name: 'Default Stream',
                created_by: user.id
              }])
              .select()
              .single()

            if (createError) throw createError

            if (newStream) {
              // Add user as owner of the new stream
              const { error: memberError } = await supabase
                .from('revenue_stream_members')
                .insert([{
                  stream_id: newStream.id,
                  user_id: user.id,
                  role: 'owner',
                  can_edit: true
                }])

              if (memberError) throw memberError
              setStreamId(newStream.id)
            }
          }
        }

        // Now get the stream data
        if (streamId) {
          const { data: streamData, error } = await supabase
            .from('revenue_streams')
            .select('*')
            .eq('id', streamId)
            .single()

          if (error) throw error
          setStream(streamData)
        }
      } catch (error) {
        console.error('Error loading stream:', error)
        setStream(null)
      } finally {
        setLoading(false)
      }
    }

    loadStream()

    // Listen for stream change events
    const handleStreamChange = (e: CustomEvent) => {
      const newStreamId = e.detail
      if (newStreamId !== streamId) {
        setStreamId(newStreamId)
      }
    }

    window.addEventListener(STREAM_CHANGE_EVENT, handleStreamChange as EventListener)
    return () => {
      window.removeEventListener(STREAM_CHANGE_EVENT, handleStreamChange as EventListener)
      setStream(null)
      setLoading(true)
    }
  }, [streamId, urlStreamId])

  return { stream, streamId, loading }
}

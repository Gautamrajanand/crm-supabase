// Hook for managing current stream selection and navigation
import { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/supabase'
import { useAuth } from '@/app/auth-provider'



type CustomStreamEvent = CustomEvent<string>

// Custom event name for stream changes
export const STREAM_CHANGE_EVENT = 'streamChange' as const

type Stream = Database['public']['Tables']['revenue_streams']['Row']
type StreamMember = {
  stream: Stream
}

export function useCurrentStream() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('currentStreamId') : null
  )
  const [loading, setLoading] = useState(true)
  const [stream, setStream] = useState<Stream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const urlStreamId = searchParams.get('stream')
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )

  // Initial load and URL sync
  useEffect(() => {
    const loadInitialStream = async () => {
      try {
        setLoading(true)
        if (!user) {
          setLoading(false)
          setError('No authenticated user')
          return
        }

        // Try localStorage/cookie stream first
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
            
            // If no stream in URL, add it while preserving pathname
            if (!urlStreamId) {
              router.replace(`${pathname}?stream=${streamData.id}`)
            }
            
            setLoading(false)
            return
          }
        }

        // Try URL stream if no stored stream
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
          } else {
            // If URL stream is invalid, redirect to pathname with stored stream
            if (storedId) {
              router.replace(`${pathname}?stream=${storedId}`)
            }
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
          
          // Ensure stream ID is in URL
          if (!urlStreamId) {
            router.replace(`${pathname}?stream=${firstStream.id}`)
          }
        } else {
          // No streams available
          setCurrentStreamId(null)
          setStream(null)
          setError('No revenue streams available')
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
        
        // Update URL with new stream ID while preserving pathname
        router.replace(`${pathname}?stream=${newStreamId}`)
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

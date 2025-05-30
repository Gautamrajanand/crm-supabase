import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type Stream = {
  id: string
  name: string
}

type CurrentStream = {
  stream: Stream | null
  streamId: string
  loading: boolean
}

export function useCurrentStream(): CurrentStream {
  const [stream, setStream] = useState<Stream | null>(null)
  const [streamId, setStreamId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCurrentStream = async () => {
      try {
        console.log('Loading current stream...');
        const { data: { user } } = await supabase.auth.getUser()
        console.log('User:', user);
        
        if (!user) {
          console.log('No user found');
          setLoading(false)
          return
        }

        // First get user's workspace
        console.log('Getting workspace for user:', user.id);
        const { data: workspaceMember, error: workspaceError } = await supabase
          .from('workspace_members')
          .select('workspace_id, workspaces(id, name)')
          .eq('user_id', user.id)
          .single()

        console.log('Workspace member result:', { workspaceMember, workspaceError });

        if (workspaceError) {
          console.error('Error getting workspace:', workspaceError);
          setLoading(false);
          return;
        }

        if (!workspaceMember?.workspace_id) {
          console.log('No workspace found for user');
          setLoading(false)
          return
        }

        // Then get the first revenue stream for this workspace
        console.log('Getting streams for workspace:', workspaceMember.workspace_id);
        const { data: streams, error: streamsError } = await supabase
          .from('revenue_streams')
          .select('*, revenue_stream_members!inner(*)')
          .eq('workspace_id', workspaceMember.workspace_id)
          .eq('revenue_stream_members.user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)

        console.log('Streams result:', { streams, streamsError });

        if (streamsError) {
          console.error('Error getting streams:', streamsError);
          setLoading(false);
          return;
        }

        if (streams?.[0]) {
          console.log('Setting current stream:', streams[0]);
          setStream(streams[0])
          setStreamId(streams[0].id)
        } else {
          console.log('No streams found for workspace');
        }
      } catch (error) {
        console.error('Error loading current stream:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCurrentStream()

    const channel = supabase
      .channel('current_stream_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'revenue_streams',
        filter: `id=eq.${streamId}`
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setStream(null)
          setStreamId('')
        } else {
          setStream(payload.new as Stream)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [streamId])

  return { stream, streamId, loading }
}

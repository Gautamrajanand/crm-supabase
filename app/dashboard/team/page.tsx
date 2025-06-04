'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import TeamClient from './team-client'
import type { TeamClientProps } from './team-client'
import { useCurrentStream } from '@/hooks/use-current-stream'

type Member = TeamClientProps['members'][0]
type Invitation = TeamClientProps['invitations'][0]

export default function TeamPage() {
  const [stream, setStream] = useState<{ id: string; name: string } | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { streamId } = useCurrentStream()

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/login')
          return
        }

        if (!streamId) {
          return
        }

        // Get stream details
        const { data: streamData, error: streamError } = await supabase
          .from('revenue_streams')
          .select('id, name')
          .eq('id', streamId || '')
          .single()

        if (streamError) {
          console.error('Error fetching stream:', streamError)
          throw streamError
        }

        setStream(streamData)

        // Get members
        const { data: membersData, error: membersError } = await supabase
          .from('revenue_stream_members')
          .select(`
            id,
            user_id,
            role,
            can_edit,
            created_at,
            users:auth_users(email, raw_user_meta_data)
          `)
          .eq('stream_id', streamId)
          .order('created_at')

        if (membersError) throw membersError

        const members = membersData?.map(m => {
          const userData = Array.isArray(m.users) ? m.users[0] : m.users
          return {
            id: m.id,
            name: userData?.raw_user_meta_data?.full_name || userData?.email?.split('@')[0] || 'Unknown User',
            email: userData?.email || '',
            role: m.role || 'member',
            created_at: m.created_at,
            permissions: {
              outreach: m.can_edit ? 'edit' as const : 'view' as const,
              deals: m.can_edit ? 'edit' as const : 'view' as const,
              customers: m.can_edit ? 'edit' as const : 'view' as const,
              tasks: m.can_edit ? 'edit' as const : 'view' as const,
              calendar: m.can_edit ? 'edit' as const : 'view' as const
            }
          }
        }) || []

        setMembers(members)

        // Get invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('stream_invitations')
          .select('id, stream_id, email, access_level, created_at, expires_at, status')
          .eq('stream_id', streamId)
          .eq('status', 'pending')
          .order('created_at')

        if (invitationsError) throw invitationsError

        const invitations = invitationsData?.map(i => ({
          id: i.id,
          email: i.email,
          role: i.access_level || 'member',
          permissions: {
            outreach: 'view' as const,
            deals: 'view' as const,
            customers: 'view' as const,
            tasks: 'view' as const,
            calendar: 'view' as const
          },
          created_at: i.created_at,
          expires_at: i.expires_at,
          status: i.status
        })) || []
        
        setInvitations(invitations)
      } catch (error: any) {
        console.error('Error in team page:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Clear data when switching streams
    return () => {
      setMembers([])
      setInvitations([])
      setLoading(true)
    }
  }, [streamId, router, supabase])

  if (loading) {
    return <div className="flex items-center justify-center h-screen dark:text-gray-100">Loading...</div>
  }

  if (!stream) {
    return <div className="flex items-center justify-center h-screen dark:text-gray-100">No stream found</div>
  }

  return <TeamClient workspace={stream} members={members} invitations={invitations} />
}

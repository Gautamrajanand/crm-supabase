'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'
import TeamClient from './team-client'
import type { TeamClientProps } from './team-client'
import { useCurrentStream } from '@/hooks/use-current-stream'
import type { MemberRole } from './team-client'

type Member = {
  id: string
  email: string
  role: MemberRole
  permissions: string
  created_at: string | null
  expires_at: string | null
  status: string
}

type Invitation = TeamClientProps['invitations'][0]

type StreamInvitation = {
  id: string
  stream_id: string
  email: string
  access_level: string
  created_at: string
  expires_at: string
  status: string
}

export default function TeamPage() {
  const [stream, setStream] = useState<{ id: string; name: string } | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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
            user:user_id (id, email),
            role,
            created_at,
            permissions
          `)
          .eq('stream_id', streamId)
          .order('created_at', { ascending: false })

        if (membersError) throw membersError

        const members = (membersData || []).map((member: any) => ({
          id: member.id,
          email: member.user.email,
          role: member.role,
          permissions: member.permissions,
          created_at: member.created_at,
          expires_at: null,
          status: 'active',
        })) || []

        setMembers(members as any)

        // Get invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('stream_invitations')
          .select('id, stream_id, email, access_level, created_at, expires_at, status')
          .eq('stream_id', streamId)
          .eq('status', 'pending')
          .order('created_at')

        if (invitationsError) throw invitationsError

        const invitations = invitationsData?.map((i) => ({
          id: i.id,
          email: i.email,
          role: (i.access_level as MemberRole) || 'member',
          permissions: JSON.stringify({
            outreach: 'view',
            deals: 'view',
            customers: 'view',
            tasks: 'view',
            calendar: 'view',
          }),
          created_at: i.created_at,
          expires_at: i.expires_at,
          status: i.status,
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

  return <TeamClient workspace={{ ...stream, created_at: new Date().toISOString() }} members={members} invitations={invitations} />
}

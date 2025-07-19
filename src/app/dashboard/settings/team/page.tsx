'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/auth-provider'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBrowserSupabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type UserRole = 'owner' | 'admin' | 'member' | 'viewer'
type UserStatus = 'active' | 'pending'

const roleOptions: UserRole[] = ['admin', 'member', 'viewer']

type DatabaseTeamMember = Database['public']['Tables']['team_members']['Row']
type DatabaseTeamInvitation = Database['public']['Tables']['team_invitations']['Row']

type TeamMember = {
  id: string
  user_id: string
  email: string
  full_name: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at?: string
  joined_at: string | null
}

const mapDatabaseMemberToTeamMember = (dbMember: DatabaseTeamMember): TeamMember => {
  const baseFields = {
    id: dbMember.id,
    user_id: dbMember.user_id,
    email: dbMember.email,
    full_name: dbMember.full_name,
    role: dbMember.role as UserRole,
    status: 'active' as const,
    created_at: dbMember.created_at,
  }
  return {
    ...baseFields,
    updated_at: (dbMember as any).updated_at || dbMember.created_at,
    joined_at: (dbMember as any).joined_at || null
  }
}

const mapDatabaseInvitationToTeamMember = (invitation: DatabaseTeamInvitation): TeamMember => {
  const baseFields = {
    id: invitation.id,
    user_id: invitation.invited_by,
    email: invitation.email,
    full_name: invitation.email,
    role: invitation.role as UserRole,
    status: 'pending' as const,
    created_at: invitation.created_at,
  }
  return {
    ...baseFields,
    updated_at: invitation.created_at, // For invitations, updated_at is same as created_at
    joined_at: null // Invitations are never joined
  }
}

export default function TeamSettings() {
  const [loading, setLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamMember[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('member')
  const [streamId, setStreamId] = useState<string | null>(null)
  
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createBrowserSupabase()

  // Load team members
  const loadMembers = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      // Get current stream ID from URL or local storage
      const searchParams = new URLSearchParams(window.location.search)
      const currentStreamId = searchParams.get('stream_id') || localStorage.getItem('currentStreamId')
      if (!currentStreamId) {
        throw new Error('No stream selected')
      }
      setStreamId(currentStreamId)

      // Set current stream_id
      const { error: streamError } = await supabase.rpc('set_current_stream_id', { 
        stream_id: currentStreamId 
      })
      
      if (streamError) {
        console.error('Error setting stream ID:', streamError)
        throw streamError
      }

      // Load active team members
      const { data: activeMembers, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('stream_id', currentStreamId)
        .order('created_at', { ascending: true })

      if (membersError) {
        console.error('Error loading members:', membersError)
        throw membersError
      }

      // Map database members to frontend type
      const mappedMembers = (activeMembers || []).map(mapDatabaseMemberToTeamMember)

      // Load pending invitations
      const { data: pendingInvitations, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('stream_id', currentStreamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (invitationsError) {
        console.error('Error loading invitations:', invitationsError)
        throw invitationsError
      }

      // Map invitations to team members
      const mappedInvitations = (pendingInvitations || []).map(mapDatabaseInvitationToTeamMember)

      // Combine members and invitations
      setMembers([...mappedMembers, ...mappedInvitations])
    } catch (error) {
      console.error('Error loading team data:', error)
      toast.error('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  // Load members on mount
  useEffect(() => {
    loadMembers()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !role || inviteLoading || !user?.id || !user?.email) return

    setInviteLoading(true)
    try {
      // Check if current user is a team member
      if (!user?.id) {
        throw new Error('You must be a team member to invite others')
      }

      // Create invitation
      const { data: invitation, error } = await supabase
        .from('team_invitations')
        .insert({
          email,
          role,
          invited_by: user.id,
          status: 'pending',
          stream_id: streamId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        throw error
      }

      // Add the new invitation to the list
      if (invitation) {
        const newMember = mapDatabaseInvitationToTeamMember(invitation)
        setMembers([...members, newMember])
      }

      const inviteLink = `${window.location.origin}/invite/${invitation.id}`
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invitation link copied to clipboard!')
      setEmail('')
      await loadMembers()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send invitation')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemove = async (id: string, status: UserStatus) => {
    try {
      // Set current stream_id
      await supabase.rpc('set_current_stream_id', { stream_id: streamId })
      if (status === 'pending') {
        // Cancel invitation
        const { error } = await supabase
          .from('team_invitations')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error cancelling invitation:', error)
          throw error
        }
        toast.success('Invitation cancelled')
      } else {
        // Remove active member
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error removing member:', error)
          throw error
        }
        toast.success('Member removed')
      }

      await loadMembers()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove member')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Members</h3>
        <p className="text-sm text-muted-foreground">
          Add or remove team members and manage their roles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            autoComplete="email"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <Select 
            value={role} 
            onValueChange={(value: UserRole) => setRole(value)}
            name="role"
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={!email || !role || inviteLoading}>
          {inviteLoading ? <Spinner className="mr-2 h-4 w-4" /> : 'Send Invitation'}
        </Button>
      </form>

      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  {member.status === 'pending' ? (
                    <span className="text-yellow-600">Pending</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {member.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={async () => {
                        const inviteLink = `${window.location.origin}/invite/${member.id}`
                        await navigator.clipboard.writeText(inviteLink)
                        toast.success('Invitation link copied!')
                      }}
                    >
                      Copy Link
                    </Button>
                  )}
                  {member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemove(member.id, member.status)}
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Debug tools moved to /dashboard/settings/team/debug */}
    </div>
  )
}

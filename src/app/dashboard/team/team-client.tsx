'use client'

import { createBrowserClient } from '@supabase/ssr'
import { UserPlus, Trash2, X, Copy, Send, Loader2 } from 'lucide-react'
import { Database } from '@/types/database'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

export type MemberRole = 'owner' | 'admin' | 'member'
export type PermissionType = 'none' | 'view' | 'edit'
export type Board = 'outreach' | 'deals' | 'customers' | 'tasks' | 'calendar'

export const DEFAULT_PERMISSIONS: Record<Board, PermissionType> = {
  outreach: 'none',
  deals: 'none',
  customers: 'none',
  tasks: 'none',
  calendar: 'none'
}

export type TeamClientProps = {
  workspace: {
    id: string
    name: string
    created_at: string
  }
  members: {
    id: string
    email: string
    role: MemberRole
    permissions: string
    created_at: string | null
    expires_at: string | null
    status: string
  }[]
  invitations: {
    id: string
    email: string
    role: MemberRole
    permissions: string
    created_at: string | null
    expires_at: string | null
    status: string
  }[]
}

export default function TeamClient({ workspace, members: initialMembers, invitations: initialInvitations }: TeamClientProps) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('member')
  const [invitePermissions, setInvitePermissions] = useState<Record<Board, PermissionType>>(DEFAULT_PERMISSIONS)
  const [inviteLink, setInviteLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState(initialMembers)
  const [invitations, setInvitations] = useState(initialInvitations)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!inviteName) {
        toast.error('Please enter a name')
        return
      }

      if (!inviteEmail) {
        toast.error('Please enter an email address')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(inviteEmail)) {
        toast.error('Please enter a valid email address')
        return
      }

      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        throw new Error('Not authenticated')
      }

      const { data: invitation, error } = await supabase
        .rpc('send_stream_invitation', {
          email: inviteEmail,
          stream_id: workspace.id,
          access_level: inviteRole,
        } as any)

      if (error) throw error

      if (!invitation || !invitation[0]) {
        throw new Error('Failed to create invitation')
      }

      const { magic_link, invitation_id } = invitation[0] as any
      setInviteLink(magic_link)
      
      // Fetch the new invitation to add to the list
      const { data: newInvitation, error: fetchError } = await supabase
        .from('stream_invitations')
        .select('id, email, access_level, created_at, expires_at, status')
        .eq('id', invitation_id)
        .single()

      if (fetchError) throw fetchError

      const formattedInvitation = {
        id: newInvitation.id,
        email: newInvitation.email,
        role: newInvitation.access_level as MemberRole,
        permissions: JSON.stringify({
          outreach: 'view',
          deals: 'view',
          customers: 'view',
          tasks: 'view',
          calendar: 'view'
        }),
        created_at: newInvitation.created_at,
        expires_at: newInvitation.expires_at,
        status: newInvitation.status
      }

      if (fetchError) throw fetchError
      setInvitations([...invitations, formattedInvitation])

      toast.success('Invitation created successfully')
    } catch (error: any) {
      if (error.message.includes('already been invited')) {
        toast.error('This email has already been invited')
      } else {
        toast.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvite = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('stream_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId)

      if (error) throw error

      setInvitations(invitations.filter(i => i.id !== invitationId))
      toast.success('Invitation cancelled')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
    try {
      const { error } = await supabase
        .from('revenue_stream_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.map(m => {
        if (m.id === memberId) {
          return { ...m, role: newRole }
        }
        return m
      }))
      toast.success('Role updated successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('revenue_stream_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.filter(m => m.id !== memberId))
      toast.success('Member removed successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-100">{workspace.name} Team</h1>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="dark:hover:bg-orange-600"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Team Members</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Manage your team members and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.email}`}
                      alt={member.email}
                    />
                    <AvatarFallback className="dark:bg-gray-700 dark:text-gray-100">{member.email[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium dark:text-gray-100">{member.email.split('@')[0]}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={member.role}
                    onValueChange={(value: MemberRole) =>
                      handleUpdateRole(member.id, value)
                    }
                  >
                    <SelectTrigger className="w-[110px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="owner">Owner</SelectItem>
                      <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="admin">Admin</SelectItem>
                      <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Pending Invitations</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Manage your pending team invitations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${invitation.email.split('@')[0]}`}
                        alt={invitation.email.split('@')[0]}
                      />
                      <AvatarFallback className="dark:bg-gray-700 dark:text-gray-100">{invitation.email[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium dark:text-gray-100">{invitation.email.split('@')[0]}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invitation.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-100">{invitation.role}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancelInvite(invitation.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Invite Team Member</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Add a new member to your workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="dark:text-gray-100">Name</Label>
                <Input
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label className="dark:text-gray-100">Email</Label>
                <Input
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label className="dark:text-gray-100">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value: MemberRole) => setInviteRole(value)}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="owner">Owner</SelectItem>
                    <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="admin">Admin</SelectItem>
                    <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="dark:text-gray-100">Board Permissions</Label>
                <div className="grid gap-4">
                  {Object.entries(invitePermissions).map(([board, permission]) => (
                    <div
                      key={board}
                      className="flex items-center justify-between"
                    >
                      <Label className="capitalize dark:text-gray-100">{board}</Label>
                      <Select
                        value={permission}
                        onValueChange={(value: PermissionType) =>
                          setInvitePermissions({
                            ...invitePermissions,
                            [board]: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-[110px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="none">None</SelectItem>
                          <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="view">View</SelectItem>
                          <SelectItem className="dark:text-gray-100 dark:focus:bg-gray-700" value="edit">Edit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              {inviteLink ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      value={inviteLink}
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink)
                        toast.success('Invitation link copied to clipboard')
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full dark:hover:bg-gray-700"
                    onClick={() => {
                      setIsInviteOpen(false)
                      setInviteLink('')
                      setInviteName('')
                      setInviteEmail('')
                      setInviteRole('member')
                      setInvitePermissions(DEFAULT_PERMISSIONS)
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <Button type="submit" className="w-full dark:hover:bg-orange-600" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client';

import { useState } from 'react';
import { useTeam } from '@/app/hooks/useTeam';
import { TeamRole, TeamMember, TeamInvitation, TeamActivity } from '@/app/types/team';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function TeamPage() {
  const { members, invitations, activities, loading, inviteMember, acceptInvitation, updateMemberRole, removeMember } = useTeam();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<TeamRole, 'OWNER'>>('MEMBER');

  const handleInvite = () => {
    if (email) {
      inviteMember(email, role);
      setEmail('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>Manage your team members and invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-8">
            <Input
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-sm"
            />
            <Select value={role} onValueChange={(value) => setRole(value as Exclude<TeamRole, 'OWNER'>)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite}>Invite</Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Team Members</h3>
              <div className="space-y-4">
                {members.map((member: TeamMember) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {member.role !== 'OWNER' && (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(value) => updateMemberRole(member.id, value as TeamRole)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="VIEWER">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {invitations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Pending Invitations</h3>
                <div className="space-y-4">
                  {invitations.filter((inv: TeamInvitation) => inv.status === 'pending').map((invitation: TeamInvitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">Role: {invitation.role}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acceptInvitation(invitation.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {activities.map((activity: TeamActivity) => (
                  <div key={activity.id} className="text-sm text-muted-foreground">
                    {activity.action} - {new Date(activity.created_at).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

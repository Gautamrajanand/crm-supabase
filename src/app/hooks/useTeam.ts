'use client';

import { useCallback, useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/utils/supabase';
import type { Database } from '@/types/supabase';
import { toast } from '@/components/ui/use-toast';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type TeamInvitation = Database['public']['Tables']['team_invitations']['Row'];
type TeamActivity = Database['public']['Tables']['team_activity']['Row'];
type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';
type UserStatus = 'pending' | 'accepted' | 'rejected';

type TeamMemberData = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: TeamRole;
  created_at: string;
  updated_at: string;
  joined_at: string | null;
};

type TeamInvitationData = {
  id: string;
  email: string;
  role: TeamRole;
  status: UserStatus;
  invited_by: string;
  created_at: string;
  expires_at: string;
};

type TeamActivityData = {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
};

export function useTeam() {
  const supabase = createBrowserSupabase();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitationData[]>([]);
  const [activities, setActivities] = useState<TeamActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        { data: membersData, error: membersError },
        { data: invitationsData, error: invitationsError },
        { data: activitiesData, error: activitiesError }
      ] = await Promise.all([
        supabase.from('team_members').select('*'),
        supabase.from('team_invitations').select('*'),
        supabase.from('team_activity').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (membersError) throw membersError;
      if (invitationsError) throw invitationsError;
      if (activitiesError) throw activitiesError;

      if (membersData) {
        setMembers(membersData.map(member => ({
          id: member.id,
          user_id: member.user_id,
          email: member.email,
          full_name: member.full_name,
          role: member.role as TeamRole,
          created_at: member.created_at,
          updated_at: member.updated_at,
          joined_at: member.joined_at
        })));
      }

      if (invitationsData) {
        setInvitations(invitationsData.map(invitation => ({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role as TeamRole,
          status: invitation.status as UserStatus,
          invited_by: invitation.invited_by,
          created_at: invitation.created_at,
          expires_at: invitation.expires_at
        })));
      }

      if (activitiesData) {
        setActivities(activitiesData.map(activity => ({
          id: activity.id,
          user_id: activity.user_id,
          action: activity.action,
          details: activity.details,
          created_at: activity.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Invite team member
  const inviteMember = useCallback(async (email: string, role: Exclude<TeamRole, 'OWNER'>) => {
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          email,
          role,
          status: 'pending' as UserStatus,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          invited_by: user.id
        } as Database['public']['Tables']['team_invitations']['Insert']);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Invitation sent to ${email}`,
      });

      // Refresh data after 100ms to ensure consistency
      setTimeout(() => fetchTeamData(), 100);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive'
      });
    }
  }, [supabase, fetchTeamData]);

  // Accept invitation
  const acceptInvitation = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' as UserStatus } as Partial<TeamInvitation>)
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Welcome to the team!',
      });

      // Refresh data after 100ms to ensure consistency
      setTimeout(() => fetchTeamData(), 100);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept invitation. Please try again.',
        variant: 'destructive'
      });
    }
  }, [supabase, fetchTeamData]);

  // Update member role
  const updateMemberRole = useCallback(async (memberId: string, role: TeamRole) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role } as Partial<TeamMember>)
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team member role updated',
      });

      // Refresh data after 100ms to ensure consistency
      setTimeout(() => fetchTeamData(), 100);
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive'
      });
    }
  }, [supabase, fetchTeamData]);

  // Remove team member
  const removeMember = useCallback(async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Team member removed',
      });

      // Refresh data after 100ms to ensure consistency
      setTimeout(() => fetchTeamData(), 100);
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member. Please try again.',
        variant: 'destructive'
      });
    }
  }, [supabase, fetchTeamData]);

  // Set up real-time subscriptions
  useEffect(() => {
    const membersSubscription = supabase
      .channel('team_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, fetchTeamData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_invitations' }, fetchTeamData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_activity' }, fetchTeamData)
      .subscribe();

    // Initial fetch
    fetchTeamData();

    return () => {
      membersSubscription.unsubscribe();
    };
  }, [supabase, fetchTeamData]);

  return {
    members,
    invitations,
    activities,
    loading,
    inviteMember,
    acceptInvitation,
    updateMemberRole,
    removeMember,
    refreshTeam: fetchTeamData
  };
}

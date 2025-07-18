import { useCallback, useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { TeamMember, TeamInvitation, TeamActivity, TeamRole } from '@/types/team';
import { toast } from '@/components/ui/use-toast';

export function useTeam() {
  const { supabase } = useSupabase();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
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

      setMembers(membersData || []);
      setInvitations(invitationsData || []);
      setActivities(activitiesData || []);
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
      const { error } = await supabase
        .from('team_invitations')
        .insert({ email, role });

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
        .update({ status: 'accepted' })
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
        .update({ role })
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

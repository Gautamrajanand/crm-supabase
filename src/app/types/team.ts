export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: TeamRole;
  created_at: string;
  updated_at: string;
  joined_at: string | null;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: Exclude<TeamRole, 'OWNER'>;
  invited_by: string;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
}

export interface TeamActivity {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

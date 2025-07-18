-- 1. Create a test invitation (as owner)
INSERT INTO team_invitations (email, role, invited_by)
VALUES ('test@example.com', 'MEMBER', 'a84db21e-0c8e-4502-a5e2-a8ccba9f4aea');

-- Verify invitation was created
SELECT * FROM team_invitations WHERE email = 'test@example.com';

-- 2. Accept the invitation (simulating the invitee accepting)
UPDATE team_invitations 
SET status = 'accepted' 
WHERE email = 'test@example.com';

-- 3. Verify new team member was created
SELECT * FROM team_members WHERE email = 'test@example.com';

-- 4. Check activity log
SELECT * FROM team_activity 
WHERE action = 'joined_team' 
ORDER BY created_at DESC 
LIMIT 1;

-- 5. Clean up test data (optional)
DELETE FROM team_invitations WHERE email = 'test@example.com';

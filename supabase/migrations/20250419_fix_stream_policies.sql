-- First, check and fix revenue stream policies
DROP POLICY IF EXISTS "stream_select" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_insert" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_update" ON public.revenue_streams;
DROP POLICY IF EXISTS "stream_delete" ON public.revenue_streams;

-- Create new policies
CREATE POLICY "stream_select" ON public.revenue_streams
    FOR SELECT USING (true);

CREATE POLICY "stream_insert" ON public.revenue_streams
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "stream_update" ON public.revenue_streams
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.revenue_stream_members m
            WHERE m.stream_id = id 
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "stream_delete" ON public.revenue_streams
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.revenue_stream_members m
            WHERE m.stream_id = id
            AND m.user_id = auth.uid()
            AND m.role = 'owner'
        )
    );

-- Make sure RLS is enabled
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;

-- Fix member policies
DROP POLICY IF EXISTS "member_select" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "member_insert" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "member_update" ON public.revenue_stream_members;
DROP POLICY IF EXISTS "member_delete" ON public.revenue_stream_members;

CREATE POLICY "member_select" ON public.revenue_stream_members
    FOR SELECT USING (true);

CREATE POLICY "member_insert" ON public.revenue_stream_members
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
            -- Allow creating first member as owner (for new streams)
            (
                role = 'owner' 
                AND user_id = auth.uid()
                AND NOT EXISTS (
                    SELECT 1 FROM public.revenue_stream_members m
                    WHERE m.stream_id = revenue_stream_members.stream_id
                )
            )
            OR
            -- Allow admins/owners to add members
            EXISTS (
                SELECT 1 FROM public.revenue_stream_members m
                WHERE m.stream_id = revenue_stream_members.stream_id
                AND m.user_id = auth.uid()
                AND m.role IN ('owner', 'admin')
            )
        )
    );

CREATE POLICY "member_update" ON public.revenue_stream_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.revenue_stream_members m
            WHERE m.stream_id = revenue_stream_members.stream_id
            AND m.user_id = auth.uid()
            AND m.role = 'owner'
        )
    );

CREATE POLICY "member_delete" ON public.revenue_stream_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.revenue_stream_members m
            WHERE m.stream_id = revenue_stream_members.stream_id
            AND m.user_id = auth.uid()
            AND m.role = 'owner'
        )
        OR user_id = auth.uid()
    );

-- Make sure RLS is enabled
ALTER TABLE public.revenue_stream_members ENABLE ROW LEVEL SECURITY;

-- Update the user_is_stream_member function to be less restrictive
CREATE OR REPLACE FUNCTION public.user_is_stream_member(check_stream_id uuid) 
RETURNS boolean AS $$
BEGIN
    -- For inserts with no stream_id (new streams), allow it
    IF check_stream_id IS NULL THEN
        RETURN true;
    END IF;

    -- Otherwise check membership
    RETURN EXISTS (
        SELECT 1 FROM public.revenue_stream_members m
        WHERE m.stream_id = check_stream_id
        AND m.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user_is_stream_member_with_role function to be less restrictive
CREATE OR REPLACE FUNCTION public.user_is_stream_member_with_role(check_stream_id uuid, required_role text[]) 
RETURNS boolean AS $$
BEGIN
    -- For inserts with no stream_id (new streams), allow it
    IF check_stream_id IS NULL THEN
        RETURN true;
    END IF;

    -- Otherwise check membership and role
    RETURN EXISTS (
        SELECT 1 FROM public.revenue_stream_members m
        WHERE m.stream_id = check_stream_id
        AND m.user_id = auth.uid()
        AND (
            array_length(required_role, 1) IS NULL -- If no roles specified, any role is fine
            OR m.role = ANY(required_role) -- Otherwise, must have one of the specified roles
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

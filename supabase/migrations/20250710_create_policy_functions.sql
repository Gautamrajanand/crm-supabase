-- Function to drop all policies for a table
CREATE OR REPLACE FUNCTION public.drop_all_policies(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = table_name
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
  END LOOP;
END;
$$;

-- Function to create a policy
CREATE OR REPLACE FUNCTION public.create_policy(
  policy_name text,
  table_name text,
  operation text,
  using_expression text,
  with_check_expression text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF operation = 'SELECT' THEN
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR %s USING (%s)',
      policy_name,
      table_name,
      operation,
      using_expression
    );
  ELSIF operation = 'INSERT' THEN
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR %s WITH CHECK (%s)',
      policy_name,
      table_name,
      operation,
      with_check_expression
    );
  ELSE
    IF with_check_expression IS NULL THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR %s USING (%s)',
        policy_name,
        table_name,
        operation,
        using_expression
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR %s USING (%s) WITH CHECK (%s)',
        policy_name,
        table_name,
        operation,
        using_expression,
        with_check_expression
      );
    END IF;
  END IF;
END;
$$;

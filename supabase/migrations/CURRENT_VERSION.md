# Current Database Version: v1.1

This version includes all migrations up to and including:
- 20250603_fix_prospect_policies.sql
- 20250602_fix_permissions.sql
- 20250602_fix_recursion.sql
- 20250602_revert_changes.sql
- 20250511_add_rls_all_tables.sql
- 20250416_revenue_streams_final_v12.sql
- ... (earlier migrations)

## Key Features
1. Fixed prospect RLS policies to handle both workspace and stream membership
2. Improved error handling and state revert on failures
3. Consolidated duplicate policies
4. Removed share stream option from revenue switcher

## How to Restore
If you need to restore to this version:
1. Check out git tag v1.1
2. Run `supabase db reset` to apply all migrations
3. This will recreate the database with all tables, policies, and base data

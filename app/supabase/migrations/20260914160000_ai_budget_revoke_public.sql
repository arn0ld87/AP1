-- Close privilege gap in AI budget RPCs (follow-up to 20260914150000).
--
-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default.
-- The revokes in 20260914150000_ai_budget_daily_rpc.sql only removed
-- direct grants for anon/authenticated; both roles still inherited
-- EXECUTE via PUBLIC. Any logged-in user could have called
-- release_ai_budget() to reset their own daily counter and bypass the
-- AI grading limit (or burned foreign budget via consume_ai_budget()).
--
-- Fix: revoke EXECUTE from PUBLIC, grant it explicitly to service_role
-- (the only intended caller: the grade-exam-answer edge function).
-- Statements are idempotent.

revoke execute on function public.consume_ai_budget(uuid, integer) from public;
revoke execute on function public.release_ai_budget(uuid) from public;

grant execute on function public.consume_ai_budget(uuid, integer) to service_role;
grant execute on function public.release_ai_budget(uuid) to service_role;

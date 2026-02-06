-- Function to get aggregated stats to reduce client-side processing
-- Run this in your Supabase SQL Editor

create or replace function get_user_stats(
  target_user_id uuid, 
  start_date timestamptz
)
returns table (
  date text,
  total_minutes numeric,
  session_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    to_char(started_at, 'YYYY-MM-DD') as date,
    sum(duration) / 60 as total_minutes,
    count(*) as session_count
  from pomodoro_sessions
  where 
    user_id = target_user_id
    and completed = true
    and mode = 'focus'
    and started_at >= start_date
  group by 1
  order by 1;
end;
$$;

SELECT cron.unschedule('refresh-admin-dashboard');
SELECT cron.schedule(
  'refresh-admin-dashboard',
  '*/5 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard_mv$$
);
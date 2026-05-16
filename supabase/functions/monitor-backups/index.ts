import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireCronAuth } from "../_shared/require-cron-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const unauthorized = requireCronAuth(req, corsHeaders);
  if (unauthorized) return unauthorized;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for failed backups
    const { data: failedBackups, error: queryError } = await supabase
      .from('backup_management.database_backups')
      .select()
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(10)

    if (queryError) {
      throw new Error(`Failed to query backup status: ${queryError.message}`)
    }

    // Clean up old backups
    await supabase.rpc('backup_management.cleanup_old_backups')

    // Check storage usage
    const { data: storageStats, error: storageError } = await supabase
      .from('backup_management.storage_backups')
      .select('backup_size')
      .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (storageError) {
      throw new Error(`Failed to get storage stats: ${storageError.message}`)
    }

    const totalStorageUsed = storageStats.reduce((acc, curr) => acc + (curr.backup_size || 0), 0)

    return new Response(
      JSON.stringify({
        success: true,
        failed_backups: failedBackups,
        total_storage_used: totalStorageUsed,
        monitored_at: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Backup monitoring failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
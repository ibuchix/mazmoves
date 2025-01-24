import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for failed backups in the last 24 hours
    const { data: failedBackups, error: queryError } = await supabase
      .from('backup_management.database_backups')
      .select('*')
      .eq('status', 'failed')
      .gt('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (queryError) {
      throw new Error(`Failed to query backup status: ${queryError.message}`)
    }

    // Check for storage backup failures
    const { data: failedStorageBackups, error: storageQueryError } = await supabase
      .from('backup_management.storage_backups')
      .select('*')
      .eq('status', 'failed')
      .gt('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (storageQueryError) {
      throw new Error(`Failed to query storage backup status: ${storageQueryError.message}`)
    }

    // If there are any failures, send notification (implement your notification logic here)
    if (failedBackups.length > 0 || failedStorageBackups.length > 0) {
      // Here you would implement your notification logic
      // For example, sending an email to administrators
      console.error('Backup failures detected:', {
        failedBackups,
        failedStorageBackups
      })
    }

    // Clean up old backups
    await supabase.rpc('backup_management.cleanup_old_backups')

    return new Response(
      JSON.stringify({ 
        success: true, 
        failedBackups: failedBackups.length,
        failedStorageBackups: failedStorageBackups.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Backup monitoring failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
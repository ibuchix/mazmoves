import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { base_recovery_point_id } = await req.json()

    if (!base_recovery_point_id) {
      throw new Error('Base recovery point ID is required')
    }

    // Create new incremental backup record
    const { data: backupRecord, error: createError } = await supabase.rpc(
      'backup_management.create_incremental_backup',
      { p_base_recovery_point_id: base_recovery_point_id }
    )

    if (createError) {
      throw new Error(`Failed to create incremental backup record: ${createError.message}`)
    }

    // Get the database connection string
    const dbUrl = Deno.env.get('SUPABASE_DB_URL')
    if (!dbUrl) {
      throw new Error('Database URL not configured')
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `incremental-${timestamp}-${base_recovery_point_id}.backup`

    // Execute pg_basebackup with WAL streaming
    const command = new Deno.Command("pg_basebackup", {
      args: [
        "-D", `/tmp/${backupFileName}`,
        "--format=tar",
        "--wal-method=stream",
        "--dbname", dbUrl,
        "--progress",
        "--verbose"
      ],
    });

    const { success, stdout, stderr } = await command.output();

    if (!success) {
      throw new Error(`Backup failed: ${new TextDecoder().decode(stderr)}`)
    }

    // Upload backup file to storage
    const { error: uploadError } = await supabase
      .storage
      .from('database_backups')
      .upload(`incremental/${backupFileName}`, stdout)

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`)
    }

    // Update backup record status
    const { error: updateError } = await supabase.rpc(
      'backup_management.update_incremental_backup_status',
      {
        p_backup_id: backupRecord.id,
        p_status: 'completed',
        p_backup_size: stdout.length,
        p_storage_path: `incremental/${backupFileName}`
      }
    )

    if (updateError) {
      throw new Error(`Failed to update backup status: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Incremental backup completed successfully',
        backup_id: backupRecord.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Incremental backup failed:', error)
    
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
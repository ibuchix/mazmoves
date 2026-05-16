import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { format } from "https://deno.land/std@0.168.0/datetime/mod.ts";
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

    const { data: { backup_type } } = await req.json()
    const timestamp = format(new Date(), "yyyy-MM-dd-HH-mm-ss")
    const backupFileName = `backup-${backup_type}-${timestamp}.sql`

    // Create backup record
    const { data: backupRecord, error: insertError } = await supabase
      .from('backup_management.database_backups')
      .insert({
        backup_type,
        backup_location: backupFileName,
        status: 'in_progress'
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create backup record: ${insertError.message}`)
    }

    // Perform the backup using pg_dump
    const dbUrl = Deno.env.get('SUPABASE_DB_URL')
    if (!dbUrl) {
      throw new Error('Database URL not configured')
    }

    // Execute pg_dump
    const command = new Deno.Command("pg_dump", {
      args: [
        dbUrl,
        "--format=custom",
        "--no-owner",
        "--no-acl"
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
      .upload(backupFileName, stdout)

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`)
    }

    // Update backup record
    const { error: updateError } = await supabase
      .from('backup_management.database_backups')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        backup_size: stdout.length,
        metadata: {
          success: true,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', backupRecord.id)

    if (updateError) {
      throw new Error(`Failed to update backup record: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Backup completed successfully',
        backup_id: backupRecord.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Backup failed:', error)
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { format } from "https://deno.land/std@0.168.0/datetime/mod.ts";

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

    const timestamp = format(new Date(), "yyyy-MM-dd-HH-mm-ss")
    
    // Create backup record
    const { data: backupRecord, error: insertError } = await supabase
      .from('backup_management.storage_backups')
      .insert({
        bucket_name: 'company_docs',
        status: 'in_progress'
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create backup record: ${insertError.message}`)
    }

    // List all files in the company_docs bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from('company_docs')
      .list()

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`)
    }

    let totalSize = 0
    const backupFolder = `storage-backup-${timestamp}`

    // Copy each file to the backup bucket
    for (const file of files) {
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('company_docs')
        .download(file.name)

      if (downloadError) {
        console.error(`Failed to download ${file.name}: ${downloadError.message}`)
        continue
      }

      const { error: uploadError } = await supabase
        .storage
        .from('database_backups')
        .upload(`${backupFolder}/${file.name}`, fileData)

      if (uploadError) {
        console.error(`Failed to upload ${file.name}: ${uploadError.message}`)
        continue
      }

      totalSize += file.metadata?.size || 0
    }

    // Update backup record
    const { error: updateError } = await supabase
      .from('backup_management.storage_backups')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_files: files.length,
        backup_size: totalSize,
        backup_location: backupFolder,
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
        message: 'Storage backup completed successfully',
        backup_id: backupRecord.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Storage backup failed:', error)
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
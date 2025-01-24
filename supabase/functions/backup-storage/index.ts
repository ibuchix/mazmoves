import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { format } from "https://deno.land/std@0.168.0/datetime/mod.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bucket_name } = await req.json()
    const timestamp = format(new Date(), "yyyy-MM-dd-HH-mm-ss")
    
    // Create backup record
    const { data: backupRecord, error: insertError } = await supabase
      .from('backup_management.storage_backups')
      .insert({
        bucket_name,
        status: 'in_progress'
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create backup record: ${insertError.message}`)
    }

    // List all files in the bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from(bucket_name)
      .list()

    if (listError) {
      throw new Error(`Failed to list bucket contents: ${listError.message}`)
    }

    let totalSize = 0
    const backupFiles = []

    // Download and backup each file
    for (const file of files) {
      const { data, error: downloadError } = await supabase
        .storage
        .from(bucket_name)
        .download(file.name)

      if (downloadError) {
        console.error(`Failed to download ${file.name}: ${downloadError.message}`)
        continue
      }

      const backupPath = `${bucket_name}-backup/${timestamp}/${file.name}`
      const { error: uploadError } = await supabase
        .storage
        .from('database_backups')
        .upload(backupPath, data)

      if (uploadError) {
        console.error(`Failed to upload ${file.name}: ${uploadError.message}`)
        continue
      }

      totalSize += data.size
      backupFiles.push(file.name)
    }

    // Update backup record
    const { error: updateError } = await supabase
      .from('backup_management.storage_backups')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_files: backupFiles.length,
        backup_size: totalSize,
        metadata: {
          files: backupFiles,
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
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Storage backup failed:', error)
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
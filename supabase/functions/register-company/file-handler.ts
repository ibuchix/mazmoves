import { SupabaseClient } from '@supabase/supabase-js'

export async function uploadInsuranceDocuments(
  supabase: SupabaseClient,
  transitInsurance: File,
  liabilityInsurance: File
): Promise<{ transitPath: string; liabilityPath: string }> {
  const uploadFile = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${prefix}_${crypto.randomUUID()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('company_docs')
      .upload(filePath, file)

    if (uploadError) throw uploadError
    return filePath
  }

  const [transitPath, liabilityPath] = await Promise.all([
    uploadFile(transitInsurance, 'transit'),
    uploadFile(liabilityInsurance, 'liability')
  ]);

  return { transitPath, liabilityPath };
}
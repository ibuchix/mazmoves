import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

async function validateFile(file: File): Promise<FileValidationResult> {
  // Max size 10MB
  const MAX_SIZE = 10 * 1024 * 1024;
  
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 10MB limit: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  // Check file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF and Word documents are allowed'
    };
  }

  return { isValid: true };
}

export async function uploadInsuranceDocuments(
  supabase: SupabaseClient,
  transitInsurance: File,
  liabilityInsurance: File,
  companyId: string
): Promise<{ transitPath: string; liabilityPath: string }> {
  // Validate files
  const transitValidation = await validateFile(transitInsurance);
  if (!transitValidation.isValid) {
    throw new Error(`Transit insurance: ${transitValidation.error}`);
  }

  const liabilityValidation = await validateFile(liabilityInsurance);
  if (!liabilityValidation.isValid) {
    throw new Error(`Liability insurance: ${liabilityValidation.error}`);
  }

  const uploadFile = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop();
    const sanitizedFileName = `${prefix}_${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${companyId}/${sanitizedFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('company_docs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Log the upload
    await supabase.from('document_access_logs').insert({
      document_path: filePath,
      company_id: companyId,
      action_type: 'upload'
    });

    return filePath;
  }

  const [transitPath, liabilityPath] = await Promise.all([
    uploadFile(transitInsurance, 'transit'),
    uploadFile(liabilityInsurance, 'liability')
  ]);

  return { transitPath, liabilityPath };
}
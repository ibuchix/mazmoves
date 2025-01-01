import { supabase } from "@/integrations/supabase/client";

export const uploadCompanyDocument = async (file: File, prefix: string) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${prefix}_${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('company_docs')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  return filePath;
};
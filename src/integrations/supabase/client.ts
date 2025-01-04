import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tcyulkuyfptlisfyefnn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Remove any trailing slashes and ensure proper URL formatting
const formattedUrl = supabaseUrl.replace(/\/+$/, '');

export const supabase = createClient(formattedUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'easymove'
    }
  }
});
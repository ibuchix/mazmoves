import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tcyulkuyfptlisfyefnn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeXVsa3V5ZnB0bGlzZnllZm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTQ0MzYsImV4cCI6MjA1MDQ5MDQzNn0.BCfN7FMzY2hDp26NGOWqrV197j2EztDEoplL0CF5_gg';

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
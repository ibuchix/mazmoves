import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcyulkuyfptlisfyefnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeXVsa3V5ZnB0bGlzZnllZm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NTQxNDcsImV4cCI6MjAyNDUzMDE0N30.GYq1B9MyEYNF3XPJvwA7GgLmxvE9NOYDYJhh0oqxwKo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
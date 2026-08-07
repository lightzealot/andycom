import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://pkimwppqoujxbntxdzxu.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraW13cHBxb3VqeGJudHhkenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTg5MjksImV4cCI6MjA2ODMzNDkyOX0.VeHDzVqhYmCWFRQdIn9TBv1Fo9keumcHUbcqg_zWE3s';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

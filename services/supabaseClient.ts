import { createClient } from '@supabase/supabase-js';

// Access keys securely from Vite environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("CRITICAL ERROR: Supabase Keys are missing. Please check your .env file.");
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || ''
);
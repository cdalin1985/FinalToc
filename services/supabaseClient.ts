
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ankvjywsnydpkepdvuvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua3ZqeXdzbnlkcGtlcGR2dXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTE2NzUsImV4cCI6MjA4MTUyNzY3NX0.6Zm9L1fWa0oYE8ni46WXdN1hhvK5Gek6ePKZF6ptVUU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const hasValidSupabaseConfig = true;

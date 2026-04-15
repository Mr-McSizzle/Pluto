import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables!',
    '\nVITE_SUPABASE_URL:', supabaseUrl ? '✓ set' : '✗ MISSING',
    '\nVITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ set' : '✗ MISSING',
    '\nMake sure these are set in your Netlify environment variables with the VITE_ prefix.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

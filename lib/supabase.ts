
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if the environment variables are set and valid
const isValidUrl = (url: string) => url.startsWith('https://');

export const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl))
    ? createClient(supabaseUrl, supabaseKey)
    : null;

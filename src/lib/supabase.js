import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yrtoehnganehpcvzvwyps.supabase.co"
const supabaseKey = "PASTE_YOUR_ANON_KEY_HERE"

export const supabase = createClient(supabaseUrl, supabaseKey)

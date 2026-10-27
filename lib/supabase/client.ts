import { createBrowserClient } from '@supabase/ssr'

const DEFAULT_SUPABASE_URL = 'https://tgmaxlijbvqjjjgzxcdl.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbWF4bGlqYnZxampqZ3p4Y2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTQxNDAsImV4cCI6MjEwODY3MDE0MH0.mg7XdwiCmFThivrRissyuivCQep_bHTDbRrqySMwbp0'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

  return createBrowserClient(url, key)
}

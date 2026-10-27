/**
 * Supabase Admin Client — gunakan HANYA di server-side (API Routes).
 * Service Role Key bypass seluruh RLS dan boleh menulis ke auth.users.
 * JANGAN pernah expose file ini ke client-side / browser.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tgmaxlijbvqjjjgzxcdl.supabase.co";

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbWF4bGlqYnZxampqZ3p4Y2RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzA5NDE0MCwiZXhwIjoyMTA4NjcwMTQwfQ.J7u9JofdipzboEjzJDfjJzDSw_1HeG2yO6bKvy8cIcs";

/**
 * Buat Supabase Admin Client dengan Service Role Key.
 * Client ini bypass RLS dan memiliki akses penuh termasuk ke auth.users.
 */
export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

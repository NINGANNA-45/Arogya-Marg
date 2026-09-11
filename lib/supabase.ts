import { createClient } from "@supabase/supabase-js";

function getValidSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    const match = url.match(/postgres\.([a-z0-9]+):/i);
    if (match && match[1]) {
      return `https://${match[1]}.supabase.co`;
    }
  }
  if (!url || !url.startsWith("http")) {
    return "https://placeholder.supabase.co";
  }
  return url;
}

const supabaseUrl = getValidSupabaseUrl();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

/**
 * Browser client — uses the anon key.
 * Safe to use on the client side. RLS applies.
 */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server client — uses the service role key.
 * ONLY use inside Next.js API routes (server-side). Bypasses RLS.
 * Never expose this to the browser.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

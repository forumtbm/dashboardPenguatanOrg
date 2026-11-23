import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Klien dengan service role key. HANYA dipakai di server untuk mengelola user. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diset di environment variables.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function usernameToEmail(username: string) {
  const domain = process.env.USERNAME_EMAIL_DOMAIN || "users.forumtbm.local";
  return `${username.trim().toLowerCase()}@${domain}`;
}

export const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

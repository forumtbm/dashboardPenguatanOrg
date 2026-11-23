"use server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { usernameToEmail } from "@/lib/supabase/admin";

export async function changePassword(_prev: { error?: string; ok?: string } | undefined, fd: FormData) {
  const me = await requireProfile();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  const confirm = String(fd.get("confirm") || "");
  if (next.length < 8) return { error: "Password baru minimal 8 karakter." };
  if (next !== confirm) return { error: "Konfirmasi password tidak sama." };
  const supabase = await createClient();
  const { error: e1 } = await supabase.auth.signInWithPassword({ email: usernameToEmail(me.username), password: current });
  if (e1) return { error: "Password lama salah." };
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };
  return { ok: "Password berhasil diubah." };
}

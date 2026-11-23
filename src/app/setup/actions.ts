"use server";
import { redirect } from "next/navigation";
import { createAdminClient, usernameToEmail, USERNAME_RE } from "@/lib/supabase/admin";

export async function isSetupOpen() {
  const admin = createAdminClient();
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true });
  return (count ?? 0) === 0;
}

export async function createFirstSuperuser(_prev: { error?: string } | undefined, formData: FormData) {
  if (!(await isSetupOpen())) return { error: "Setup sudah dilakukan. Silakan login." };
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const full_name = String(formData.get("full_name") || "").trim();
  const password = String(formData.get("password") || "");
  if (!USERNAME_RE.test(username)) return { error: "Username 3-32 karakter: huruf kecil, angka, titik, - atau _." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username, full_name },
  });
  if (error || !data.user) return { error: error?.message || "Gagal membuat user." };
  const { error: pErr } = await admin.from("profiles").insert({ id: data.user.id, username, full_name, role: "superadmin" });
  if (pErr) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: pErr.message };
  }
  redirect("/login");
}

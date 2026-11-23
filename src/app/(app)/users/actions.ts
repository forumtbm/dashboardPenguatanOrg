"use server";
import { revalidatePath } from "next/cache";
import { requireProfile, canManageUsers, type Role, type Profile } from "@/lib/auth";
import { createAdminClient, usernameToEmail, USERNAME_RE } from "@/lib/supabase/admin";

type Result = { error?: string; ok?: string } | undefined;
const ROLES: Role[] = ["superadmin", "admin", "operator", "viewer"];

async function requireManager(): Promise<Profile> {
  const p = await requireProfile();
  if (!canManageUsers(p.role)) throw new Error("Akses ditolak.");
  return p;
}

/** admin hanya boleh mengelola operator & viewer; superadmin boleh semua */
function canAssign(actor: Profile, role: Role) {
  return actor.role === "superadmin" || role === "operator" || role === "viewer";
}

async function getTarget(id: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("*").eq("id", id).maybeSingle();
  return data as Profile | null;
}

export async function createUser(_prev: Result, fd: FormData): Promise<Result> {
  const actor = await requireManager();
  const username = String(fd.get("username") || "").trim().toLowerCase();
  const full_name = String(fd.get("full_name") || "").trim() || null;
  const password = String(fd.get("password") || "");
  const role = String(fd.get("role") || "viewer") as Role;
  if (!USERNAME_RE.test(username)) return { error: "Username 3-32 karakter: huruf kecil, angka, titik, - atau _." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };
  if (!ROLES.includes(role) || !canAssign(actor, role)) return { error: "Anda tidak boleh membuat user dengan peran tersebut." };

  const admin = createAdminClient();
  const { data: exists } = await admin.from("profiles").select("id").eq("username", username).maybeSingle();
  if (exists) return { error: "Username sudah dipakai." };

  const { data, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username, full_name },
  });
  if (error || !data.user) return { error: error?.message || "Gagal membuat user." };
  const { error: pErr } = await admin.from("profiles").insert({ id: data.user.id, username, full_name, role });
  if (pErr) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: pErr.message };
  }
  revalidatePath("/users");
  return { ok: `User ${username} berhasil dibuat.` };
}

export async function updateUser(_prev: Result, fd: FormData): Promise<Result> {
  const actor = await requireManager();
  const id = String(fd.get("id"));
  const target = await getTarget(id);
  if (!target) return { error: "User tidak ditemukan." };
  if (!canAssign(actor, target.role)) return { error: "Anda tidak boleh mengubah user ini." };
  const role = String(fd.get("role") || target.role) as Role;
  if (!ROLES.includes(role) || !canAssign(actor, role)) return { error: "Peran tidak diizinkan." };
  if (id === actor.id && role !== actor.role) return { error: "Tidak dapat mengubah peran akun sendiri." };
  const full_name = String(fd.get("full_name") || "").trim() || null;
  const password = String(fd.get("password") || "");

  const admin = createAdminClient();
  if (password) {
    if (password.length < 8) return { error: "Password minimal 8 karakter." };
    const { error } = await admin.auth.admin.updateUserById(id, { password });
    if (error) return { error: error.message };
  }
  const { error } = await admin.from("profiles").update({ role, full_name }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/users");
  return { ok: `User ${target.username} diperbarui${password ? " (password direset)" : ""}.` };
}

export async function deleteUser(id: string) {
  const actor = await requireManager();
  if (id === actor.id) return { error: "Tidak dapat menghapus akun sendiri." };
  const target = await getTarget(id);
  if (!target) return { error: "User tidak ditemukan." };
  if (!canAssign(actor, target.role)) return { error: "Anda tidak boleh menghapus user ini." };
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id); // profil ikut terhapus (cascade)
  if (error) return { error: error.message };
  revalidatePath("/users");
}

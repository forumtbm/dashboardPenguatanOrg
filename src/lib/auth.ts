import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "superadmin" | "admin" | "operator" | "viewer";
export type Profile = { id: string; username: string; full_name: string | null; role: Role };

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function requireProfile(): Promise<Profile> {
  const p = await getProfile();
  if (!p) redirect("/login");
  return p;
}

export const canEdit = (r: Role) => r === "superadmin" || r === "admin" || r === "operator";
export const canManageUsers = (r: Role) => r === "superadmin" || r === "admin";

export async function requireEditor(): Promise<Profile> {
  const p = await requireProfile();
  if (!canEdit(p.role)) throw new Error("Anda tidak memiliki hak untuk mengubah data.");
  return p;
}

import { redirect } from "next/navigation";
import { requireProfile, canManageUsers, type Profile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const me = await requireProfile();
  if (!canManageUsers(me.role)) redirect("/");
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id, username, full_name, role, created_at").order("created_at");
  return <UsersClient me={me} users={(data ?? []) as (Profile & { created_at: string })[]} />;
}

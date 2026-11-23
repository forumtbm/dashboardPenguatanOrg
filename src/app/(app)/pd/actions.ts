"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireEditor } from "@/lib/auth";
import { orgRecordFromForm, friendlyDbError } from "@/lib/org-actions";

export async function savePD(_prev: { error?: string } | undefined, fd: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const rec = orgRecordFromForm(fd, "PD");
  if (!rec.kabupaten_id) return { error: "Kabupaten/Kota wajib dipilih." };
  const id = fd.get("id");
  const { error } = id
    ? await supabase.from("pengurus_daerah").update(rec).eq("id", Number(id))
    : await supabase.from("pengurus_daerah").insert(rec);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/pd");
}

export async function deletePD(id: number) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("pengurus_daerah").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/", "layout");
}

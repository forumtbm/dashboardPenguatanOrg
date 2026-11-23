"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireEditor } from "@/lib/auth";
import { orgRecordFromForm, friendlyDbError } from "@/lib/org-actions";

export async function savePW(_prev: { error?: string } | undefined, fd: FormData) {
  await requireEditor();
  const supabase = await createClient();
  const rec = orgRecordFromForm(fd, "PW");
  if (!rec.provinsi_kode) return { error: "Provinsi wajib dipilih." };
  const id = fd.get("id");
  const { error } = id
    ? await supabase.from("pengurus_wilayah").update(rec).eq("id", Number(id))
    : await supabase.from("pengurus_wilayah").insert(rec);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/pw");
}

export async function deletePW(id: number) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("pengurus_wilayah").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/", "layout");
}

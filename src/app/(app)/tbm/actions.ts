"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireEditor } from "@/lib/auth";
import { TBM_EDITABLE_COLUMNS, TBM_ARRAY_COLUMNS } from "@/lib/tbm-fields";
import { friendlyDbError } from "@/lib/org-actions";

export async function saveTbm(_prev: { error?: string } | undefined, fd: FormData) {
  await requireEditor();
  const rec: Record<string, unknown> = {};
  for (const c of TBM_EDITABLE_COLUMNS) {
    const raw = String(fd.get(c) ?? "").trim();
    if (TBM_ARRAY_COLUMNS.has(c)) {
      const items = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      rec[c] = items.length ? items : null;
    } else rec[c] = raw || null;
  }
  if (!rec.nama_tbm) return { error: "Nama TBM wajib diisi." };
  const supabase = await createClient();
  const id = fd.get("id");
  const { error } = id
    ? await supabase.from("tbm").update(rec).eq("id", Number(id))
    : await supabase.from("tbm").insert(rec);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/tbm");
}

export async function deleteTbm(id: number) {
  await requireEditor();
  const supabase = await createClient();
  const { error } = await supabase.from("tbm").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/", "layout");
}

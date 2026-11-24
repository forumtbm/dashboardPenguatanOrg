"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, canEdit } from "@/lib/auth";
import { friendlyDbError } from "@/lib/org-actions";

export async function savePortofolio(_prev: { error?: string } | undefined, fd: FormData) {
  const me = await getProfile();
  if (!me || !canEdit(me.role)) return { error: "Anda tidak memiliki hak untuk mengubah data." };
  const tbm_id = Number(fd.get("tbm_id"));
  const isi = String(fd.get("isi") ?? "").trim();
  const judul = String(fd.get("judul") ?? "").trim() || null;
  const tanggal = String(fd.get("tanggal") ?? "").trim() || new Date().toISOString().slice(0, 10);
  if (!tbm_id) return { error: "Pilih TBM terlebih dahulu." };
  if (!isi) return { error: "Isi portofolio/kegiatan wajib diisi." };

  const supabase = await createClient();
  const id = fd.get("id");
  const rec = { tbm_id, judul, isi, tanggal };
  const { error } = id
    ? await supabase.from("tbm_portofolio").update(rec).eq("id", Number(id))
    : await supabase.from("tbm_portofolio").insert(rec);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/portofolio", "layout");
  redirect(`/portofolio/tbm/${tbm_id}`);
}

export async function deletePortofolio(id: number) {
  const me = await getProfile();
  if (!me || !canEdit(me.role)) return { error: "Anda tidak memiliki hak untuk mengubah data." };
  const supabase = await createClient();
  const { error } = await supabase.from("tbm_portofolio").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error.message) };
  revalidatePath("/portofolio", "layout");
}

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import PortoForm from "@/components/PortoForm";

const TBM_COLS = "id, nama_tbm, nomor_anggota_tbm, kabupaten_nama, provinsi_nama";

export default async function PortoUpdatePage({ searchParams }: { searchParams: Promise<{ tbm?: string; edit?: string }> }) {
  const sp = await searchParams;
  const me = await requireProfile();
  if (!canEdit(me.role)) redirect("/portofolio");
  const supabase = await createClient();

  let entry = null;
  let tbmId = sp.tbm ? Number(sp.tbm) : null;
  if (sp.edit) {
    const { data } = await supabase.from("tbm_portofolio").select("id, tbm_id, tanggal, judul, isi").eq("id", Number(sp.edit)).maybeSingle();
    if (!data) notFound();
    entry = data;
    tbmId = data.tbm_id;
  }
  let tbm = null;
  if (tbmId) {
    const { data } = await supabase.from("tbm").select(TBM_COLS).eq("id", tbmId).maybeSingle();
    tbm = data;
  }
  return <PortoForm key={`${tbmId}-${sp.edit ?? ""}`} tbm={tbm} entry={entry} />;
}

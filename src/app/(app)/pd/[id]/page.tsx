import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import OrgForm from "@/components/OrgForm";
import { savePD } from "../actions";

export default async function PDEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kabupaten?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: provinsi }, { data: kabupaten }, { data: existing }] = await Promise.all([
    supabase.from("ref_provinsi").select("kode, nama").order("kode"),
    supabase.from("ref_kabupaten").select("id, nama, provinsi_kode").order("provinsi_kode").order("kode"),
    supabase.from("pengurus_daerah").select("kabupaten_id"),
  ]);
  let initial: Record<string, unknown> = { kabupaten_id: sp.kabupaten ?? "", status: "AKTIF" };
  if (id !== "baru") {
    const { data } = await supabase.from("pengurus_daerah").select("*").eq("id", Number(id)).maybeSingle();
    if (!data) notFound();
    initial = data;
  }
  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="h1">{id === "baru" ? "Tambah" : canEdit(profile.role) ? "Edit" : "Detail"} Pengurus Daerah</h1>
      <OrgForm
        level="PD"
        action={savePD}
        initial={initial}
        provinsi={provinsi ?? []}
        kabupaten={kabupaten ?? []}
        takenKeys={(existing ?? []).map((e) => String(e.kabupaten_id))}
        readOnly={!canEdit(profile.role)}
      />
    </div>
  );
}

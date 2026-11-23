import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import OrgForm from "@/components/OrgForm";
import { savePW } from "../actions";

export default async function PWEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ provinsi?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: provinsi }, { data: existing }] = await Promise.all([
    supabase.from("ref_provinsi").select("kode, nama").order("kode"),
    supabase.from("pengurus_wilayah").select("provinsi_kode"),
  ]);
  let initial: Record<string, unknown> = { provinsi_kode: sp.provinsi ?? "", status: "AKTIF" };
  if (id !== "baru") {
    const { data } = await supabase.from("pengurus_wilayah").select("*").eq("id", Number(id)).maybeSingle();
    if (!data) notFound();
    initial = data;
  }
  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="h1">{id === "baru" ? "Tambah" : canEdit(profile.role) ? "Edit" : "Detail"} Pengurus Wilayah</h1>
      <OrgForm
        level="PW"
        action={savePW}
        initial={initial}
        provinsi={provinsi ?? []}
        takenKeys={(existing ?? []).map((e) => e.provinsi_kode)}
        readOnly={!canEdit(profile.role)}
      />
    </div>
  );
}

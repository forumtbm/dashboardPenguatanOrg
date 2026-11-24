import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import TbmForm from "@/components/TbmForm";
import { saveTbm } from "../actions";
import { titleCase } from "@/lib/constants";

export default async function TbmEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: provinsi }, { data: kabupaten }] = await Promise.all([
    supabase.from("ref_provinsi").select("kode, nama").order("kode"),
    supabase.from("ref_kabupaten").select("nama, provinsi_kode").order("provinsi_kode").order("kode"),
  ]);
  let initial: Record<string, unknown> = { negara: "Indonesia" };
  let mapped: string | null = null;
  if (id !== "baru") {
    const { data } = await supabase.from("tbm").select("*, ref_kabupaten(nama)").eq("id", Number(id)).maybeSingle();
    if (!data) notFound();
    initial = data;
    mapped = (data.ref_kabupaten as { nama: string } | null)?.nama ?? null;
  }
  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="h1">{id === "baru" ? "Tambah Anggota TBM" : (initial.nama_tbm as string) || "Detail TBM"}</h1>
        {id !== "baru" && (
          <a href={`/portofolio/tbm/${id}`} className="text-sm text-emerald-700 hover:underline">Lihat portofolio TBM ini →</a>
        )}
        {id !== "baru" &&
          (mapped ? (
            <p className="text-sm text-stone-500">Terpetakan ke wilayah: <b>{titleCase(mapped)}</b></p>
          ) : (
            <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Provinsi/kabupaten belum cocok dengan data referensi, sehingga TBM ini belum terhitung di dashboard daerah.
              Perbaiki penulisan nama provinsi/kabupaten (pilih dari daftar saran).
            </p>
          ))}
      </div>
      <TbmForm action={saveTbm} initial={initial} provinsi={provinsi ?? []} kabupaten={kabupaten ?? []} readOnly={!canEdit(profile.role)} />
    </div>
  );
}

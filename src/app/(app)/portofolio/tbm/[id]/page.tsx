import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import { titleCase } from "@/lib/constants";
import DeleteButton from "@/components/DeleteButton";
import { deletePortofolio } from "../../actions";

const list = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v ? String(v) : "");

export default async function PortoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireProfile();
  const editable = canEdit(me.role);
  const supabase = await createClient();
  const [{ data: t }, { data: entries }] = await Promise.all([
    supabase.from("tbm").select("*, ref_kabupaten(nama), ref_provinsi(nama)").eq("id", Number(id)).maybeSingle(),
    supabase.from("tbm_portofolio").select("id, tanggal, judul, isi, updated_at").eq("tbm_id", Number(id))
      .order("tanggal", { ascending: false }).order("id", { ascending: false }),
  ]);
  if (!t) notFound();
  const kab = (t.ref_kabupaten as { nama: string } | null)?.nama ?? t.kabupaten_nama;
  const prov = (t.ref_provinsi as { nama: string } | null)?.nama ?? t.provinsi_nama;

  const info: [string, string][] = [
    ["Nomor Anggota", t.nomor_anggota_tbm ?? ""],
    ["Lokasi", [t.alamat_desa, t.alamat_kecamatan, titleCase(kab), titleCase(prov)].filter(Boolean).join(", ")],
    ["Status", t.status ?? ""],
    ["Badan Hukum (bentuk kelembagaan)", t.kelembagaan_bentuk ?? ""],
    ["Layanan Literasi Dasar", list(t.program_layanan_literasi_dasar)],
    ["Kegiatan Rutin", list(t.program_kegiatan_kerap)],
    ["Jumlah Buku", t.program_jml_buku ?? ""],
    ["Sumber Dana", list(t.program_sumber_dana)],
    ["Minat Pengembangan Kapasitas", t.kap_minat_pengembangan ?? ""],
    ["Topik Pengembangan Kapasitas", [t.kap_topik_literasi, t.kap_topik_keorganisasian, t.kap_topik_kecakapan_diri, t.kap_topik_kecakapan_hidup].map(list).filter(Boolean).join(", ")],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t.nama_tbm || "(tanpa nama)"}</h2>
          <p className="text-sm text-stone-500">{entries?.length ?? 0} catatan portofolio</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/tbm/${t.id}`} className="btn-secondary">Data lengkap TBM</Link>
          {editable && <Link href={`/portofolio/update?tbm=${t.id}`} className="btn-primary">+ Tambah Portofolio</Link>}
        </div>
      </div>

      <section className="card grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
        {info.map(([k, v]) => (
          <div key={k}>
            <div className="text-xs font-semibold text-stone-500">{k}</div>
            <div>{v || <span className="text-stone-400">—</span>}</div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Portofolio dan Kegiatan</h3>
        {(entries ?? []).length === 0 && (
          <div className="card py-8 text-center text-sm text-stone-500">Belum ada catatan portofolio.</div>
        )}
        <ol className="relative space-y-3 border-l-2 border-emerald-100 pl-5">
          {(entries ?? []).map((e) => (
            <li key={e.id} className="card relative p-4">
              <span className="absolute -left-[27px] top-5 h-3 w-3 rounded-full border-2 border-white bg-emerald-600" />
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-emerald-700">
                    {new Date(e.tanggal + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  {e.judul && <div className="font-semibold">{e.judul}</div>}
                </div>
                {editable && (
                  <div className="flex gap-1">
                    <Link href={`/portofolio/update?edit=${e.id}`} className="btn-secondary btn-sm">Edit</Link>
                    <DeleteButton action={deletePortofolio.bind(null, e.id)} confirmText="Hapus catatan portofolio ini?" />
                  </div>
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-800">{e.isi}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

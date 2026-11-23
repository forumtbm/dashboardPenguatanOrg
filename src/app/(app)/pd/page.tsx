import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import { titleCase, PD_STATUS } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "@/components/DeleteButton";
import { deletePD } from "./actions";

export default async function PDPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; provinsi?: string }>;
}) {
  const sp = await searchParams;
  const profile = await requireProfile();
  const editable = canEdit(profile.role);
  const supabase = await createClient();

  let q = supabase.from("v_daerah").select("*").not("pd_id", "is", null);
  if (sp.provinsi) q = q.eq("provinsi_kode", sp.provinsi);
  if (sp.status) q = q.eq("status_pd", sp.status);
  if (sp.q) q = q.ilike("kabupaten_nama", `%${sp.q}%`);
  const [{ data: rows }, { data: pd }, { data: provinsi }] = await Promise.all([
    q.order("provinsi_kode").order("kabupaten_kode"),
    supabase.from("pengurus_daerah").select("id, ketua, tahun_musda, nomor_sk, periode_mulai, periode_selesai"),
    supabase.from("ref_provinsi").select("kode, nama").order("kode"),
  ]);
  const pdMap = new Map((pd ?? []).map((r) => [r.id, r]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">Pengurus Daerah (PD)</h1>
          <p className="text-sm text-stone-500">Jumlah TBM dihitung otomatis dari data anggota TBM di kabupaten/kota tersebut.</p>
        </div>
        {editable && <Link href="/pd/baru" className="btn-primary">+ Tambah PD</Link>}
      </div>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Cari kabupaten/kota..." className="input max-w-xs" />
        <select name="provinsi" defaultValue={sp.provinsi ?? ""} className="input max-w-[240px]">
          <option value="">Semua provinsi</option>
          {(provinsi ?? []).map((p) => <option key={p.kode} value={p.kode}>{titleCase(p.nama)}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[200px]">
          <option value="">Semua status</option>
          {PD_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="btn-secondary">Terapkan</button>
      </form>
      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Kabupaten/Kota</th><th>Provinsi</th><th>Status</th><th>Ketua</th><th>Musda</th><th>Nomor SK</th>
              <th>Periode</th><th className="text-right">TBM</th><th></th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const d = pdMap.get(r.pd_id);
              return (
                <tr key={r.kabupaten_id}>
                  <td className="font-medium">{titleCase(r.kabupaten_nama)}</td>
                  <td>{titleCase(r.provinsi_nama)}</td>
                  <td><StatusBadge status={r.status_pd} /></td>
                  <td>{d?.ketua ?? "—"}</td>
                  <td>{d?.tahun_musda ?? "—"}</td>
                  <td>{d?.nomor_sk ?? "—"}</td>
                  <td>{d?.periode_mulai ? `${d.periode_mulai}–${d.periode_selesai ?? ""}` : "—"}</td>
                  <td className="text-right tabular-nums">{r.jumlah_tbm}</td>
                  <td className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/pd/${r.pd_id}`} className="btn-secondary btn-sm">{editable ? "Edit" : "Lihat"}</Link>
                      {editable && <DeleteButton action={deletePD.bind(null, r.pd_id)} />}
                    </div>
                  </td>
                </tr>
              );
            })}
            {(rows ?? []).length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-stone-500">Belum ada data PD. Tambahkan lewat tombol di atas atau dari menu Identifikasi Daerah.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

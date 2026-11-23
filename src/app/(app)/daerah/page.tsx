import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import { titleCase, THRESHOLD_POTENSI_PD, TERBENTUK } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";

export default async function DaerahPage({
  searchParams,
}: {
  searchParams: Promise<{ provinsi?: string; pd?: string; pw?: string; q?: string; potensi?: string }>;
}) {
  const sp = await searchParams;
  const profile = await requireProfile();
  const editable = canEdit(profile.role);
  const supabase = await createClient();

  let q = supabase.from("v_daerah").select("*");
  if (sp.provinsi) q = q.eq("provinsi_kode", sp.provinsi);
  if (sp.q) q = q.ilike("kabupaten_nama", `%${sp.q}%`);
  if (sp.pd === "BELUM") q = q.or("status_pd.is.null,status_pd.eq.PEMBENTUKAN");
  else if (sp.pd) q = q.eq("status_pd", sp.pd);
  if (sp.pw === "BELUM") q = q.or("status_pw.is.null,status_pw.eq.PRESIDIUM");
  else if (sp.pw === "ADA") q = q.in("status_pw", TERBENTUK);
  if (sp.potensi) q = q.gte("jumlah_tbm", THRESHOLD_POTENSI_PD).or("status_pd.is.null,status_pd.eq.PEMBENTUKAN");

  const [{ data: rows }, { data: provinsi }] = await Promise.all([
    q.order("provinsi_kode").order("kabupaten_kode"),
    supabase.from("ref_provinsi").select("kode, nama").order("kode"),
  ]);
  const exportQs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">Identifikasi Daerah Kabupaten/Kota</h1>
          <p className="text-sm text-stone-500">Status PW, status PD dan jumlah TBM terdaftar per kabupaten/kota.</p>
        </div>
        <a href={`/api/export/daerah?${exportQs}`} className="btn-secondary">Unduh CSV</a>
      </div>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Cari kabupaten/kota..." className="input max-w-xs" />
        <select name="provinsi" defaultValue={sp.provinsi ?? ""} className="input max-w-[220px]">
          <option value="">Semua provinsi</option>
          {(provinsi ?? []).map((p) => <option key={p.kode} value={p.kode}>{titleCase(p.nama)}</option>)}
        </select>
        <select name="pw" defaultValue={sp.pw ?? ""} className="input max-w-[200px]">
          <option value="">Status PW: semua</option>
          <option value="ADA">PW terbentuk</option>
          <option value="BELUM">PW belum terbentuk</option>
        </select>
        <select name="pd" defaultValue={sp.pd ?? ""} className="input max-w-[200px]">
          <option value="">Status PD: semua</option>
          <option value="AKTIF">PD aktif</option>
          <option value="TIDAK_AKTIF">PD tidak aktif</option>
          <option value="PEMBENTUKAN">PD dalam pembentukan</option>
          <option value="BELUM">PD belum terbentuk</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="potensi" value="1" defaultChecked={!!sp.potensi} />
          Berpotensi PD (≥ {THRESHOLD_POTENSI_PD} TBM)
        </label>
        <button className="btn-secondary">Terapkan</button>
      </form>
      <p className="text-sm text-stone-500">{rows?.length ?? 0} kabupaten/kota</p>
      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr><th>Provinsi</th><th>Kabupaten/Kota</th><th>Status PW</th><th>Status PD</th><th className="text-right">TBM terdaftar</th><th></th></tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const potensi = r.jumlah_tbm >= THRESHOLD_POTENSI_PD && !TERBENTUK.includes(r.status_pd ?? "");
              return (
                <tr key={r.kabupaten_id}>
                  <td>{titleCase(r.provinsi_nama)}</td>
                  <td className="font-medium">
                    {titleCase(r.kabupaten_nama)}
                    {potensi && <span className="badge ml-2 bg-amber-50 text-amber-800 ring-1 ring-amber-200">Berpotensi PD</span>}
                  </td>
                  <td><StatusBadge status={r.status_pw} /></td>
                  <td><StatusBadge status={r.status_pd} /></td>
                  <td className="text-right tabular-nums">
                    <Link className="text-emerald-700 hover:underline" href={`/tbm?kabupaten=${r.kabupaten_id}`}>{r.jumlah_tbm}</Link>
                  </td>
                  <td className="text-right">
                    {r.pd_id ? (
                      <Link href={`/pd/${r.pd_id}`} className="btn-secondary btn-sm">Lihat PD</Link>
                    ) : editable ? (
                      <Link href={`/pd/baru?kabupaten=${r.kabupaten_id}`} className="btn-secondary btn-sm">+ PD</Link>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

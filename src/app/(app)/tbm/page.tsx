import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import { titleCase } from "@/lib/constants";
import DeleteButton from "@/components/DeleteButton";
import { deleteTbm } from "./actions";

const PAGE = 25;

type SP = { q?: string; provinsi?: string; kabupaten?: string; status?: string; unmapped?: string; page?: string };

export default async function TbmPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const profile = await requireProfile();
  const editable = canEdit(profile.role);
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();

  let q = supabase
    .from("tbm")
    .select("id, nama_tbm, nomor_anggota_tbm, status, provinsi_nama, kabupaten_nama, kabupaten_id, nama_pendaftar, updated_at", { count: "exact" });
  if (sp.q) {
    const term = sp.q.replace(/[,()*]/g, " ").trim();
    q = q.or(`nama_tbm.ilike.*${term}*,nomor_anggota_tbm.ilike.*${term}*,nama_pendaftar.ilike.*${term}*`);
  }
  if (sp.provinsi) q = q.eq("provinsi_kode", sp.provinsi);
  if (sp.kabupaten) q = q.eq("kabupaten_id", Number(sp.kabupaten));
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.unmapped) q = q.is("kabupaten_id", null);
  const from = (page - 1) * PAGE;

  const [{ data: rows, count, error }, { data: provinsi }, { data: statuses }] = await Promise.all([
    q.order("id", { ascending: false }).range(from, from + PAGE - 1),
    supabase.from("ref_provinsi").select("kode, nama").order("kode"),
    supabase.from("v_tbm_status").select("*"),
  ]);
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const qs = (p: number) => {
    const u = new URLSearchParams(Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `/tbm?${u.toString()}`;
  };
  const exportQs = new URLSearchParams(
    Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]
  ).toString();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">Data Anggota Forum TBM</h1>
          <p className="text-sm text-stone-500">{total.toLocaleString("id-ID")} data</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/export/tbm?${exportQs}`} className="btn-secondary">Unduh CSV</a>
          {editable && <Link href="/tbm/import" className="btn-secondary">Upload CSV</Link>}
          {editable && <Link href="/tbm/baru" className="btn-primary">+ Tambah TBM</Link>}
        </div>
      </div>
      <form className="flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Cari nama TBM / no. anggota / pendaftar" className="input max-w-sm" />
        <select name="provinsi" defaultValue={sp.provinsi ?? ""} className="input max-w-[220px]">
          <option value="">Semua provinsi</option>
          {(provinsi ?? []).map((p) => <option key={p.kode} value={p.kode}>{titleCase(p.nama)}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[200px]">
          <option value="">Semua status</option>
          {(statuses ?? []).filter((s) => s.status !== "(kosong)").map((s) => (
            <option key={s.status} value={s.status}>{s.status} ({s.jumlah})</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="unmapped" value="1" defaultChecked={!!sp.unmapped} /> Wilayah belum cocok
        </label>
        {sp.kabupaten && <input type="hidden" name="kabupaten" value={sp.kabupaten} />}
        <button className="btn-secondary">Terapkan</button>
        {Object.values(sp).some(Boolean) && <Link href="/tbm" className="text-sm text-stone-500 hover:underline">Reset</Link>}
      </form>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>}
      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Nama TBM</th><th>No. Anggota</th><th>Kabupaten/Kota</th><th>Provinsi</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id}>
                <td className="tabular-nums text-stone-500">{r.id}</td>
                <td className="font-medium">
                  {r.nama_tbm || "—"}
                  {r.nama_pendaftar && <div className="text-xs font-normal text-stone-500">{r.nama_pendaftar}</div>}
                </td>
                <td>{r.nomor_anggota_tbm ?? "—"}</td>
                <td>
                  {r.kabupaten_nama ?? "—"}
                  {!r.kabupaten_id && r.kabupaten_nama && <span className="badge ml-1 bg-amber-50 text-amber-800">belum cocok</span>}
                </td>
                <td>{r.provinsi_nama ?? "—"}</td>
                <td><span className="badge bg-stone-100 text-stone-700">{r.status ?? "—"}</span></td>
                <td className="whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/tbm/${r.id}`} className="btn-secondary btn-sm">{editable ? "Edit" : "Lihat"}</Link>
                    {editable && <DeleteButton action={deleteTbm.bind(null, r.id)} />}
                  </div>
                </td>
              </tr>
            ))}
            {(rows ?? []).length === 0 && <tr><td colSpan={7} className="py-8 text-center text-stone-500">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Halaman {page} dari {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs(page - 1)} className="btn-secondary btn-sm">← Sebelumnya</Link>}
            {page < pages && <Link href={qs(page + 1)} className="btn-secondary btn-sm">Berikutnya →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}

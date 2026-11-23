import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canEdit } from "@/lib/auth";
import { titleCase, PW_STATUS } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "@/components/DeleteButton";
import { deletePW } from "./actions";

export default async function PWPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const profile = await requireProfile();
  const editable = canEdit(profile.role);
  const supabase = await createClient();
  const [{ data: prov }, { data: pw }] = await Promise.all([
    supabase.from("v_provinsi").select("*").order("provinsi_kode"),
    supabase.from("pengurus_wilayah").select("id, provinsi_kode, ketua, tahun_muswil, nomor_sk, periode_mulai, periode_selesai, nomor_kontak"),
  ]);
  const pwMap = new Map((pw ?? []).map((r) => [r.provinsi_kode, r]));
  let rows = (prov ?? []).map((p) => ({ ...p, pw: pwMap.get(p.provinsi_kode) }));
  if (sp.status === "BELUM") rows = rows.filter((r) => !r.status_pw);
  else if (sp.status) rows = rows.filter((r) => r.status_pw === sp.status);
  if (sp.q) rows = rows.filter((r) => r.provinsi_nama.toLowerCase().includes(sp.q!.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">Pengurus Wilayah (PW)</h1>
          <p className="text-sm text-stone-500">Identifikasi PW per provinsi. Jumlah PD dihitung otomatis dari data PD berstatus aktif/tidak aktif.</p>
        </div>
        {editable && <Link href="/pw/baru" className="btn-primary">+ Tambah PW</Link>}
      </div>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Cari provinsi..." className="input max-w-xs" />
        <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[200px]">
          <option value="">Semua status</option>
          {PW_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          <option value="BELUM">Belum terbentuk</option>
        </select>
        <button className="btn-secondary">Terapkan</button>
      </form>
      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Provinsi</th><th>Status</th><th>Ketua</th><th>Muswil</th><th>Nomor SK</th><th>Periode</th>
              <th className="text-right">PD</th><th className="text-right">TBM</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.provinsi_kode}>
                <td className="font-medium">{titleCase(r.provinsi_nama)}</td>
                <td><StatusBadge status={r.status_pw} /></td>
                <td>{r.pw?.ketua ?? "—"}</td>
                <td>{r.pw?.tahun_muswil ?? "—"}</td>
                <td>{r.pw?.nomor_sk ?? "—"}</td>
                <td>{r.pw?.periode_mulai ? `${r.pw.periode_mulai}–${r.pw.periode_selesai ?? ""}` : "—"}</td>
                <td className="text-right tabular-nums">{r.jumlah_pd}</td>
                <td className="text-right tabular-nums">{r.jumlah_tbm}</td>
                <td className="whitespace-nowrap text-right">
                  {r.pw ? (
                    <div className="flex justify-end gap-1">
                      <Link href={`/pw/${r.pw.id}`} className="btn-secondary btn-sm">{editable ? "Edit" : "Lihat"}</Link>
                      {editable && <DeleteButton action={deletePW.bind(null, r.pw.id)} />}
                    </div>
                  ) : editable ? (
                    <Link href={`/pw/baru?provinsi=${r.provinsi_kode}`} className="btn-secondary btn-sm">+ Tambah</Link>
                  ) : null}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-stone-500">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

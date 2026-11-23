import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { titleCase, THRESHOLD_POTENSI_PD, THRESHOLD_POTENSI_PW, TERBENTUK } from "@/lib/constants";
import { PDPerPWChart, SimpleBarChart } from "@/components/Charts";
import StatusBadge from "@/components/StatusBadge";

function Stat({ label, value, sub, href }: { label: string; value: number; sub?: string; href?: string }) {
  const body = (
    <div className="card h-full p-4 transition hover:border-emerald-300">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums text-stone-900">{value.toLocaleString("id-ID")}</div>
      {sub && <div className="mt-1 text-xs text-stone-500">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: prov }, { data: daerah }, { data: tbmStatus }] = await Promise.all([
    supabase.from("v_provinsi").select("*").order("provinsi_kode"),
    supabase.from("v_daerah").select("*").order("provinsi_kode").order("kabupaten_kode"),
    supabase.from("v_tbm_status").select("*"),
  ]);
  const P = prov ?? [];
  const D = daerah ?? [];

  const cnt = <T,>(arr: T[], f: (x: T) => boolean) => arr.filter(f).length;
  const pwAktif = cnt(P, (p) => p.status_pw === "AKTIF");
  const pwTidak = cnt(P, (p) => p.status_pw === "TIDAK_AKTIF");
  const pwPresidium = cnt(P, (p) => p.status_pw === "PRESIDIUM");
  const pwTotal = pwAktif + pwTidak;
  const pdAktif = cnt(D, (d) => d.status_pd === "AKTIF");
  const pdTidak = cnt(D, (d) => d.status_pd === "TIDAK_AKTIF");
  const pdPembentukan = cnt(D, (d) => d.status_pd === "PEMBENTUKAN");
  const pdTotal = pdAktif + pdTidak;
  const totalTbm = (tbmStatus ?? []).reduce((s, r) => s + r.jumlah, 0);

  const potensiPD = D.filter((d) => d.jumlah_tbm >= THRESHOLD_POTENSI_PD && !TERBENTUK.includes(d.status_pd ?? ""))
    .sort((a, b) => b.jumlah_tbm - a.jumlah_tbm);
  const potensiPW = P.filter((p) => p.jumlah_pd >= THRESHOLD_POTENSI_PW && !TERBENTUK.includes(p.status_pw ?? ""))
    .sort((a, b) => b.jumlah_pd - a.jumlah_pd);

  const pdPerPW = P.map((p) => ({
    nama: titleCase(p.provinsi_nama),
    aktif: p.pd_aktif,
    tidak_aktif: p.pd_tidak_aktif,
    pembentukan: p.pd_pembentukan,
  }))
    .filter((r) => r.aktif + r.tidak_aktif + r.pembentukan > 0)
    .sort((a, b) => b.aktif + b.tidak_aktif + b.pembentukan - (a.aktif + a.tidak_aktif + a.pembentukan));

  const tbmPerProv = P.filter((p) => p.jumlah_tbm > 0)
    .map((p) => ({ nama: titleCase(p.provinsi_nama), jumlah: p.jumlah_tbm }))
    .sort((a, b) => b.jumlah - a.jumlah);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Dashboard Penguatan Organisasi</h1>
        <p className="text-sm text-stone-500">Monitoring Pengurus Wilayah, Pengurus Daerah dan Keanggotaan Forum TBM</p>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-600">Pengurus Wilayah ({P.length} provinsi)</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Jumlah PW" value={pwTotal} sub="terbentuk (aktif + tidak aktif)" href="/pw" />
          <Stat label="PW Aktif" value={pwAktif} href="/pw?status=AKTIF" />
          <Stat label="PW Tidak Aktif" value={pwTidak} href="/pw?status=TIDAK_AKTIF" />
          <Stat label="PW Presidium" value={pwPresidium} href="/pw?status=PRESIDIUM" />
          <Stat label="Belum Terbentuk PW" value={P.length - pwTotal} sub="provinsi (termasuk presidium)" href="/pw?status=BELUM" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-600">Pengurus Daerah ({D.length} kabupaten/kota)</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Jumlah PD" value={pdTotal} sub="terbentuk (aktif + tidak aktif)" href="/pd" />
          <Stat label="PD Aktif" value={pdAktif} href="/pd?status=AKTIF" />
          <Stat label="PD Tidak Aktif" value={pdTidak} href="/pd?status=TIDAK_AKTIF" />
          <Stat label="PD Dalam Pembentukan" value={pdPembentukan} href="/pd?status=PEMBENTUKAN" />
          <Stat label="Belum Terbentuk PD" value={D.length - pdTotal} sub="kab/kota (termasuk pembentukan)" href="/daerah?pd=BELUM" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Anggota TBM" value={totalTbm} href="/tbm" />
        <Stat label="Berpotensi PD" value={potensiPD.length} sub={`kab/kota ≥ ${THRESHOLD_POTENSI_PD} TBM, belum ada PD`} href="/daerah?potensi=1" />
        <Stat label="Berpotensi PW" value={potensiPW.length} sub={`provinsi ≥ ${THRESHOLD_POTENSI_PW} PD, belum ada PW`} />
        <Stat label="Provinsi dengan PD" value={pdPerPW.length} sub={`dari ${P.length} provinsi`} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <h2 className="font-semibold">Jumlah PD pada masing-masing PW</h2>
          <p className="mb-3 text-xs text-stone-500">Per provinsi, menurut status PD</p>
          <PDPerPWChart data={pdPerPW} />
        </section>
        <section className="card">
          <h2 className="font-semibold">Anggota TBM per Provinsi</h2>
          <p className="mb-3 text-xs text-stone-500">Jumlah TBM terdaftar</p>
          <SimpleBarChart data={tbmPerProv} label="Jumlah TBM" />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card overflow-x-auto">
          <h2 className="font-semibold">Daerah Berpotensi Membentuk PD</h2>
          <p className="mb-3 text-xs text-stone-500">Kabupaten/kota dengan ≥ {THRESHOLD_POTENSI_PD} TBM yang belum memiliki PD</p>
          <table className="table">
            <thead><tr><th>Kabupaten/Kota</th><th>Provinsi</th><th>Status PD</th><th className="text-right">TBM</th></tr></thead>
            <tbody>
              {potensiPD.slice(0, 15).map((d) => (
                <tr key={d.kabupaten_id}>
                  <td className="font-medium">{titleCase(d.kabupaten_nama)}</td>
                  <td>{titleCase(d.provinsi_nama)}</td>
                  <td><StatusBadge status={d.status_pd} /></td>
                  <td className="text-right tabular-nums">{d.jumlah_tbm}</td>
                </tr>
              ))}
              {potensiPD.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-stone-500">Tidak ada.</td></tr>}
            </tbody>
          </table>
          {potensiPD.length > 15 && (
            <Link href="/daerah?potensi=1" className="mt-3 inline-block text-sm text-emerald-700 hover:underline">
              Lihat semua ({potensiPD.length}) →
            </Link>
          )}
        </section>
        <section className="card overflow-x-auto">
          <h2 className="font-semibold">Daerah Berpotensi Membentuk PW</h2>
          <p className="mb-3 text-xs text-stone-500">Provinsi dengan ≥ {THRESHOLD_POTENSI_PW} PD yang belum memiliki PW</p>
          <table className="table">
            <thead><tr><th>Provinsi</th><th>Status PW</th><th className="text-right">PD</th><th className="text-right">TBM</th></tr></thead>
            <tbody>
              {potensiPW.map((p) => (
                <tr key={p.provinsi_kode}>
                  <td className="font-medium">{titleCase(p.provinsi_nama)}</td>
                  <td><StatusBadge status={p.status_pw} /></td>
                  <td className="text-right tabular-nums">{p.jumlah_pd}</td>
                  <td className="text-right tabular-nums">{p.jumlah_tbm}</td>
                </tr>
              ))}
              {potensiPW.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-stone-500">Tidak ada.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Rekap per Provinsi</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Provinsi</th><th>Status PW</th><th className="text-right">Kab/Kota</th><th className="text-right">PD Aktif</th>
              <th className="text-right">PD Tidak Aktif</th><th className="text-right">PD Pembentukan</th>
              <th className="text-right">Belum PD</th><th className="text-right">TBM</th>
            </tr>
          </thead>
          <tbody>
            {P.map((p) => (
              <tr key={p.provinsi_kode}>
                <td className="font-medium">
                  <Link href={`/daerah?provinsi=${p.provinsi_kode}`} className="hover:underline">{titleCase(p.provinsi_nama)}</Link>
                </td>
                <td><StatusBadge status={p.status_pw} /></td>
                <td className="text-right tabular-nums">{p.jumlah_kabupaten}</td>
                <td className="text-right tabular-nums">{p.pd_aktif}</td>
                <td className="text-right tabular-nums">{p.pd_tidak_aktif}</td>
                <td className="text-right tabular-nums">{p.pd_pembentukan}</td>
                <td className="text-right tabular-nums">{p.jumlah_kabupaten - p.jumlah_pd}</td>
                <td className="text-right tabular-nums">{p.jumlah_tbm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

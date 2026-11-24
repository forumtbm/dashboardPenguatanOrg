import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PortoResults, { Pager, type PortoRow } from "@/components/PortoResults";

const PER = 20;

const FILTERS = [
  { key: "badan_hukum", param: "p_badan_hukum", label: "Badan Hukum (bentuk kelembagaan)" },
  { key: "literasi", param: "p_literasi", label: "Layanan Literasi Dasar" },
  { key: "kegiatan", param: "p_kegiatan", label: "Kegiatan Rutin" },
  { key: "jml_buku", param: "p_jml_buku", label: "Jumlah Buku" },
  { key: "sumber_dana", param: "p_sumber_dana", label: "Sumber Dana" },
  { key: "kap_minat", param: "p_kap_minat", label: "Minat Pengembangan Kapasitas" },
  { key: "kap_topik", param: "p_kap_topik", label: "Topik Pengembangan Kapasitas" },
] as const;

type SP = Partial<Record<(typeof FILTERS)[number]["key"] | "page", string>>;

export default async function PortoFilterPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();

  const args: Record<string, unknown> = { p_limit: PER, p_offset: (page - 1) * PER };
  for (const f of FILTERS) if (sp[f.key]) args[f.param] = sp[f.key];

  const [{ data: opsi }, res] = await Promise.all([
    supabase.rpc("tbm_opsi_filter"),
    supabase.rpc("cari_portofolio", args),
  ]);
  const options = new Map<string, { nilai: string; jumlah: number }[]>();
  for (const o of (opsi ?? []) as { kolom: string; nilai: string; jumlah: number }[]) {
    if (!options.has(o.kolom)) options.set(o.kolom, []);
    options.get(o.kolom)!.push(o);
  }
  const rows = (res.data ?? []) as PortoRow[];
  const total = rows[0]?.total ?? 0;
  const active = FILTERS.filter((f) => sp[f.key]);
  const href = (p: number) => {
    const u = new URLSearchParams(Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `/portofolio/filter?${u}`;
  };

  return (
    <div className="space-y-4">
      <form className="card grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {FILTERS.map((f) => (
          <div key={f.key}>
            <label className="label" htmlFor={f.key}>{f.label}</label>
            <select id={f.key} name={f.key} defaultValue={sp[f.key] ?? ""} className="input">
              <option value="">Semua</option>
              {(options.get(f.key) ?? []).map((o) => (
                <option key={o.nilai} value={o.nilai}>{o.nilai} ({o.jumlah})</option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex items-end gap-2">
          <button className="btn-primary">Terapkan Filter</button>
          {active.length > 0 && <Link href="/portofolio/filter" className="btn-secondary">Reset</Link>}
        </div>
        <p className="text-xs text-stone-500 md:col-span-2 xl:col-span-4">
          Pilihan diambil dari isian data TBM. Angka dalam kurung = jumlah TBM. Topik pengembangan kapasitas mencakup topik
          literasi, keorganisasian, kecakapan diri dan kecakapan hidup.
        </p>
      </form>
      {res.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{res.error.message}</p>}
      <p className="text-sm text-stone-600">
        {total.toLocaleString("id-ID")} TBM{active.length ? " sesuai filter" : ""}
        {active.length > 0 && (
          <span className="ml-2 inline-flex flex-wrap gap-1">
            {active.map((f) => (
              <span key={f.key} className="badge bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">
                {f.label}: {sp[f.key]}
              </span>
            ))}
          </span>
        )}
      </p>
      <PortoResults rows={rows} words={[]} showMeta />
      <Pager page={page} total={total} perPage={PER} href={href} />
    </div>
  );
}

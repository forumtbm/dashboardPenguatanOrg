import { createClient } from "@/lib/supabase/server";
import PortoResults, { Pager, type PortoRow } from "@/components/PortoResults";
import { keywords } from "@/lib/highlight";

const PER = 20;

export default async function PortoSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  let rows: PortoRow[] = [];
  let error: string | null = null;
  if (q) {
    const supabase = await createClient();
    const res = await supabase.rpc("cari_portofolio", { p_keyword: q, p_limit: PER, p_offset: (page - 1) * PER });
    rows = (res.data ?? []) as PortoRow[];
    error = res.error?.message ?? null;
  }
  const total = rows[0]?.total ?? 0;

  return (
    <div className="space-y-4">
      <form className="card flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Ketik kata kunci: nama TBM, provinsi, kabupaten/kota, kecamatan, atau isi portofolio…"
          className="input min-w-[260px] flex-1"
        />
        <button className="btn-primary">Cari</button>
        <p className="w-full text-xs text-stone-500">
          Mencari di <b>Nama TBM</b> &amp; nomor anggota, <b>Lokasi TBM</b> (provinsi, kabupaten/kota, kecamatan, desa) dan
          <b> Info Portofolio</b>. Bila memakai beberapa kata, semua kata harus ditemukan.
        </p>
      </form>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {q ? (
        <>
          <p className="text-sm text-stone-600">
            {total.toLocaleString("id-ID")} TBM ditemukan untuk <b>&ldquo;{q}&rdquo;</b>
          </p>
          <PortoResults rows={rows} words={keywords(q)} />
          <Pager page={page} total={total} perPage={PER} href={(p) => `/portofolio?q=${encodeURIComponent(q)}&page=${p}`} />
        </>
      ) : (
        <div className="card py-10 text-center text-sm text-stone-500">Masukkan kata kunci untuk mulai mencari.</div>
      )}
    </div>
  );
}

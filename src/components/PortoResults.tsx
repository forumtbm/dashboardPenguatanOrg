import Link from "next/link";
import { titleCase } from "@/lib/constants";
import { Highlight, excerpt } from "@/lib/highlight";

export type PortoRow = {
  tbm_id: number;
  nama_tbm: string | null;
  nomor_anggota_tbm: string | null;
  provinsi: string | null;
  kabupaten: string | null;
  status: string | null;
  kelembagaan_bentuk: string | null;
  program_jml_buku: string | null;
  jumlah_portofolio: number;
  portofolio_terakhir: string | null;
  cuplikan_judul: string | null;
  cuplikan: string | null;
  cocok_di: string[];
  total: number;
};

const fmtDate = (d: string | null) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function PortoResults({ rows, words, showMeta }: { rows: PortoRow[]; words: string[]; showMeta?: boolean }) {
  if (rows.length === 0) return <div className="card py-10 text-center text-sm text-stone-500">Tidak ada TBM yang cocok.</div>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.tbm_id} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={`/portofolio/tbm/${r.tbm_id}`} className="text-base font-semibold text-emerald-800 hover:underline">
                <Highlight text={r.nama_tbm || "(tanpa nama)"} words={words} />
              </Link>
              <div className="text-sm text-stone-600">
                {r.nomor_anggota_tbm && (
                  <span className="mr-2">No. <Highlight text={r.nomor_anggota_tbm} words={words} /> ·</span>
                )}
                <Highlight text={[titleCase(r.kabupaten), titleCase(r.provinsi)].filter(Boolean).join(", ") || "Lokasi belum diisi"} words={words} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {r.cocok_di.map((c) => (
                <span key={c} className="badge bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200">cocok: {c}</span>
              ))}
              <span className="badge bg-stone-100 text-stone-700">
                {r.jumlah_portofolio} portofolio{r.portofolio_terakhir ? ` · ${fmtDate(r.portofolio_terakhir)}` : ""}
              </span>
            </div>
          </div>
          {showMeta && (r.kelembagaan_bentuk || r.program_jml_buku) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
              {r.kelembagaan_bentuk && <span>Kelembagaan: {r.kelembagaan_bentuk}</span>}
              {r.program_jml_buku && <span>Buku: {r.program_jml_buku}</span>}
            </div>
          )}
          {r.cuplikan && (
            <p className="mt-2 border-l-2 border-emerald-200 pl-3 text-sm text-stone-700">
              {r.cuplikan_judul && <b className="mr-1"><Highlight text={r.cuplikan_judul} words={words} />:</b>}
              <Highlight text={excerpt(r.cuplikan, words)} words={words} />
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Pager({ page, total, perPage, href }: { page: number; total: number; perPage: number; href: (p: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-500">Halaman {page} dari {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className="btn-secondary btn-sm">← Sebelumnya</Link>}
        {page < pages && <Link href={href(page + 1)} className="btn-secondary btn-sm">Berikutnya →</Link>}
      </div>
    </div>
  );
}

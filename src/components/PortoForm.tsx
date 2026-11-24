"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { titleCase } from "@/lib/constants";
import { savePortofolio } from "@/app/(app)/portofolio/actions";

type Tbm = { id: number; nama_tbm: string | null; nomor_anggota_tbm: string | null; kabupaten_nama: string | null; provinsi_nama: string | null };
type Entry = { id: number; tanggal: string; judul: string | null; isi: string };

function TbmPicker({ onPick }: { onPick: (t: Tbm) => void }) {
  const [term, setTerm] = useState("");
  const [list, setList] = useState<Tbm[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = term.replace(/[,()*]/g, " ").trim();
    if (s.length < 2) {
      setList([]);
      return;
    }
    const h = setTimeout(async () => {
      setLoading(true);
      const { data } = await createClient()
        .from("tbm")
        .select("id, nama_tbm, nomor_anggota_tbm, kabupaten_nama, provinsi_nama")
        .or(`nama_tbm.ilike.*${s}*,nomor_anggota_tbm.ilike.*${s}*`)
        .order("nama_tbm")
        .limit(15);
      setList((data ?? []) as Tbm[]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(h);
  }, [term]);

  return (
    <div>
      <label className="label" htmlFor="cari-tbm">Cari TBM (nama atau nomor anggota) *</label>
      <input id="cari-tbm" value={term} onChange={(e) => setTerm(e.target.value)} className="input" placeholder="Ketik minimal 2 huruf…" autoComplete="off" />
      {loading && <p className="mt-1 text-xs text-stone-500">Mencari…</p>}
      {list.length > 0 && (
        <ul className="mt-1 max-h-72 divide-y divide-stone-100 overflow-y-auto rounded-lg border border-stone-200 bg-white">
          {list.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => onPick(t)} className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-50">
                <b>{t.nama_tbm || "(tanpa nama)"}</b>
                <span className="ml-2 text-stone-500">
                  {t.nomor_anggota_tbm ? `No. ${t.nomor_anggota_tbm} · ` : ""}
                  {[t.kabupaten_nama, t.provinsi_nama].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && term.trim().length >= 2 && list.length === 0 && <p className="mt-1 text-xs text-stone-500">TBM tidak ditemukan.</p>}
    </div>
  );
}

export default function PortoForm({ tbm: initialTbm, entry }: { tbm?: Tbm | null; entry?: Entry | null }) {
  const [state, action, pending] = useActionState(savePortofolio, undefined);
  const [tbm, setTbm] = useState<Tbm | null>(initialTbm ?? null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="card max-w-3xl space-y-4">
      <h2 className="font-semibold">{entry ? "Edit Portofolio" : "Update Data Portofolio TBM"}</h2>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      {tbm ? (
        <>
          <input type="hidden" name="tbm_id" value={tbm.id} />
          <div className="grid gap-3 rounded-lg bg-stone-50 p-3 md:grid-cols-2">
            <div>
              <div className="label">Nama TBM</div>
              <div className="font-semibold">{tbm.nama_tbm || "(tanpa nama)"}</div>
              <div className="text-xs text-stone-500">
                {[titleCase(tbm.kabupaten_nama), titleCase(tbm.provinsi_nama)].filter(Boolean).join(", ")}
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="label">Nomor Anggota</div>
                <div className="font-semibold">{tbm.nomor_anggota_tbm || "—"}</div>
              </div>
              {!entry && (
                <button type="button" className="btn-secondary btn-sm" onClick={() => setTbm(null)}>Ganti TBM</button>
              )}
            </div>
          </div>
        </>
      ) : (
        <TbmPicker onPick={setTbm} />
      )}

      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <div>
          <label className="label" htmlFor="tanggal">Tanggal</label>
          <input id="tanggal" name="tanggal" type="date" className="input" defaultValue={entry?.tanggal ?? today} />
        </div>
        <div>
          <label className="label" htmlFor="judul">Judul kegiatan (opsional)</label>
          <input id="judul" name="judul" className="input" defaultValue={entry?.judul ?? ""} placeholder="mis. Festival Dongeng Anak 2026" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="isi">Update Portofolio dan Kegiatan TBM *</label>
        <textarea
          id="isi"
          name="isi"
          rows={10}
          required
          className="input leading-relaxed"
          defaultValue={entry?.isi ?? ""}
          placeholder="Tuliskan perkembangan, capaian, program, kegiatan, mitra, penerima manfaat, dan informasi portofolio lainnya…"
        />
      </div>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={pending || !tbm}>{pending ? "Menyimpan..." : "Simpan Portofolio"}</button>
        <Link href={tbm ? `/portofolio/tbm/${tbm.id}` : "/portofolio"} className="btn-secondary">Batal</Link>
      </div>
    </form>
  );
}

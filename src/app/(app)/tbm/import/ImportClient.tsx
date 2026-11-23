"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseTbmCsv, normalizeTbmRow, type ParsedCsv } from "@/lib/tbm-csv";

const CHUNK = 200;
type Mode = "upsert" | "insert";

export default function ImportClient() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mode, setMode] = useState<Mode>("upsert");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ok: number; failed: { row: string; msg: string }[] } | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setResult(null);
    if (!f) return setParsed(null);
    setFileName(f.name);
    setParsed(parseTbmCsv(await f.text()));
  }

  async function runImport() {
    if (!parsed) return;
    setBusy(true);
    setProgress(0);
    const supabase = createClient();
    const records = parsed.rows.map(normalizeTbmRow).map((r) => {
      if (mode === "insert") delete r.id;
      return r;
    });
    const withId = records.filter((r) => r.id != null);
    const withoutId = records.filter((r) => r.id == null);
    let ok = 0;
    const failed: { row: string; msg: string }[] = [];
    let done = 0;

    const send = async (batch: Record<string, unknown>[], kind: "upsert" | "insert") => {
      const { error } =
        kind === "upsert"
          ? await supabase.from("tbm").upsert(batch, { onConflict: "id", defaultToNull: false })
          : await supabase.from("tbm").insert(batch, { defaultToNull: false });
      if (!error) {
        ok += batch.length;
        return;
      }
      // Batch gagal -> coba satu per satu untuk menemukan baris bermasalah
      for (const r of batch) {
        const { error: e1 } =
          kind === "upsert"
            ? await supabase.from("tbm").upsert(r, { onConflict: "id" })
            : await supabase.from("tbm").insert(r);
        if (e1) failed.push({ row: String(r.nama_tbm ?? r.id ?? "?"), msg: e1.message });
        else ok++;
      }
    };

    for (let i = 0; i < withId.length; i += CHUNK) {
      await send(withId.slice(i, i + CHUNK), "upsert");
      done += Math.min(CHUNK, withId.length - i);
      setProgress(Math.round((done / records.length) * 100));
    }
    if (withId.length) await supabase.rpc("sync_tbm_id_seq");
    for (let i = 0; i < withoutId.length; i += CHUNK) {
      await send(withoutId.slice(i, i + CHUNK), "insert");
      done += Math.min(CHUNK, withoutId.length - i);
      setProgress(Math.round((done / records.length) * 100));
    }
    setResult({ ok, failed });
    setBusy(false);
    router.refresh();
  }

  const preview = parsed?.rows.slice(0, 5) ?? [];

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="h1">Upload CSV Anggota TBM</h1>
        <p className="text-sm text-stone-500">
          Gunakan format kolom yang sama dengan template. Kolom bertipe daftar boleh berisi JSON array
          (<code>[&quot;A&quot;,&quot;B&quot;]</code>) atau teks biasa.
        </p>
        <div className="mt-2 flex gap-3 text-sm">
          <a href="/template_tbm_kosong.csv" download className="text-emerald-700 hover:underline">Unduh template kosong</a>
          <a href="/template_tbm.csv" download className="text-emerald-700 hover:underline">Unduh contoh berisi 1 baris</a>
        </div>
      </div>

      <div className="card space-y-4">
        <input type="file" accept=".csv,text/csv" onChange={onFile} disabled={busy} className="block text-sm" />
        {parsed && (
          <div className="space-y-2 text-sm">
            <p><b>{fileName}</b>: {parsed.rows.length} baris data terbaca.</p>
            {parsed.repairedRows > 0 && (
              <p className="rounded bg-blue-50 px-3 py-2 text-blue-800">
                {parsed.repairedRows} baris terbungkus tanda kutip satu baris penuh dan telah diperbaiki otomatis.
              </p>
            )}
            {parsed.unknownColumns.length > 0 && (
              <p className="rounded bg-amber-50 px-3 py-2 text-amber-800">Kolom tidak dikenal (diabaikan): {parsed.unknownColumns.join(", ")}</p>
            )}
            {parsed.missingColumns.length > 0 && parsed.missingColumns.length < 99 && (
              <p className="rounded bg-stone-100 px-3 py-2 text-stone-600">
                Kolom tidak ada di file (akan kosong): {parsed.missingColumns.join(", ")}
              </p>
            )}
            {!parsed.rows.length || parsed.missingColumns.includes("nama_tbm") ? (
              <p className="rounded bg-red-50 px-3 py-2 text-red-700">File tidak valid: kolom nama_tbm tidak ditemukan atau tidak ada data.</p>
            ) : null}
            {parsed.errors.map((e) => <p key={e} className="text-red-700">{e}</p>)}
          </div>
        )}

        {parsed && parsed.rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>id</th><th>nama_tbm</th><th>provinsi_nama</th><th>kabupaten_nama</th><th>status</th></tr></thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i}>
                      <td>{String(r.id ?? "")}</td><td>{String(r.nama_tbm ?? "")}</td><td>{String(r.provinsi_nama ?? "")}</td>
                      <td>{String(r.kabupaten_nama ?? "")}</td><td>{String(r.status ?? "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 5 && <p className="mt-1 text-xs text-stone-500">Menampilkan 5 dari {parsed.rows.length} baris.</p>}
            </div>
            <fieldset className="space-y-2 text-sm" disabled={busy}>
              <label className="flex items-start gap-2">
                <input type="radio" checked={mode === "upsert"} onChange={() => setMode("upsert")} className="mt-1" />
                <span><b>Tambah & perbarui</b> — baris dengan <code>id</code> yang sudah ada akan diperbarui; baris tanpa id ditambahkan.</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" checked={mode === "insert"} onChange={() => setMode("insert")} className="mt-1" />
                <span><b>Tambah semua sebagai data baru</b> — kolom <code>id</code> diabaikan.</span>
              </label>
            </fieldset>
            <button
              className="btn-primary"
              disabled={busy || parsed.missingColumns.includes("nama_tbm")}
              onClick={runImport}
            >
              {busy ? `Mengunggah... ${progress}%` : `Impor ${parsed.rows.length} baris`}
            </button>
          </>
        )}

        {result && (
          <div className="space-y-2 text-sm">
            <p className="rounded bg-emerald-50 px-3 py-2 text-emerald-800">{result.ok} baris berhasil disimpan.</p>
            {result.failed.length > 0 && (
              <div className="rounded bg-red-50 px-3 py-2 text-red-700">
                <p className="font-semibold">{result.failed.length} baris gagal:</p>
                <ul className="list-disc pl-5">
                  {result.failed.slice(0, 20).map((f, i) => <li key={i}>{f.row}: {f.msg}</li>)}
                </ul>
              </div>
            )}
            <Link href="/tbm?unmapped=1" className="text-emerald-700 hover:underline">Cek TBM yang wilayahnya belum cocok →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

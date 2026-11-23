"use client";
import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { TBM_SECTIONS, TBM_LABELS, TBM_ARRAY_COLUMNS } from "@/lib/tbm-fields";
import { titleCase } from "@/lib/constants";

type State = { error?: string } | undefined;
const LONG = new Set(["alamat_jalan", "alamat_jalan_luar", "catatan_pd", "catatan_pw", "program_nama_tbm_lain", "medsos_lainnya"]);

export default function TbmForm({
  action,
  initial,
  provinsi,
  kabupaten,
  readOnly,
}: {
  action: (p: State, fd: FormData) => Promise<State>;
  initial: Record<string, unknown>;
  provinsi: { kode: string; nama: string }[];
  kabupaten: { nama: string; provinsi_kode: string }[];
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [prov, setProv] = useState(String(initial.provinsi_nama ?? ""));
  const provKode = useMemo(
    () => provinsi.find((p) => p.nama.toUpperCase() === prov.trim().toUpperCase())?.kode,
    [prov, provinsi]
  );
  const kabList = kabupaten.filter((k) => !provKode || k.provinsi_kode === provKode);

  const val = (c: string) => {
    const v = initial[c];
    if (v == null) return "";
    if (Array.isArray(v)) return v.join("\n");
    return String(v);
  };

  return (
    <form action={formAction} className="space-y-6">
      {initial.id != null && <input type="hidden" name="id" value={String(initial.id)} />}
      <datalist id="dl-provinsi">{provinsi.map((p) => <option key={p.kode} value={titleCase(p.nama)} />)}</datalist>
      <datalist id="dl-kabupaten">{kabList.map((k) => <option key={k.provinsi_kode + k.nama} value={titleCase(k.nama)} />)}</datalist>
      <fieldset disabled={readOnly} className="space-y-6">
        {TBM_SECTIONS.map((sec) => (
          <section key={sec.title} className="card">
            <h2 className="mb-4 font-semibold">{sec.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sec.fields.map((c) => {
                const isArr = TBM_ARRAY_COLUMNS.has(c);
                const label = (TBM_LABELS[c] ?? c) + (c === "nama_tbm" ? " *" : "");
                return (
                  <div key={c} className={isArr || LONG.has(c) ? "md:col-span-2" : ""}>
                    <label className="label" htmlFor={c}>
                      {label}
                      {isArr && <span className="font-normal text-stone-400"> — satu pilihan per baris</span>}
                    </label>
                    {c === "provinsi_nama" ? (
                      <input id={c} name={c} list="dl-provinsi" className="input" defaultValue={val(c)} onChange={(e) => setProv(e.target.value)} />
                    ) : c === "kabupaten_nama" ? (
                      <input id={c} name={c} list="dl-kabupaten" className="input" defaultValue={val(c)} />
                    ) : isArr || LONG.has(c) ? (
                      <textarea id={c} name={c} rows={isArr ? Math.max(2, val(c).split("\n").length) : 2} className="input" defaultValue={val(c)} />
                    ) : (
                      <input id={c} name={c} className="input" defaultValue={val(c)} required={c === "nama_tbm"} />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </fieldset>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <div className="sticky bottom-0 flex gap-2 border-t border-stone-200 bg-[#f5f5f3]/95 py-3">
        {!readOnly && <button className="btn-primary" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</button>}
        <Link href="/tbm" className="btn-secondary">Kembali</Link>
      </div>
    </form>
  );
}

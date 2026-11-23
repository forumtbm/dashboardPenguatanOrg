"use client";
import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { PENGURUS_FIELDS, PW_STATUS, PD_STATUS, titleCase } from "@/lib/constants";

type Prov = { kode: string; nama: string };
type Kab = { id: number; nama: string; provinsi_kode: string };
type Rec = Record<string, unknown>;
type State = { error?: string } | undefined;

export default function OrgForm({
  level,
  action,
  initial,
  provinsi,
  kabupaten = [],
  takenKeys,
  readOnly,
}: {
  level: "PW" | "PD";
  action: (prev: State, fd: FormData) => Promise<State>;
  initial: Rec;
  provinsi: Prov[];
  kabupaten?: Kab[];
  takenKeys: string[]; // provinsi_kode (PW) / kabupaten_id (PD) yang sudah punya data
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const initialProv =
    level === "PW"
      ? String(initial.provinsi_kode ?? "")
      : String(kabupaten.find((k) => k.id === Number(initial.kabupaten_id))?.provinsi_kode ?? initial.provinsi_kode ?? "");
  const [prov, setProv] = useState(initialProv);
  const kabOptions = useMemo(() => kabupaten.filter((k) => k.provinsi_kode === prov), [kabupaten, prov]);
  const statuses = level === "PW" ? PW_STATUS : PD_STATUS;
  const v = (k: string) => (initial[k] == null ? "" : String(initial[k]));
  const taken = new Set(takenKeys);
  const ownKey = level === "PW" ? v("provinsi_kode") : v("kabupaten_id");

  return (
    <form action={formAction} className="space-y-6">
      {initial.id != null && <input type="hidden" name="id" value={String(initial.id)} />}
      <fieldset disabled={readOnly} className="space-y-6">
        <section className="card">
          <h2 className="mb-4 font-semibold">Identifikasi {level}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Provinsi *</label>
              <select
                name={level === "PW" ? "provinsi_kode" : "_provinsi"}
                className="input"
                value={prov}
                onChange={(e) => setProv(e.target.value)}
                required
              >
                <option value="">— pilih provinsi —</option>
                {provinsi.map((p) => (
                  <option key={p.kode} value={p.kode} disabled={level === "PW" && taken.has(p.kode) && p.kode !== ownKey}>
                    {titleCase(p.nama)}
                    {level === "PW" && taken.has(p.kode) && p.kode !== ownKey ? " (sudah ada PW)" : ""}
                  </option>
                ))}
              </select>
            </div>
            {level === "PD" && (
              <div>
                <label className="label">Kabupaten/Kota *</label>
                <select name="kabupaten_id" className="input" defaultValue={v("kabupaten_id")} key={prov} required>
                  <option value="">— pilih kabupaten/kota —</option>
                  {kabOptions.map((k) => (
                    <option key={k.id} value={k.id} disabled={taken.has(String(k.id)) && String(k.id) !== ownKey}>
                      {titleCase(k.nama)}
                      {taken.has(String(k.id)) && String(k.id) !== ownKey ? " (sudah ada PD)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="label">Status Keaktifan *</label>
              <select name="status" className="input" defaultValue={v("status") || "AKTIF"}>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tahun {level === "PW" ? "Muswil" : "Musda"}</label>
              <input
                name={level === "PW" ? "tahun_muswil" : "tahun_musda"}
                type="number" min={1990} max={2100} className="input"
                defaultValue={v(level === "PW" ? "tahun_muswil" : "tahun_musda")}
              />
            </div>
            <div>
              <label className="label">Nomor SK</label>
              <input name="nomor_sk" className="input" defaultValue={v("nomor_sk")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Periode Mulai (tahun)</label>
                <input name="periode_mulai" type="number" min={1990} max={2100} className="input" defaultValue={v("periode_mulai")} />
              </div>
              <div>
                <label className="label">Periode Selesai (tahun)</label>
                <input name="periode_selesai" type="number" min={1990} max={2100} className="input" defaultValue={v("periode_selesai")} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">Media Sosial</label>
              <textarea name="media_sosial" rows={2} className="input" defaultValue={v("media_sosial")} placeholder="Instagram, Facebook, dll" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Catatan Kepengurusan</label>
              <textarea name="catatan" rows={3} className="input" defaultValue={v("catatan")} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-4 font-semibold">Data Pengurus {level === "PW" ? "Wilayah" : "Daerah"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {PENGURUS_FIELDS.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea name={f.name} rows={2} className="input" defaultValue={v(f.name)} />
                ) : (
                  <input name={f.name} type={f.type || "text"} className="input" defaultValue={v(f.name)} />
                )}
              </div>
            ))}
          </div>
        </section>
      </fieldset>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        {!readOnly && <button className="btn-primary" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</button>}
        <Link href={level === "PW" ? "/pw" : "/pd"} className="btn-secondary">Kembali</Link>
      </div>
    </form>
  );
}

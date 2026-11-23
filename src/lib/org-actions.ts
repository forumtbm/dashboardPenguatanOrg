import "server-only";
import { PENGURUS_FIELDS } from "@/lib/constants";

const intOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
};
const strOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s ? s : null;
};

export function orgRecordFromForm(fd: FormData, level: "PW" | "PD") {
  const rec: Record<string, unknown> = {
    status: strOrNull(fd.get("status")),
    nomor_sk: strOrNull(fd.get("nomor_sk")),
    periode_mulai: intOrNull(fd.get("periode_mulai")),
    periode_selesai: intOrNull(fd.get("periode_selesai")),
    media_sosial: strOrNull(fd.get("media_sosial")),
    catatan: strOrNull(fd.get("catatan")),
  };
  if (level === "PW") {
    rec.provinsi_kode = strOrNull(fd.get("provinsi_kode"));
    rec.tahun_muswil = intOrNull(fd.get("tahun_muswil"));
  } else {
    rec.kabupaten_id = intOrNull(fd.get("kabupaten_id"));
    rec.tahun_musda = intOrNull(fd.get("tahun_musda"));
  }
  for (const f of PENGURUS_FIELDS) rec[f.name] = strOrNull(fd.get(f.name));
  return rec;
}

export function friendlyDbError(msg: string) {
  if (/duplicate key/i.test(msg)) return "Data untuk wilayah ini sudah ada.";
  if (/row-level security/i.test(msg)) return "Anda tidak memiliki hak untuk mengubah data.";
  return msg;
}

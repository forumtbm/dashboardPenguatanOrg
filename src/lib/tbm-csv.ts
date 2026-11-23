import Papa from "papaparse";
import { TBM_COLUMNS, TBM_ARRAY_COLUMNS } from "@/lib/tbm-fields";

const KNOWN = new Set<string>(TBM_COLUMNS);

export type ParsedCsv = {
  rows: Record<string, unknown>[];
  unknownColumns: string[];
  missingColumns: string[];
  repairedRows: number;
  errors: string[];
};

/** Ubah satu nilai sel menjadi array untuk kolom jsonb */
export function toArray(v: unknown): string[] | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map(String).filter((s) => s.trim() !== "");
  const s = String(v).trim();
  if (!s) return null;
  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* jatuh ke bawah */
    }
  }
  return [s];
}

/** Normalisasi 1 baris CSV -> record siap simpan ke tabel tbm */
export function normalizeTbmRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [kRaw, v] of Object.entries(raw)) {
    const k = kRaw.trim().toLowerCase();
    if (!KNOWN.has(k)) continue;
    const s = v == null ? "" : String(v).trim();
    if (k === "id") {
      const n = Number.parseInt(s, 10);
      if (Number.isFinite(n) && n > 0) out.id = n;
      continue;
    }
    if (k === "created_at" || k === "updated_at") {
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) out[k] = s; // format Postgres diterima langsung
      continue;
    }
    if (TBM_ARRAY_COLUMNS.has(k)) out[k] = toArray(s);
    else out[k] = s === "" ? null : s;
  }
  delete out.updated_at;
  return out;
}

/**
 * Parse teks CSV. Menangani juga ekspor yang "rusak" di mana satu baris utuh
 * terbungkus tanda kutip (seperti contoh template_tbm.csv).
 */
export function parseTbmCsv(text: string): ParsedCsv {
  const clean = text.replace(/^﻿/, "");
  const res = Papa.parse<string[]>(clean, { skipEmptyLines: "greedy" });
  const errors = res.errors.slice(0, 5).map((e) => `Baris ${(e.row ?? 0) + 1}: ${e.message}`);
  const data = res.data;
  if (data.length === 0) return { rows: [], unknownColumns: [], missingColumns: [...TBM_COLUMNS], repairedRows: 0, errors: ["File kosong."] };

  const header = data[0].map((h) => h.trim().toLowerCase());
  let repaired = 0;
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < data.length; i++) {
    let cells = data[i];
    if (cells.length === 1 && header.length > 1 && cells[0].includes(",")) {
      const inner = Papa.parse<string[]>(cells[0]).data[0];
      if (inner && inner.length > 1) {
        cells = inner;
        repaired++;
      }
    }
    if (cells.every((c) => String(c).trim() === "")) continue;
    const obj: Record<string, unknown> = {};
    header.forEach((h, idx) => (obj[h] = cells[idx] ?? ""));
    rows.push(obj);
  }
  return {
    rows,
    unknownColumns: header.filter((h) => h && !KNOWN.has(h)),
    missingColumns: TBM_COLUMNS.filter((c) => !header.includes(c)),
    repairedRows: repaired,
    errors,
  };
}

/** Untuk ekspor: array -> string JSON (format sama dengan template) */
export function tbmRowToCsvRecord(r: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of TBM_COLUMNS) {
    const v = r[c];
    out[c] = v == null ? "" : Array.isArray(v) || typeof v === "object" ? JSON.stringify(v) : v;
  }
  return out;
}

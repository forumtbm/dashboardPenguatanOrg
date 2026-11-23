import Papa from "papaparse";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { tbmRowToCsvRecord } from "@/lib/tbm-csv";
import { TBM_COLUMNS } from "@/lib/tbm-fields";
import { STATUS_LABEL, THRESHOLD_POTENSI_PD, TERBENTUK } from "@/lib/constants";

export const dynamic = "force-dynamic";

function csv(name: string, fields: string[], data: unknown[][] | Record<string, unknown>[]) {
  const body = "﻿" + Papa.unparse({ fields, data: data as unknown[] } as Papa.UnparseObject<unknown>);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}_${stamp}.csv"`,
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const profile = await getProfile();
  if (!profile) return new NextResponse("Unauthorized", { status: 401 });
  const { type } = await params;
  const sp = req.nextUrl.searchParams;
  const supabase = await createClient();

  if (type === "tbm") {
    const all: Record<string, unknown>[] = [];
    for (let from = 0; ; from += 1000) {
      let q = supabase.from("tbm").select("*");
      const term = sp.get("q")?.replace(/[,()*]/g, " ").trim();
      if (term) q = q.or(`nama_tbm.ilike.*${term}*,nomor_anggota_tbm.ilike.*${term}*,nama_pendaftar.ilike.*${term}*`);
      if (sp.get("provinsi")) q = q.eq("provinsi_kode", sp.get("provinsi")!);
      if (sp.get("kabupaten")) q = q.eq("kabupaten_id", Number(sp.get("kabupaten")));
      if (sp.get("status")) q = q.eq("status", sp.get("status")!);
      if (sp.get("unmapped")) q = q.is("kabupaten_id", null);
      const { data, error } = await q.order("id").range(from, from + 999);
      if (error) return new NextResponse(error.message, { status: 500 });
      all.push(...(data ?? []).map(tbmRowToCsvRecord));
      if (!data || data.length < 1000) break;
    }
    return csv("data_tbm", [...TBM_COLUMNS], all);
  }

  if (type === "daerah") {
    let q = supabase.from("v_daerah").select("*");
    if (sp.get("provinsi")) q = q.eq("provinsi_kode", sp.get("provinsi")!);
    const { data, error } = await q.order("provinsi_kode").order("kabupaten_kode");
    if (error) return new NextResponse(error.message, { status: 500 });
    let rows = data ?? [];
    const pd = sp.get("pd"), pw = sp.get("pw");
    if (pd === "BELUM") rows = rows.filter((r) => !TERBENTUK.includes(r.status_pd ?? ""));
    else if (pd) rows = rows.filter((r) => r.status_pd === pd);
    if (pw === "BELUM") rows = rows.filter((r) => !TERBENTUK.includes(r.status_pw ?? ""));
    else if (pw === "ADA") rows = rows.filter((r) => TERBENTUK.includes(r.status_pw ?? ""));
    if (sp.get("potensi")) rows = rows.filter((r) => r.jumlah_tbm >= THRESHOLD_POTENSI_PD && !TERBENTUK.includes(r.status_pd ?? ""));
    const q2 = sp.get("q")?.toLowerCase();
    if (q2) rows = rows.filter((r) => r.kabupaten_nama.toLowerCase().includes(q2));
    return csv(
      "identifikasi_daerah",
      ["provinsi", "kabupaten_kota", "status_pw", "status_pd", "jumlah_tbm_terdaftar"],
      rows.map((r) => [
        r.provinsi_nama, r.kabupaten_nama,
        r.status_pw ? STATUS_LABEL[r.status_pw] : "Belum terbentuk",
        r.status_pd ? STATUS_LABEL[r.status_pd] : "Belum terbentuk",
        r.jumlah_tbm,
      ])
    );
  }

  return new NextResponse("Not found", { status: 404 });
}


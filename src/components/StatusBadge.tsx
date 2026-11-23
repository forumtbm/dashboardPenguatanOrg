import { STATUS_LABEL } from "@/lib/constants";

const STYLE: Record<string, string> = {
  AKTIF: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  TIDAK_AKTIF: "bg-orange-50 text-orange-800 ring-1 ring-orange-200",
  PRESIDIUM: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  PEMBENTUKAN: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
};

export default function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="badge bg-stone-100 text-stone-500">Belum terbentuk</span>;
  return <span className={`badge ${STYLE[status] ?? "bg-stone-100 text-stone-700"}`}>{STATUS_LABEL[status] ?? status}</span>;
}

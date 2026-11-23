export const THRESHOLD_POTENSI_PD = 4; // kab/kota dengan >= 4 TBM berpotensi membentuk PD
export const THRESHOLD_POTENSI_PW = 4; // provinsi dengan >= 4 PD berpotensi membentuk PW

export const PW_STATUS = [
  { value: "AKTIF", label: "Aktif" },
  { value: "TIDAK_AKTIF", label: "Tidak Aktif" },
  { value: "PRESIDIUM", label: "Presidium" },
] as const;

export const PD_STATUS = [
  { value: "AKTIF", label: "Aktif" },
  { value: "TIDAK_AKTIF", label: "Tidak Aktif" },
  { value: "PEMBENTUKAN", label: "Dalam Pembentukan" },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  AKTIF: "Aktif",
  TIDAK_AKTIF: "Tidak Aktif",
  PRESIDIUM: "Presidium",
  PEMBENTUKAN: "Dalam Pembentukan",
};

export const TERBENTUK = ["AKTIF", "TIDAK_AKTIF"];

/** Field data pengurus (dipakai PW & PD) */
export const PENGURUS_FIELDS: { name: string; label: string; type?: string }[] = [
  { name: "ketua", label: "Nama Ketua" },
  { name: "sekretaris", label: "Sekretaris" },
  { name: "bendahara", label: "Bendahara" },
  { name: "kabid_popsdm", label: "Ketua Bidang POPSDM" },
  { name: "kabid_litbang", label: "Ketua Bidang Litbang" },
  { name: "kabid_program", label: "Ketua Bidang Program" },
  { name: "kabid_infokom", label: "Ketua Bidang Infokom" },
  { name: "ketua_sekretariatan", label: "Ketua Sekretariatan" },
  { name: "nomor_kontak", label: "Nomor Kontak" },
  { name: "email", label: "Alamat Email", type: "email" },
  { name: "alamat_sekretariat", label: "Alamat Sekretariat", type: "textarea" },
];

export const ROLE_LABEL: Record<string, string> = {
  superadmin: "Superuser",
  admin: "Administrator",
  operator: "Operator (input data)",
  viewer: "Viewer (hanya lihat)",
};

export function titleCase(s: string | null | undefined) {
  if (!s) return "";
  return s.toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (_m, a, b) => a + b.toUpperCase());
}

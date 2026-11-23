// Dihasilkan dari header template_tbm.csv
export const TBM_COLUMNS = ["id", "user_pendaftar_id", "status", "created_at", "updated_at", "nama_pendaftar", "kontak_pendaftar", "status_pendaftar", "ref_sumber", "ref_identitas", "ref_status_pd", "nama_tbm", "provinsi_nama", "kabupaten_nama", "alamat_kecamatan", "alamat_desa", "alamat_jalan", "negara", "alamat_negara_bagian", "alamat_kota_luar", "alamat_jalan_luar", "alamat_kodepos", "tbm_email", "tbm_telepon", "tbm_website", "medsos_facebook", "medsos_instagram", "medsos_lainnya", "kelembagaan_pendiri", "kelembagaan_tgl_berdiri", "kelembagaan_status_izin", "kelembagaan_bentuk", "kelembagaan_badan_hukum", "kelembagaan_akta_pendirian", "kelembagaan_tgl_akta", "kelembagaan_sk_kemenkumham", "kelembagaan_tgl_sk", "kelembagaan_npwp", "kelembagaan_rekening", "kelembagaan_nama_satuan", "kelembagaan_sk_pendirian", "kelembagaan_tgl_sk_pendirian", "program_layanan_literasi_dasar", "program_kegiatan_kerap", "program_isu_pemberdayaan", "program_daerah_3t", "program_jml_pengguna", "program_usia_pengguna", "program_gender_pengguna", "program_jml_buku", "program_koleksi_lain", "program_jenis_kegiatan", "program_rerata_kegiatan", "program_pengelola", "program_gender_pengelola", "program_jml_relawan", "program_usia_relawan", "program_sumber_dana", "program_pengeluaran_terbesar", "program_rerata_pengeluaran", "program_aktivitas_administrasi", "program_jml_tbm_lain", "program_nama_tbm_lain", "program_kolaborasi_jenis", "program_kolaborasi_dengan", "program_pustaka_dihasilkan", "program_asal_pustaka", "ftbm_pengetahuan", "ftbm_sumber_pengetahuan", "ftbm_alasan_bergabung", "kap_minat_pengembangan", "kap_topik_literasi", "kap_topik_keorganisasian", "kap_topik_kecakapan_diri", "kap_topik_kecakapan_hidup", "kap_durasi_pembelajaran", "kap_kegiatan_belajar", "kap_sumber_belajar", "kap_kontribusi_peran", "val_pernyataan_kebenaran", "val_setuju_ad_art", "val_setuju_kegiatan", "val_setuju_grup_wa", "catatan_pd", "foto_verifikasi_pd", "verifikator_pd_id", "tgl_verifikasi_pd", "catatan_pw", "validator_pw_id", "tgl_validasi_pw", "nomor_sk", "nomor_berita_acara", "tgl_berita_acara", "nama_ketua_pw", "ttd_ketua_pw_path", "nama_sekretaris_pw", "ttd_sekretaris_pw_path", "nomor_anggota_tbm", "user_tbm_id"] as const;

/** Kolom bertipe daftar (jsonb array) */
export const TBM_ARRAY_COLUMNS = new Set<string>(["kelembagaan_status_izin", "program_layanan_literasi_dasar", "program_kegiatan_kerap", "program_isu_pemberdayaan", "program_daerah_3t", "program_usia_pengguna", "program_koleksi_lain", "program_usia_relawan", "program_sumber_dana", "program_pengeluaran_terbesar", "program_aktivitas_administrasi", "program_kolaborasi_jenis", "program_kolaborasi_dengan", "program_pustaka_dihasilkan", "program_asal_pustaka", "ftbm_sumber_pengetahuan", "ftbm_alasan_bergabung", "kap_topik_literasi", "kap_topik_keorganisasian", "kap_topik_kecakapan_diri", "kap_topik_kecakapan_hidup", "kap_durasi_pembelajaran", "kap_kegiatan_belajar", "kap_sumber_belajar", "kap_kontribusi_peran", "foto_verifikasi_pd"]);

export const TBM_LABELS: Record<string, string> = {
  "user_pendaftar_id": "ID User Pendaftar",
  "status": "Status",
  "nama_pendaftar": "Nama Pendaftar",
  "kontak_pendaftar": "Kontak Pendaftar",
  "status_pendaftar": "Status Pendaftar",
  "ref_sumber": "Referensi Sumber",
  "ref_identitas": "Referensi Identitas",
  "ref_status_pd": "Status PD (referensi)",
  "nama_tbm": "Nama TBM",
  "provinsi_nama": "Provinsi",
  "kabupaten_nama": "Kabupaten/Kota",
  "alamat_kecamatan": "Kecamatan",
  "alamat_desa": "Desa/Kelurahan",
  "alamat_jalan": "Alamat Jalan",
  "negara": "Negara",
  "alamat_negara_bagian": "Negara Bagian (luar negeri)",
  "alamat_kota_luar": "Kota (luar negeri)",
  "alamat_jalan_luar": "Alamat (luar negeri)",
  "alamat_kodepos": "Kode Pos",
  "tbm_email": "Email TBM",
  "tbm_telepon": "Telepon TBM",
  "tbm_website": "Website TBM",
  "medsos_facebook": "Facebook",
  "medsos_instagram": "Instagram",
  "medsos_lainnya": "Media Sosial Lainnya",
  "kelembagaan_pendiri": "Pendiri",
  "kelembagaan_tgl_berdiri": "Tanggal Berdiri",
  "kelembagaan_status_izin": "Status Izin",
  "kelembagaan_bentuk": "Bentuk Lembaga",
  "kelembagaan_badan_hukum": "Badan Hukum",
  "kelembagaan_akta_pendirian": "Akta Pendirian",
  "kelembagaan_tgl_akta": "Tanggal Akta",
  "kelembagaan_sk_kemenkumham": "SK Kemenkumham",
  "kelembagaan_tgl_sk": "Tanggal SK",
  "kelembagaan_npwp": "NPWP",
  "kelembagaan_rekening": "Rekening",
  "kelembagaan_nama_satuan": "Nama Satuan",
  "kelembagaan_sk_pendirian": "SK Pendirian",
  "kelembagaan_tgl_sk_pendirian": "Tanggal SK Pendirian",
  "program_layanan_literasi_dasar": "Layanan Literasi Dasar",
  "program_kegiatan_kerap": "Kegiatan yang Kerap Dilakukan",
  "program_isu_pemberdayaan": "Isu Pemberdayaan",
  "program_daerah_3t": "Daerah 3T",
  "program_jml_pengguna": "Jumlah Pengguna",
  "program_usia_pengguna": "Usia Pengguna",
  "program_gender_pengguna": "Gender Pengguna",
  "program_jml_buku": "Jumlah Buku",
  "program_koleksi_lain": "Koleksi Lain",
  "program_jenis_kegiatan": "Jenis Kegiatan",
  "program_rerata_kegiatan": "Rerata Kegiatan",
  "program_pengelola": "Pengelola",
  "program_gender_pengelola": "Gender Pengelola",
  "program_jml_relawan": "Jumlah Relawan",
  "program_usia_relawan": "Usia Relawan",
  "program_sumber_dana": "Sumber Dana",
  "program_pengeluaran_terbesar": "Pengeluaran Terbesar",
  "program_rerata_pengeluaran": "Rerata Pengeluaran",
  "program_aktivitas_administrasi": "Aktivitas Administrasi",
  "program_jml_tbm_lain": "Jumlah TBM Lain",
  "program_nama_tbm_lain": "Nama TBM Lain",
  "program_kolaborasi_jenis": "Jenis Kolaborasi",
  "program_kolaborasi_dengan": "Kolaborasi Dengan",
  "program_pustaka_dihasilkan": "Pustaka Dihasilkan",
  "program_asal_pustaka": "Asal Pustaka",
  "ftbm_pengetahuan": "Pengetahuan tentang Forum TBM",
  "ftbm_sumber_pengetahuan": "Sumber Pengetahuan",
  "ftbm_alasan_bergabung": "Alasan Bergabung",
  "kap_minat_pengembangan": "Minat Pengembangan Kapasitas",
  "kap_topik_literasi": "Topik Literasi",
  "kap_topik_keorganisasian": "Topik Keorganisasian",
  "kap_topik_kecakapan_diri": "Topik Kecakapan Diri",
  "kap_topik_kecakapan_hidup": "Topik Kecakapan Hidup",
  "kap_durasi_pembelajaran": "Durasi Pembelajaran",
  "kap_kegiatan_belajar": "Kegiatan Belajar",
  "kap_sumber_belajar": "Sumber Belajar",
  "kap_kontribusi_peran": "Kontribusi Peran",
  "val_pernyataan_kebenaran": "Pernyataan Kebenaran Data",
  "val_setuju_ad_art": "Setuju AD/ART",
  "val_setuju_kegiatan": "Setuju Mengikuti Kegiatan",
  "val_setuju_grup_wa": "Setuju Masuk Grup WA",
  "catatan_pd": "Catatan PD",
  "foto_verifikasi_pd": "Foto Verifikasi PD",
  "verifikator_pd_id": "ID Verifikator PD",
  "tgl_verifikasi_pd": "Tanggal Verifikasi PD",
  "catatan_pw": "Catatan PW",
  "validator_pw_id": "ID Validator PW",
  "tgl_validasi_pw": "Tanggal Validasi PW",
  "nomor_sk": "Nomor SK",
  "nomor_berita_acara": "Nomor Berita Acara",
  "tgl_berita_acara": "Tanggal Berita Acara",
  "nama_ketua_pw": "Nama Ketua PW",
  "ttd_ketua_pw_path": "Path TTD Ketua PW",
  "nama_sekretaris_pw": "Nama Sekretaris PW",
  "ttd_sekretaris_pw_path": "Path TTD Sekretaris PW",
  "nomor_anggota_tbm": "Nomor Anggota TBM",
  "user_tbm_id": "ID User TBM"
};

export const TBM_SECTIONS: { title: string; fields: string[] }[] = [
  {
    "title": "Status & Keanggotaan",
    "fields": [
      "status",
      "nomor_anggota_tbm",
      "user_tbm_id"
    ]
  },
  {
    "title": "Pendaftar",
    "fields": [
      "user_pendaftar_id",
      "nama_pendaftar",
      "kontak_pendaftar",
      "status_pendaftar",
      "ref_sumber",
      "ref_identitas",
      "ref_status_pd"
    ]
  },
  {
    "title": "Identitas & Alamat TBM",
    "fields": [
      "nama_tbm",
      "provinsi_nama",
      "kabupaten_nama",
      "alamat_kecamatan",
      "alamat_desa",
      "alamat_jalan",
      "alamat_kodepos",
      "negara",
      "alamat_negara_bagian",
      "alamat_kota_luar",
      "alamat_jalan_luar"
    ]
  },
  {
    "title": "Kontak & Media Sosial",
    "fields": [
      "tbm_email",
      "tbm_telepon",
      "tbm_website",
      "medsos_facebook",
      "medsos_instagram",
      "medsos_lainnya"
    ]
  },
  {
    "title": "Kelembagaan",
    "fields": [
      "kelembagaan_pendiri",
      "kelembagaan_tgl_berdiri",
      "kelembagaan_status_izin",
      "kelembagaan_bentuk",
      "kelembagaan_badan_hukum",
      "kelembagaan_akta_pendirian",
      "kelembagaan_tgl_akta",
      "kelembagaan_sk_kemenkumham",
      "kelembagaan_tgl_sk",
      "kelembagaan_npwp",
      "kelembagaan_rekening",
      "kelembagaan_nama_satuan",
      "kelembagaan_sk_pendirian",
      "kelembagaan_tgl_sk_pendirian"
    ]
  },
  {
    "title": "Program & Layanan",
    "fields": [
      "program_layanan_literasi_dasar",
      "program_kegiatan_kerap",
      "program_isu_pemberdayaan",
      "program_daerah_3t",
      "program_jml_pengguna",
      "program_usia_pengguna",
      "program_gender_pengguna",
      "program_jml_buku",
      "program_koleksi_lain",
      "program_jenis_kegiatan",
      "program_rerata_kegiatan",
      "program_pengelola",
      "program_gender_pengelola",
      "program_jml_relawan",
      "program_usia_relawan",
      "program_sumber_dana",
      "program_pengeluaran_terbesar",
      "program_rerata_pengeluaran",
      "program_aktivitas_administrasi",
      "program_jml_tbm_lain",
      "program_nama_tbm_lain",
      "program_kolaborasi_jenis",
      "program_kolaborasi_dengan",
      "program_pustaka_dihasilkan",
      "program_asal_pustaka"
    ]
  },
  {
    "title": "Forum TBM",
    "fields": [
      "ftbm_pengetahuan",
      "ftbm_sumber_pengetahuan",
      "ftbm_alasan_bergabung"
    ]
  },
  {
    "title": "Pengembangan Kapasitas",
    "fields": [
      "kap_minat_pengembangan",
      "kap_topik_literasi",
      "kap_topik_keorganisasian",
      "kap_topik_kecakapan_diri",
      "kap_topik_kecakapan_hidup",
      "kap_durasi_pembelajaran",
      "kap_kegiatan_belajar",
      "kap_sumber_belajar",
      "kap_kontribusi_peran"
    ]
  },
  {
    "title": "Validasi Pernyataan",
    "fields": [
      "val_pernyataan_kebenaran",
      "val_setuju_ad_art",
      "val_setuju_kegiatan",
      "val_setuju_grup_wa"
    ]
  },
  {
    "title": "Verifikasi PD & Validasi PW",
    "fields": [
      "catatan_pd",
      "foto_verifikasi_pd",
      "verifikator_pd_id",
      "tgl_verifikasi_pd",
      "catatan_pw",
      "validator_pw_id",
      "tgl_validasi_pw",
      "nomor_sk",
      "nomor_berita_acara",
      "tgl_berita_acara",
      "nama_ketua_pw",
      "ttd_ketua_pw_path",
      "nama_sekretaris_pw",
      "ttd_sekretaris_pw_path"
    ]
  }
];

export const TBM_EDITABLE_COLUMNS = TBM_COLUMNS.filter((c) => c !== "id" && c !== "created_at" && c !== "updated_at");

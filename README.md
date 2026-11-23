# Dashboard Penguatan Organisasi – Forum TBM

Aplikasi web untuk monitoring **Pengurus Wilayah (PW)**, **Pengurus Daerah (PD)** dan **Keanggotaan TBM**,
dengan login username/password, manajemen user, CRUD data, upload/unduh CSV, dan dashboard visualisasi.

**Teknologi:** Next.js 16 (App Router) · Supabase (Postgres + Auth) · Tailwind CSS · Recharts · deploy di Vercel lewat GitHub.

---

## Fitur

| Menu | Isi |
|---|---|
| **Dashboard** | Jumlah PW/PD seluruh Indonesia, PW & PD aktif/tidak aktif, PD dalam pembentukan, PW presidium, daerah belum terbentuk PW/PD, daerah berpotensi membentuk PD (≥ 4 TBM) dan PW (≥ 4 PD), grafik PD per PW, grafik TBM per provinsi, rekap per provinsi |
| **Pengurus Wilayah** | CRUD identifikasi PW + data pengurus (ketua, sekretaris, bendahara, kabid POPSDM/Litbang/Program/Infokom, sekretariatan, kontak, email, medsos, alamat). Jumlah PD dihitung otomatis |
| **Pengurus Daerah** | CRUD identifikasi PD + data pengurus. Jumlah TBM dihitung otomatis |
| **Identifikasi Daerah** | Semua kab/kota: provinsi, status PW, status PD, jumlah TBM terdaftar, filter + unduh CSV |
| **Anggota TBM** | CRUD 99 kolom sesuai `template_tbm.csv`, pencarian, filter, **upload CSV** (tambah/perbarui), **unduh CSV** |
| **Manajemen User** | Superuser/Administrator menambah user, mengganti peran, reset password, menghapus user |
| **Akun Saya** | Ganti password sendiri |

### Peran user

| Peran | Lihat data | Ubah data | Kelola user |
|---|---|---|---|
| Superuser (`superadmin`) | ✓ | ✓ | semua peran |
| Administrator (`admin`) | ✓ | ✓ | Operator & Viewer |
| Operator | ✓ | ✓ | – |
| Viewer | ✓ | – | – |

Keamanan ditegakkan di database (Row Level Security), bukan hanya di tampilan.

---

## Langkah Instalasi

### 1. Buat project Supabase
1. Buka https://supabase.com → **New project**.
2. Buka **SQL Editor** → jalankan isi file berikut **berurutan**:
   1. `supabase/01_schema.sql` – tabel, trigger, view, RLS
   2. `supabase/02_seed_wilayah.sql` – 38 provinsi & 515 kabupaten/kota
3. **Matikan pendaftaran publik:** *Authentication → Sign In / Providers → Email* → nonaktifkan
   **"Allow new users to sign up"** (biarkan provider Email tetap aktif). User hanya dibuat dari aplikasi.
4. Catat dari *Project Settings → API*: **Project URL**, **anon/publishable key**, **service_role/secret key**.

### 2. Upload ke GitHub
```bash
cd dashboard-po
git remote add origin https://github.com/<akun-anda>/dashboard-po.git
git push -u origin main
```
(Repositori sudah di-`git init` dan berisi commit awal. Jadikan repositori **Private**.)

### 3. Deploy di Vercel
1. https://vercel.com → **Add New → Project** → impor repositori GitHub tadi.
2. Di **Environment Variables** isi:

| Nama | Nilai |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key (**rahasia**, jangan diberi awalan `NEXT_PUBLIC_`) |

3. **Deploy.** Setiap `git push` ke GitHub otomatis membangun ulang di Vercel.

### 4. Buat Superuser pertama
Buka `https://<domain-anda>.vercel.app/setup` → isi nama, username, password.
Halaman ini **otomatis terkunci** setelah user pertama dibuat. Selanjutnya user lain ditambahkan dari menu **Manajemen User**.

### Menjalankan di komputer sendiri (opsional)
```bash
cp .env.example .env.local   # isi nilainya
npm install
npm run dev                  # http://localhost:3000
```

---

## Import data TBM dari CSV

Menu **Anggota TBM → Upload CSV**.
- Header kolom sama dengan `template_tbm.csv` (template kosong & contoh bisa diunduh dari halaman upload).
- Kolom daftar (mis. `program_isu_pemberdayaan`) boleh berisi JSON array `["A","B"]` atau teks biasa.
- **Mode "Tambah & perbarui":** baris yang `id`-nya sudah ada diperbarui; baris tanpa `id` ditambahkan.
  **Mode "Tambah semua sebagai baru":** `id` diabaikan.
- File contoh yang Anda kirim memiliki satu baris utuh yang terbungkus tanda kutip; importer **memperbaikinya otomatis**.
- Nama provinsi/kabupaten dicocokkan otomatis ke data referensi (tidak peka huruf besar/kecil; "Kab. Bogor", "Bandung",
  "Sumatera Utara", "DI Yogyakarta" dll dikenali). TBM yang tidak cocok ditandai **"belum cocok"** — filter
  *Wilayah belum cocok* di daftar TBM untuk memperbaikinya, karena TBM tersebut belum terhitung di dashboard daerah.
- **Unduh CSV** menghasilkan format yang sama, sehingga bisa diedit di Excel lalu di-upload kembali.

---

## Definisi perhitungan dashboard

| Indikator | Definisi |
|---|---|
| PW / PD **terbentuk** | status `Aktif` atau `Tidak Aktif` |
| Belum terbentuk PW | provinsi tanpa PW terbentuk (termasuk yang masih **Presidium**) |
| Belum terbentuk PD | kab/kota tanpa PD terbentuk (termasuk yang **Dalam Pembentukan**) |
| Berpotensi membentuk PD | kab/kota belum terbentuk PD dengan **≥ 4 TBM** terdaftar |
| Berpotensi membentuk PW | provinsi belum terbentuk PW dengan **≥ 4 PD** terbentuk |
| Jumlah TBM terdaftar | semua baris data TBM (semua status) yang wilayahnya cocok |

Ambang batas bisa diubah di `src/lib/constants.ts` (`THRESHOLD_POTENSI_PD`, `THRESHOLD_POTENSI_PW`).
Definisi "terbentuk" ada di view `v_daerah` / `v_provinsi` (`supabase/01_schema.sql`).

---

## Struktur proyek
```
supabase/01_schema.sql         skema database, trigger, view, RLS
supabase/02_seed_wilayah.sql   data referensi provinsi & kab/kota
src/proxy.ts                   proteksi login semua halaman
src/app/login, setup           halaman login & setup superuser pertama
src/app/(app)/                 dashboard, pw, pd, daerah, tbm, users, akun
src/app/api/export/[type]      unduh CSV (tbm, daerah)
src/lib/tbm-fields.ts          daftar kolom, label & pengelompokan form TBM
src/lib/tbm-csv.ts             parser & normalisasi CSV
```

## Catatan keamanan
- Login memakai Supabase Auth. Username dipetakan ke email internal `username@users.forumtbm.local` (tidak perlu email asli).
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server (membuat/menghapus user) dan tidak pernah dikirim ke browser.
- Akun yang tidak memiliki profil di tabel `profiles` tidak bisa membaca data apa pun, walaupun berhasil login.
- Mesin pencari diblokir (`noindex`).
"# dashboardPO" 

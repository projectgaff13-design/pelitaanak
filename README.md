# Proof Landing Page (Vercel Ready)

Website statis untuk **Proof — Protect Our Future**. Paket ini sudah siap di-deploy ke Vercel tanpa build step tambahan.

## Struktur folder

```txt
proof-vercel/
├─ index.html
├─ assets/
│  ├─ css/
│  │  └─ styles.css
│  └─ js/
│     └─ main.js
├─ package.json
├─ vercel.json
└─ README.md
```

## Jalankan lokal

Cara paling mudah:

```bash
cd proof-vercel
python3 -m http.server 3000
```

Buka `http://localhost:3000`.

## Deploy ke Vercel lewat GitHub

1. Buat repository GitHub baru.
2. Upload semua isi folder `proof-vercel`.
3. Buka Vercel → **Add New Project** → pilih repo tersebut.
4. Framework preset: **Other**.
5. Build command: kosongkan.
6. Output directory: kosongkan / default.
7. Klik **Deploy**.

## Deploy lewat Vercel CLI

```bash
npm i -g vercel
cd proof-vercel
vercel
```

Untuk production:

```bash
vercel --prod
```

## Catatan edit

- Konten utama ada di `index.html`.
- Styling ada di `assets/css/styles.css`.
- Interaksi carousel dan tombol keranjang ada di `assets/js/main.js`.
- Font memakai Google Fonts, jadi saat online tampilannya akan mengikuti desain asli.


## Supabase CMS Setup

Versi ini sudah punya `admin.html` yang tersambung ke Supabase.

### 1. Jalankan SQL

Buka Supabase → SQL Editor → paste isi file:

```txt
supabase/schema.sql
```

Lalu klik **Run**.

### 2. Buat user admin

Buka Supabase → Authentication → Users → Add user.
Buat email dan password admin yang nanti dipakai login di `admin.html`.

### 3. Isi konfigurasi Supabase

Edit file:

```txt
assets/js/supabase-config.js
```

Isi:

```js
window.PELITA_SUPABASE = {
  url: "https://PROJECT_REF.supabase.co",
  anonKey: "ANON_PUBLIC_KEY",
  table: "site_content",
  rowId: "main"
};
```

Ambil `Project URL` dan `anon public key` dari Supabase → Project Settings → API.
Jangan pakai service role key di frontend.

### 4. Deploy

Push ke GitHub. Vercel akan deploy otomatis.
Admin berada di:

```txt
/admin.html
```

Konten publik akan dibaca dari Supabase. Admin harus login untuk menyimpan perubahan.


## Cara mengganti logo PNG

Logo sekarang sudah memakai file PNG di folder `assets/img/`, jadi bisa diganti kapan saja tanpa mengubah kode HTML.

- `assets/img/logo-header.png` — logo utama di header semua halaman publik.
- `assets/img/logo-footer.png` — logo di bagian footer.
- `assets/img/logo-admin.png` — logo khusus halaman admin.
- `assets/img/logo.png` — cadangan/logo umum jika ingin dipakai untuk kebutuhan lain.

Cara update:
1. Siapkan gambar logo format `.png`.
2. Ubah nama file sesuai bagian yang ingin diganti, misalnya `logo-header.png`.
3. Timpa file lama di folder `assets/img/` dengan file baru.
4. Pastikan nama file tetap sama agar semua halaman otomatis memakai logo baru.

Rekomendasi ukuran: gunakan PNG transparan berbentuk persegi, minimal 512×512 px, agar tajam di semua tampilan.

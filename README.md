# Pelita Anak Landing Page (Vercel Ready)

Website statis untuk **Pelita Anak — Cegah Grooming, Lindungi Anak**. Paket ini sudah siap di-deploy ke Vercel tanpa build step tambahan.

## Struktur folder

```txt
pelita-anak-vercel/
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
cd pelita-anak-vercel
python3 -m http.server 3000
```

Buka `http://localhost:3000`.

## Deploy ke Vercel lewat GitHub

1. Buat repository GitHub baru.
2. Upload semua isi folder `pelita-anak-vercel`.
3. Buka Vercel → **Add New Project** → pilih repo tersebut.
4. Framework preset: **Other**.
5. Build command: kosongkan.
6. Output directory: kosongkan / default.
7. Klik **Deploy**.

## Deploy lewat Vercel CLI

```bash
npm i -g vercel
cd pelita-anak-vercel
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

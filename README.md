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

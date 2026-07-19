# Setup Supabase untuk Admin Pelita Anak

Ikuti langkah ini setelah file di-upload ke GitHub/Vercel.

## 1. Buat project Supabase

1. Buka https://supabase.com
2. Buat project baru
3. Simpan database password
4. Tunggu project aktif

## 2. Jalankan SQL schema

Buka Supabase → SQL Editor → New query.

Paste isi file:

```txt
supabase/schema.sql
```

Lalu klik **Run**.

Schema ini membuat tabel:

```txt
site_content
```

Tabel ini menyimpan semua konten website dalam format JSON.

## 3. Buat akun admin

Buka:

```txt
Supabase → Authentication → Users → Add user
```

Buat email dan password admin. Akun ini dipakai login di halaman:

```txt
/admin.html
```

## 4. Isi konfigurasi Supabase

Edit file:

```txt
assets/js/supabase-config.js
```

Ganti:

```js
url: "https://PROJECT_REF.supabase.co",
anonKey: "ISI_SUPABASE_ANON_PUBLIC_KEY",
```

dengan data dari:

```txt
Supabase → Project Settings → API
```

Pakai:

- Project URL
- anon public key

Jangan pakai service_role key di frontend.

## 5. Deploy ke Vercel

Push perubahan ke GitHub:

```bash
git add .
git commit -m "Connect admin CMS to Supabase"
git push
```

Vercel akan deploy otomatis.

## 6. Cara update konten

1. Buka `https://domain-kamu.vercel.app/admin.html`
2. Login memakai email/password admin dari Supabase Auth
3. Edit konten
4. Klik **Simpan Perubahan**
5. Website publik akan membaca konten terbaru dari Supabase

## Catatan keamanan

Versi ini memakai Supabase Auth. Policy saat ini mengizinkan user yang login untuk update konten. Jangan buat akun auth untuk orang yang tidak boleh mengedit website.


## Upload gambar langsung dari admin

Versi ini memakai Supabase Storage bucket:

```txt
pelita-images
```

Bucket dan policy dibuat otomatis oleh `supabase/schema.sql`. Jika sebelumnya kamu sudah menjalankan SQL lama, jalankan ulang file `supabase/schema.sql` terbaru di SQL Editor agar Storage bucket dan policy upload ikut dibuat.

Di `admin.html`, login dulu, buka tab Hero/Beranda/Materi/Artikel/Mother Sharing/Toko, lalu klik **Upload gambar** pada field URL gambar. Setelah upload sukses, klik **Simpan Perubahan**.

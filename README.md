# SiteSurvey Pro

Sistem manajemen dan eksekusi survey lapangan untuk departemen Interior & Arsitektur.
Next.js 14+ (App Router, Server Actions, TypeScript) + Supabase (Postgres, Auth, RLS) + Tailwind CSS v4.

## Yang sudah dibangun (batch ini)

- Skema database lengkap di Supabase project **SURVEYGO** (`uefevjxgtmqmvxztfofd`): `profiles`,
  `projects`, `project_assignments`, `equipment_templates`, `equipment_checklists`,
  `survey_zones`, `survey_items`, `survey_photos` — semua dengan Row Level Security
  berbasis role (admin / project_manager / surveyor) dan project assignment.
- Trigger correlation engine: project baru otomatis dapat checklist peralatan sesuai
  `project_type` (Interior Fit-Out / Renovasi / Bare Unit), dari master data `equipment_templates`.
- Auth (login) + middleware session refresh.
- Dashboard (`/dashboard`) — sidebar navigasi dark forest + banner hijau tua + KPI cards
  mengambang + daftar project aktif + widget equipment correlation interaktif.
- Daftar & buat project (`/projects`, `/projects/new`).
- Detail project dengan 4 tab (`/projects/[id]`): Pre-Survey & Peralatan (equipment checklist
  matrix interaktif), Survey Execution (ringkasan + tombol ke mode eksekusi), Foto & 360
  (placeholder), Export & Laporan (placeholder).
- Mode eksekusi survey mobile-friendly (`/execute/[id]`): accordion per ruangan/zona,
  auto-calculator luas (m²) & volume (m³), form item survey per kategori dengan dynamic
  warning badge (moisture > 20% = merah, 15–20% = kuning; lux < 100 = kuning), indikator
  online/offline.

## Belum dibangun (fase berikutnya, sesuai roadmap)

- Layer offline-first penuh (Dexie/IndexedDB + service worker + sync queue) — saat ini
  form execution online-only (Fase 3a dari rencana implementasi).
- Galeri foto & tagging 360°, upload ke Supabase Storage.
- Export laporan PDF (client-side render).
- Halaman Peralatan & Laporan lintas-project (saat ini placeholder).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Kredensial Supabase sudah ada di `.env.local` (jangan commit file ini — sudah masuk `.gitignore`).
`SUPABASE_SERVICE_ROLE_KEY` bersifat rahasia (bypass RLS) — jangan expose ke client.

> Catatan instalasi: sandbox tempat proyek ini dibuat punya koneksi npm registry yang lambat/
> tidak stabil untuk paket besar seperti `next`, sehingga `node_modules` di sini belum
> terverifikasi build (`npm run build`) sampai selesai di sandbox. Jalankan `npm install` di
> mesin lokal Anda (koneksi normal) untuk instalasi yang bersih, lalu `npm run build` untuk
> verifikasi.

## Login pertama kali

Belum ada user. Buat user lewat Supabase Auth (dashboard Supabase → Authentication → Add user),
lalu role default akan `surveyor` (trigger otomatis membuat baris `profiles`). Untuk jadi admin,
update kolom `role` di tabel `profiles` lewat SQL editor Supabase:

```sql
update public.profiles set role = 'admin' where email = 'email-anda@contoh.com';
```

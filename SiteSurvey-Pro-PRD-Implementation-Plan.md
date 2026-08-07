# SiteSurvey Pro — PRD & Rencana Implementasi

**Versi:** 1.0 (draft perencanaan, belum dieksekusi)
**Tanggal:** 7 Agustus 2026

## 0. Keputusan yang Sudah Ditetapkan

| Area | Keputusan |
|---|---|
| Supabase project | Belum ada project terpilih — plan dibuat fleksibel untuk dua skenario (buat baru via MCP, atau connect ke project existing). Keputusan final diambil tepat sebelum eksekusi. |
| Offline support | **Offline-first penuh (PWA)** — surveyor bisa mengisi seluruh survey tanpa internet, sync otomatis saat online kembali. |
| Export laporan | **Client-side render** (react-pdf), live preview di browser, tanpa server tambahan. |
| Scope kode awal | Dashboard Utama, Modul Form Survey (execution), Komponen Equipment Checklist Matriks — sesuai permintaan asli. Halaman lain menyusul di fase berikutnya. |

Karena offline-first penuh dipilih, kompleksitas proyek naik signifikan dibanding draft awal (yang hanya minta localStorage draft-save). Bagian ini paling banyak diperluas di bawah.

---

## PART 1 — PRD YANG DISEMPURNAKAN

### 1.1 Ringkasan Produk

"SiteSurvey Pro" adalah aplikasi web fullstack untuk tim Interior & Arsitektur mengelola dan mengeksekusi survey lapangan: persiapan alat, pengukuran ruang, pencatatan temuan (kelembapan, listrik, plumbing), dokumentasi foto/360°, hingga export laporan PDF — dengan surveyor bisa bekerja penuh tanpa koneksi internet di lokasi.

### 1.2 Tech Stack (Diperbarui)

| Layer | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js 14+ (App Router, Server Actions, TypeScript) | |
| Database & Auth | Supabase (PostgreSQL, RLS, Supabase Auth, Storage) | |
| Styling & UI | Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion | |
| Form & Validasi | React Hook Form + Zod | Skema Zod dipakai ulang untuk validasi offline & online |
| State/Data | TanStack Query (server state) + Zustand (UI/offline queue state) | |
| **Offline storage** | **Dexie.js (wrapper IndexedDB)** | Menyimpan draft zona/item survey & foto pending upload |
| **PWA/Service Worker** | **Serwist (pengganti next-pwa yang sudah tidak aktif dikembangkan)** | Precaching shell, background sync untuk queue |
| PDF Export | @react-pdf/renderer | Render client-side, live preview |
| Image handling | browser-image-compression (kompres sebelum upload) | Penting untuk foto 360°/high-res dari HP di lapangan |

### 1.3 Role & Permission Matrix

| Aksi | admin | project_manager | surveyor |
|---|---|---|---|
| Kelola user/role | ✅ | ❌ | ❌ |
| CRUD semua project | ✅ | ✅ (project miliknya) | ❌ |
| Assign surveyor ke project | ✅ | ✅ | ❌ |
| Lihat project yang di-assign | ✅ | ✅ | ✅ (hanya yang di-assign) |
| Isi/edit checklist alat | ✅ | ✅ | ✅ (project assigned) |
| Isi/edit survey_zones & survey_items | ✅ | ✅ | ✅ (project assigned) |
| Upload foto | ✅ | ✅ | ✅ (project assigned) |
| Generate/export PDF laporan | ✅ | ✅ | ✅ (read-only project assigned) |
| Hapus project | ✅ | ✅ (miliknya) | ❌ |

Catatan: matrix ini perlu tabel penghubung tambahan `project_assignments` (project_id, user_id, role_in_project) — **tidak ada di skema asli** tapi wajib untuk RLS surveyor "hanya lihat project yang di-assign". Ditambahkan di §1.5.

### 1.4 Design System

| Token | Light | Dark |
|---|---|---|
| Primary/Accent | `emerald-900` (`#0F382C`) | sama, dipakai sebagai brand color konsisten |
| Accent Light | `emerald-500` (`#10B981`) | `emerald-400` untuk kontras lebih baik di dark |
| Background | `#FFFFFF` / `#F8FAF9` | `#0B1310` / `#121C18` |
| Text utama | `#090A0A` | `#FFFFFF` |
| Subtext | `#64748B` (slate-500) | `#94A3B8` (slate-400, lebih terang untuk kontras AA di dark) |
| Warning | amber-500 (`#F59E0B`) | sama |
| Critical/Danger | red-600 (`#DC2626`) | red-500 (`#EF4444`) |
| Success | emerald-500 | emerald-400 |

Implementasi via CSS variables + `next-themes`, token didefinisikan di `tailwind.config.ts` agar shadcn/ui otomatis ikut tema. Kontras teks-di-atas-hijau-tua divalidasi WCAG AA minimum.

### 1.5 Skema Database (Direvisi)

Perubahan dari draft asli:
- Tambah tabel `project_assignments` (untuk RLS multi-surveyor per project).
- Tambah kolom sinkronisasi offline di tabel yang bisa diedit di lapangan (`survey_zones`, `survey_items`, `survey_photos`): `client_generated_id` (uuid, untuk idempotent insert dari device), `updated_at`, `synced_at`.
- Enum `condition_status` & threshold warning didefinisikan sebagai constant yang direplikasi di client (Zod schema) agar validasi offline konsisten dengan DB constraint.
- Tabel `equipment_checklists` perlu `project_type` referensi implisit — checklist di-generate dari trigger berdasarkan `projects.project_type` (kolom baru, lihat di bawah).

**`projects`** — tambahan kolom: `project_type` (enum: `interior_fitout`, `renovasi`, `bare_unit`) — dipakai trigger correlation engine.

**`project_assignments`** (baru):
- `id`, `project_id` (FK), `user_id` (FK profiles), `assigned_role` (text), `created_at`

**RLS inti (ringkas):**
- `profiles`: user hanya bisa lihat/update baris sendiri; admin lihat semua.
- `projects`: admin — semua akses; PM — akses baris yang `created_by = auth.uid()`; surveyor — akses baris yang `id` ada di `project_assignments` miliknya.
- `survey_zones`, `survey_items`, `equipment_checklists`, `survey_photos`: turunan dari akses `projects` (via `project_id`/`zone_id` join), pola sama.
- Semua tabel: `INSERT`/`UPDATE` policy juga cek assignment, bukan cuma `SELECT`.

**Trigger Correlation Engine:**
Trigger `AFTER INSERT` di `projects` (bukan hanya untuk `interior_fitout`) memanggil function yang membaca tabel referensi `equipment_templates` (tabel baru, master data: project_type → daftar item wajib) lalu insert ke `equipment_checklists`. Ini lebih maintainable daripada hardcode di trigger — admin bisa ubah master checklist tanpa redeploy.

**`equipment_templates`** (baru, master data):
- `id`, `project_type` (enum), `item_name`, `category`, `is_required` (default true)

### 1.6 Arsitektur Offline-First (Baru — Detail Penting)

Karena dipilih PWA offline-first penuh, ini bagian paling kritis untuk didesain dengan benar sebelum coding:

1. **Service Worker (Serwist):** precache app shell (halaman `/projects/[id]/execute`, assets, fonts). Strategi `NetworkFirst` untuk data API, `CacheFirst` untuk assets statis.
2. **Local DB (Dexie/IndexedDB):** cermin skema Supabase untuk tabel yang diedit di lapangan (`survey_zones`, `survey_items`, `survey_photos` metadata + blob foto). Setiap record punya `sync_status`: `'synced' | 'pending' | 'conflict'`.
3. **Write path:** semua form write (RHF submit) menulis ke Dexie dulu (optimistic), UI update instant, lalu masuk **sync queue**.
4. **Sync queue (Zustand + background sync API):** saat online terdeteksi (`navigator.onLine` + event listener + heartbeat ping ke Supabase), queue diproses FIFO — push ke Supabase via Server Action/REST, on success update `sync_status='synced'` dan hapus dari queue.
5. **Konflik:** strategi **last-write-wins berdasarkan `updated_at`**, dengan notifikasi non-blocking ke user jika data server lebih baru (kasus jarang karena field-level ownership per surveyor, tapi tetap ditangani).
6. **Foto:** disimpan sebagai Blob di IndexedDB, dikompres saat capture, di-upload ke Supabase Storage saat online, `photo_url` di-update setelah upload sukses.
7. **Indikator UI:** badge online/offline persisten di header eksekusi survey + counter "X item menunggu sync".

Ini butuh effort tersendiri yang signifikan (estimasi ~30–35% dari total effort proyek) — dicatat di roadmap sebagai fase khusus.

### 1.7 Dynamic Warning Logic (Diperjelas)

| Kondisi | Threshold | Warning |
|---|---|---|
| Moisture dinding | > 20% | Badge merah "Kelembapan Tinggi" |
| Moisture dinding | 15–20% | Badge kuning "Perlu Pemantauan" |
| Kapasitas listrik (MCB) | < daya kebutuhan estimasi (input manual PM) | Badge merah "Kapasitas Tidak Cukup" |
| Lux level (pencahayaan) | < 100 lux (area kerja) | Badge kuning "Pencahayaan Kurang" |

Threshold disimpan sebagai constant di `lib/constants/thresholds.ts`, bukan hardcode di komponen — supaya bisa diaudit dan diubah tanpa architectural change.

### 1.8 Non-Functional Requirements (Baru)

- **Performance:** halaman execute harus tetap responsif dengan 50+ survey_items per project (virtualized list jika perlu).
- **Security:** RLS wajib aktif di semua tabel sebelum go-live; service role key tidak pernah expose ke client.
- **Aksesibilitas:** kontras warna AA, touch target minimum 44x44px di halaman mobile execute.
- **Mobile-first:** halaman `/execute` didesain mobile-first, breakpoint desktop sebagai enhancement.

### 1.9 Out of Scope (Fase Awal)

- Multi-bahasa (i18n)
- Notifikasi push
- Integrasi kalender eksternal
- Multi-tenant/organization (asumsi 1 perusahaan)

---

## PART 2 — RENCANA IMPLEMENTASI

### 2.1 Struktur Folder (Usulan)

```
app/
  (auth)/login, register
  dashboard/page.tsx
  projects/[id]/page.tsx          # detail + tabs
  projects/[id]/execute/page.tsx  # mobile execution
  api/... (jika perlu route handler selain Server Actions)
components/
  dashboard/ (kpi-cards, project-list, equipment-widget)
  equipment/ (checklist-matrix, checklist-card)
  survey/ (zone-accordion, dimension-calculator, warning-badge)
  photo/ (gallery-grid, upload-fab)
  report/ (pdf-preview, pdf-document)
  shared/ (theme-toggle, offline-indicator, sync-badge)
lib/
  supabase/ (client.ts, server.ts, middleware.ts)
  offline/ (dexie-db.ts, sync-queue.ts, sync-worker.ts)
  validators/ (zod schemas per entity)
  constants/ (thresholds.ts, equipment-templates.ts)
  actions/ (server actions per domain)
supabase/
  migrations/
```

### 2.2 Roadmap Bertahap

**Fase 0 — Fondasi**
Setup Next.js + TypeScript + Tailwind + shadcn, konfigurasi tema dark green, setup Supabase project (baru atau connect existing — keputusan diambil sebelum fase ini mulai), migration awal (semua tabel + `project_assignments` + `equipment_templates`), RLS dasar, auth flow (login/register + role assignment oleh admin).

**Fase 1 — Dashboard Utama**
KPI cards (query agregat), tabel/list project dengan filter & search, Quick Equipment Correlation Widget (read-only preview dari `equipment_templates`).

**Fase 2 — Equipment Checklist Matriks**
Halaman detail project Tab 1, trigger correlation engine, UI grid interaktif dengan status "Siap/Bawa" vs "Tidak Ada/Rusak", update via Server Action.

**Fase 3 — Survey Execution + Offline Layer**
Ini fase terberat — dibangun dalam 2 sub-tahap:
- 3a: Form execution online-only dulu (accordion zona, dimension calculator, checklist per kategori, dynamic warning) — supaya logic bisnis tervalidasi dulu tanpa kompleksitas offline.
- 3b: Lapisan offline (Dexie, service worker, sync queue, indikator UI) dipasang di atas 3a.

**Fase 4 — Photo & 360 Gallery**
Upload dengan kompresi, tagging titik objek, integrasi offline blob storage → Supabase Storage sync.

**Fase 5 — Export & Report**
React-pdf template dengan logo perusahaan, live preview Tab 4.

**Fase 6 — Polish & QA**
Responsive audit, aksesibilitas, RLS advisor check (Supabase), performance test dengan data dummy besar, PWA install/offline end-to-end test.

### 2.3 Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Kompleksitas sync offline menyebabkan bug data hilang/duplikat | Idempotent insert via `client_generated_id`, test skenario offline→online secara eksplisit di fase 3b sebelum lanjut fase 4 |
| RLS salah konfigurasi bocorkan data antar project/surveyor | Jalankan Supabase advisor check setiap migration, tulis test query per role sebelum fitur dianggap selesai |
| Foto/360° besar memenuhi IndexedDB quota | Kompresi wajib sebelum simpan lokal, batasi resolusi upload |
| Scope creep dari 4 halaman jadi seluruh app sekaligus | Ikuti urutan fase, tidak mulai fase baru sebelum fase sebelumnya lolos verifikasi |

### 2.4 Yang Perlu Diputuskan Sebelum Eksekusi Dimulai

1. Supabase project: buat baru via MCP, atau kredensial project existing yang mau dipakai.
2. Nama perusahaan, logo, dan format letterhead untuk PDF report.
3. Data dummy/seed awal untuk testing (nama project, user demo per role).

---

*Dokumen ini adalah rencana perencanaan — belum ada kode yang dieksekusi. Setelah direview, saya bisa mulai dari Fase 0.*

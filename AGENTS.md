<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AbsenKu

PWA kehadiran guru (mobile-first, `max-w-[480px]`). Spek lengkap di `prd.md`. Saat ini **UI mockup statis** — backend Supabase belum ada (tidak ada `.env`, client Supabase, atau route API). Jangan asumsikan fungsi backend sudah tersedia.

## Commands
- Dev: `npm run dev`
- Lint: `npm run lint` (`eslint`, flat config `eslint.config.mjs`)
- Typecheck: **tidak ada script** — jalankan `npx tsc --noEmit`. Butuh tipe route yang digenerate Next (`.next/types`): kalau `.next` belum ada (clone baru/dihapus), jalankan `npx next typegen` atau `npm run dev` dulu, karena `LayoutProps`/`PageProps` adalah helper global hasil generate.
- Build: `npm run build`
- Tidak ada test suite

## Stack quirks (beda dari training-data umum)
- **Next.js 16** (`next@16.3.0`, React 19) — baca `node_modules/next/dist/docs/` sebelum menulis kode (lihat blok atas).
- **shadcn v4** style `base-nova`, berbasis **Base UI** (`@base-ui/react`), BUKAN Radix. Jangan salin kode shadcn lama berbasis Radix; tambah komponen via `npx shadcn add <name>` agar mengikuti style project.
- **Tailwind CSS v4** — TIDAK ada `tailwind.config.*`. Tema lewat CSS di `app/globals.css` (`@import "tailwindcss"`, `@theme`, `@custom-variant dark`). Jangan buat config file.
- Path alias `@/*` (lihat `components.json`); util `cn()` di `lib/utils.ts`.
- Font: **Inter** (sans) via `next/font` di `app/layout.tsx`; mono masih **Geist Mono** (DESIGN.md menyebut JetBrains Mono, belum diterapkan).

## Structure & Conventions
- `app/(app)/layout.tsx` — shell bersama (banner PWA, header, bottom nav) untuk semua halaman ber-autentikasi; konten halaman berisi `children` di dalam container `max-w-[480px]`.
- `app/login/page.tsx` — halaman login TANPA shell `(app)` (client component, responsif mobile/desktop, panel brand di desktop).
- `app/(app)/dashboard/page.tsx` — dashboard utama guru (client component, jam real-time, status geofence; semua data masih statis).
- `app/(app)/riwayat/page.tsx` — riwayat presensi (server component, data statis).
- `app/(app)/izin/page.tsx` — halaman pengajuan izin (server component).
- `app/(app)/profile/page.tsx` — halaman profil guru (server component, data statis).
- `app/admin/page.tsx` — dashboard rekap admin (data statis; rekap Hadir/Terlambat/Izin/Sakit/Alpa, export Excel/PDF, antrean izin; konten responsif — list di mobile, tabel di desktop). TIDAK memakai shell `(app)`: punya layout sendiri `app/admin/layout.tsx` (sidebar desktop, topbar + bottom-nav mobile) karena halaman admin butuh lebar penuh, bukan `max-w-[480px]`.
- `app/admin/users/page.tsx` — kelola pengguna (tombol + form tambah dalam modal `Dialog`, daftar responsif — list di mobile, tabel di desktop).
- `app/admin/izin/page.tsx` — approval izin (filter status Segmented, daftar responsif — list di mobile, tabel di desktop; aksi setujui/tolak mengubah state lokal).
- `app/admin/absensi/page.tsx` — rekap absensi (filter bulan + status via Select, daftar responsif — list di mobile, tabel di desktop).
- `app/page.tsx` (`/`) masih boilerplate create-next-app; halaman utama yang dipakai adalah `/dashboard` dan `/login`.
- `components/ui/` — komponen shadcn yang sudah ada: `avatar`, `badge`, `button`, `card`, `dialog`, `input`, `select`, `tabs`, `textarea`.
- **Design system: `DESIGN.md`** — token warna/tipografi yang dipakai semua halaman. Halaman tidak menampilkan konten selain yang sudah ada; ikuti pola kode aktual: border `border-[#c6c6cd]` + `shadow-sm`, kartu putih `rounded-xl` (prose DESIGN.md menyebut `#E2E8F0` & tanpa shadow — kode aktual memakai token `outline-variant`).
- Sisa file mockup lawas `app/(app)/profile/page.html` (dan `.html` lain di `app/`) TIDAK dipakai lagi — sudah dikonversi ke `page.tsx`; jangan diedit, boleh dihapus.
- Branding app: **AbsenKu** (package `absen-ku`) — jangan pakai "AbsenGuru".
- Absensi berbasis **geofence GPS**, TANPA selfie/foto (lihat `prd.md`).


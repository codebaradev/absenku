<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AbsenKu

PWA kehadiran guru (mobile-first, `max-w-[480px]`). Spek lengkap di `prd.md`.

**Status backend:** halaman UI masih mockup statis — tidak ada page/route yang memakai Prisma/Supabase (grep `@/lib` di `app/` kosong). TAPI scaffolding backend sudah ada dan `.env` terisi kredensial asli. Jangan asumsikan fungsi backend berjalan, dan jangan commit `.env`.

## Commands
- Dev: `npm run dev`
- Lint: `npm run lint` (`eslint`, flat config `eslint.config.mjs`)
- Typecheck: **tidak ada script** — jalankan `npx tsc --noEmit`. Butuh tipe route yang digenerate Next (`.next/types`): kalau `.next` belum ada (clone baru/dihapus), jalankan `npx next typegen` atau `npm run dev` dulu, karena `LayoutProps`/`PageProps` adalah helper global hasil generate.
- Build: `npm run build`
- Prisma: `npx prisma migrate dev` / `npx prisma studio` / `npx prisma generate` (regenerate `@prisma/client` wajib setelah ubah `schema.prisma`).
- Tidak ada test suite

## Backend (Prisma 7 + Supabase)
- **Prisma 7** (`prisma.config.ts`, `@prisma/client@7.9.1`) — BUKAN Prisma 8 (skill `prisma-8` di repo ini TIDAK berlaku). `@prisma/adapter-pg` terpasang tapi belum dipakai di `lib/prisma.ts`.
- Dua URL di `.env`: **CLI migrate pakai `DIRECT_URL`** (session mode, via `prisma.config.ts` yang `import "dotenv/config"` — `.env` tidak dibaca otomatis oleh Prisma CLI); **client runtime pakai `DATABASE_URL`** (pooler pgbouncer) di `lib/prisma.ts`.
- Client siap pakai: `lib/prisma.ts` (PrismaClient), `lib/supabase.ts` (anon, client-side), `lib/supabase-server.ts` (`supabaseAdmin` pakai service-role — server-only).
- Skema ada di `prisma/schema.prisma` (migration `20260809183945_init`): model `School` (geofence lat/long/radius), `User`, `Attendance`, `LeaveRequest`. **Enums schema ≠ `prd.md`**: schema memakai `ADMIN/TEACHER/STAFF` & `PRESENT/LATE/ABSENT`; `prd.md` menyebut `ADMIN_TU/KEPALA_SEKOLAH/GURU`. Untuk kode, ikuti schema.
- `.env.example` tidak lengkap (hanya `DATABASE_URL` placeholder) — Supabase keys & `DIRECT_URL` cuma ada di `.env`.

## Stack quirks (beda dari training-data umum)
- **Next.js 16** (`next@16.3.0`, React 19) — baca `node_modules/next/dist/docs/` sebelum menulis kode (lihat blok atas).
- **shadcn v4** style `base-nova`, berbasis **Base UI** (`@base-ui/react`), BUKAN Radix. Jangan salin kode shadcn lama berbasis Radix; tambah komponen via `npx shadcn add <name>`.
- **Tailwind CSS v4** — TIDAK ada `tailwind.config.*`. Tema lewat CSS di `app/globals.css` (`@import "tailwindcss"`, `@theme`, `@custom-variant dark`). Jangan buat config file.
- Path alias `@/*` (lihat `components.json`); util `cn()` di `lib/utils.ts`.
- Font: **Inter** (sans) via `next/font` di `app/layout.tsx`; mono masih **Geist Mono** (DESIGN.md menyebut JetBrains Mono, belum diterapkan).
- `.env` berisi kredensial asli (Supabase + Postgres) — `.gitignore` menutup `.env*`. Jangan pernah commit.

## Structure & Conventions
- `app/(app)/layout.tsx` — shell bersama (banner PWA, header, bottom nav) untuk semua halaman ber-autentikasi; konten halaman berisi `children` di dalam container `max-w-[480px]`.
- `app/login/page.tsx` — halaman login TANPA shell `(app)` (client component, responsif mobile/desktop, panel brand di desktop).
- `app/(app)/dashboard|riwayat|izin|profile` — halaman guru (client/server component, semua data masih statis).
- `app/admin/*` — dashboard rekap admin (data statis). TIDAK memakai shell `(app)`: punya layout sendiri `app/admin/layout.tsx` (sidebar desktop, topbar + bottom-nav mobile) karena halaman admin butuh lebar penuh, bukan `max-w-[480px]`.
- `app/page.tsx` (`/`) masih boilerplate create-next-app; halaman utama yang dipakai adalah `/dashboard` dan `/login`.
- `components/ui/` — komponen shadcn yang sudah ada: `avatar`, `badge`, `button`, `card`, `dialog`, `input`, `pagination`, `select`, `table`, `tabs`, `textarea`; plus `components/table-pagination.tsx`.
- **Design system: `DESIGN.md`** — token warna/tipografi. Ikuti pola kode aktual: border `border-[#c6c6cd]` + `shadow-sm`, kartu putih `rounded-xl` (prose DESIGN.md menyebut `#E2E8F0` & tanpa shadow — kode aktual memakai token `outline-variant`).
- Sisa file mockup lawas `app/**/*.html` (mis. `app/(app)/profile/page.html`) TIDAK dipakai lagi — sudah dikonversi ke `page.tsx`; jangan diedit, boleh dihapus.
- Branding app: **AbsenKu** (package `absen-ku`) — jangan pakai "AbsenGuru".
- Absensi berbasis **geofence GPS**, TANPA selfie/foto (lihat `prd.md`).

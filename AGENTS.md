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
- Typecheck: **tidak ada script** — jalankan `npx tsc --noEmit`
- Build: `npm run build`
- Tidak ada test suite

## Stack quirks (beda dari training-data umum)
- **Next.js 16** (`next@16.3.0`, React 19) — baca `node_modules/next/dist/docs/` sebelum menulis kode (lihat blok atas).
- **shadcn v4** style `base-nova`, berbasis **Base UI** (`@base-ui/react`), BUKAN Radix. Jangan salin kode shadcn lama berbasis Radix; tambah komponen via `npx shadcn add <name>` agar mengikuti style project.
- **Tailwind CSS v4** — TIDAK ada `tailwind.config.*`. Tema lewat CSS di `app/globals.css` (`@import "tailwindcss"`, `@theme`, `@custom-variant dark`). Jangan buat config file.
- Path alias `@/*` (lihat `components.json`); util `cn()` di `lib/utils.ts`.

## Structure & Conventions
- `app/(app)/layout.tsx` — shell bersama (banner PWA, header, bottom nav) untuk semua halaman ber-autentikasi; konten halaman berisi `children` di dalam container `max-w-[480px]`.
- `app/login/page.tsx` — halaman login TANPA shell `(app)` (client component, responsif mobile/desktop, panel brand di desktop).
- `app/(app)/dashboard/page.tsx` — dashboard utama guru (client component, jam real-time, status geofence; semua data masih statis).
- `app/(app)/riwayat/page.tsx` — riwayat presensi (server component, data statis).
- `app/(app)/izin/page.tsx` — halaman pengajuan izin (server component).
- `app/(app)/profile/page.tsx` — halaman profil guru (server component, data statis).
- `components/ui/` — komponen shadcn (`button`, `badge`, `tabs`).
- Branding app: **AbsenKu** (package `absen-ku`) — jangan pakai "AbsenGuru".
- Absensi berbasis **geofence GPS**, TANPA selfie/foto (lihat `prd.md`).


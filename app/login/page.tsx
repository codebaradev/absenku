"use client";

import React, { useActionState } from "react";
import { GraduationCap, MapPin, CalendarCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, type LoginState } from "@/lib/actions/auth";

const FEATURES = [
  { icon: MapPin, text: "Presensi masuk & pulang berbasis lokasi geofence" },
  { icon: CalendarCheck, text: "Pengajuan izin & riwayat terpusat" },
  { icon: FileText, text: "Rekap otomatis untuk pelaporan sekolah" },
];

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col md:flex-row">
      {/* Desktop Brand Panel */}
      <aside className="hidden md:flex md:w-[45%] lg:w-1/2 bg-[#0b1c30] text-[#eaf1ff] flex-col justify-between p-10 lg:p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white text-black flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AbsenKu</span>
          </div>

          <h1 className="mt-14 text-4xl font-bold leading-tight tracking-tight">
            Absensi Guru yang{" "}
            <span className="text-[#6ffbbe]">cepat dan akurat</span>
          </h1>
          <p className="mt-4 text-[#bec6e0] max-w-md">
            Presensi berbasis lokasi untuk tenaga pendidik, dirancang agar
            cepat digunakan di luar ruangan.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-[#6cf8bb]/15 text-[#6ffbbe] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-[#bec6e0] mt-12">© 2026 AbsenKu</p>
      </aside>

      {/* Form Panel */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 md:px-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile Brand */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="mt-3 text-2xl font-bold tracking-tight text-[#0b1c30]">
              AbsenKu
            </span>
          </div>

          <div className="md:hidden text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[#0b1c30]">
              Selamat Datang
            </h2>
            <p className="text-sm text-[#45464d] mt-1">
              Masuk untuk melanjutkan presensi Anda hari ini.
            </p>
          </div>

          <form
            action={formAction}
            className="bg-white border border-[#c6c6cd] rounded-xl p-6 flex flex-col gap-5 mt-6"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="identifier"
                className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
              >
                NIP / Email
              </label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Masukkan NIP atau email"
                className="h-12 w-full rounded-md bg-[#f8f9ff] px-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
              >
                Kata Sandi
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan kata sandi"
                className="h-12 w-full rounded-md bg-[#f8f9ff] px-4"
              />
            </div>

            {state.error && (
              <p className="text-sm text-[#ba1a1a]" role="alert">
                {state.error}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-[#0b1c30]">
                <input type="checkbox" className="h-4 w-4 accent-[#0b1c30]" />
                Ingat saya
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#006c49] hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-md text-base font-semibold"
            >
              {isPending ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#45464d] mt-6">
            Belum punya akun?{" "}
            <button
              type="button"
              className="font-medium text-[#006c49] hover:underline"
            >
              Hubungi Admin Sekolah
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

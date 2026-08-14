"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  Users,
  Settings,
  BellRing,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/izin", label: "Pengajuan Izin", icon: CalendarCheck },
  { href: "/admin/absensi", label: "Data Absensi", icon: CalendarClock },
  { href: "/admin/users", label: "Kelola Pengguna", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
  // { href: "#", label: "Laporan", icon: FileSpreadsheet },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-[#c6c6cd] flex-col p-4 z-40">
        <div className="flex items-center gap-3 px-2 h-12 shrink-0">
          <img
            src="/icons/icon-192.png"
            alt="Logo AbsenKu"
            className="h-9 w-9 rounded-lg shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#0b1c30] leading-tight">
              AbsenKu
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#006c49]">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 mt-6">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 h-11 rounded-lg px-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <Dialog>
            <DialogTrigger
              render={
                <button className="flex items-center gap-3 h-11 w-full rounded-lg px-3 text-sm font-medium text-[#45464d] hover:bg-[#fee2e2] hover:text-[#b91c1c] transition-colors" />
              }
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Keluar</DialogTitle>
                <DialogDescription>Apakah Anda yakin ingin keluar dari akun ini?</DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <DialogClose render={<Button variant="outline" />}>
                  Batal
                </DialogClose>
                <form action={logout}>
                  <Button type="submit" variant="destructive">Keluar</Button>
                </form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#c6c6cd] px-4 h-12 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192.png"
            alt="Logo AbsenKu"
            className="h-8 w-8 rounded-lg shrink-0"
          />
          <h1 className="text-lg font-bold tracking-tight text-[#0b1c30]">
            AbsenKu
          </h1>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#006c49] bg-[#6cf8bb]/30 border border-[#4edea3]/20 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#eff4ff] transition-colors text-[#0b1c30]">
            <BellRing className="w-5 h-5" />
          </button>
          <Dialog>
            <DialogTrigger
              render={
                <button
                  type="button"
                  title="Keluar"
                  aria-label="Keluar"
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#fee2e2] hover:text-[#b91c1c] transition-colors text-[#45464d]"
                />
              }
            >
              <LogOut className="w-5 h-5" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Keluar</DialogTitle>
                <DialogDescription>Apakah Anda yakin ingin keluar dari akun ini?</DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <DialogClose render={<Button variant="outline" />}>
                  Batal
                </DialogClose>
                <form action={logout}>
                  <Button type="submit" variant="destructive">Keluar</Button>
                </form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="md:pl-64 pb-[90px] md:pb-0">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1100px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#c6c6cd] flex justify-around items-center px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              title={label}
              aria-label={label}
              className={`flex items-center justify-center px-3 py-1 min-w-[48px] min-h-[48px] transition-all ${
                active
                  ? "bg-black text-white rounded-full"
                  : "text-[#45464d] hover:text-[#0b1c30]"
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

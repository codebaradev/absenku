"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radio,
  Home,
  History,
  FileText,
  User,
  LogOut,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import type { Role } from "@prisma/client";
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
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/izin", label: "Izin", icon: FileText },
  { href: "/profile", label: "Profil", icon: User },
];

const SUPERVISOR_NAV = [
  { href: "/persetujuan", label: "Persetujuan", icon: CalendarCheck },
  { href: "/absensi", label: "Absensi", icon: CalendarClock },
];

export function AppShell({
  children,
  fullName,
  role,
}: {
  children: React.ReactNode;
  fullName: string;
  role: Role;
}) {
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
  const pathname = usePathname();
  const navItems =
    role === "KEPALA_SEKOLAH" ? [...NAV_ITEMS, ...SUPERVISOR_NAV] : NAV_ITEMS;

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen font-sans antialiased overflow-hidden flex justify-center">
      <main className="w-full max-w-[480px] bg-[#f8f9ff] min-h-screen relative overflow-y-auto overflow-x-hidden no-scrollbar pb-[100px] shadow-2xl flex flex-col">
        {/* Top App Bar Header */}
        <header className="bg-[#f8f9ff] border-b border-[#c6c6cd] sticky top-0 left-0 w-full z-40 flex justify-between items-center px-4 h-12 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border border-[#c6c6cd] shrink-0 bg-[#e5eeff] flex items-center justify-center text-[13px] font-semibold text-[#0b1c30]">
              {initials}
            </div>
            <h1 className="text-xl font-bold text-black tracking-tight">
              AbsenKu
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {/* <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#eff4ff] transition-colors text-black active:scale-95 duration-100 shrink-0">
              <Radio className="w-5 h-5" />
            </button> */}
            <Dialog>
              <DialogTrigger
                render={
                  <button
                    type="button"
                    title="Keluar"
                    aria-label="Keluar"
                    className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#fee2e2] hover:text-[#b91c1c] transition-colors text-[#45464d] active:scale-95 duration-100"
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

        {/* Body Content */}
        <div className="flex-1 flex flex-col p-4 gap-6">{children}</div>

        {/* Bottom Navigation Bar */}
        <nav className="bg-white border-t border-[#c6c6cd] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex justify-around items-center px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                title={label}
                aria-label={label}
                className={`flex items-center justify-center px-4 py-1 transition-all min-w-[48px] min-h-[48px] ${
                  active
                    ? "bg-black text-white rounded-full active:scale-90 duration-150"
                    : "text-[#45464d] hover:text-black active:scale-90 duration-150"
                }`}
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}

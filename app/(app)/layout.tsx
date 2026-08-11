"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Download,
  X,
  Radio,
  Home,
  History,
  FileText,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/izin", label: "Izin", icon: FileText },
  { href: "/profile", label: "Profil", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const pathname = usePathname();

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen font-sans antialiased overflow-hidden flex justify-center">
      <main className="w-full max-w-[480px] bg-[#f8f9ff] min-h-screen relative overflow-y-auto overflow-x-hidden no-scrollbar pb-[100px] shadow-2xl flex flex-col">
        {/* Banner PWA Install */}
        {showPwaBanner && (
          <div className="bg-[#dce9ff] border-b border-[#c6c6cd] px-4 py-2 flex items-start gap-3 w-full shrink-0">
            <Download className="text-black w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#0b1c30]">
                Install AbsenKu App
              </p>
              <p className="text-[12px] text-[#45464d]">
                Untuk pengalaman yang lebih baik.
              </p>
            </div>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#d3e4fe] transition-colors shrink-0"
              aria-label="Tutup banner"
            >
              <X className="w-4 h-4 text-[#5f636b]" />
            </button>
          </div>
        )}

        {/* Top App Bar Header */}
        <header className="bg-[#f8f9ff] border-b border-[#c6c6cd] sticky top-0 left-0 w-full z-40 flex justify-between items-center px-4 h-12 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-[#c6c6cd] shrink-0 bg-[#e5eeff] relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD95jOUfsON7Td5UA1hwzs6jRvacdc37LdxbuERkAxHd-bRCS8wj0brWZYSmBSNLbgIPODHEjSxHdHg2JRoQDXgz26S_qhNyhYW1vGnG7lmdkWDkYPg-v9gppPIKSoxkXwLRN8L1XeAP1aGx724rNAI1amEVyvEEkfE6TvEHgF6ikIgZkmbjAZyZBUjwNd5KMIQ_dvJRDbvdsLJ8-yxV12M9jk6CEP874T0LbcyNiwUBv1VSffwjo8IQ"
                alt="Foto profil guru"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <h1 className="text-xl font-bold text-black tracking-tight">
              AbsenKu
            </h1>
          </div>
          <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[#eff4ff] transition-colors text-black active:scale-95 duration-100 shrink-0">
            <Radio className="w-5 h-5" />
          </button>
        </header>

        {/* Body Content */}
        <div className="flex-1 flex flex-col p-4 gap-6">{children}</div>

        {/* Bottom Navigation Bar */}
        <nav className="bg-white border-t border-[#c6c6cd] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex justify-around items-center px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center justify-center px-4 py-1 transition-all min-w-[48px] min-h-[48px] ${
                  active
                    ? "bg-black text-white rounded-full active:scale-90 duration-150"
                    : "text-[#45464d] hover:text-black active:scale-90 duration-150"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] uppercase font-semibold tracking-wider mt-0.5">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}

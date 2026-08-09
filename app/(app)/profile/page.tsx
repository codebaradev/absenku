import React from "react";
import Image from "next/image";
import {
  Mail,
  Phone,
  Building2,
  School,
  PenLine,
  Lock,
  BellRing,
  CircleHelp,
  ChevronRight,
  CheckCircle2,
  LogOut,
} from "lucide-react";

const INFO_ITEMS = [
  {
    label: "Email",
    value: "budi.santoso@sman1.sch.id",
    icon: Mail,
  },
  {
    label: "Nomor Telepon",
    value: "+62 812-3456-7890",
    icon: Phone,
  },
  {
    label: "Unit Kerja",
    value: "SMA Negeri 1",
    icon: Building2,
  },
  {
    label: "Mata Pelajaran",
    value: "Matematika",
    icon: School,
  },
];

const SETTINGS_ITEMS = [
  { label: "Ubah Profil", icon: PenLine },
  { label: "Keamanan & Password", icon: Lock },
  { label: "Notifikasi", icon: BellRing },
  { label: "Pusat Bantuan", icon: CircleHelp },
];

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Profile Header */}
      <section className="flex flex-col items-center">
        <div className="relative mb-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-[#e5eeff] relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjf7DCc7WeNcTbf12xikcqk2_eTr6QH6D_A8piFjezzEQgbN3jq1ZXfgPAnLvKRpoGX5DwDSm4Xe64V3GObbjBSiDpNNJErx2nRFj8DNcUY_DNSyxSolta2YAZf1sqfARlYYXcP7zKFpUfTXryCfx6OpLyP13m17ff2ib-bKcnaj6-ajwQQn620V6Ls-8iKK0Y7GLZu-S6oKh-K01hEcQzxzy5Af6KHxD74zgP2Z9Do6WN8P69ORTMxQ"
              alt="Foto profil guru"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#4edea3] rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#002113]" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[#0b1c30] mb-1">
          Budi Santoso, S.Pd
        </h2>
        <p className="text-sm text-[#45464d]">
          NIP: 198005152005011004
        </p>
        <span className="mt-2 px-3 py-1 bg-[#d1fae5] text-[#047857] rounded-full text-[12px] font-semibold uppercase tracking-wider">
          Aktif Mengajar
        </span>
      </section>

      {/* Personal Info Card */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-4 shadow-sm">
        <h3 className="text-base font-semibold text-[#0b1c30]">
          Informasi Pribadi
        </h3>
        {INFO_ITEMS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#45464d] shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                {label}
              </p>
              <p className="text-sm text-[#0b1c30]">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Settings Menu */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
        <ul className="flex flex-col">
          {SETTINGS_ITEMS.map(({ label, icon: Icon }, i) => (
            <li
              key={label}
              className={`border-b border-[#c6c6cd] ${
                i === SETTINGS_ITEMS.length - 1 ? "border-b-0" : ""
              }`}
            >
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#eff4ff] transition-colors min-h-[48px]">
                <div className="flex items-center gap-3 text-[#0b1c30]">
                  <Icon className="w-5 h-5 text-[#45464d]" />
                  <span className="text-sm">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#45464d]" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Logout Button */}
      <button className="w-full min-h-[48px] bg-[#fee2e2] text-[#b91c1c] text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#fecaca] transition-colors border border-[#fca5a5]">
        <LogOut className="w-4 h-4" />
        Keluar Aplikasi
      </button>
    </div>
  );
}

import React from "react";
import { LogIn, LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  { value: "10-2023", label: "Oktober 2023" },
  { value: "09-2023", label: "September 2023" },
  { value: "08-2023", label: "Agustus 2023" },
];

const STATS = [
  { value: "21", label: "Hadir", className: "text-[#006c49]" },
  { value: "2", label: "Telat", className: "text-[#ba1a1a]" },
  { value: "1", label: "Izin", className: "text-[#0b1c30]" },
];

export default function RiwayatPage() {
  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Filter Section */}
      <section className="flex flex-col gap-2">
        <label
          className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
          htmlFor="month-filter"
        >
          Pilih Periode
        </label>
        <Select defaultValue="10-2023">
          <SelectTrigger
            id="month-filter"
            className="h-12 w-full rounded-lg bg-white"
          >
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Statistics Summary */}
      <section className="grid grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#c6c6cd] rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm"
          >
            <span className={`text-4xl font-bold ${s.className}`}>
              {s.value}
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] text-center">
              {s.label}
            </span>
          </div>
        ))}
      </section>

      {/* Detailed List */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[#0b1c30] mb-2">
          Detail Harian
        </h2>

        <div className="flex flex-col gap-4">
          {/* Item: Tepat Waktu */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm text-[#45464d]">Senin</span>
                <span className="text-lg font-semibold text-[#0b1c30]">
                  23 Okt
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium uppercase tracking-wider bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20">
                Tepat Waktu
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-[#c6c6cd] pt-3 mt-1">
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1 flex items-center gap-1">
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk
                </span>
                <span className="font-mono text-sm font-bold text-[#0b1c30]">
                  06:45 WIB
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1 flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" />
                  Pulang
                </span>
                <span className="font-mono text-sm font-bold text-[#0b1c30]">
                  15:10 WIB
                </span>
              </div>
            </div>
          </div>

          {/* Item: Terlambat */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm text-[#45464d]">Jumat</span>
                <span className="text-lg font-semibold text-[#0b1c30]">
                  20 Okt
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium uppercase tracking-wider bg-[#ffdad6] text-[#93000a]">
                Terlambat
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-[#c6c6cd] pt-3 mt-1">
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1 flex items-center gap-1">
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk
                </span>
                <span className="font-mono text-sm font-bold text-[#ba1a1a]">
                  07:15 WIB
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1 flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" />
                  Pulang
                </span>
                <span className="font-mono text-sm font-bold text-[#0b1c30]">
                  15:05 WIB
                </span>
              </div>
            </div>
          </div>

          {/* Item: Izin */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm text-[#45464d]">Kamis</span>
                <span className="text-lg font-semibold text-[#0b1c30]">
                  19 Okt
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium uppercase tracking-wider bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]">
                Izin Sakit
              </span>
            </div>
            <div className="border-t border-[#c6c6cd] pt-3 mt-1">
              <p className="text-sm text-[#45464d] italic text-center">
                Menghadiri acara keluarga.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

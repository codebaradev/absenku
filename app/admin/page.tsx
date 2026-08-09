import React from "react";
import { FileSpreadsheet, FileText, BellRing, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATS = [
  { label: "Hadir", value: "18", className: "text-[#006c49]" },
  { label: "Terlambat", value: "3", className: "text-[#ba1a1a]" },
  { label: "Izin", value: "2", className: "text-[#0b1c30]" },
  { label: "Sakit", value: "1", className: "text-[#b45309]" },
  { label: "Alpa", value: "0", className: "text-[#45464d]" },
];

const STATUS_CLASSES: Record<string, string> = {
  Hadir: "bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20",
  Terlambat: "bg-[#ffdad6] text-[#93000a]",
  Izin: "bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]",
  Sakit: "bg-[#fef3c7] text-[#92400e]",
  Alpa: "bg-[#e5eeff] text-[#45464d]",
};

const ATTENDANCE = [
  { name: "Budi Santoso, S.Pd", subject: "Fisika", time: "06:50", status: "Hadir" },
  { name: "Siti Rahayu, M.Pd", subject: "Bahasa Indonesia", time: "06:45", status: "Hadir" },
  { name: "Ahmad Fauzi, S.Pd", subject: "Matematika", time: "07:15", status: "Terlambat" },
  { name: "Dewi Lestari, S.Pd", subject: "Biologi", time: "--:--", status: "Sakit" },
  { name: "Rina Wulandari, S.Pd", subject: "Sejarah", time: "--:--", status: "Izin" },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header + Export */}
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[#0b1c30]">
            Dashboard Admin
          </h2>
          <p className="text-sm text-[#45464d]">
            Rekap kehadiran guru — SMA Negeri 1 · Senin, 23 Okt
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex md:gap-3">
          <button className="bg-white border border-[#c6c6cd] hover:bg-[#eff4ff] text-black rounded-lg h-12 md:h-10 md:px-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
            <FileSpreadsheet className="w-5 h-5 text-[#006c49]" />
            <span className="text-sm font-medium">Export Excel</span>
          </button>
          <button className="bg-white border border-[#c6c6cd] hover:bg-[#eff4ff] text-black rounded-lg h-12 md:h-10 md:px-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
            <FileText className="w-5 h-5 text-[#ba1a1a]" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
        </div>
      </section>

      {/* Statistics Summary */}
      <section className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#c6c6cd] rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm"
          >
            <span className={`text-3xl font-bold ${s.className}`}>
              {s.value}
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] text-center">
              {s.label}
            </span>
          </div>
        ))}
      </section>

      {/* Pending Approvals */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="h-10 w-10 rounded-full bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center shrink-0">
          <BellRing className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0b1c30]">
            2 Pengajuan Izin Menunggu
          </p>
          <p className="text-[12px] text-[#45464d]">Perlu persetujuan Anda</p>
        </div>
        <button className="bg-black text-white rounded-lg h-10 px-4 text-sm font-semibold hover:bg-[#131b2e] transition-colors shrink-0">
          Tinjau
        </button>
      </section>

      {/* Attendance - Mobile List */}
      <section className="flex flex-col gap-3 md:hidden">
        <h3 className="text-base font-semibold text-[#0b1c30]">
          Kehadiran Hari Ini
        </h3>

        {ATTENDANCE.map((a) => (
          <div
            key={a.name}
            className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[#0b1c30] truncate">
                  {a.name}
                </span>
                <span className="text-[12px] text-[#45464d]">{a.subject}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="font-mono text-sm font-semibold text-[#0b1c30]">
                {a.time}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_CLASSES[a.status]}`}
              >
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Attendance - Desktop Table */}
      <section className="hidden md:flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0b1c30]">
            Kehadiran Hari Ini
          </h3>
          <span className="text-sm text-[#45464d]">
            18 dari 24 guru hadir
          </span>
        </div>

        <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#c6c6cd] text-left hover:bg-transparent">
                <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Nama Guru
                </TableHead>
                <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Mata Pelajaran
                </TableHead>
                <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Masuk
                </TableHead>
                <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ATTENDANCE.map((a) => (
                <TableRow
                  key={a.name}
                  className="border-b border-[#c6c6cd] last:border-b-0"
                >
                  <TableCell className="px-4 py-3 text-sm font-medium text-[#0b1c30]">
                    {a.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-[#45464d]">
                    {a.subject}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-sm text-[#0b1c30]">
                    {a.time}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium uppercase tracking-wider ${STATUS_CLASSES[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

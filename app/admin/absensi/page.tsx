"use client";

import React, { useState } from "react";
import {
  LogIn,
  LogOut,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TablePagination,
  useTablePagination,
} from "@/components/table-pagination";

const MONTHS = [
  { value: "10-2023", label: "Oktober 2023" },
  { value: "09-2023", label: "September 2023" },
];

const STATUS_OPTIONS = [
  { value: "semua", label: "Semua Status" },
  { value: "Hadir", label: "Hadir" },
  { value: "Terlambat", label: "Terlambat" },
  { value: "Izin", label: "Izin" },
  { value: "Sakit", label: "Sakit" },
  { value: "Alpa", label: "Alpa" },
];

const STATUS_CLASSES: Record<string, string> = {
  Hadir: "bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20",
  Terlambat: "bg-[#ffdad6] text-[#93000a]",
  Izin: "bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]",
  Sakit: "bg-[#fef3c7] text-[#92400e]",
  Alpa: "bg-[#e5eeff] text-[#45464d]",
};

type AttendanceRecord = {
  id: string;
  month: string;
  date: string;
  name: string;
  in: string;
  out: string;
  status: string;
};

const initialRecords: AttendanceRecord[] = [
  { id: "1", month: "10-2023", date: "Senin, 23 Okt", name: "Budi Santoso, S.Pd", in: "06:50", out: "15:10", status: "Hadir" },
  { id: "2", month: "10-2023", date: "Senin, 23 Okt", name: "Ahmad Fauzi, S.Pd", in: "07:15", out: "15:05", status: "Terlambat" },
  { id: "3", month: "10-2023", date: "Senin, 23 Okt", name: "Dewi Lestari, S.Pd", in: "--:--", out: "--:--", status: "Sakit" },
  { id: "4", month: "10-2023", date: "Senin, 23 Okt", name: "Rina Wulandari, S.Pd", in: "--:--", out: "--:--", status: "Izin" },
  { id: "5", month: "10-2023", date: "Jumat, 20 Okt", name: "Budi Santoso, S.Pd", in: "06:45", out: "15:00", status: "Hadir" },
  { id: "6", month: "10-2023", date: "Jumat, 20 Okt", name: "Siti Rahayu, M.Pd", in: "07:20", out: "15:10", status: "Terlambat" },
  { id: "7", month: "10-2023", date: "Kamis, 19 Okt", name: "Siti Rahayu, M.Pd", in: "--:--", out: "--:--", status: "Alpa" },
  { id: "8", month: "09-2023", date: "Senin, 25 Sep", name: "Budi Santoso, S.Pd", in: "06:52", out: "15:08", status: "Hadir" },
  { id: "9", month: "09-2023", date: "Senin, 25 Sep", name: "Siti Rahayu, M.Pd", in: "06:48", out: "15:12", status: "Hadir" },
];

const selectClass = "h-10 w-full rounded-lg bg-white";

export default function AdminAbsensiPage() {
  const [month, setMonth] = useState("10-2023");
  const [status, setStatus] = useState("semua");

  const filtered = initialRecords.filter(
    (r) =>
      r.month === month &&
      (status === "semua" || r.status === status)
  );

  const { page, pageCount, pageItems, setPage } =
    useTablePagination(filtered);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0b1c30]">
          Data Absensi
        </h2>
        <p className="text-sm text-[#45464d]">
          Rekap presensi harian guru — SMA Negeri 1
        </p>
      </section>

      {/* Filters */}
      <section className="grid grid-cols-2 gap-3 md:flex md:gap-3 md:max-w-md">
        <Select value={month} onValueChange={(v) => setMonth(v ?? "10-2023")}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder="Pilih bulan" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => setStatus(v ?? "semua")}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Mobile List */}
      <section className="flex flex-col gap-3 md:hidden">
        {pageItems.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                {r.date}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_CLASSES[r.status]}`}
              >
                {r.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#0b1c30] truncate">
                  {r.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#e5e7eb] pt-3">
              <div className="flex items-center gap-1.5">
                <LogIn className="w-4 h-4 text-[#45464d]" />
                <span className="font-mono text-sm font-semibold text-[#0b1c30]">
                  {r.in}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-[#45464d]" />
                <span className="font-mono text-sm font-semibold text-[#0b1c30]">
                  {r.out}
                </span>
              </div>
            </div>
          </div>
        ))}
        <TablePagination
          page={page}
          pageCount={pageCount}
          total={filtered.length}
          onPageChange={setPage}
        />
      </section>

      {/* Desktop Table */}
      <section className="hidden md:block bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#c6c6cd] text-left hover:bg-transparent">
              <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Tanggal
              </TableHead>
              <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Guru
              </TableHead>
              <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Masuk
              </TableHead>
              <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Pulang
              </TableHead>
              <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((r) => (
              <TableRow
                key={r.id}
                className="border-b border-[#c6c6cd] last:border-b-0"
              >
                <TableCell className="px-4 py-3 text-sm text-[#45464d]">
                  {r.date}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm font-medium text-[#0b1c30]">
                  {r.name}
                </TableCell>
                <TableCell className="px-4 py-3 font-mono text-sm text-[#0b1c30]">
                  {r.in}
                </TableCell>
                <TableCell className="px-4 py-3 font-mono text-sm text-[#0b1c30]">
                  {r.out}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold uppercase tracking-wider ${STATUS_CLASSES[r.status]}`}
                  >
                    {r.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          pageCount={pageCount}
          total={filtered.length}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}

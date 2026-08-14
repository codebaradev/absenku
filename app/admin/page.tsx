import React from "react";
import Link from "next/link";
import { FileSpreadsheet, FileText, BellRing, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import type { AttendanceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_CLASSES: Record<string, string> = {
  Hadir: "bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20",
  Terlambat: "bg-[#ffdad6] text-[#93000a]",
  Izin: "bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]",
  Sakit: "bg-[#fef3c7] text-[#92400e]",
  Alpa: "bg-[#e5eeff] text-[#45464d]",
};

type Row = { name: string; time: string | null; status: string };

const attendanceStatus = (s: AttendanceStatus): string =>
  s === "PRESENT" ? "Hadir" : s === "LATE" ? "Terlambat" : "Alpa";

function fmtTime(iso: string | null): string {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );

  const [school, totalTeachers, todaysAttendance, todaysLeaves, pendingLeaves, sickCount, izinCount] =
    await Promise.all([
      prisma.school.findFirst({ select: { name: true } }),
      prisma.user.count({
        where: { role: { in: ["TEACHER", "STAFF"] }, is_active: true },
      }),
      prisma.attendance.findMany({
        where: { date: today },
        include: { user: { select: { full_name: true } } },
        orderBy: [{ status: "asc" }, { user: { full_name: "asc" } }],
      }),
      prisma.leaveRequest.findMany({
        where: {
          approval_status: "APPROVED",
          start_date: { lt: tomorrow },
          end_date: { gte: today },
        },
        include: { user: { select: { full_name: true } } },
        orderBy: { user: { full_name: "asc" } },
      }),
      prisma.leaveRequest.count({ where: { approval_status: "PENDING" } }),
      prisma.leaveRequest.count({
        where: {
          approval_status: "APPROVED",
          leave_type: "SICK",
          start_date: { lt: tomorrow },
          end_date: { gte: today },
        },
      }),
      prisma.leaveRequest.count({
        where: {
          approval_status: "APPROVED",
          leave_type: { not: "SICK" },
          start_date: { lt: tomorrow },
          end_date: { gte: today },
        },
      }),
    ]);

  const hadir = todaysAttendance.filter((a) => a.status === "PRESENT").length;
  const terlambat = todaysAttendance.filter((a) => a.status === "LATE").length;
  const alpa = todaysAttendance.filter((a) => a.status === "ABSENT").length;

  const STATS = [
    { label: "Hadir", value: hadir, className: "text-[#006c49]" },
    { label: "Terlambat", value: terlambat, className: "text-[#ba1a1a]" },
    { label: "Izin", value: izinCount, className: "text-[#0b1c30]" },
    { label: "Sakit", value: sickCount, className: "text-[#b45309]" },
    { label: "Alpa", value: alpa, className: "text-[#45464d]" },
  ];

  const rows: Row[] = [
    ...todaysAttendance.map((a) => ({
      name: a.user.full_name,
      time: a.check_in_time?.toISOString() ?? null,
      status: attendanceStatus(a.status),
    })),
    ...todaysLeaves.map((l) => ({
      name: l.user.full_name,
      time: null,
      status: (l.leave_type === "SICK" ? "Sakit" : "Izin") as string,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const dateLabel = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header + Export */}
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[#0b1c30]">
            Dashboard Admin
          </h2>
          <p className="text-sm text-[#45464d]">
            Rekap kehadiran guru — {school?.name ?? "Sekolah"} · {dateLabel}
          </p>
        </div>
        {/* <div className="grid grid-cols-2 gap-3 md:flex md:gap-3">
          <button className="bg-white border border-[#878a91] hover:bg-[#eff4ff] text-black rounded-lg h-12 md:h-10 md:px-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
            <FileSpreadsheet className="w-5 h-5 text-[#006c49]" />
            <span className="text-sm font-medium">Export Excel</span>
          </button>
          <button className="bg-white border border-[#878a91] hover:bg-[#eff4ff] text-black rounded-lg h-12 md:h-10 md:px-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
            <FileText className="w-5 h-5 text-[#ba1a1a]" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
        </div> */}
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
      <Link
        href="/admin/izin"
        className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-[#878a91] transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center shrink-0">
          <BellRing className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0b1c30]">
            {pendingLeaves} Pengajuan Izin Menunggu
          </p>
          <p className="text-[12px] text-[#45464d]">Perlu persetujuan Anda</p>
        </div>
        <button className="bg-black text-white rounded-lg h-10 px-4 text-sm font-semibold hover:bg-[#131b2e] transition-colors shrink-0">
          Tinjau
        </button>
      </Link>

      {/* Attendance - Mobile List */}
      <section className="flex flex-col gap-3 md:hidden">
        <h3 className="text-base font-semibold text-[#0b1c30]">
          Kehadiran Hari Ini
        </h3>

        {rows.length === 0 ? (
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-8 text-center text-sm text-[#5f636b] shadow-sm">
            Belum ada data kehadiran hari ini.
          </div>
        ) : (
          rows.map((a, i) => (
            <div
              key={`${a.name}-${i}`}
              className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#0b1c30] truncate">
                  {a.name}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-mono text-sm font-semibold text-[#0b1c30]">
                  {fmtTime(a.time)}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${STATUS_CLASSES[a.status]}`}
                >
                  {a.status}
                </span>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Attendance - Desktop Table */}
      <section className="hidden md:flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0b1c30]">
            Kehadiran Hari Ini
          </h3>
          <span className="text-sm text-[#45464d]">
            {hadir} dari {totalTeachers} guru hadir
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
                  Masuk
                </TableHead>
                <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-[#5f636b]"
                  >
                    Belum ada data kehadiran hari ini.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((a, i) => (
                  <TableRow
                    key={`${a.name}-${i}`}
                    className="border-b border-[#c6c6cd] last:border-b-0"
                  >
                    <TableCell className="px-4 py-3 text-sm font-medium text-[#0b1c30]">
                      {a.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm text-[#0b1c30]">
                      {fmtTime(a.time)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium uppercase tracking-wider ${STATUS_CLASSES[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
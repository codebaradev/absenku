"use client";

import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  CalendarDays,
  FileText,
  Users,
  Check,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  getAdminLeaveRequests,
  setLeaveStatus,
  type AdminLeaveRow,
  type AdminLeaveStatus,
} from "@/lib/actions/izin-admin";

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "menunggu", label: "Menunggu" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
] as const;

const TYPE_ICONS: Record<AdminLeaveRow["type"], typeof Stethoscope> = {
  Sakit: Stethoscope,
  Izin: FileText,
  Cuti: CalendarDays,
};

const TYPE_BADGES: Record<AdminLeaveRow["type"], string> = {
  Sakit: "bg-[#fef3c7] text-[#92400e]",
  Izin: "bg-[#d3e4fe] text-[#0b1c30]",
  Cuti: "bg-[#e5eeff] text-[#45464d]",
};

const STATUS_BADGES: Record<AdminLeaveStatus, string> = {
  menunggu: "bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]/40",
  disetujui: "bg-[#6cf8bb]/40 text-[#00714d]",
  ditolak: "bg-[#ffdad6] text-[#93000a]",
};

const STATUS_LABELS: Record<AdminLeaveStatus, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

function fmtRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const short = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  if (start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10))
    return short(start);
  return `${short(start)} - ${short(end)}`;
}

export default function AdminIzinPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("semua");
  const [requests, setRequests] = useState<AdminLeaveRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getAdminLeaveRequests().then((res) => {
      if (!mounted) return;
      if (!res.ok) setError(res.error);
      else setRequests(res.items);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function setStatus(id: string, status: "APPROVED" | "REJECTED") {
    if (pendingId) return;
    setPendingId(id);
    setLeaveStatus(id, status).then((res) => {
      setPendingId(null);
      if (res.error) {
        setError(res.error);
        return;
      }
      setRequests((rs) =>
        rs
          ? rs.map((r) =>
              r.id === id
                ? { ...r, status: status === "APPROVED" ? "disetujui" : "ditolak" }
                : r
            )
          : rs
      );
    });
  }

  const filtered = (requests ?? []).filter(
    (r) =>
      (filter === "semua" || r.status === filter) &&
      r.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const { page, pageCount, pageItems, setPage } =
    useTablePagination(filtered);

  if (error) {
    return <p className="text-sm text-[#ba1a1a]">{error}</p>;
  }

  if (requests === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#45464d]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0b1c30]">
          Pengajuan Izin
        </h2>
        <p className="text-sm text-[#45464d]">
          Kelola dan setujui pengajuan izin guru
        </p>
      </section>

      {/* Search by Name */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f636b] pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama guru..."
          className="h-11 w-full pl-9 bg-white border-[#c6c6cd] rounded-lg shadow-sm"
        />
      </div>

      {/* Status Filter */}
      <section className="bg-[#e5eeff] p-1 rounded-lg grid grid-cols-4 gap-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`h-9 rounded-md text-[12px] font-medium text-center transition-all ${
              filter === key
                ? "bg-white text-black shadow-sm"
                : "text-[#45464d] hover:text-[#0b1c30]"
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#c6c6cd] rounded-lg p-8 text-center text-sm text-[#5f636b] shadow-sm">
          Tidak ada pengajuan izin yang cocok.
        </div>
      ) : (
        <>
          {/* Mobile List */}
          <section className="flex flex-col gap-3 md:hidden">
            {pageItems.map((r) => {
              const TypeIcon = TYPE_ICONS[r.type];
              const busy = pendingId === r.id;
              return (
                <div
                  key={r.id}
                  className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-[#0b1c30] truncate">
                          {r.name}
                        </span>
                        <span className="text-[12px] text-[#45464d] flex items-center gap-1">
                          <TypeIcon className="w-3.5 h-3.5" />
                          {r.type} · {fmtRange(r.startDate, r.endDate)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${STATUS_BADGES[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </div>

                  <p className="text-sm text-[#45464d] border-t border-[#e5e7eb] pt-3">
                    {r.reason}
                  </p>

                  {r.status === "menunggu" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        disabled={busy}
                        onClick={() => setStatus(r.id, "APPROVED")}
                        className="bg-[#047857] hover:bg-[#065f46] disabled:opacity-50 text-white rounded-lg h-11 flex items-center justify-center gap-1.5 text-sm font-semibold active:scale-[0.98] transition-transform"
                      >
                        {busy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Setujui
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => setStatus(r.id, "REJECTED")}
                        className="bg-white border border-[#c6c6cd] hover:bg-[#ffdad6]/40 disabled:opacity-50 text-[#b91c1c] rounded-lg h-11 flex items-center justify-center gap-1.5 text-sm font-semibold active:scale-[0.98] transition-transform"
                      >
                        {busy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
                    Guru
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                    Jenis Izin
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                    Tanggal
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                    Alasan
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
                {pageItems.map((r) => {
                  const TypeIcon = TYPE_ICONS[r.type];
                  const busy = pendingId === r.id;
                  return (
                    <TableRow
                      key={r.id}
                      className="border-b border-[#c6c6cd] last:border-b-0"
                    >
                      <TableCell className="px-4 py-3 text-sm font-medium text-[#0b1c30]">
                        {r.name}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold uppercase tracking-wider ${TYPE_BADGES[r.type]}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {r.type}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-[#45464d]">
                        {fmtRange(r.startDate, r.endDate)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-[#45464d] max-w-xs truncate">
                        {r.reason}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATUS_BADGES[r.status]}`}
                        >
                          {STATUS_LABELS[r.status]}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {r.status === "menunggu" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={busy}
                              onClick={() => setStatus(r.id, "APPROVED")}
                              className="bg-[#047857] hover:bg-[#065f46] disabled:opacity-50 text-white rounded-lg h-9 px-3 flex items-center gap-1.5 text-sm font-semibold transition-colors"
                            >
                              {busy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Setujui
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => setStatus(r.id, "REJECTED")}
                              className="bg-white border border-[#c6c6cd] hover:bg-[#ffdad6]/40 disabled:opacity-50 text-[#b91c1c] rounded-lg h-9 px-3 flex items-center gap-1.5 text-sm font-semibold transition-colors"
                            >
                              {busy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-[#5f636b] block text-right">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              page={page}
              pageCount={pageCount}
              total={filtered.length}
              onPageChange={setPage}
            />
          </section>
        </>
      )}
    </div>
  );
}
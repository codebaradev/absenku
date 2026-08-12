"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  LogIn,
  LogOut,
  Pencil,
  Trash2,
  Users,
  Loader2,
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
import {
  getAbsensiData,
  deleteAbsensi,
  updateAttendance,
  type AbsensiData,
  type AbsensiRow,
  type AbsensiStatus,
} from "@/lib/actions/absensi";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimeField } from "@/components/time-field";

const STATUS_OPTIONS = [
  { value: "semua", label: "Semua Status" },
  { value: "Hadir", label: "Hadir" },
  { value: "Terlambat", label: "Terlambat" },
  { value: "Izin", label: "Izin" },
  { value: "Sakit", label: "Sakit" },
  { value: "Alpa", label: "Alpa" },
];

const STATUS_CLASSES: Record<AbsensiStatus, string> = {
  Hadir: "bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20",
  Terlambat: "bg-[#ffdad6] text-[#93000a]",
  Izin: "bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]",
  Sakit: "bg-[#fef3c7] text-[#92400e]",
  Alpa: "bg-[#e5eeff] text-[#45464d]",
};

const selectClass = "h-10 w-full rounded-lg bg-white";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("id-ID", { weekday: "long" })}, ${d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })}`;
}

function fmtTime(iso: string | null): string {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function AdminAbsensiPage({
  editable = true,
}: {
  editable?: boolean;
}) {
  const [data, setData] = useState<Extract<AbsensiData, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("semua");
  const [pending, setPending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { id: string; name: string; kind: "attendance" | "leave" } | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<AbsensiRow | null>(null);
  const [editIn, setEditIn] = useState("");
  const [editOut, setEditOut] = useState("");
  const [editStatus, setEditStatus] = useState<"PRESENT" | "LATE" | "ABSENT">(
    "PRESENT"
  );
  const [saving, setSaving] = useState(false);

  const toHHMM = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };
  const statusToEnum = (s: AbsensiStatus): "PRESENT" | "LATE" | "ABSENT" =>
    s === "Hadir" ? "PRESENT" : s === "Terlambat" ? "LATE" : "ABSENT";

  function openEdit(r: AbsensiRow) {
    setEditTarget(r);
    setEditIn(toHHMM(r.in));
    setEditOut(toHHMM(r.out));
    setEditStatus(statusToEnum(r.status));
  }

  useEffect(() => {
    let mounted = true;
    getAbsensiData().then((res) => {
      if (!mounted) return;
      if (!res.ok) setError(res.error);
      else setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function onMonthChange(value: string | null) {
    if (!value || !data || value === data.selected) return;
    setPending(true);
    getAbsensiData(value).then((res) => {
      setPending(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res);
    });
  }

  const filtered = useMemo(() => {
    if (!data) return [];
    return status === "semua"
      ? data.rows
      : data.rows.filter((r) => r.status === status);
  }, [data, status]);

  const { page, pageCount, pageItems, setPage } =
    useTablePagination(filtered);

  if (error) {
    return <p className="text-sm text-[#ba1a1a]">{error}</p>;
  }

  if (!data) {
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
          Data Absensi
        </h2>
        <p className="text-sm text-[#45464d]">
          Rekap presensi harian guru dari database
        </p>
      </section>

      {/* Filters */}
      <section className="grid grid-cols-2 gap-3 md:flex md:gap-3 md:max-w-md">
        <Select
          value={data.selected}
          onValueChange={onMonthChange}
          disabled={pending}
        >
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder="Pilih bulan" />
          </SelectTrigger>
          <SelectContent>
            {data.months.map((m) => (
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

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#c6c6cd] rounded-lg p-8 text-center text-sm text-[#5f636b] shadow-sm">
          Tidak ada data absensi pada periode ini.
        </div>
      ) : (
        <>
          {/* Mobile List */}
          <section className="flex flex-col gap-3 md:hidden">
            {pageItems.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex flex-col gap-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                    {fmtDate(r.date)}
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
                    {editable && (
                      <>
                        <button
                          disabled={r.kind === "leave"}
                          onClick={() => openEdit(r)}
                          title={r.kind === "leave" ? "Edit absen tidak tersedia untuk izin" : "Edit"}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ id: r.id, name: r.name, kind: r.kind })
                          }
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-[#e5e7eb] pt-3">
                  <div className="flex items-center gap-1.5">
                    <LogIn className="w-4 h-4 text-[#45464d]" />
                    <span className="font-mono text-sm font-semibold text-[#0b1c30]">
                      {fmtTime(r.in)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LogOut className="w-4 h-4 text-[#45464d]" />
                    <span className="font-mono text-sm font-semibold text-[#0b1c30]">
                      {fmtTime(r.out)}
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
                      {fmtDate(r.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium text-[#0b1c30]">
                      {r.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm text-[#0b1c30]">
                      {fmtTime(r.in)}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm text-[#0b1c30]">
                      {fmtTime(r.out)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold uppercase tracking-wider ${STATUS_CLASSES[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {editable && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            disabled={r.kind === "leave"}
                            onClick={() => openEdit(r)}
                            title={r.kind === "leave" ? "Edit absen tidak tersedia untuk izin" : "Edit"}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                           <button
                              onClick={() =>
                                setDeleteTarget({
                                  id: r.id,
                                  name: r.name,
                                  kind: r.kind,
                                })
                              }
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      )}
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
        </>
      )}

      {/* Modal Konfirmasi Hapus */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0b1c30]">
              Hapus data absensi?
            </DialogTitle>
            <DialogDescription>
              Data absensi {deleteTarget?.name ? `atas nama ${deleteTarget.name} ` : ""}
              akan dihapus secara permanen dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
            <Button
              disabled={deleting}
              onClick={async () => {
                if (!deleteTarget) return;
                setDeleting(true);
                const res = await deleteAbsensi(
                  deleteTarget.id,
                  deleteTarget.kind
                );
                setDeleting(false);
                if (res.error) {
                  setError(res.error);
                  setDeleteTarget(null);
                  return;
                }
                setDeleteTarget(null);
                const refreshed = await getAbsensiData(data!.selected);
                if (refreshed.ok) setData(refreshed);
                else setError(refreshed.error);
              }}
              className="h-12 rounded-md text-base font-semibold bg-[#b91c1c] hover:bg-[#991b1b] text-white"
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Absensi */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0b1c30]">
              Edit Absensi
            </DialogTitle>
            <DialogDescription>
              {editTarget?.name} — {editTarget ? fmtDate(editTarget.date) : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <TimeField
                label="Jam Masuk"
                value={editIn}
                onChange={setEditIn}
              />
              <TimeField
                label="Jam Pulang"
                value={editOut}
                onChange={setEditOut}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                Status
              </label>
              <Select
                value={editStatus}
                onValueChange={(v) =>
                  setEditStatus(v as "PRESENT" | "LATE" | "ABSENT")
                }
              >
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Hadir</SelectItem>
                  <SelectItem value="LATE">Terlambat</SelectItem>
                  <SelectItem value="ABSENT">Alpa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
            <Button
              disabled={saving}
              onClick={async () => {
                if (!editTarget) return;
                setSaving(true);
                const res = await updateAttendance({
                  id: editTarget.id,
                  checkIn: editIn || null,
                  checkOut: editOut || null,
                  status: editStatus,
                });
                setSaving(false);
                if (res.error) {
                  setError(res.error);
                  setEditTarget(null);
                  return;
                }
                setEditTarget(null);
                const refreshed = await getAbsensiData(data!.selected);
                if (refreshed.ok) setData(refreshed);
                else setError(refreshed.error);
              }}
              className="h-12 rounded-md text-base font-semibold"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import {
  CalendarDays,
  CheckCircle2,
  History,
  Send,
  Upload,
  XCircle,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getLeaveHistory,
  submitLeaveRequest,
  type LeaveHistoryData,
} from "@/lib/actions/izin";
import type { ApprovalStatus, LeaveType } from "@prisma/client";

const LEAVE_OPTIONS: { value: LeaveType; label: string }[] = [
  { value: "SICK", label: "Sakit" },
  { value: "ANNUAL", label: "Cuti Tahunan" },
  { value: "MATERNITY", label: "Cuti Melahirkan" },
  { value: "OTHER", label: "Keperluan Lainnya" },
];

const STATUS_META: Record<
  ApprovalStatus,
  { label: string; badge: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Menunggu",
    badge: "bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]",
    icon: History,
  },
  APPROVED: {
    label: "Disetujui",
    badge: "bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Ditolak",
    badge: "bg-[#ffdad6] text-[#93000a]",
    icon: XCircle,
  },
};

function fmtRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dayMonth = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  if (start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10))
    return start.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  return `${dayMonth(start)} - ${end.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export default function LeaveRequestPage() {
  const [leaveType, setLeaveType] = useState<LeaveType | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [history, setHistory] = useState<
    Extract<LeaveHistoryData, { ok: true }>["items"] | null
  >(null);
  const [histError, setHistError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    getLeaveHistory().then((res) => {
      if (!mounted) return;
      if (!res.ok) setHistError(res.error);
      else setHistory(res.items);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function refreshHistory() {
    getLeaveHistory().then((res) => {
      if (res.ok) {
        setHistory(res.items);
        setHistError(null);
      }
    });
  }

  function resetForm() {
    setLeaveType(null);
    setStartDate("");
    setEndDate("");
    setReason("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData();
    fd.set("leaveType", leaveType ?? "");
    fd.set("startDate", startDate);
    fd.set("endDate", endDate);
    fd.set("reason", reason);
    if (file) fd.set("attachment", file);

    startTransition(async () => {
      const res = await submitLeaveRequest(fd);
      if (res.error) {
        setMsg({ kind: "err", text: res.error });
        return;
      }
      setMsg({ kind: "ok", text: res.message ?? "Berhasil dikirim." });
      resetForm();
      refreshHistory();
    });
  }

  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Page Title */}
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0b1c30]">
          Ajukan Izin/Cuti
        </h2>
        <p className="text-sm text-[#45464d]">
          Lengkapi formulir di bawah ini untuk mengajukan perizinan baru.
        </p>
      </section>

      {/* Application Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-4 shadow-sm"
      >
        {/* Type Selection */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-[#0b1c30]"
            htmlFor="permitType"
          >
            Jenis Izin
          </label>
          <Select
            value={leaveType ?? ""}
            onValueChange={(v) => setLeaveType((v as LeaveType) || null)}
          >
            <SelectTrigger
              id="permitType"
              className="h-12 w-full rounded-lg bg-[#f8f9ff]"
            >
              <SelectValue placeholder="Pilih jenis izin" />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-[#0b1c30]"
              htmlFor="startDate"
            >
              Tanggal Mulai
            </label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12 w-full rounded-lg bg-[#f8f9ff]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-[#0b1c30]"
              htmlFor="endDate"
            >
              Tanggal Selesai
            </label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12 w-full rounded-lg bg-[#f8f9ff]"
            />
          </div>
        </div>

        {/* Reason */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-[#0b1c30]"
            htmlFor="permitReason"
          >
            Keterangan / Alasan
          </label>
          <Textarea
            id="permitReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan alasan izin Anda secara singkat..."
            className="w-full resize-none min-h-[100px] rounded-lg bg-[#f8f9ff]"
          />
        </div>

        {/* Attachment */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#e5e7eb]">
          <span className="text-sm font-medium text-[#0b1c30]">
            Lampiran Dokumen
          </span>
          <p className="text-xs text-[#45464d] mb-1">
            Unggah surat keterangan dokter atau dokumen pendukung lainnya
            (PDF/JPG/PNG, maks. 5 MB).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 h-12 w-full rounded-lg border-2 border-dashed border-[#878a91] bg-[#f8f9ff] text-sm font-medium text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
          >
            <Upload className="w-4 h-4" />
            {file ? file.name : "Pilih Dokumen"}
          </button>
        </div>

        {msg && (
          <p
            className={`text-sm ${
              msg.kind === "ok" ? "text-[#00714d]" : "text-[#ba1a1a]"
            }`}
          >
            {msg.text}
          </p>
        )}

        {/* Submit Action */}
        <div className="pt-2 mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 h-[52px] w-full rounded-lg bg-[#047857] hover:bg-[#065f46] disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-semibold shadow-sm active:scale-[0.98] transition-transform"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isPending ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </div>
      </form>

      {/* History Section */}
      <section className="flex flex-col gap-4 mt-2">
        <h3 className="text-lg font-semibold text-[#0b1c30]">
          Status Pengajuan Terakhir
        </h3>

        {histError && <p className="text-sm text-[#ba1a1a]">{histError}</p>}

        {history === null ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#45464d]" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-8 text-center text-sm text-[#5f636b] shadow-sm">
            Belum ada pengajuan izin.
          </div>
        ) : (
          history.map((h) => {
            const meta = STATUS_META[h.status];
            const Icon = meta.icon;
            return (
              <div
                key={h.id}
                className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-base font-medium text-[#0b1c30] truncate">
                    {LEAVE_OPTIONS.find((o) => o.value === h.leaveType)?.label ??
                      h.leaveType}
                  </span>
                  <span className="text-sm text-[#45464d] flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    {fmtRange(h.startDate, h.endDate)}
                  </span>
                  <span className="text-[12px] text-[#5f636b] line-clamp-1">
                    {h.reason}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider shrink-0 ${meta.badge}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </span>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
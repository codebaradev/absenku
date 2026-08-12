"use client";

import React, { useEffect, useState } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getRiwayatData,
  type RiwayatData,
  type RiwayatDay,
} from "@/lib/actions/riwayat";
import type { AttendanceStatus, LeaveType } from "@prisma/client";

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Tepat Waktu",
  LATE: "Terlambat",
  ABSENT: "Alpa",
};

const STATUS_CLASSES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20",
  LATE: "bg-[#ffdad6] text-[#93000a]",
  ABSENT: "bg-[#e5eeff] text-[#45464d]",
};

const LEAVE_LABELS: Record<LeaveType, string> = {
  SICK: "Izin Sakit",
  ANNUAL: "Cuti Tahunan",
  MATERNITY: "Cuti Melahirkan",
  OTHER: "Izin Lain",
};

const STATS_META = [
  { key: "hadir" as const, label: "Hadir", className: "text-[#006c49]" },
  { key: "telat" as const, label: "Telat", className: "text-[#ba1a1a]" },
  { key: "izin" as const, label: "Izin", className: "text-[#0b1c30]" },
];

function fmtTime(iso: string | null): string {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtDay(iso: string): { weekday: string; day: string } {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString("id-ID", { weekday: "long" }),
    day: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
  };
}

function DayCard({ day }: { day: RiwayatDay }) {
  const { weekday, day: dayLabel } = fmtDay(day.date);

  if (day.kind === "attendance") {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-sm text-[#45464d]">{weekday}</span>
            <span className="text-lg font-semibold text-[#0b1c30]">
              {dayLabel}
            </span>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium uppercase tracking-wider ${STATUS_CLASSES[day.status]}`}
          >
            {STATUS_LABELS[day.status]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-[#c6c6cd] pt-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1 flex items-center gap-1">
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </span>
            <span className="font-mono text-sm font-bold text-[#0b1c30]">
              {fmtTime(day.checkIn)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d] mb-1 flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              Pulang
            </span>
            <span className="font-mono text-sm font-bold text-[#0b1c30]">
              {fmtTime(day.checkOut)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-sm text-[#45464d]">{weekday}</span>
          <span className="text-lg font-semibold text-[#0b1c30]">{dayLabel}</span>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium uppercase tracking-wider bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]">
          {LEAVE_LABELS[day.leaveType]}
        </span>
      </div>
      <div className="border-t border-[#c6c6cd] pt-3 mt-1">
        <p className="text-sm text-[#45464d] italic text-center">{day.reason}</p>
      </div>
    </div>
  );
}

export default function RiwayatPage() {
  const [data, setData] = useState<Extract<RiwayatData, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let mounted = true;
    getRiwayatData().then((res) => {
      if (!mounted) return;
      if (!res.ok) setError(res.error);
      else setData(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function onMonthChange(value: string | null) {
    if (!value) return;
    setPending(true);
    getRiwayatData(value).then((res) => {
      setPending(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res);
    });
  }

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
    <div className="flex flex-col gap-6 mt-2">
      {/* Filter Section */}
      <section className="flex flex-col gap-2">
        <label
          className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
          htmlFor="month-filter"
        >
          Pilih Periode
        </label>
        <Select
          value={data.selected}
          onValueChange={onMonthChange}
          disabled={pending}
        >
          <SelectTrigger
            id="month-filter"
            className="h-12 w-full rounded-lg bg-white"
          >
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            {data.months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Statistics Summary */}
      <section className="grid grid-cols-3 gap-3">
        {STATS_META.map((s) => (
          <div
            key={s.key}
            className="bg-white border border-[#c6c6cd] rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm"
          >
            <span className={`text-4xl font-bold ${s.className}`}>
              {data.stats[s.key]}
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

        {data.days.length === 0 ? (
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-8 text-center text-sm text-[#5f636b] shadow-sm">
            Tidak ada data absensi atau izin pada periode ini.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.days.map((d) => (
              <DayCard key={d.id} day={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { AttendanceStatus, LeaveType } from "@prisma/client";

export type RiwayatDay =
  | {
      kind: "attendance";
      id: string;
      date: string;
      status: AttendanceStatus;
      checkIn: string | null;
      checkOut: string | null;
    }
  | {
      kind: "leave";
      id: string;
      date: string;
      leaveType: LeaveType;
      reason: string;
    };

export type RiwayatData =
  | {
      ok: true;
      selected: string;
      months: { value: string; label: string }[];
      stats: { hadir: number; telat: number; izin: number };
      days: RiwayatDay[];
    }
  | { ok: false; error: string };

function monthOptions() {
  const now = new Date();
  const list: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    list.push({
      value: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    });
  }
  return list;
}

function parseMonth(value: string): { start: Date; end: Date } {
  const [y, m] = value.split("-").map(Number);
  return {
    start: new Date(Date.UTC(y, m - 1, 1)),
    end: new Date(Date.UTC(y, m, 1)),
  };
}

export async function getRiwayatData(month?: string): Promise<RiwayatData> {
  try {
    const user = await requireUser();
    const months = monthOptions();
    const selected =
      month && months.some((m) => m.value === month) ? month : months[0].value;
    const { start, end } = parseMonth(selected);

    const [attendances, leaves] = await Promise.all([
      prisma.attendance.findMany({
        where: { user_id: user.id, date: { gte: start, lt: end } },
        orderBy: { date: "desc" },
      }),
      prisma.leaveRequest.findMany({
        where: {
          user_id: user.id,
          approval_status: "APPROVED",
          start_date: { lt: end },
          end_date: { gte: start },
        },
        orderBy: { start_date: "desc" },
      }),
    ]);

    const days: RiwayatDay[] = [
      ...attendances.map((a) => ({
        kind: "attendance" as const,
        id: a.id,
        date: a.date.toISOString(),
        status: a.status,
        checkIn: a.check_in_time?.toISOString() ?? null,
        checkOut: a.check_out_time?.toISOString() ?? null,
      })),
      ...leaves.map((l) => ({
        kind: "leave" as const,
        id: l.id,
        date: l.start_date.toISOString(),
        leaveType: l.leave_type,
        reason: l.reason,
      })),
    ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

    return {
      ok: true,
      selected,
      months,
      stats: {
        hadir: attendances.filter((a) => a.status === "PRESENT").length,
        telat: attendances.filter((a) => a.status === "LATE").length,
        izin: leaves.length,
      },
      days,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal memuat riwayat.",
    };
  }
}
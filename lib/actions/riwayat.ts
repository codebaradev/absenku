"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getMonthOptions, parseMonth } from "@/lib/date-utils";
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

export async function getRiwayatData(month?: string): Promise<RiwayatData> {
  try {
    const user = await requireUser();
    const months = getMonthOptions();
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
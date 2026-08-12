"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSupervisor } from "@/lib/session";
import { getMonthOptions, parseMonth } from "@/lib/date-utils";

export type AbsensiStatus = "Hadir" | "Terlambat" | "Izin" | "Sakit" | "Alpa";

export type AbsensiRow = {
  id: string;
  kind: "attendance" | "leave";
  date: string;
  name: string;
  in: string | null;
  out: string | null;
  status: AbsensiStatus;
};

export type AbsensiData =
  | {
      ok: true;
      selected: string;
      months: { value: string; label: string }[];
      rows: AbsensiRow[];
    }
  | { ok: false; error: string };

const attendanceStatus = (s: "PRESENT" | "LATE" | "ABSENT"): AbsensiStatus =>
  s === "PRESENT" ? "Hadir" : s === "LATE" ? "Terlambat" : "Alpa";

export async function getAbsensiData(month?: string): Promise<AbsensiData> {
  try {
    await requireSupervisor();
    const months = getMonthOptions();
    const selected =
      month && months.some((m) => m.value === month) ? month : months[0].value;
    const { start, end } = parseMonth(selected);

    const [attendances, leaves] = await Promise.all([
      prisma.attendance.findMany({
        where: { date: { gte: start, lt: end } },
        include: { user: { select: { full_name: true } } },
        orderBy: [{ date: "desc" }, { user: { full_name: "asc" } }],
      }),
      prisma.leaveRequest.findMany({
        where: {
          approval_status: "APPROVED",
          start_date: { lt: end },
          end_date: { gte: start },
        },
        include: { user: { select: { full_name: true } } },
        orderBy: [{ start_date: "desc" }, { user: { full_name: "asc" } }],
      }),
    ]);

    const rows: AbsensiRow[] = [
      ...attendances.map((a) => ({
        id: a.id,
        kind: "attendance" as const,
        date: a.date.toISOString(),
        name: a.user.full_name,
        in: a.check_in_time?.toISOString() ?? null,
        out: a.check_out_time?.toISOString() ?? null,
        status: attendanceStatus(a.status),
      })),
      ...leaves.map((l) => ({
        id: l.id,
        kind: "leave" as const,
        date: l.start_date.toISOString(),
        name: l.user.full_name,
        in: null,
        out: null,
        status: (l.leave_type === "SICK" ? "Sakit" : "Izin") as AbsensiStatus,
      })),
    ].sort(
      (a, b) =>
        +new Date(b.date) - +new Date(a.date) || a.name.localeCompare(b.name)
    );

    return { ok: true, selected, months, rows };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal memuat data absensi.",
    };
  }
}

export async function deleteAbsensi(
  id: string,
  kind: "attendance" | "leave"
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    if (kind === "attendance") {
      await prisma.attendance.delete({ where: { id } });
    } else {
      await prisma.leaveRequest.delete({ where: { id } });
    }
    revalidatePath("/admin/absensi");
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Gagal menghapus data.",
    };
  }
}

export async function updateAttendance(input: {
  id: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "PRESENT" | "LATE" | "ABSENT";
}): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const att = await prisma.attendance.findUnique({ where: { id: input.id } });
    if (!att) return { error: "Data absensi tidak ditemukan." };

    const d = new Date(att.date);
    const toTs = (v: string | null): Date | null => {
      if (!v) return null;
      const [h, m] = v.split(":").map(Number);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
    };

    await prisma.attendance.update({
      where: { id: input.id },
      data: {
        check_in_time: toTs(input.checkIn),
        check_out_time: toTs(input.checkOut),
        status: input.status,
      },
    });
    revalidatePath("/admin/absensi");
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Gagal menyimpan perubahan.",
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { haversineMeters } from "@/lib/geo";
import type { AttendanceStatus } from "@prisma/client";

type Geofence = {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  checkInStart: Date;
  checkInEnd: Date;
  lateTolerance: number;
};

const todayUtc = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
};

const minutesUtc = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();

export type DashboardData =
  | {
      ok: true;
      user: { fullName: string; nip: string };
      school: Geofence | null;
      today: {
        checkInTime: string | null;
        checkOutTime: string | null;
        status: AttendanceStatus | null;
      } | null;
    }
  | { ok: false; error: string };

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const user = await requireUser();
    const school = await prisma.school.findFirst();
    const attendance = await prisma.attendance.findFirst({
      where: { user_id: user.id, date: todayUtc() },
    });
    return {
      ok: true,
      user: { fullName: user.fullName, nip: user.nip },
      school: school
        ? {
            name: school.name,
            latitude: school.latitude.toNumber(),
            longitude: school.longitude.toNumber(),
            radiusMeters: school.radius_meters,
            checkInStart: school.check_in_start,
            checkInEnd: school.check_in_end,
            lateTolerance: school.late_tolerance_minutes,
          }
        : null,
      today: attendance
        ? {
            checkInTime: attendance.check_in_time?.toISOString() ?? null,
            checkOutTime: attendance.check_out_time?.toISOString() ?? null,
            status: attendance.status,
          }
        : null,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memuat data." };
  }
}

export type AttendanceResult =
  | {
      ok: true;
      message: string;
      checkInTime?: string;
      checkOutTime?: string;
      status?: AttendanceStatus;
    }
  | { ok: false; error: string };

async function checkGeofence(
  latitude: number,
  longitude: number
): Promise<{ school: Geofence } | { error: string }> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
    return { error: "Koordinat tidak valid." };

  const school = await prisma.school.findFirst();
  if (!school) return { error: "Sekolah belum diatur." };

  const geofence: Geofence = {
    name: school.name,
    latitude: school.latitude.toNumber(),
    longitude: school.longitude.toNumber(),
    radiusMeters: school.radius_meters,
    checkInStart: school.check_in_start,
    checkInEnd: school.check_in_end,
    lateTolerance: school.late_tolerance_minutes,
  };

  const distance = haversineMeters(
    latitude,
    longitude,
    geofence.latitude,
    geofence.longitude
  );
  if (distance > geofence.radiusMeters)
    return {
      error: `Anda berada di luar radius sekolah (jarak ${Math.round(
        distance
      )}m dari ${geofence.name}).`,
    };

  return { school: geofence };
}

export async function checkIn(
  latitude: number,
  longitude: number,
  clientMinutes: number
): Promise<AttendanceResult> {
  try {
    const user = await requireUser();
    const geofence = await checkGeofence(latitude, longitude);
    if ("error" in geofence) return { ok: false, error: geofence.error };

    const date = todayUtc();
    const existing = await prisma.attendance.findFirst({
      where: { user_id: user.id, date },
    });
    if (existing?.check_in_time)
      return { ok: false, error: "Anda sudah absen masuk hari ini." };

    const now = new Date();
    // ponytail: bandingkan dengan waktu lokal perangkat guru (clientMinutes)
    // agar tidak bergantung zona server. check_in_start menyimpan waktu lokal
    // di field UTC, sehingga langsung sebanding.
    const mins = Number.isFinite(clientMinutes) ? clientMinutes : 0;
    const limit =
      minutesUtc(geofence.school.checkInStart) + geofence.school.lateTolerance;
    const status: AttendanceStatus = mins <= limit ? "PRESENT" : "LATE";

    const created = existing
      ? await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            check_in_time: now,
            check_in_lat: latitude,
            check_in_long: longitude,
            status,
          },
        })
      : await prisma.attendance.create({
          data: {
            user_id: user.id,
            date,
            check_in_time: now,
            check_in_lat: latitude,
            check_in_long: longitude,
            status,
          },
        });

    revalidatePath("/dashboard");
    return {
      ok: true,
      status,
      checkInTime: created.check_in_time!.toISOString(),
      message:
        status === "PRESENT"
          ? "Absen masuk berhasil."
          : "Absen masuk berhasil (terlambat).",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal absen masuk." };
  }
}

export type WeekAttendance = {
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus | null;
};

export async function getWeekAttendance(): Promise<WeekAttendance[]> {
  const user = await requireUser();
  const now = new Date();
  const day = now.getUTCDay() || 7; // Minggu = 7
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (day - 1))
  );
  const sunday = new Date(
    Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 7)
  );
  const rows = await prisma.attendance.findMany({
    where: { user_id: user.id, date: { gte: monday, lt: sunday } },
    orderBy: { date: "asc" },
  });
  return rows.map((r) => ({
    date: r.date.toISOString(),
    checkInTime: r.check_in_time?.toISOString() ?? null,
    checkOutTime: r.check_out_time?.toISOString() ?? null,
    status: r.status,
  }));
}

export async function checkOut(
  latitude: number,
  longitude: number
): Promise<AttendanceResult> {
  try {
    const user = await requireUser();
    const geofence = await checkGeofence(latitude, longitude);
    if ("error" in geofence) return { ok: false, error: geofence.error };

    const existing = await prisma.attendance.findFirst({
      where: { user_id: user.id, date: todayUtc() },
    });
    if (!existing?.check_in_time)
      return { ok: false, error: "Anda belum absen masuk hari ini." };
    if (existing.check_out_time)
      return { ok: false, error: "Anda sudah absen pulang hari ini." };

    const now = new Date();
    await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        check_out_time: now,
        check_out_lat: latitude,
        check_out_long: longitude,
      },
    });

    revalidatePath("/dashboard");
    return {
      ok: true,
      checkOutTime: now.toISOString(),
      message: "Absen pulang berhasil.",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal absen pulang." };
  }
}
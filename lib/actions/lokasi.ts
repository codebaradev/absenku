"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type GeofenceResult = { error?: string; message?: string };

const parseTime = (v: string): Date | null => {
  const m = /^(\d{2}):(\d{2})$/.exec(v);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return new Date(Date.UTC(1970, 0, 1, h, min));
};

export async function updateSchoolHours(input: {
  checkInStart: string;
  checkInEnd: string;
}): Promise<GeofenceResult> {
  const start = parseTime(input.checkInStart);
  const end = parseTime(input.checkInEnd);
  if (!start || !end) return { error: "Format jam tidak valid." };
  if (start >= end) return { error: "Jam masuk harus sebelum jam pulang." };

  const school = await prisma.school.findFirst();
  if (!school) return { error: "Belum ada data sekolah." };

  await prisma.school.update({
    where: { id: school.id },
    data: { check_in_start: start, check_in_end: end },
  });

  revalidatePath("/admin/lokasi");
  return { message: "Jam absensi berhasil disimpan." };
}

export async function updateGeofence(input: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}): Promise<GeofenceResult> {
  const { latitude, longitude, radiusMeters } = input;
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
    return { error: "Latitude harus antara -90 dan 90." };
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
    return { error: "Longitude harus antara -180 dan 180." };
  if (!Number.isInteger(radiusMeters) || radiusMeters < 10 || radiusMeters > 5000)
    return { error: "Radius harus 10–5000 meter." };

  const school = await prisma.school.findFirst();
  if (!school) return { error: "Belum ada data sekolah." };

  await prisma.school.update({
    where: { id: school.id },
    data: { latitude, longitude, radius_meters: radiusMeters },
  });

  revalidatePath("/admin/lokasi");
  return { message: "Titik lokasi berhasil disimpan." };
}

export async function updateSchoolName(name: string): Promise<GeofenceResult> {
  const trimmed = name.trim();
  if (trimmed.length < 3) return { error: "Nama sekolah minimal 3 karakter." };

  const school = await prisma.school.findFirst();
  if (!school) return { error: "Belum ada data sekolah." };

  await prisma.school.update({ where: { id: school.id }, data: { name: trimmed } });

  revalidatePath("/admin/lokasi");
  return { message: "Nama sekolah berhasil disimpan." };
}
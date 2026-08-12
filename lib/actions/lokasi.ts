"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type GeofenceResult = { error?: string; message?: string };

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
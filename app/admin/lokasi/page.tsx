import { prisma } from "@/lib/prisma";
import { LokasiClient } from "./lokasi-client";

export const dynamic = "force-dynamic";

export default async function AdminLokasiPage() {
  const school = await prisma.school.findFirst();
  if (!school) {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-8 text-center text-sm text-[#5f636b] shadow-sm">
        Belum ada data sekolah. Pastikan seeder sudah dijalankan.
      </div>
    );
  }

  const fmtTime = (d: Date | null) =>
    d
      ? `${String(d.getUTCHours()).padStart(2, "0")}:${String(
          d.getUTCMinutes()
        ).padStart(2, "0")}`
      : "";

  return (
    <LokasiClient
      schoolName={school.name}
      latitude={school.latitude.toNumber()}
      longitude={school.longitude.toNumber()}
      radiusMeters={school.radius_meters}
      checkInStart={fmtTime(school.check_in_start) || "07:00"}
      checkInEnd={fmtTime(school.check_in_end) || "15:00"}
    />
  );
}
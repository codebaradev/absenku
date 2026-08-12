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

  return (
    <LokasiClient
      schoolName={school.name}
      latitude={school.latitude.toNumber()}
      longitude={school.longitude.toNumber()}
      radiusMeters={school.radius_meters}
    />
  );
}
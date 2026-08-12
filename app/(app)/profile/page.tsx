import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "./profile-view";

export default async function ProfilePage() {
  const user = await requireUser();
  const [profile, school] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nip: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
      },
    }),
    prisma.school.findFirst({ select: { name: true } }),
  ]);

  if (!profile) {
    return <p className="text-sm text-[#ba1a1a]">Data profil tidak ditemukan.</p>;
  }

  return (
    <ProfileView
      profile={{
        fullName: profile.full_name,
        nip: profile.nip,
        email: profile.email,
        role: profile.role,
        isActive: profile.is_active,
      }}
      schoolName={school?.name ?? null}
    />
  );
}
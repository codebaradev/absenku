import { prisma } from "@/lib/prisma";
import { UsersClient, type UserRow } from "./users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { full_name: "asc" },
    select: {
      id: true,
      nip: true,
      full_name: true,
      email: true,
      role: true,
      is_active: true,
    },
  });

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    nip: u.nip,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    isActive: u.is_active,
  }));

  return <UsersClient users={rows} />;
}

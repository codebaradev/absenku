import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { Role } from "@prisma/client";

export const ACCESS_TOKEN_COOKIE = "absenku_access_token";
export const REFRESH_TOKEN_COOKIE = "absenku_refresh_token";

export type SessionUser = {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  role: Role;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { id: true, nip: true, full_name: true, email: true, role: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    nip: user.nip,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
  };
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function requireTeacher() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  return user;
}

export async function requireSupervisor() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "KEPALA_SEKOLAH")
    redirect("/dashboard");
  return user;
}

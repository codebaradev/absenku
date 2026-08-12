"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/session";

export type LoginState = { error?: string };

const HOME_BY_ROLE = {
  ADMIN: "/admin",
  TEACHER: "/dashboard",
  STAFF: "/dashboard",
  KEPALA_SEKOLAH: "/dashboard",
} as const;

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { error: "Isi NIP/email dan kata sandi." };

  let email = identifier;
  if (!identifier.includes("@")) {
    const user = await prisma.user.findUnique({
      where: { nip: identifier },
      select: { email: true },
    });
    if (!user) return { error: "NIP/email tidak terdaftar." };
    email = user.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session)
    return { error: "NIP/email atau kata sandi salah." };

  const user = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { id: true, role: true, is_active: true },
  });
  if (!user) return { error: "Akun belum terdaftar di sistem." };
  if (!user.is_active) return { error: "Akun dinonaktifkan. Hubungi admin." };

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, data.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.session.expires_in,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(HOME_BY_ROLE[user.role]);
}

export async function logout() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    await supabaseAdmin.auth.admin.signOut(accessToken).catch(() => {});
  }
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  redirect("/login");
}

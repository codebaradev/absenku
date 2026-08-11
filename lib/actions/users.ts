"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-server";

export type UserActionResult = { error?: string };

type UserInput = {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  role: Role;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ponytail: single-school assumption; school_id dipakai dari sekolah pertama
async function getDefaultSchoolId() {
  const school = await prisma.school.findFirst({ select: { id: true } });
  if (!school) throw new Error("Belum ada data sekolah. Buat sekolah terlebih dahulu.");
  return school.id;
}

// ponytail: users.id diharapkan = auth uid, tapi user seed lama tidak sinkron.
// Resolve via id dulu, fallback ke email supaya sync tetap jalan.
async function resolveAuthUid(id: string, email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
  if (!error && data?.user) return data.user.id;

  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const match = list?.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  return match?.id ?? null;
}

function validateUserInput(input: Omit<UserInput, "id"> & { password?: string }): string | null {
  if (!input.nip || !input.fullName || !input.email || !input.role)
    return "Semua field wajib diisi.";
  if (!EMAIL_RE.test(input.email)) return "Format email tidak valid.";
  if (!Object.values(Role).includes(input.role)) return "Role tidak valid.";
  if (input.password !== undefined && input.password.length > 0 && input.password.length < 6)
    return "Password minimal 6 karakter.";
  return null;
}

export async function createUser(
  input: { nip: string; fullName: string; email: string; role: Role; password: string }
): Promise<UserActionResult> {
  const validationError = validateUserInput(input);
  if (validationError) return { error: validationError };

  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { nip: input.nip }] },
    select: { id: true },
  });
  if (existing) return { error: "NIP atau email sudah terdaftar." };

  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
    });
  if (authError || !authUser?.user)
    return { error: authError?.message ?? "Gagal membuat akun autentikasi." };

  await prisma.user.create({
    data: {
      id: authUser.user.id,
      nip: input.nip,
      full_name: input.fullName,
      email,
      role: input.role,
      school_id: await getDefaultSchoolId(),
    },
  });

  revalidatePath("/admin/users");
  return {};
}

export async function updateUser(
  input: UserInput & { password?: string }
): Promise<UserActionResult> {
  const validationError = validateUserInput(input);
  if (validationError) return { error: validationError };

  const email = input.email.trim().toLowerCase();

  const current = await prisma.user.findUnique({
    where: { id: input.id },
    select: { email: true },
  });
  if (!current) return { error: "Pengguna tidak ditemukan." };

  const duplicate = await prisma.user.findFirst({
    where: {
      id: { not: input.id },
      OR: [{ email }, { nip: input.nip }],
    },
    select: { id: true },
  });
  if (duplicate) return { error: "NIP atau email sudah dipakai pengguna lain." };

  const authAttributes: {
    email?: string;
    password?: string;
    user_metadata?: { full_name: string };
  } = { email, user_metadata: { full_name: input.fullName } };
  if (input.password) authAttributes.password = input.password;

  // ponytail: user seed lama tidak punya akun Supabase — dibuatkan supaya sync lengkap
  const uid = await resolveAuthUid(input.id, current.email);
  if (uid) {
    await supabaseAdmin.auth.admin.updateUserById(uid, authAttributes).catch(() => {});
  } else {
    await supabaseAdmin.auth.admin
      .createUser({
        email,
        password: input.password || crypto.randomUUID(),
        email_confirm: true,
      })
      .catch(() => {});
  }

  await prisma.user.update({
    where: { id: input.id },
    data: {
      nip: input.nip,
      full_name: input.fullName,
      email,
      role: input.role,
    },
  });

  revalidatePath("/admin/users");
  return {};
}

export async function deleteUser(id: string): Promise<UserActionResult> {
  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (user) {
    const uid = await resolveAuthUid(id, user.email);
    if (uid) await supabaseAdmin.auth.admin.deleteUser(uid).catch(() => {});
  }
  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return {
      error:
        "Pengguna masih memiliki data absensi/izin. Nonaktifkan akun alih-alih menghapus.",
    };
  }
  revalidatePath("/admin/users");
  return {};
}

export async function toggleUserActive(id: string): Promise<UserActionResult> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { is_active: true, email: true },
  });
  if (!user) return { error: "Pengguna tidak ditemukan." };

  await prisma.user.update({
    where: { id },
    data: { is_active: !user.is_active },
  });

  // ponytail: ban/unban best-effort, supaya akun tidak bisa login saat nonaktif
  const uid = await resolveAuthUid(id, user.email);
  if (uid) {
    await supabaseAdmin.auth.admin
      .updateUserById(uid, { ban_duration: user.is_active ? "8760h" : "none" })
      .catch(() => {});
  }

  revalidatePath("/admin/users");
  return {};
}

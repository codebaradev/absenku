"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/session";

export type ProfileResult = { error?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateProfile(input: {
  fullName: string;
  email: string;
}): Promise<ProfileResult> {
  const user = await requireUser();
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  if (!fullName) return { error: "Nama lengkap wajib diisi." };
  if (!EMAIL_RE.test(email)) return { error: "Format email tidak valid." };

  const duplicate = await prisma.user.findFirst({
    where: { id: { not: user.id }, email },
    select: { id: true },
  });
  if (duplicate) return { error: "Email sudah dipakai pengguna lain." };

  await prisma.user.update({
    where: { id: user.id },
    data: { full_name: fullName, email },
  });

  // ponytail: user yang login pasti punya auth UID = user.id (invariant), sync langsung
  await supabaseAdmin.auth.admin
    .updateUserById(user.id, { email, user_metadata: { full_name: fullName } })
    .catch(() => {});

  revalidatePath("/profile");
  return { message: "Profil berhasil diperbarui." };
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ProfileResult> {
  const user = await requireUser();
  const { currentPassword, newPassword } = input;
  if (!currentPassword || !newPassword)
    return { error: "Isi semua field password." };
  if (newPassword.length < 6)
    return { error: "Password baru minimal 6 karakter." };
  if (currentPassword === newPassword)
    return { error: "Password baru harus berbeda dari password saat ini." };

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (error) return { error: "Password saat ini salah." };

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );
  if (updateError)
    return { error: updateError.message ?? "Gagal mengubah password." };

  return { message: "Password berhasil diubah." };
}
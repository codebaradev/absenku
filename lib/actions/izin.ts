"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/session";
import { LeaveType, type ApprovalStatus } from "@prisma/client";

export type LeaveSubmitResult = { error?: string; message?: string };

export type LeaveHistoryItem = {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: ApprovalStatus;
};

export type LeaveHistoryData =
  | { ok: true; items: LeaveHistoryItem[] }
  | { ok: false; error: string };

const BUCKET = "leave-attachments";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const LEAVE_TYPES = Object.values(LeaveType);

export async function submitLeaveRequest(
  formData: FormData
): Promise<LeaveSubmitResult> {
  const user = await requireUser();

  const leaveType = String(formData.get("leaveType") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const file = formData.get("attachment");

  if (!LEAVE_TYPES.includes(leaveType as LeaveType))
    return { error: "Jenis izin tidak valid." };
  if (!startDate || !endDate)
    return { error: "Isi tanggal mulai dan tanggal selesai." };

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(+start) || Number.isNaN(+end))
    return { error: "Format tanggal tidak valid." };
  if (end < start)
    return { error: "Tanggal selesai tidak boleh sebelum tanggal mulai." };
  if (reason.length < 5)
    return { error: "Keterangan minimal 5 karakter." };

  let attachmentUrl: string | null = null;
  if (file && file instanceof File && file.size > 0) {
    if (file.size > MAX_SIZE) return { error: "Ukuran file maksimal 5 MB." };
    if (!ALLOWED_TYPES.includes(file.type))
      return { error: "Hanya PDF, JPG, atau PNG yang diizinkan." };

    await supabaseAdmin.storage
      .createBucket(BUCKET, { public: false })
      .catch(() => {});

    const ext = file.name.split(".").pop() ?? "";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, file);
    if (uploadError)
      return { error: uploadError.message ?? "Gagal mengunggah lampiran." };
    attachmentUrl = path;
  }

  await prisma.leaveRequest.create({
    data: {
      user_id: user.id,
      leave_type: leaveType as LeaveType,
      start_date: start,
      end_date: end,
      reason,
      attachment_url: attachmentUrl,
    },
  });

  revalidatePath("/izin");
  return { message: "Pengajuan izin berhasil dikirim." };
}

export async function getLeaveHistory(): Promise<LeaveHistoryData> {
  try {
    const user = await requireUser();
    const items = await prisma.leaveRequest.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        leave_type: true,
        start_date: true,
        end_date: true,
        reason: true,
        approval_status: true,
      },
    });
    return {
      ok: true,
      items: items.map((l) => ({
        id: l.id,
        leaveType: l.leave_type,
        startDate: l.start_date.toISOString(),
        endDate: l.end_date.toISOString(),
        reason: l.reason,
        status: l.approval_status,
      })),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal memuat riwayat izin.",
    };
  }
}
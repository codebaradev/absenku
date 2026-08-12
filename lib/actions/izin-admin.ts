"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSupervisor } from "@/lib/session";
import type { LeaveType } from "@prisma/client";

export type AdminLeaveType = "Sakit" | "Izin" | "Cuti";
export type AdminLeaveStatus = "menunggu" | "disetujui" | "ditolak";

export type AdminLeaveRow = {
  id: string;
  name: string;
  type: AdminLeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: AdminLeaveStatus;
};

export type AdminLeaveData =
  | { ok: true; items: AdminLeaveRow[] }
  | { ok: false; error: string };

const TYPE_MAP: Record<LeaveType, AdminLeaveType> = {
  SICK: "Sakit",
  ANNUAL: "Cuti",
  MATERNITY: "Cuti",
  OTHER: "Izin",
};

const STATUS_MAP: Record<"PENDING" | "APPROVED" | "REJECTED", AdminLeaveStatus> = {
  PENDING: "menunggu",
  APPROVED: "disetujui",
  REJECTED: "ditolak",
};

export async function getAdminLeaveRequests(): Promise<AdminLeaveData> {
  try {
    await requireSupervisor();
    const items = await prisma.leaveRequest.findMany({
      include: { user: { select: { full_name: true } } },
      orderBy: { created_at: "desc" },
    });
    return {
      ok: true,
      items: items.map((l) => ({
        id: l.id,
        name: l.user.full_name,
        type: TYPE_MAP[l.leave_type],
        startDate: l.start_date.toISOString(),
        endDate: l.end_date.toISOString(),
        reason: l.reason,
        status: STATUS_MAP[l.approval_status],
      })),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal memuat pengajuan izin.",
    };
  }
}

export async function setLeaveStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<{ error?: string }> {
  const admin = await requireSupervisor();
  if (status !== "APPROVED" && status !== "REJECTED")
    return { error: "Status tidak valid." };

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!leave) return { error: "Pengajuan tidak ditemukan." };

  await prisma.leaveRequest.update({
    where: { id },
    data: { approval_status: status, approved_by: admin.id },
  });

  revalidatePath("/admin/izin");
  return {};
}
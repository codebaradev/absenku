"use client";

import React, { useState, useTransition, type FormEvent } from "react";
import {
  Mail,
  Building2,
  Users,
  PenLine,
  Lock,
  BellRing,
  CircleHelp,
  ChevronRight,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { changePassword, updateProfile } from "@/lib/actions/profile";
import { logout } from "@/lib/actions/auth";
import type { Role } from "@prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  TEACHER: "Guru",
  ADMIN: "Admin",
  STAFF: "Staf",
};

const inputClass = "h-12 w-full rounded-lg bg-[#f8f9ff]";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
    >
      {children}
    </label>
  );
}

export function ProfileView({
  profile,
  schoolName,
}: {
  profile: {
    fullName: string;
    nip: string;
    email: string;
    role: Role;
    isActive: boolean;
  };
  schoolName: string | null;
}) {
  const [name, setName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [open, setOpen] = useState<"edit" | "pass" | null>(null);
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [editMsg, setEditMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const INFO_ITEMS = [
    { label: "Email", value: email, icon: Mail },
    { label: "Unit Kerja", value: schoolName ?? "Belum diatur", icon: Building2 },
    { label: "Role", value: ROLE_LABELS[profile.role], icon: Users },
  ];

  function openEdit() {
    setEditMsg(null);
    setOpen("edit");
  }

  function openPass() {
    setPassMsg(null);
    setOpen("pass");
  }

  function submitEdit(e: FormEvent) {
    e.preventDefault();
    setEditMsg(null);
    startTransition(async () => {
      const res = await updateProfile({ fullName: name, email });
      if (res.error) {
        setEditMsg({ kind: "err", text: res.error });
      } else {
        setOpen(null);
      }
    });
  }

  function submitPass(e: FormEvent) {
    e.preventDefault();
    setPassMsg(null);
    if (newPass !== confirmPass) {
      setPassMsg({ kind: "err", text: "Konfirmasi password tidak cocok." });
      return;
    }
    startTransition(async () => {
      const res = await changePassword({
        currentPassword: curPass,
        newPassword: newPass,
      });
      if (res.error) {
        setPassMsg({ kind: "err", text: res.error });
      } else {
        setCurPass("");
        setNewPass("");
        setConfirmPass("");
        setOpen(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Profile Header */}
      <section className="flex flex-col items-center">
        <div className="relative mb-2">
          <div className="w-24 h-24 rounded-full bg-[#e5eeff] border-4 border-white shadow-sm flex items-center justify-center text-2xl font-semibold text-[#0b1c30]">
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#4edea3] rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#002113]" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[#0b1c30] mb-1">{name}</h2>
        <p className="text-sm text-[#45464d]">NIP: {profile.nip}</p>
        <span
          className={`mt-2 px-3 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wider ${
            profile.isActive
              ? "bg-[#d1fae5] text-[#047857]"
              : "bg-[#ffdad6] text-[#93000a]"
          }`}
        >
          {profile.isActive ? "Aktif" : "Nonaktif"}
        </span>
      </section>

      {/* Personal Info Card */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-4 shadow-sm">
        <h3 className="text-base font-semibold text-[#0b1c30]">
          Informasi Pribadi
        </h3>
        {INFO_ITEMS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#45464d] shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                {label}
              </p>
              <p className="text-sm text-[#0b1c30]">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Settings Menu */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
        <ul className="flex flex-col">
          <li className="border-b border-[#c6c6cd]">
            <button
              onClick={openEdit}
              className="w-full flex items-center justify-between p-4 hover:bg-[#eff4ff] transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-3 text-[#0b1c30]">
                <PenLine className="w-5 h-5 text-[#45464d]" />
                <span className="text-sm">Ubah Profil</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#45464d]" />
            </button>
          </li>
          <li className="border-b border-[#c6c6cd]">
            <button
              onClick={openPass}
              className="w-full flex items-center justify-between p-4 hover:bg-[#eff4ff] transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-3 text-[#0b1c30]">
                <Lock className="w-5 h-5 text-[#45464d]" />
                <span className="text-sm">Keamanan & Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#45464d]" />
            </button>
          </li>
          {[
            { label: "Notifikasi", icon: BellRing },
            { label: "Pusat Bantuan", icon: CircleHelp },
          ].map(({ label, icon: Icon }, i) => (
            <li
              key={label}
              className={i === 1 ? "" : "border-b border-[#c6c6cd]"}
            >
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#eff4ff] transition-colors min-h-[48px]">
                <div className="flex items-center gap-3 text-[#0b1c30]">
                  <Icon className="w-5 h-5 text-[#45464d]" />
                  <span className="text-sm">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#45464d]" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Logout Button */}
      <form action={logout}>
        <button className="w-full min-h-[48px] bg-[#fee2e2] text-[#a51818] text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#fecaca] transition-colors border border-[#e5737e]">
          <LogOut className="w-4 h-4" />
          Keluar Aplikasi
        </button>
      </form>

      {/* Edit Profile Dialog */}
      <Dialog open={open === "edit"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0b1c30]">
              Ubah Profil
            </DialogTitle>
            <DialogDescription>
              Perbarui nama dan email Anda, lalu simpan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitEdit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="profile-name">Nama Lengkap</FieldLabel>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap dengan gelar"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                className={inputClass}
              />
            </div>

            {editMsg && (
              <p
                className={`text-sm ${
                  editMsg.kind === "ok" ? "text-[#00714d]" : "text-[#ba1a1a]"
                }`}
              >
                {editMsg.text}
              </p>
            )}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Batal
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 rounded-md text-base font-semibold"
              >
                {isPending ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={open === "pass"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0b1c30]">
              Keamanan & Password
            </DialogTitle>
            <DialogDescription>
              Ganti password Anda. Password minimal 6 karakter.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitPass} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="cur-pass">Password Saat Ini</FieldLabel>
              <Input
                id="cur-pass"
                type="password"
                value={curPass}
                onChange={(e) => setCurPass(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="new-pass">Password Baru</FieldLabel>
              <Input
                id="new-pass"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="confirm-pass">Konfirmasi Password Baru</FieldLabel>
              <Input
                id="confirm-pass"
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className={inputClass}
              />
            </div>

            {passMsg && (
              <p
                className={`text-sm ${
                  passMsg.kind === "ok" ? "text-[#00714d]" : "text-[#ba1a1a]"
                }`}
              >
                {passMsg.text}
              </p>
            )}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Batal
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 rounded-md text-base font-semibold"
              >
                {isPending ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
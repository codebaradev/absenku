"use client";

import React, { useMemo, useState, useTransition, type FormEvent } from "react";
import { Search, Plus, Pencil, Trash2, Users, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TablePagination,
  useTablePagination,
} from "@/components/table-pagination";
import {
  createUser,
  deleteUser,
  toggleUserActive,
  updateUser,
} from "@/lib/actions/users";
import type { Role } from "@prisma/client";

export type UserRow = {
  id: string;
  nip: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
};

const ROLE_LABELS: Record<Role, string> = {
  TEACHER: "Guru",
  ADMIN: "Admin",
  STAFF: "Staff",
  KEPALA_SEKOLAH: "Kepala Sekolah",
};

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));

const ROLE_BADGES: Record<Role, string> = {
  TEACHER: "bg-[#e5eeff] text-[#0b1c30] border border-[#c6c6cd]",
  ADMIN: "bg-[#6cf8bb]/40 text-[#00714d] border border-[#4edea3]/30",
  STAFF: "bg-black text-white",
  KEPALA_SEKOLAH: "bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]",
};

type FormState = {
  nip: string;
  fullName: string;
  email: string;
  role: Role;
  password: string;
};

const EMPTY_FORM: FormState = {
  nip: "",
  fullName: "",
  email: "",
  role: "TEACHER",
  password: "",
};

type DialogState =
  | { mode: "add" }
  | { mode: "edit"; user: UserRow }
  | { mode: "delete"; user: UserRow }
  | null;

const inputClass = "h-12 w-full rounded-lg bg-[#f8f9ff]";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
    >
      {children}
    </label>
  );
}

function RoleSelect({
  value,
  onValueChange,
}: {
  value: Role;
  onValueChange: (role: Role) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as Role)}>
      <SelectTrigger id="user-role" className={inputClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map(({ value: v, label }) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function UsersClient({ users }: { users: UserRow[] }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nip.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const { page, pageCount, pageItems, setPage } = useTablePagination(filtered);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialog({ mode: "add" });
  }

  function openEdit(user: UserRow) {
    setForm({
      nip: user.nip,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: "",
    });
    setFormError(null);
    setDialog({ mode: "edit", user });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const role = form.role;
    startTransition(async () => {
      const res =
        dialog?.mode === "edit"
          ? await updateUser({
              id: dialog.user.id,
              nip: form.nip,
              fullName: form.fullName,
              email: form.email,
              role,
              password: form.password,
            })
          : await createUser({
              nip: form.nip,
              fullName: form.fullName,
              email: form.email,
              role,
              password: form.password,
            });
      if (res.error) {
        setFormError(res.error);
        return;
      }
      setDialog(null);
    });
  }

  function handleToggle(user: UserRow) {
    startTransition(async () => {
      const res = await toggleUserActive(user.id);
      if (res.error) setFormError(res.error);
    });
  }

  function handleDelete(user: UserRow) {
    startTransition(async () => {
      const res = await deleteUser(user.id);
      if (res.error) {
        setFormError(res.error);
        setDialog({ mode: "delete", user });
        return;
      }
      setDialog(null);
    });
  }

  const editing = dialog?.mode === "edit";
  const formOpen = dialog?.mode === "add" || dialog?.mode === "edit";

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header + Add Button */}
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[#0b1c30]">
            Kelola Pengguna
          </h2>
          <p className="text-sm text-[#45464d]">
            Kelola akun guru dan staf — SMA Negeri 1
          </p>
        </div>

        <Button
          onClick={openAdd}
          className="h-12 md:h-10 md:px-4 rounded-md text-sm font-semibold"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengguna
        </Button>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0b1c30]">
              {editing ? "Edit Pengguna" : "Tambah Pengguna"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data pengguna, lalu simpan."
                : "Isi data pengguna baru, lalu simpan."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="user-nip">NIP</FieldLabel>
              <Input
                id="user-nip"
                value={form.nip}
                onChange={(e) => setForm({ ...form, nip: e.target.value })}
                placeholder="Contoh: 198005152005011004"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="user-name">Nama Lengkap</FieldLabel>
              <Input
                id="user-name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nama lengkap dengan gelar"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="user-email">Email</FieldLabel>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@sman1.sch.id"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="user-role">Role</FieldLabel>
              <RoleSelect
                value={form.role}
                onValueChange={(role) => setForm({ ...form, role })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="user-password">Password</FieldLabel>
              <Input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? "Kosongkan jika tidak diganti" : "Password awal pengguna"}
                className={inputClass}
              />
            </div>

            {formError && (
              <p className="text-sm text-[#ba1a1a]">{formError}</p>
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
                {isPending ? "Menyimpan..." : "Simpan Pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={dialog?.mode === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0b1c30]">
              Hapus Pengguna?
            </DialogTitle>
            <DialogDescription>
              {dialog?.mode === "delete" && (
                <>
                  {dialog.user.fullName} ({dialog.user.nip}) akan dihapus
                  permanen beserta akun loginnya.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {formError && <p className="text-sm text-[#ba1a1a]">{formError}</p>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Batal
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => dialog?.mode === "delete" && handleDelete(dialog.user)}
              className="h-12 rounded-md text-base font-semibold"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users List / Table */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-base font-semibold text-[#0b1c30]">
            Daftar Pengguna
          </h3>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#5f636b] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari NIP, nama, atau email..."
              className="h-10 w-full rounded-lg bg-white pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-8 text-center text-sm text-[#5f636b] shadow-sm">
            Tidak ada pengguna yang cocok.
          </div>
        ) : (
          <>
            {/* Mobile List */}
            <div className="flex flex-col gap-3 md:hidden">
              {pageItems.map((u) => (
                <div
                  key={u.id}
                  className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex items-center gap-3 shadow-sm"
                >
                  <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0b1c30] truncate">
                        {u.fullName}
                      </span>
                      <span
                        className={`shrink-0 w-2 h-2 rounded-full ${
                          u.isActive ? "bg-[#059669]" : "bg-[#8f9299]"
                        }`}
                      />
                    </div>
                    <span className="text-[12px] text-[#45464d] block truncate">
                      {u.email}
                    </span>
                    <span className="text-[11px] text-[#5f636b] font-mono">
                      NIP: {u.nip}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGES[u.role]}`}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        onClick={() => handleToggle(u)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => openEdit(u)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Hapus"
                        onClick={() => {
                          setFormError(null);
                          setDialog({ mode: "delete", user: u });
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <TablePagination
                page={page}
                pageCount={pageCount}
                total={filtered.length}
                onPageChange={setPage}
              />
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#c6c6cd] text-left hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Nama
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      NIP
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Email
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Role
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((u) => (
                    <TableRow
                      key={u.id}
                      className="border-b border-[#c6c6cd] last:border-b-0"
                    >
                      <TableCell className="px-4 py-3 text-sm font-medium text-[#0b1c30]">
                        {u.fullName}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-sm text-[#45464d]">
                        {u.nip}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-[#45464d]">
                        {u.email}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold uppercase tracking-wider ${ROLE_BADGES[u.role]}`}
                        >
                          {ROLE_LABELS[u.role]}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold uppercase tracking-wider ${
                            u.isActive
                              ? "bg-[#6cf8bb]/40 text-[#00714d]"
                              : "bg-[#e5eeff] text-[#45464d]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-[#059669]" : "bg-[#8f9299]"
                            }`}
                          />
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                            onClick={() => handleToggle(u)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEdit(u)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Hapus"
                            onClick={() => {
                              setFormError(null);
                              setDialog({ mode: "delete", user: u });
                            }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                pageCount={pageCount}
                total={filtered.length}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

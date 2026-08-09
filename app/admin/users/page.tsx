"use client";

import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
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
  DialogTrigger,
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

const ROLES = ["Guru", "Admin TU", "Kepala Sekolah"];

const ROLE_BADGES: Record<string, string> = {
  Guru: "bg-[#e5eeff] text-[#0b1c30] border border-[#c6c6cd]",
  "Admin TU": "bg-[#6cf8bb]/40 text-[#00714d] border border-[#4edea3]/30",
  "Kepala Sekolah": "bg-black text-white",
};

const USERS = [
  { nip: "198005152005011004", name: "Budi Santoso, S.Pd", email: "budi.santoso@sman1.sch.id", role: "Guru", active: true },
  { nip: "198107231998032001", name: "Siti Rahayu, M.Pd", email: "siti.rahayu@sman1.sch.id", role: "Guru", active: true },
  { nip: "197502121998021002", name: "Ahmad Fauzi, S.Pd", email: "ahmad.fauzi@sman1.sch.id", role: "Guru", active: true },
  { nip: "19671201999031001", name: "Dr. H. Sutrisno, M.Pd", email: "sutrisno@sman1.sch.id", role: "Kepala Sekolah", active: true },
  { nip: "198803112012122001", name: "Dewi Lestari, S.Pd", email: "dewi.lestari@sman1.sch.id", role: "Guru", active: false },
  { nip: "199001012020012001", name: "Rina Wulandari, S.Pd", email: "rina.wulandari@sman1.sch.id", role: "Admin TU", active: true },
];

const inputClass = "h-12 w-full rounded-lg bg-[#f8f9ff]";

export default function AdminUsersPage() {
  const [open, setOpen] = useState(false);
  const { page, pageCount, pageItems, setPage } =
    useTablePagination(USERS);

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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="h-12 md:h-10 md:px-4 rounded-md text-sm font-semibold" />
            }
          >
            <Plus className="w-5 h-5" />
            Tambah Pengguna
          </DialogTrigger>

          <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-[#0b1c30]">
                Tambah Pengguna
              </DialogTitle>
              <DialogDescription>
                Isi data pengguna baru, lalu simpan.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="user-nip"
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                >
                  NIP
                </label>
                <Input
                  id="user-nip"
                  placeholder="Contoh: 198005152005011004"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="user-name"
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                >
                  Nama Lengkap
                </label>
                <Input
                  id="user-name"
                  placeholder="Nama lengkap dengan gelar"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="user-email"
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                >
                  Email
                </label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="nama@sman1.sch.id"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="user-role"
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                >
                  Role
                </label>
                <Select>
                  <SelectTrigger id="user-role" className={inputClass}>
                    <SelectValue placeholder="Pilih role pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="user-password"
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]"
                >
                  Password
                </label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Password awal pengguna"
                  className={inputClass}
                />
              </div>

              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Batal
                </DialogClose>
                <Button
                  type="submit"
                  className="h-12 rounded-md text-base font-semibold"
                >
                  Simpan Pengguna
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      {/* Users List / Table */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-base font-semibold text-[#0b1c30]">
            Daftar Pengguna
          </h3>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#76777d] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cari NIP atau nama..."
              className="h-10 w-full rounded-lg bg-white pl-9"
            />
          </div>
        </div>

        {/* Mobile List */}
        <div className="flex flex-col gap-3 md:hidden">
          {pageItems.map((u) => (
            <div
              key={u.nip}
              className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex items-center gap-3 shadow-sm"
            >
              <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0b1c30] truncate">
                    {u.name}
                  </span>
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${
                      u.active ? "bg-[#10b981]" : "bg-[#c6c6cd]"
                    }`}
                  />
                </div>
                <span className="text-[12px] text-[#45464d] block truncate">
                  {u.email}
                </span>
                <span className="text-[11px] text-[#76777d] font-mono">
                  NIP: {u.nip}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGES[u.role]}`}
                >
                  {u.role}
                </span>
                <div className="flex items-center gap-1">
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <TablePagination
            page={page}
            pageCount={pageCount}
            total={USERS.length}
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
                  key={u.nip}
                  className="border-b border-[#c6c6cd] last:border-b-0"
                >
                  <TableCell className="px-4 py-3 text-sm font-medium text-[#0b1c30]">
                    {u.name}
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
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold uppercase tracking-wider ${
                        u.active
                          ? "bg-[#6cf8bb]/40 text-[#00714d]"
                          : "bg-[#e5eeff] text-[#45464d]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.active ? "bg-[#10b981]" : "bg-[#76777d]"
                        }`}
                      />
                      {u.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#45464d] hover:bg-[#ffdad6] hover:text-[#b91c1c] transition-colors">
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
            total={USERS.length}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}

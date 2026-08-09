import React from "react";
import {
  CalendarDays,
  History,
  CheckCircle2,
  Send,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeaveRequestPage() {
  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Page Title */}
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0b1c30]">
          Ajukan Izin/Cuti
        </h2>
        <p className="text-sm text-[#45464d]">
          Lengkapi formulir di bawah ini untuk mengajukan perizinan baru.
        </p>
      </section>

      {/* Application Form Card */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-4 shadow-sm">
        {/* Type Selection */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-[#0b1c30]"
            htmlFor="permitType"
          >
            Jenis Izin
          </label>
          <Select>
            <SelectTrigger
              id="permitType"
              className="h-12 w-full rounded-lg bg-[#f8f9ff]"
            >
              <SelectValue placeholder="Pilih jenis izin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sakit">Sakit</SelectItem>
              <SelectItem value="cuti">Cuti Tahunan</SelectItem>
              <SelectItem value="dinas">Dinas Luar</SelectItem>
              <SelectItem value="lainnya">Keperluan Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-[#0b1c30]"
            htmlFor="permitDate"
          >
            Tanggal
          </label>
          <Input
            id="permitDate"
            type="date"
            className="h-12 w-full rounded-lg bg-[#f8f9ff]"
          />
        </div>

        {/* Reason */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-[#0b1c30]"
            htmlFor="permitReason"
          >
            Keterangan / Alasan
          </label>
          <Textarea
            id="permitReason"
            placeholder="Jelaskan alasan izin Anda secara singkat..."
            className="w-full resize-none min-h-[100px] rounded-lg bg-[#f8f9ff]"
          />
        </div>

        {/* Attachment */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#e5e7eb]">
          <span className="text-sm font-medium text-[#0b1c30]">
            Lampiran Dokumen
          </span>
          <p className="text-xs text-[#45464d] mb-1">
            Unggah surat keterangan dokter atau dokumen pendukung lainnya.
          </p>
          <button className="flex items-center justify-center gap-2 h-12 w-full rounded-lg border-2 border-dashed border-[#c6c6cd] bg-[#f8f9ff] text-sm font-medium text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors">
            <Upload className="w-4 h-4" />
            Pilih Dokumen
          </button>
        </div>

        {/* Submit Action */}
        <div className="pt-2 mt-2">
          <button className="flex items-center justify-center gap-2 h-[52px] w-full rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-base font-semibold shadow-sm active:scale-[0.98] transition-transform">
            <Send className="w-5 h-5" />
            Kirim Pengajuan
          </button>
        </div>
      </section>

      {/* History Section */}
      <section className="flex flex-col gap-4 mt-2">
        <h3 className="text-lg font-semibold text-[#0b1c30]">
          Status Pengajuan Terakhir
        </h3>

        {/* History Card 1 */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-medium text-[#0b1c30]">
              Sakit - Demam Berdarah
            </span>
            <span className="text-sm text-[#45464d] flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              24 Okt 2023
            </span>
          </div>
          <Badge className="bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20 rounded-full px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui
          </Badge>
        </div>

        {/* History Card 2 */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-medium text-[#0b1c30]">
              Cuti Tahunan
            </span>
            <span className="text-sm text-[#45464d] flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              10 - 12 Sep 2023
            </span>
          </div>
          <Badge className="bg-[#e5eeff] text-[#45464d] border border-[#c6c6cd] rounded-full px-3 py-1">
            <History className="w-3.5 h-3.5" />
            Selesai
          </Badge>
        </div>

        <button className="w-full text-sm font-medium text-[#10b981] hover:underline">
          Lihat Semua Riwayat
        </button>
      </section>
    </div>
  );
}

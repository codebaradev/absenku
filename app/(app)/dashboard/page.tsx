"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Map, LogIn, LogOut } from "lucide-react";

export default function AbsenKuDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Real-time clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Header Profil & Status Guru */}
      <section className="flex flex-col items-center text-center mt-2">
        <h2 className="text-xl font-semibold text-[#0b1c30]">
          Budi Santoso, S.Pd
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe] mr-1.5"></span>
            Online
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#d3e4fe] text-[#0b1c30] border border-[#c6c6cd]">
            <MapPin className="w-3.5 h-3.5 mr-1 text-black" />
            Di Dalam Radius 15m
          </span>
        </div>
      </section>

      {/* Jam & Tanggal Real-time */}
      <section className="flex flex-col items-center justify-center py-4">
        <div className="font-mono text-4xl font-bold text-black tracking-tighter tabular-nums">
          {currentTime || "00:00:00"}
        </div>
        <div className="text-sm text-[#45464d] mt-1">
          {currentDate || "Loading..."}
        </div>
      </section>

      {/* Card Status Geofence / Lokasi */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#006c49] fill-[#006c49]" />
            <h3 className="text-base font-medium text-[#0b1c30]">
              Status Lokasi
            </h3>
          </div>
          <span className="font-mono text-xs text-[#45464d] bg-[#e5eeff] px-2 py-1 rounded-md">
            12m / 50m
          </span>
        </div>
        <div className="text-sm text-[#0b1c30]">
          Sekolah Utama - SMA Negeri 1
        </div>

        {/* Visualisasi Peta Latar Belakang */}
        <div className="absolute -right-6 -bottom-8 w-32 h-32 opacity-10 pointer-events-none">
          <Map className="w-32 h-32 text-black" />
        </div>
      </section>

      {/* Tombol Aksi Absensi */}
      <section className="grid grid-cols-2 gap-3 mt-2">
        <button className="bg-[#10b981] hover:bg-[#059669] text-white rounded-lg h-[64px] flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-transform w-full">
          <LogIn className="w-5 h-5 fill-current" />
          <span className="text-sm font-semibold">Absen Masuk</span>
        </button>
        <button className="bg-white border border-[#c6c6cd] hover:bg-[#eff4ff] text-black rounded-lg h-[64px] flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform w-full">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Absen Pulang</span>
        </button>
      </section>

      {/* Segmented Control & List Riwayat Presensi */}
      <section className="flex flex-col flex-1 mt-2">
        {/* Segmented Control / Tabs */}
        <div className="bg-[#e5eeff] p-1 rounded-lg flex w-full mb-4">
          <button
            onClick={() => setActiveTab("today")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium text-center transition-all ${
              activeTab === "today"
                ? "bg-white text-black shadow-sm"
                : "text-[#45464d] hover:text-[#0b1c30]"
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium text-center transition-all ${
              activeTab === "week"
                ? "bg-white text-black shadow-sm"
                : "text-[#45464d] hover:text-[#0b1c30]"
            }`}
          >
            Minggu Ini
          </button>
        </div>

        {/* List Item Presensi Hari Ini */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[#0b1c30] mb-1">
            Presensi Hari Ini
          </h3>

          {/* Item Card - Absen Masuk */}
          <div className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#0b1c30]">
                  Masuk
                </span>
                <span className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider mt-0.5">
                  Tepat Waktu
                </span>
              </div>
            </div>
            <div className="font-mono text-sm font-semibold text-[#0b1c30]">
              07:14
            </div>
          </div>

          {/* Item Card Placeholder - Absen Pulang (Empty State) */}
          <div className="bg-white border border-[#c6c6cd] border-dashed rounded-lg p-3 flex justify-between items-center opacity-60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#45464d]">
                  Pulang
                </span>
                <span className="text-[12px] font-semibold text-[#76777d] uppercase tracking-wider mt-0.5">
                  Belum Tercatat
                </span>
              </div>
            </div>
            <div className="font-mono text-sm text-[#45464d]">--:--</div>
          </div>
        </div>
      </section>
    </>
  );
}

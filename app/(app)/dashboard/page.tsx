"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Map, LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkIn,
  checkOut,
  getDashboardData,
  getWeekAttendance,
  type DashboardData,
  type AttendanceResult,
  type WeekAttendance,
} from "@/lib/actions/attendance";
import { haversineMeters } from "@/lib/geo";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Position = { latitude: number; longitude: number; accuracy: number | null };
type TodayView = NonNullable<Extract<DashboardData, { ok: true }>["today"]>;

function formatClock(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtHM(d: Date | null | undefined): string {
  if (!d) return "--:--";
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes()
  ).padStart(2, "0")}`;
}

function fmtRange(start: Date | null | undefined, toleranceMin: number): string {
  if (!start) return "--:--";
  const end = new Date(start.getTime() + toleranceMin * 60000);
  return `${fmtHM(start)} - ${fmtHM(end)}`;
}

function getPosition(): Promise<Position | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Number.isFinite(pos.coords.accuracy)
            ? pos.coords.accuracy
            : null,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export default function AbsenKuDashboard() {
  const [data, setData] = useState<Extract<DashboardData, { ok: true }> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [today, setToday] = useState<TodayView | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [pending, setPending] = useState<"in" | "out" | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [week, setWeek] = useState<WeekAttendance[] | null>(null);
  const [confirmAction, setConfirmAction] = useState<"in" | "out" | null>(null);

  useEffect(() => {
    if (activeTab === "week" && week === null)
      getWeekAttendance().then(setWeek);
  }, [activeTab, week]);

  const school = data?.school ?? null;
  const distance =
    position && school
      ? haversineMeters(
          position.latitude,
          position.longitude,
          school.latitude,
          school.longitude
        )
      : null;
  const lowAccuracy =
    position?.accuracy != null && school && position.accuracy > school.radiusMeters;

  useEffect(() => {
    getDashboardData().then((res) => {
      if (!res.ok) return setLoadError(res.error);
      setData(res);
      setToday(res.today);
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    getPosition().then((pos) => {
      if (mounted) setPosition(pos);
    });
    return () => {
      mounted = false;
    };
  }, []);

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

  async function handleAction(action: "in" | "out") {
    if (pending) return;
    setNotice(null);
    const pos = await getPosition();
    if (!pos) {
      setNotice({
        type: "err",
        text: "Lokasi tidak terdeteksi. Aktifkan GPS dan izinkan akses lokasi, lalu coba lagi.",
      });
      return;
    }
    setPosition(pos);
    if (!school) return;

    const dist = haversineMeters(
      pos.latitude,
      pos.longitude,
      school.latitude,
      school.longitude
    );
    if (dist > school.radiusMeters) {
      setNotice({
        type: "err",
        text: `Anda berada di luar radius sekolah (jarak ${Math.round(dist)}m dari ${school.name}).`,
      });
      return;
    }

    setPending(action);
    const clientNow = new Date();
    const clientMinutes =
      clientNow.getHours() * 60 + clientNow.getMinutes();
    const res: AttendanceResult =
      action === "in"
        ? await checkIn(pos.latitude, pos.longitude, clientMinutes)
        : await checkOut(pos.latitude, pos.longitude);
    setPending(null);

    if (res.ok) {
      setNotice({ type: "ok", text: res.message });
      setToday((t) => ({
        checkInTime: res.checkInTime ?? t?.checkInTime ?? null,
        checkOutTime: res.checkOutTime ?? t?.checkOutTime ?? null,
        status: res.status ?? t?.status ?? null,
      }));
    } else {
      setNotice({ type: "err", text: res.error });
    }
  }

  if (loadError) {
    return <p className="text-sm text-[#ba1a1a]">{loadError}</p>;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#45464d]" />
      </div>
    );
  }

  const inRadius = distance !== null && school && distance <= school.radiusMeters;
  const locationText = !school
    ? "Sekolah belum diatur"
    : distance === null
      ? "Mengambil lokasi..."
      : inRadius
        ? `Di Dalam Radius ${Math.round(distance)}m`
        : lowAccuracy
          ? "Akurasi GPS rendah, jarak tidak akurat"
          : `Di Luar Radius ${Math.round(distance)}m`;

  return (
    <>
      {notice && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium border ${
            notice.type === "ok"
              ? "bg-[#6cf8bb]/30 text-[#00714d] border-[#4edea3]/30"
              : "bg-[#ffdad6] text-[#93000a] border-[#c6c6cd]"
          }`}
          role={notice.type === "err" ? "alert" : "status"}
        >
          {notice.text}
        </div>
      )}

      {/* Header Profil & Status Guru */}
      <section className="flex flex-col items-center text-center mt-2">
        <h2 className="text-xl font-semibold text-[#0b1c30]">
          {data.user.fullName}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#6cf8bb] text-[#00714d] border border-[#4edea3]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mr-1.5"></span>
            {today?.checkInTime ? "Hadir" : "Belum Absen"}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${
              inRadius
                ? "bg-[#d3e4fe] text-[#0b1c30] border-[#c6c6cd]"
                : "bg-[#ffdad6] text-[#93000a] border-[#c6c6cd]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 mr-1 text-black" />
            {locationText}
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
          {school && (
            <button
              type="button"
              onClick={() => getPosition().then(setPosition)}
              className="font-mono text-xs text-[#45464d] bg-[#e5eeff] px-2 py-1 rounded-md hover:bg-[#d3e4fe]"
            >
              {distance === null ? "..." : `${Math.round(distance)}m`} / {school.radiusMeters}m
            </button>
          )}
        </div>
        <div className="text-sm text-[#0b1c30]">
          {school ? school.name : "Sekolah belum diatur"}
        </div>
        {position?.accuracy != null && (
          <p
            className={`text-[12px] font-medium ${
              lowAccuracy ? "text-[#b45309]" : "text-[#5f636b]"
            }`}
          >
            Akurasi GPS ±{Math.round(position.accuracy)}m
            {lowAccuracy &&
              " — akurasi rendah, aktifkan GPS & memakai HP agar jarak akurat"}
          </p>
        )}

        {/* Visualisasi Peta Latar Belakang */}
        <div className="absolute -right-6 -bottom-8 w-32 h-32 opacity-10 pointer-events-none">
          <Map className="w-32 h-32 text-black" />
        </div>
      </section>

      {/* Aturan Absensi */}
      <section className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <h3 className="text-sm font-semibold text-[#0b1c30]">Aturan Absensi</h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#45464d]">
              Jam Masuk
            </span>
            <span className="font-mono text-base font-semibold text-[#0b1c30]">
              {fmtRange(school?.checkInStart, school?.lateTolerance ?? 0)}
            </span>
          </div>
          <div className="flex flex-col gap-1 border-l border-[#c6c6cd]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#45464d]">
              Jam Pulang
            </span>
            <span className="font-mono text-base font-semibold text-[#0b1c30]">
              {fmtHM(school?.checkInEnd)}
            </span>
          </div>
        </div>
        {/* <p className="text-[12px] text-[#5f636b]">
          Absen masuk lewat jam masuk + toleransi dihitung terlambat.
        </p> */}
      </section>

      {/* Tombol Aksi Absensi */}
      <section className="grid grid-cols-2 gap-3 mt-2">
        <button
          type="button"
          disabled={!!today?.checkInTime || pending !== null}
          onClick={() => setConfirmAction("in")}
          className="bg-[#047857] hover:bg-[#065f46] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg h-[64px] flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-transform w-full"
        >
          {pending === "in" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogIn className="w-5 h-5 fill-current" />
          )}
          <span className="text-sm font-semibold">
            {pending === "in" ? "Memproses..." : "Absen Masuk"}
          </span>
        </button>
        <button
          type="button"
          disabled={!!today?.checkOutTime || pending !== null}
          onClick={() => setConfirmAction("out")}
          className="bg-white border border-[#878a91] hover:bg-[#eff4ff] text-black rounded-lg h-[64px] flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {pending === "out" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {pending === "out" ? "Memproses..." : "Absen Pulang"}
          </span>
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

        {/* List Item Presensi */}
        <div className="flex flex-col gap-3">
          {activeTab === "today" ? (
            <>
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
                    <span className="text-sm font-medium text-[#0b1c30]">Masuk</span>
                    <span className="text-[12px] font-semibold text-[#45464d] uppercase tracking-wider mt-0.5">
                      {today?.checkInTime
                        ? today.status === "PRESENT"
                          ? "Tepat Waktu"
                          : "Terlambat"
                        : "Belum Tercatat"}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-sm font-semibold text-[#0b1c30]">
                  {formatClock(today?.checkInTime) ?? "--:--"}
                </div>
              </div>

              {/* Item Card - Absen Pulang */}
              <div
                className={`bg-white border rounded-lg p-3 flex justify-between items-center ${
                  today?.checkOutTime ? "border-[#c6c6cd] shadow-sm" : "border-[#c6c6cd] border-dashed opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#0b1c30]">Pulang</span>
                    <span className="text-[12px] font-semibold text-[#5f636b] uppercase tracking-wider mt-0.5">
                      {today?.checkOutTime ? "Tercatat" : "Belum Tercatat"}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-sm text-[#0b1c30]">
                  {formatClock(today?.checkOutTime) ?? "--:--"}
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-[#0b1c30] mb-1">
                Presensi Minggu Ini
              </h3>
              {week === null ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#45464d]" />
                </div>
              ) : week.length === 0 ? (
                <p className="text-sm text-[#5f636b] text-center py-6">
                  Belum ada presensi minggu ini.
                </p>
              ) : (
                Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date();
                  const day = d.getUTCDay() || 7;
                  const monday = new Date(
                    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - (day - 1) + i)
                  );
                  const iso = monday.toISOString();
                  const w = week.find((x) => x.date === iso) ?? null;
                  return (
                    <div
                      key={iso}
                      className="bg-white border border-[#c6c6cd] rounded-lg p-3 flex justify-between items-center shadow-sm"
                    >
                      <div className="flex gap-4 justify-center items-center ">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="h-10 w-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center text-[11px] font-semibold uppercase">
                            {monday.toLocaleDateString("id-ID", {
                              weekday: "short",
                              timeZone: "UTC",
                            })}
                          </div>
                          <span className="text-[11px] font-medium text-[#45464d]">
                            {monday.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              timeZone: "UTC",
                            })}
                          </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#0b1c30]">
                              {w?.checkInTime
                                ? w.status === "PRESENT"
                                  ? "Tepat Waktu"
                                  : "Terlambat"
                                : "Tidak Absen"}
                            </span>
                            <span className="text-[12px] font-semibold text-[#5f636b] uppercase tracking-wider mt-0.5">
                              {w?.checkOutTime ? "Pulang Tercatat" : "Belum Pulang"}
                            </span>
                          </div>
                      </div>

                      <div className="font-mono text-sm font-semibold text-[#0b1c30]">
                        {formatClock(w?.checkInTime) ?? "--:--"}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal Konfirmasi Absen */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0b1c30]">
              {confirmAction === "in" ? "Yakin absen masuk?" : "Yakin absen pulang?"}
            </DialogTitle>
            <DialogDescription>
              Pastikan GPS aktif dan Anda berada di dalam radius sekolah
              {school ? ` (${school.name})` : ""} sebelum melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
            <Button
              onClick={() => {
                const action = confirmAction;
                setConfirmAction(null);
                if (action) handleAction(action);
              }}
              disabled={pending !== null}
              className="h-12 rounded-md text-base font-semibold"
            >
              {pending ? "Memproses..." : "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
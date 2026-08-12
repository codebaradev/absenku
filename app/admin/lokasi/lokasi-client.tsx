"use client";

import React, { useState, useTransition, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, MapPin, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateGeofence, updateSchoolHours, updateSchoolName } from "@/lib/actions/lokasi";

const LokasiMap = dynamic(
  () => import("./lokasi-map").then((m) => m.LokasiMap),
  { ssr: false }
);

type Props = {
  schoolName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  checkInStart: string;
  checkInEnd: string;
};

const inputClass = "h-12 w-full rounded-lg bg-[#f8f9ff] font-mono";

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

const selectClass =
  "h-12 w-16 rounded-lg bg-[#f8f9ff] border border-[#c6c6cd] px-2 font-mono text-[#0b1c30] text-center";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [h, m] = value.split(":");
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor="ciStart">{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <select
          aria-label="Jam"
          value={h}
          onChange={(e) => onChange(`${e.target.value}:${m}`)}
          className={selectClass}
        >
          {HOURS.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <span className="font-mono text-lg text-[#45464d]">:</span>
        <select
          aria-label="Menit"
          value={m}
          onChange={(e) => onChange(`${h}:${e.target.value}`)}
          className={selectClass}
        >
          {MINUTES.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function LokasiClient({
  schoolName,
  latitude,
  longitude,
  radiusMeters,
  checkInStart,
  checkInEnd,
}: Props) {
  const [lat, setLat] = useState(String(latitude));
  const [lng, setLng] = useState(String(longitude));
  const [radius, setRadius] = useState(String(radiusMeters));
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);

  const [ciStart, setCiStart] = useState(checkInStart);
  const [ciEnd, setCiEnd] = useState(checkInEnd);
  const [hoursMsg, setHoursMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const [hoursPending, hoursTransition] = useTransition();

  const [name, setName] = useState(schoolName);
  const [nameMsg, setNameMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const [namePending, nameTransition] = useTransition();

  const latNum = Number(lat);
  const lngNum = Number(lng);

  function pickLocation(nextLat: number, nextLng: number) {
    setLat(nextLat.toFixed(6));
    setLng(nextLng.toFixed(6));
    setMsg(null);
    setFlyTarget([nextLat, nextLng]);
  }

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setMsg({ kind: "err", text: "Geolokasi tidak didukung browser ini." });
      return;
    }
    setMsg(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pickLocation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setMsg({
          kind: "err",
          text: "Gagal mendapatkan lokasi. Izinkan akses lokasi di browser.",
        });
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await updateGeofence({
        latitude: latNum,
        longitude: lngNum,
        radiusMeters: Number(radius),
      });
      setMsg(
        res.error
          ? { kind: "err", text: res.error }
          : { kind: "ok", text: res.message ?? "Tersimpan." }
      );
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0b1c30]">Pengaturan Sekolah</h2>
        <p className="text-sm text-[#45464d]">
          Atur nama, lokasi geofence, dan jam absensi — {schoolName}
        </p>
      </section>


      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 md:p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0b1c30]">Profil Sekolah</p>
            <p className="text-[12px] text-[#45464d]">
              Nama yang tampil di aplikasi guru — {schoolName}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNameMsg(null);
            nameTransition(async () => {
              const res = await updateSchoolName(name);
              setNameMsg(
                res.error
                  ? { kind: "err", text: res.error }
                  : { kind: "ok", text: res.message ?? "Tersimpan." }
              );
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="schoolName">Nama Sekolah</FieldLabel>
            <Input
              id="schoolName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="SD Negeri Contoh"
              className="h-12 w-full rounded-lg bg-[#f8f9ff]"
            />
          </div>

          {nameMsg && (
            <p
              className={`text-sm ${
                nameMsg.kind === "ok" ? "text-[#00714d]" : "text-[#ba1a1a]"
              }`}
            >
              {nameMsg.text}
            </p>
          )}

          <div>
            <Button
              type="submit"
              disabled={namePending}
              className="h-12 md:h-10 rounded-md text-sm font-semibold"
            >
              {namePending ? "Menyimpan..." : "Simpan Nama Sekolah"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 md:p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0b1c30]">Jam Absensi</p>
            <p className="text-[12px] text-[#45464d]">
              Batas waktu absen masuk dan pulang — {schoolName}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setHoursMsg(null);
            hoursTransition(async () => {
              const res = await updateSchoolHours({
                checkInStart: ciStart,
                checkInEnd: ciEnd,
              });
              setHoursMsg(
                res.error
                  ? { kind: "err", text: res.error }
                  : { kind: "ok", text: res.message ?? "Tersimpan." }
              );
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TimeField
              label="Jam Masuk"
              value={ciStart}
              onChange={setCiStart}
            />
            <TimeField
              label="Jam Pulang"
              value={ciEnd}
              onChange={setCiEnd}
            />
          </div>

          {hoursMsg && (
            <p
              className={`text-sm ${
                hoursMsg.kind === "ok" ? "text-[#00714d]" : "text-[#ba1a1a]"
              }`}
            >
              {hoursMsg.text}
            </p>
          )}

          <div>
            <Button
              type="submit"
              disabled={hoursPending}
              className="h-12 md:h-10 rounded-md text-sm font-semibold"
            >
              {hoursPending ? "Menyimpan..." : "Simpan Jam Absensi"}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 md:p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#6cf8bb]/30 text-[#006c49] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0b1c30]">Koordinat Pusat</p>
            <p className="text-[12px] text-[#45464d]">
              Klik peta untuk memindahkan titik, atau gunakan lokasi Anda saat ini.
            </p>
          </div>
        </div>

        <LokasiMap
          lat={latNum}
          lng={lngNum}
          radiusMeters={Number(radius)}
          flyTarget={flyTarget}
          onPick={pickLocation}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="lat">Latitude</FieldLabel>
              <Input
                id="lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-7.x"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="lng">Longitude</FieldLabel>
              <Input
                id="lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="110.x"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="radius">Radius (meter)</FieldLabel>
            <div className="flex items-center gap-4">
              <input
                id="radius-slider"
                type="range"
                min="10"
                max="5000"
                step="10"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full accent-[#006c49]"
              />
              <Input
                id="radius"
                type="number"
                step="10"
                min="10"
                max="5000"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="h-12 w-28 rounded-lg bg-[#f8f9ff] font-mono"
              />
            </div>
            <p className="text-[12px] text-[#5f636b]">
              Lingkaran hijau di peta menunjukkan area yang diizinkan. 10–5000 meter.
            </p>
          </div>

          {msg && (
            <p
              className={`text-sm ${
                msg.kind === "ok" ? "text-[#00714d]" : "text-[#ba1a1a]"
              }`}
            >
              {msg.text}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={isPending} className="h-12 md:h-10 rounded-md text-sm font-semibold">
              {isPending ? "Menyimpan..." : "Simpan Titik Lokasi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
              disabled={locating}
              className="h-12 md:h-10 rounded-md text-sm font-semibold"
            >
              <LocateFixed className="w-4 h-4" />
              {locating ? "Mendeteksi lokasi..." : "Gunakan Lokasi Saya"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
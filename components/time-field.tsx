import React from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const selectClass =
  "h-12 w-16 rounded-lg bg-[#f8f9ff] border border-[#c6c6cd] px-2 font-mono text-[#0b1c30] text-center";

export function TimeField({
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
      <label className="text-[12px] font-semibold uppercase tracking-wider text-[#45464d]">
        {label}
      </label>
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

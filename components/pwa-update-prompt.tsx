"use client";

import { useEffect, useState } from "react";

const POLL_MS = 60_000;

async function readBuildId(): Promise<string | null> {
  try {
    const res = await fetch("/build-id.txt", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.text()).trim();
  } catch {
    return null;
  }
}

export function PwaUpdatePrompt() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let baseline: string | null = null;
    let active = true;

    readBuildId().then((id) => {
      if (active) baseline = id;
    });

    const check = async () => {
      const id = await readBuildId();
      if (baseline && id && id !== baseline) setAvailable(true);
    };

    const iv = setInterval(check, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);

    return () => {
      active = false;
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, []);

  if (!available) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[480px] bg-[#0b1c30] text-white border border-[#1f3a5f] rounded-xl p-4 flex items-center gap-3 shadow-lg"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Versi baru tersedia</p>
        <p className="text-xs opacity-80 mt-0.5">
          Ada pembaruan AbsenKu. Muat ulang untuk menikmati versi terbaru.
        </p>
      </div>
      <button
        type="button"
        onClick={() => location.reload()}
        className="h-9 px-4 rounded-md bg-white text-[#0b1c30] text-sm font-semibold shrink-0"
      >
        Perbarui
      </button>
    </div>
  );
}

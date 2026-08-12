"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    // ponytail: iOS Safari tidak pakai display-mode
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true);

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) setInstalled(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    if ((await deferred.userChoice).outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  return (
    <div
      role="alert"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[480px] bg-white border border-[#c6c6cd] shadow-sm rounded-xl p-4 flex items-start gap-3"
    >
      <div className="h-9 w-9 shrink-0 rounded-full bg-[#b45309]/15 text-[#b45309] flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0b1c30]">
          Pasang AbsenKu di layar utama
        </p>
        <p className="text-xs text-[#45464d] mt-0.5">
          Aplikasi belum terpasang. Pasang untuk akses lebih cepat &amp; seperti
          aplikasi native.
        </p>
        <button
          type="button"
          onClick={install}
          className="mt-2 h-9 px-4 rounded-md bg-[#0b1c30] text-white text-sm font-semibold"
        >
          Pasang Sekarang
        </button>
      </div>

      <button
        type="button"
        aria-label="Tutup"
        onClick={() => setDismissed(true)}
        className="text-[#45464d] hover:text-[#0b1c30] shrink-0"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}

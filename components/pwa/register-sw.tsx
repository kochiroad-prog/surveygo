"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Diam-diam gagal — app tetap jalan normal tanpa PWA caching.
      });
    }
  }, []);

  return null;
}

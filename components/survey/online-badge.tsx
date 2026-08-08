"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { usePendingSyncCount } from "@/lib/offline/use-pending-sync";

export function OnlineBadge() {
  const [online, setOnline] = useState(true);
  const pending = usePendingSyncCount();

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        online ? "bg-success-bg text-success-foreground" : "bg-danger-bg text-danger-foreground"
      }`}
    >
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {online ? "Online" : "Offline — data tersimpan lokal"}
      {pending > 0 && (
        <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-warning-bg px-1.5 py-0.5 text-warning-foreground">
          <RefreshCw className="h-2.5 w-2.5" /> {pending}
        </span>
      )}
    </span>
  );
}

"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

export function LogoutButton({ variant = "sidebar" }: { variant?: "sidebar" | "compact" }) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      signOut();
    });
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-danger transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        {isPending ? "Keluar..." : "Keluar"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
    >
      <LogOut className="h-3.5 w-3.5" />
      {isPending ? "Keluar..." : "Keluar"}
    </button>
  );
}

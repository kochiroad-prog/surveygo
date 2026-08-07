import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3.5",
        tone === "danger" ? "border-danger" : "border-border"
      )}
    >
      <Icon className={cn("h-4 w-4", tone === "danger" ? "text-danger" : "text-primary dark:text-accent")} />
      <div
        className={cn(
          "mt-1.5 text-xl font-medium",
          tone === "danger" ? "text-danger" : "text-foreground"
        )}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

import { AlertTriangle } from "lucide-react";
import { moistureWarningLevel, luxWarningLevel } from "@/lib/constants/thresholds";

export function MoistureWarning({ value }: { value: number | null }) {
  const level = moistureWarningLevel(value);
  if (level === "none") return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        level === "critical" ? "bg-danger-bg text-danger-foreground" : "bg-warning-bg text-warning-foreground"
      }`}
    >
      <AlertTriangle className="h-3 w-3" />
      {level === "critical" ? "Kelembapan tinggi" : "Perlu pemantauan"}
    </span>
  );
}

export function LuxWarning({ value }: { value: number | null }) {
  const level = luxWarningLevel(value);
  if (level === "none") return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-[10px] font-medium text-warning-foreground">
      <AlertTriangle className="h-3 w-3" />
      Pencahayaan kurang
    </span>
  );
}

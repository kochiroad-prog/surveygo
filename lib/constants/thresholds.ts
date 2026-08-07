// Ambang batas dynamic warning logic — sesuai PRD SiteSurvey Pro §1.7.
// Disimpan sebagai konstanta agar mudah diaudit/diubah tanpa mengubah komponen.

export const MOISTURE_CRITICAL = 20; // % — di atas ini: warning merah
export const MOISTURE_WARNING = 15; // % — di atas ini: warning kuning

export const LUX_MIN_WORKAREA = 100; // lux — di bawah ini: pencahayaan kurang

export type WarningLevel = "none" | "warning" | "critical";

export function moistureWarningLevel(value: number | null | undefined): WarningLevel {
  if (value == null) return "none";
  if (value > MOISTURE_CRITICAL) return "critical";
  if (value > MOISTURE_WARNING) return "warning";
  return "none";
}

export function luxWarningLevel(value: number | null | undefined): WarningLevel {
  if (value == null) return "none";
  if (value < LUX_MIN_WORKAREA) return "warning";
  return "none";
}

export const PROJECT_TYPE_LABEL: Record<string, string> = {
  interior_fitout: "Interior Fit-Out",
  renovasi: "Renovasi",
  bare_unit: "Bare Unit",
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
};

export const CONDITION_LABEL: Record<string, string> = {
  good: "Baik",
  warning: "Perlu perhatian",
  critical: "Kritis",
};

export const EQUIPMENT_CATEGORY_LABEL: Record<string, string> = {
  measurement: "Pengukuran",
  mep_testing: "MEP Testing",
  surface_inspection: "Inspeksi Permukaan",
  documentation: "Dokumentasi",
};

export const SURVEY_CATEGORY_LABEL: Record<string, string> = {
  architectural: "Arsitektural",
  interior: "Interior",
  mep: "MEP",
  structure: "Struktur",
};

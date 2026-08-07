import { ClipboardList, Loader, AlertTriangle, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProjectList } from "@/components/dashboard/project-list";
import { EquipmentWidget } from "@/components/dashboard/equipment-widget";

export default async function DashboardPage() {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [projectsRes, checklistsRes, itemsRes, templatesRes] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("equipment_checklists").select("is_checked"),
    supabase.from("survey_items").select("condition_status"),
    supabase.from("equipment_templates").select("*"),
  ]);

  const projects = projectsRes.data ?? [];
  const checklists = checklistsRes.data ?? [];
  const items = itemsRes.data ?? [];
  const templates = templatesRes.data ?? [];

  const surveyThisMonth = projects.filter(
    (p) => new Date(p.created_at) >= startOfMonth
  ).length;
  const inProgress = projects.filter((p) => p.status === "in_progress").length;
  const warnings = items.filter((i) => i.condition_status === "critical").length;
  const equipmentReady = checklists.filter((c) => c.is_checked).length;
  const equipmentTotal = checklists.length;

  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div>
      <div className="bg-primary px-6 py-5 pb-9">
        <div className="text-xs text-[#A7D9C8]">Selamat datang kembali</div>
        <div className="text-lg font-medium text-white">
          Ringkasan survey — {dateLabel}
        </div>
      </div>

      <div className="bg-background px-6 pb-6">
        <div className="-mt-5 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Survey bulan ini" value={surveyThisMonth} icon={ClipboardList} />
          <KpiCard label="Berjalan" value={inProgress} icon={Loader} />
          <KpiCard label="Warning" value={warnings} icon={AlertTriangle} tone={warnings > 0 ? "danger" : "default"} />
          <KpiCard
            label="Peralatan siap"
            value={`${equipmentReady}/${equipmentTotal}`}
            icon={Wrench}
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[2fr_1fr]">
          <ProjectList projects={projects.slice(0, 6)} />
          <EquipmentWidget templates={templates} />
        </div>
      </div>
    </div>
  );
}

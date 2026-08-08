import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL } from "@/lib/constants/thresholds";

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "default" | "accent"> = {
  in_progress: "success",
  scheduled: "warning",
  draft: "default",
  completed: "accent",
};

export default async function ReportsPage() {
  const supabase = await createClient();

  const [projectsRes, zonesRes] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("survey_zones").select("id, project_id"),
  ]);

  const projects = projectsRes.data ?? [];
  const zones = zonesRes.data ?? [];
  const zoneIds = zones.map((z) => z.id);

  // survey_items is keyed by zone_id, not project_id — fetch by zone then
  // roll up to each project via the zone -> project_id map.
  const { data: itemsData } = zoneIds.length
    ? await supabase.from("survey_items").select("id, zone_id, condition_status").in("zone_id", zoneIds)
    : { data: [] as { id: string; zone_id: string; condition_status: string }[] };
  const items = itemsData ?? [];
  const zoneToProject = new Map(zones.map((z) => [z.id, z.project_id]));

  const rows = projects.map((p) => {
    const zoneCount = zones.filter((z) => z.project_id === p.id).length;
    const itemRows = items.filter((i) => zoneToProject.get(i.zone_id) === p.id);
    const warnings = itemRows.filter((i) => i.condition_status !== "good").length;
    return { project: p, zoneCount, itemCount: itemRows.length, warnings };
  });

  return (
    <AppShell activeHref="/reports">
      <div className="space-y-4 p-6">
        <div>
          <h1 className="text-lg font-medium">Laporan</h1>
          <p className="text-xs text-muted-foreground">
            Semua project — buka detail project untuk preview dan unduh laporan PDF.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Belum ada project.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {rows.map(({ project, zoneCount, itemCount, warnings }, idx) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}?tab=export`}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-background ${
                  idx !== rows.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{project.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {PROJECT_TYPE_LABEL[project.project_type]} • {zoneCount} zona • {itemCount} item
                      {warnings > 0 && <span className="text-warning"> • {warnings} temuan</span>}
                      {" • "}
                      {formatDate(project.survey_date)}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={STATUS_BADGE_VARIANT[project.status] ?? "default"}>
                    {PROJECT_STATUS_LABEL[project.status]}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

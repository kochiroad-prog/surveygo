import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  EQUIPMENT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
} from "@/lib/constants/thresholds";
import type { Enums } from "@/lib/supabase/types";

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "default" | "accent"> = {
  in_progress: "success",
  scheduled: "warning",
  draft: "default",
  completed: "accent",
};

export default async function EquipmentPage() {
  const supabase = await createClient();

  const [projectsRes, checklistsRes, templatesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, status, project_type")
      .neq("status", "completed")
      .order("created_at", { ascending: false }),
    supabase.from("equipment_checklists").select("*"),
    supabase.from("equipment_templates").select("*").order("item_name"),
  ]);

  const projects = projectsRes.data ?? [];
  const checklists = checklistsRes.data ?? [];
  const templates = templatesRes.data ?? [];

  const readiness = projects.map((p) => {
    const rows = checklists.filter((c) => c.project_id === p.id);
    const required = rows.filter((r) => r.is_required);
    const requiredChecked = required.filter((r) => r.is_checked);
    const pct = required.length === 0 ? 100 : Math.round((requiredChecked.length / required.length) * 100);
    const missing = required.filter((r) => !r.is_checked);
    return { project: p, pct, total: rows.length, missing };
  });

  const templatesByType = templates.reduce<Record<string, typeof templates>>((acc, t) => {
    (acc[t.project_type] ??= []).push(t);
    return acc;
  }, {});

  return (
    <AppShell activeHref="/equipment">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-lg font-medium">Peralatan</h1>
          <p className="text-xs text-muted-foreground">
            Kesiapan checklist peralatan lintas project aktif, dan master data alat per tipe project.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium">Kesiapan per project aktif</h2>
          {readiness.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Tidak ada project aktif saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {readiness.map(({ project, pct, total, missing }) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:opacity-80"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{project.title}</span>
                    <Badge variant={STATUS_BADGE_VARIANT[project.status] ?? "default"}>
                      {PROJECT_STATUS_LABEL[project.status]}
                    </Badge>
                  </div>
                  <div className="mb-2 text-[11px] text-muted-foreground">
                    {PROJECT_TYPE_LABEL[project.project_type]} • {total} item terdaftar
                  </div>
                  <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full ${pct === 100 ? "bg-accent" : "bg-warning"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{pct}% wajib siap</span>
                    {missing.length > 0 && (
                      <span className="text-warning">{missing.length} belum siap</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium">Master data peralatan</h2>
          <div className="space-y-4">
            {Object.entries(templatesByType).map(([type, items]) => (
              <div key={type} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2.5 text-xs font-medium text-muted-foreground">
                  {PROJECT_TYPE_LABEL[type as Enums<"project_type">] ?? type}
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                    >
                      <span>{item.item_name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {EQUIPMENT_CATEGORY_LABEL[item.category]}
                        </span>
                        {item.is_required && <Badge variant="warning">Wajib</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Belum ada master data peralatan.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

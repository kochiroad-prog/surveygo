import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL } from "@/lib/constants/thresholds";
import type { Tables } from "@/lib/supabase/types";

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "default" | "accent"> = {
  in_progress: "success",
  scheduled: "warning",
  draft: "default",
  completed: "accent",
};

export function ProjectList({ projects }: { projects: Tables<"projects">[] }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada project survey. Buat project baru untuk mulai.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-medium">Project survey aktif</span>
        <Link href="/projects" className="text-xs text-accent hover:underline">
          Lihat semua
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5 transition-colors hover:opacity-80"
          >
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">
                {p.title} — {PROJECT_TYPE_LABEL[p.project_type]}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {p.client_name || "-"} • {formatDate(p.survey_date)}
              </div>
            </div>
            <Badge variant={STATUS_BADGE_VARIANT[p.status] ?? "default"}>
              {PROJECT_STATUS_LABEL[p.status]}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

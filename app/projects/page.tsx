import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL } from "@/lib/constants/thresholds";

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "default" | "accent"> = {
  in_progress: "success",
  scheduled: "warning",
  draft: "default",
  completed: "accent",
};

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const canCreate = profile?.role === "admin" || profile?.role === "project_manager";

  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status as never);
  const { data: projects } = await query;

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-medium">Project survey</h1>
        {canCreate && (
          <Button asChild variant="accent" size="sm">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" /> Project baru
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/projects?status=${tab.value}` : "/projects"}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              (status ?? "") === tab.value
                ? "border-primary bg-primary text-primary-foreground dark:bg-accent/20 dark:text-accent dark:border-accent"
                : "border-border text-muted-foreground hover:bg-card"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(projects ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="rounded-xl border border-border bg-card p-4 transition-colors hover:opacity-80"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-sm font-medium">{p.title}</span>
              <Badge variant={STATUS_BADGE_VARIANT[p.status] ?? "default"}>
                {PROJECT_STATUS_LABEL[p.status]}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">{p.client_name || "-"}</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{PROJECT_TYPE_LABEL[p.project_type]}</span>
              <span>{formatDate(p.survey_date)}</span>
            </div>
          </Link>
        ))}
        {(projects ?? []).length === 0 && (
          <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {canCreate
              ? "Belum ada project untuk status ini."
              : "Belum ada project yang di-assign ke kamu. Hubungi admin untuk di-assign ke sebuah project."}
          </div>
        )}
      </div>
    </div>
  );
}

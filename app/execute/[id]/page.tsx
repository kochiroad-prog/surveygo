import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnlineBadge } from "@/components/survey/online-badge";
import { ExecuteBoard } from "@/components/survey/execute-board";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function ExecuteSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const projectRes = await supabase.from("projects").select("id, title").eq("id", id).maybeSingle();
  if (!projectRes.data) notFound();
  const project = projectRes.data;

  const zonesRes = await supabase
    .from("survey_zones")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });
  const zones = zonesRes.data ?? [];

  const zoneIds = zones.map((z) => z.id);
  const itemsRes =
    zoneIds.length > 0
      ? await supabase.from("survey_items").select("*").in("zone_id", zoneIds)
      : { data: [] };
  const items = itemsRes.data ?? [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <Link href={`/projects/${project.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div className="flex items-center gap-3">
          <OnlineBadge />
          <LogoutButton variant="compact" />
        </div>
      </div>

      <div className="p-4">
        <h1 className="mb-4 text-base font-medium">{project.title}</h1>

        <ExecuteBoard projectId={project.id} initialZones={zones} initialItems={items} />
      </div>
    </div>
  );
}

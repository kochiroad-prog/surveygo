import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Phone, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ChecklistMatrix } from "@/components/equipment/checklist-matrix";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_TYPE_LABEL } from "@/lib/constants/thresholds";

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "default" | "accent"> = {
  in_progress: "success",
  scheduled: "warning",
  draft: "default",
  completed: "accent",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [projectRes, checklistRes, zonesRes] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("equipment_checklists").select("*").eq("project_id", id),
    supabase.from("survey_zones").select("id, zone_name").eq("project_id", id),
  ]);

  if (!projectRes.data) notFound();
  const project = projectRes.data;
  const checklists = checklistRes.data ?? [];
  const zones = zonesRes.data ?? [];

  return (
    <div>
      <div className="bg-primary px-6 py-5">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant={STATUS_BADGE_VARIANT[project.status] ?? "default"}>
            {PROJECT_STATUS_LABEL[project.status]}
          </Badge>
          <span className="text-[11px] text-[#A7D9C8]">
            {PROJECT_TYPE_LABEL[project.project_type]}
          </span>
        </div>
        <h1 className="mb-2 text-lg font-medium text-white">{project.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#A7D9C8]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {project.address || "-"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(project.survey_date)}
          </span>
          {project.client_phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {project.client_phone}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="equipment">
          <TabsList>
            <TabsTrigger value="equipment">Pre-Survey & Peralatan</TabsTrigger>
            <TabsTrigger value="execution">Survey Execution</TabsTrigger>
            <TabsTrigger value="photos">Foto & 360</TabsTrigger>
            <TabsTrigger value="export">Export & Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="equipment">
            <ChecklistMatrix items={checklists} />
          </TabsContent>

          <TabsContent value="execution">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Eksekusi survey lapangan</div>
                  <div className="text-xs text-muted-foreground">
                    {zones.length} ruangan/zona sudah dicatat
                  </div>
                </div>
                <Button asChild variant="accent" size="sm">
                  <Link href={`/execute/${project.id}`}>
                    Buka mode survey <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {zones.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {zones.map((z) => (
                    <span
                      key={z.id}
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {z.zone_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="photos">
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Galeri foto & dokumentasi 360° — menyusul di fase berikutnya.
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Export laporan PDF — menyusul di fase berikutnya.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

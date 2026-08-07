import { Ruler, Box } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SurveyItemForm } from "@/components/survey/survey-item-form";
import { MoistureWarning, LuxWarning } from "@/components/survey/warning-badge";
import { calcArea, calcVolume } from "@/lib/utils";
import { CONDITION_LABEL, SURVEY_CATEGORY_LABEL } from "@/lib/constants/thresholds";
import type { Tables } from "@/lib/supabase/types";

const CONDITION_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  good: "success",
  warning: "warning",
  critical: "danger",
};

export function ZoneList({
  projectId,
  zones,
  items,
}: {
  projectId: string;
  zones: Tables<"survey_zones">[];
  items: Tables<"survey_items">[];
}) {
  if (zones.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada ruangan/zona. Tambahkan zona pertama untuk mulai survey.
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2.5">
      {zones.map((zone) => {
        const zoneItems = items.filter((i) => i.zone_id === zone.id);
        const area = calcArea(zone.length, zone.width);
        const volume = calcVolume(zone.length, zone.width, zone.height);

        return (
          <AccordionItem key={zone.id} value={zone.id}>
            <AccordionTrigger>
              <div className="flex flex-1 flex-col items-start gap-0.5 text-left">
                <span>{zone.zone_name}</span>
                <span className="flex items-center gap-2 text-[11px] font-normal text-muted-foreground">
                  {zone.floor_level && <span>{zone.floor_level}</span>}
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" /> {area} m²
                  </span>
                  <span className="flex items-center gap-1">
                    <Box className="h-3 w-3" /> {volume} m³
                  </span>
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2.5">
                {zoneItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{item.item_name}</span>
                      <Badge variant={CONDITION_VARIANT[item.condition_status]}>
                        {CONDITION_LABEL[item.condition_status]}
                      </Badge>
                    </div>
                    <div className="mb-1.5 text-[11px] text-muted-foreground">
                      {SURVEY_CATEGORY_LABEL[item.category]}
                      {item.moisture_percentage != null && ` • Moisture: ${item.moisture_percentage}%`}
                      {item.lux_level != null && ` • Lux: ${item.lux_level}`}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <MoistureWarning value={item.moisture_percentage} />
                      <LuxWarning value={item.lux_level} />
                    </div>
                    {item.notes && (
                      <p className="mt-1.5 text-xs text-muted-foreground">{item.notes}</p>
                    )}
                  </div>
                ))}

                <SurveyItemForm projectId={projectId} zoneId={zone.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

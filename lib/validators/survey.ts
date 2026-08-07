import { z } from "zod";

export const zoneSchema = z.object({
  zone_name: z.string().min(1, "Nama ruangan wajib diisi"),
  floor_level: z.string().optional(),
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
});

export type ZoneFormValues = z.infer<typeof zoneSchema>;

export const surveyItemSchema = z.object({
  zone_id: z.string().uuid(),
  category: z.enum(["architectural", "interior", "mep", "structure"]),
  item_name: z.string().min(1, "Nama item wajib diisi"),
  condition_status: z.enum(["good", "warning", "critical"]),
  moisture_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  lux_level: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional(),
});

export type SurveyItemFormValues = z.infer<typeof surveyItemSchema>;

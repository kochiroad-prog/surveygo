"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { zoneSchema, surveyItemSchema } from "@/lib/validators/survey";

export type SurveyActionState = { error?: string; success?: boolean } | null;

export async function createZone(
  projectId: string,
  _prevState: SurveyActionState,
  formData: FormData
): Promise<SurveyActionState> {
  const parsed = zoneSchema.safeParse({
    zone_name: String(formData.get("zone_name") || ""),
    floor_level: String(formData.get("floor_level") || ""),
    length: formData.get("length") || undefined,
    width: formData.get("width") || undefined,
    height: formData.get("height") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("survey_zones").insert({
    project_id: projectId,
    zone_name: parsed.data.zone_name,
    floor_level: parsed.data.floor_level || null,
    length: parsed.data.length ?? null,
    width: parsed.data.width ?? null,
    height: parsed.data.height ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}/execute`);
  return { success: true };
}

export async function upsertSurveyItem(
  projectId: string,
  _prevState: SurveyActionState,
  formData: FormData
): Promise<SurveyActionState> {
  const raw = {
    zone_id: String(formData.get("zone_id") || ""),
    category: String(formData.get("category") || "interior"),
    item_name: String(formData.get("item_name") || ""),
    condition_status: String(formData.get("condition_status") || "good"),
    moisture_percentage: formData.get("moisture_percentage") || undefined,
    lux_level: formData.get("lux_level") || undefined,
    notes: String(formData.get("notes") || ""),
  };

  const parsed = surveyItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const itemId = String(formData.get("item_id") || "");

  const payload = {
    zone_id: parsed.data.zone_id,
    category: parsed.data.category,
    item_name: parsed.data.item_name,
    condition_status: parsed.data.condition_status,
    moisture_percentage: parsed.data.moisture_percentage ?? null,
    lux_level: parsed.data.lux_level ?? null,
    notes: parsed.data.notes || null,
  };

  const { error } = itemId
    ? await supabase.from("survey_items").update(payload).eq("id", itemId)
    : await supabase.from("survey_items").insert(payload);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}/execute`);
  return { success: true };
}

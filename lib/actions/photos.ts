"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PhotoActionState = { error?: string; success?: boolean } | null;

export async function recordPhoto(
  projectId: string,
  _prevState: PhotoActionState,
  formData: FormData
): Promise<PhotoActionState> {
  const zoneId = String(formData.get("zone_id") || "");
  const surveyItemId = String(formData.get("survey_item_id") || "") || null;
  const photoUrl = String(formData.get("photo_url") || "");
  const photoType = String(formData.get("photo_type") || "standard");
  const caption = String(formData.get("caption") || "");

  if (!zoneId || !photoUrl) {
    return { error: "Data foto tidak lengkap." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("survey_photos").insert({
    zone_id: zoneId,
    survey_item_id: surveyItemId,
    photo_url: photoUrl,
    photo_type: photoType as "standard" | "360_panorama" | "sketch",
    caption: caption || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/execute/${projectId}`);
  return { success: true };
}

export async function deletePhoto(projectId: string, photoId: string, photoUrl: string) {
  const supabase = await createClient();

  const path = photoUrl.split("/survey-photos/")[1];
  if (path) {
    await supabase.storage.from("survey-photos").remove([path]);
  }

  const { error } = await supabase.from("survey_photos").delete().eq("id", photoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/execute/${projectId}`);
}

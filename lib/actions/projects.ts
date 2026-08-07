"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validators/project";

export type ProjectActionState = { error?: string } | null;

export async function createProject(
  _prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const raw = {
    title: String(formData.get("title") || ""),
    client_name: String(formData.get("client_name") || ""),
    client_phone: String(formData.get("client_phone") || ""),
    address: String(formData.get("address") || ""),
    project_type: String(formData.get("project_type") || "interior_fitout"),
    survey_date: String(formData.get("survey_date") || ""),
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi berakhir, silakan login ulang." };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: parsed.data.title,
      client_name: parsed.data.client_name,
      client_phone: parsed.data.client_phone || null,
      address: parsed.data.address,
      project_type: parsed.data.project_type,
      survey_date: new Date(parsed.data.survey_date).toISOString(),
      created_by: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  redirect(`/projects/${data.id}`);
}

export async function toggleEquipmentChecked(checklistId: string, isChecked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("equipment_checklists")
    .update({ is_checked: isChecked, checked_by: user?.id ?? null })
    .eq("id", checklistId);

  if (error) throw new Error(error.message);
  revalidatePath("/projects", "layout");
}

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

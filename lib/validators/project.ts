import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  client_name: z.string().min(1, "Nama klien wajib diisi"),
  client_phone: z.string().optional(),
  address: z.string().min(1, "Alamat wajib diisi"),
  project_type: z.enum(["interior_fitout", "renovasi", "bare_unit"]),
  survey_date: z.string().min(1, "Tanggal survey wajib diisi"),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

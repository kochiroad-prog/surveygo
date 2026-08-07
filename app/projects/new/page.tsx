"use client";

import { useActionState } from "react";
import { createProject, type ProjectActionState } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProjectPage() {
  const [state, formAction, isPending] = useActionState<ProjectActionState, FormData>(
    createProject,
    null
  );

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-1 text-lg font-medium">Project survey baru</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Pilih tipe project — daftar peralatan wajib akan otomatis dibuat sesuai
        correlation engine.
      </p>

      <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Judul project</Label>
          <Input id="title" name="title" required placeholder="Residence Kemang — Fit-Out" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="client_name">Nama klien</Label>
            <Input id="client_name" name="client_name" required placeholder="Ibu Sarah" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_phone">No. telepon</Label>
            <Input id="client_phone" name="client_phone" placeholder="0812xxxxxxx" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Alamat</Label>
          <Input id="address" name="address" required placeholder="Jl. Kemang Raya No. 1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="project_type">Tipe project</Label>
            <select
              id="project_type"
              name="project_type"
              defaultValue="interior_fitout"
              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="interior_fitout">Interior Fit-Out</option>
              <option value="renovasi">Renovasi</option>
              <option value="bare_unit">Bare Unit</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="survey_date">Tanggal survey</Label>
            <Input id="survey_date" name="survey_date" type="date" required />
          </div>
        </div>

        {state?.error && <p className="text-sm text-danger">{state.error}</p>}

        <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Buat project"}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { zoneSchema } from "@/lib/validators/survey";
import { insertRowOfflineFirst } from "@/lib/offline/sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/lib/supabase/types";

export function NewZoneForm({
  projectId,
  onCreated,
}: {
  projectId: string;
  onCreated: (zone: Tables<"survey_zones">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const parsed = zoneSchema.safeParse({
      zone_name: String(formData.get("zone_name") || ""),
      floor_level: String(formData.get("floor_level") || ""),
      length: formData.get("length") || undefined,
      width: formData.get("width") || undefined,
      height: formData.get("height") || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }
    setError(null);

    const now = new Date().toISOString();
    const row: Tables<"survey_zones"> = {
      id: crypto.randomUUID(),
      project_id: projectId,
      zone_name: parsed.data.zone_name,
      floor_level: parsed.data.floor_level || null,
      length: parsed.data.length ?? null,
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      client_generated_id: null,
      created_at: now,
      updated_at: now,
    };

    startTransition(async () => {
      const result = await insertRowOfflineFirst("survey_zones", row, projectId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onCreated(row);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Tambah ruangan/zona
      </Button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Ruangan/zona baru</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="zone_name">Nama ruangan</Label>
          <Input id="zone_name" name="zone_name" required placeholder="Master Bedroom" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="floor_level">Lantai</Label>
          <Input id="floor_level" name="floor_level" placeholder="Lantai 2" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="length">Panjang (m)</Label>
          <Input id="length" name="length" type="number" step="0.01" min="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="width">Lebar (m)</Label>
          <Input id="width" name="width" type="number" step="0.01" min="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="height">Tinggi (m)</Label>
          <Input id="height" name="height" type="number" step="0.01" min="0" />
        </div>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" variant="accent" size="sm" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan zona"}
      </Button>
    </form>
  );
}

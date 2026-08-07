"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createZone, type SurveyActionState } from "@/lib/actions/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewZoneForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = createZone.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<SurveyActionState, FormData>(
    boundAction,
    null
  );

  if (state?.success && open) {
    setOpen(false);
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
      action={formAction}
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
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      <Button type="submit" variant="accent" size="sm" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan zona"}
      </Button>
    </form>
  );
}

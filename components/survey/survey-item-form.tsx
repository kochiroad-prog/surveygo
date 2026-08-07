"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { upsertSurveyItem, type SurveyActionState } from "@/lib/actions/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoistureWarning, LuxWarning } from "@/components/survey/warning-badge";

export function SurveyItemForm({
  projectId,
  zoneId,
}: {
  projectId: string;
  zoneId: string;
}) {
  const [open, setOpen] = useState(false);
  const [moisture, setMoisture] = useState<number | null>(null);
  const [lux, setLux] = useState<number | null>(null);
  const boundAction = upsertSurveyItem.bind(null, projectId);
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
        <Plus className="h-4 w-4" /> Tambah item survey
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-background p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Item survey baru</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <input type="hidden" name="zone_id" value={zoneId} />

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <Label htmlFor={`category-${zoneId}`}>Kategori</Label>
          <select
            id={`category-${zoneId}`}
            name="category"
            defaultValue="interior"
            className="flex h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="architectural">Arsitektural</option>
            <option value="interior">Interior</option>
            <option value="mep">MEP</option>
            <option value="structure">Struktur</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`condition-${zoneId}`}>Kondisi</Label>
          <select
            id={`condition-${zoneId}`}
            name="condition_status"
            defaultValue="good"
            className="flex h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="good">Baik</option>
            <option value="warning">Perlu perhatian</option>
            <option value="critical">Kritis</option>
          </select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor={`item_name-${zoneId}`}>Nama item</Label>
          <Input
            id={`item_name-${zoneId}`}
            name="item_name"
            required
            placeholder="Kondisi Dinding / Titik Stopkontak / Jalur Pipa AC"
            className="h-9 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`moisture-${zoneId}`}>Moisture meter (%)</Label>
          <Input
            id={`moisture-${zoneId}`}
            name="moisture_percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            className="h-9 text-xs"
            onChange={(e) => setMoisture(e.target.value === "" ? null : Number(e.target.value))}
          />
          <MoistureWarning value={moisture} />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`lux-${zoneId}`}>Lux level</Label>
          <Input
            id={`lux-${zoneId}`}
            name="lux_level"
            type="number"
            step="1"
            min="0"
            className="h-9 text-xs"
            onChange={(e) => setLux(e.target.value === "" ? null : Number(e.target.value))}
          />
          <LuxWarning value={lux} />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor={`notes-${zoneId}`}>Catatan</Label>
          <Textarea id={`notes-${zoneId}`} name="notes" className="min-h-16 text-xs" />
        </div>
      </div>

      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      <Button type="submit" variant="accent" size="sm" className="w-full" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan item"}
      </Button>
    </form>
  );
}

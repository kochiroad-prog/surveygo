"use client";

import { useState } from "react";
import { Ruler, Droplet, ScanLine, Camera, Gauge, Waves } from "lucide-react";
import { PROJECT_TYPE_LABEL } from "@/lib/constants/thresholds";
import type { Tables, Enums } from "@/lib/supabase/types";

const ICONS: Record<string, typeof Ruler> = {
  "Meteran Laser": Ruler,
  "Waterpass Laser": Gauge,
  "Wall Scanner": ScanLine,
  "Moisture Meter": Droplet,
  "Tape Ukur": Ruler,
  "Kamera 360": Camera,
  "Lux Meter": Gauge,
  "Multitester / Tang Ampere": Waves,
};

const TYPES: Enums<"project_type">[] = ["interior_fitout", "renovasi", "bare_unit"];

export function EquipmentWidget({ templates }: { templates: Tables<"equipment_templates">[] }) {
  const [selected, setSelected] = useState<Enums<"project_type">>("interior_fitout");
  const items = templates.filter((t) => t.project_type === selected);

  return (
    <div className="rounded-xl bg-primary p-4">
      <span className="inline-flex rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] text-[#5DCAA5]">
        Correlation engine
      </span>
      <div className="mb-2.5 mt-2.5 flex flex-wrap gap-1.5">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelected(type)}
            className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
              selected === type
                ? "bg-accent text-[#04342C]"
                : "border border-white/20 text-white hover:bg-white/10"
            }`}
          >
            {PROJECT_TYPE_LABEL[type]}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const Icon = ICONS[item.item_name] || Ruler;
          return (
            <div key={item.id} className="flex items-center gap-2 text-[11px] text-[#E1F5EE]">
              <Icon className="h-3.5 w-3.5 text-accent" />
              {item.item_name}
              {!item.is_required && (
                <span className="text-[9px] text-slate-400">(opsional)</span>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-[11px] text-slate-400">Belum ada template alat.</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Check, X, Package } from "lucide-react";
import { toggleEquipmentChecked } from "@/lib/actions/projects";
import { EQUIPMENT_CATEGORY_LABEL } from "@/lib/constants/thresholds";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

export function ChecklistMatrix({ items }: { items: Tables<"equipment_checklists">[] }) {
  const [localItems, setLocalItems] = useState(items);
  const [, startTransition] = useTransition();

  const grouped = localItems.reduce<Record<string, Tables<"equipment_checklists">[]>>(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {}
  );

  function toggle(item: Tables<"equipment_checklists">) {
    const next = !item.is_checked;
    setLocalItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_checked: next } : i))
    );
    startTransition(() => {
      toggleEquipmentChecked(item.id, next).catch(() => {
        setLocalItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_checked: !next } : i))
        );
      });
    });
  }

  if (localItems.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada checklist peralatan untuk project ini.
      </div>
    );
  }

  const readyCount = localItems.filter((i) => i.is_checked).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="h-4 w-4" />
        {readyCount} dari {localItems.length} alat siap dibawa
      </div>

      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category}>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {EQUIPMENT_CATEGORY_LABEL[category] ?? category}
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {catItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item)}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3.5 text-left transition-colors",
                  item.is_checked
                    ? "border-success bg-success-bg"
                    : "border-border bg-card hover:bg-background"
                )}
              >
                <div>
                  <div className="text-sm font-medium">{item.item_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.is_required ? "Wajib" : "Opsional"}
                  </div>
                </div>
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    item.is_checked ? "bg-success text-white" : "bg-danger-bg text-danger"
                  )}
                >
                  {item.is_checked ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

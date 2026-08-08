"use client";

import { useEffect, useState } from "react";
import { offlineDB } from "@/lib/offline/db";
import { NewZoneForm } from "@/components/survey/new-zone-form";
import { ZoneList } from "@/components/survey/zone-list";
import type { Tables } from "@/lib/supabase/types";

function mergeById<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const map = new Map(base.map((x) => [x.id, x]));
  for (const e of extra) if (!map.has(e.id)) map.set(e.id, e);
  return Array.from(map.values());
}

export function ExecuteBoard({
  projectId,
  initialZones,
  initialItems,
}: {
  projectId: string;
  initialZones: Tables<"survey_zones">[];
  initialItems: Tables<"survey_items">[];
}) {
  const [zones, setZones] = useState(initialZones);
  const [items, setItems] = useState(initialItems);

  // Pull in anything created offline in an earlier session (before it
  // synced) so it's not lost after a reload.
  useEffect(() => {
    if (!offlineDB) return;
    let cancelled = false;
    (async () => {
      const [cachedZones, cachedItems] = await Promise.all([
        offlineDB!.zones.where("project_id").equals(projectId).toArray(),
        offlineDB!.items.where("project_id").equals(projectId).toArray(),
      ]);
      if (cancelled) return;
      setZones((prev) => mergeById(prev, cachedZones));
      setItems((prev) => mergeById(prev, cachedItems.map(({ project_id, ...rest }) => rest as Tables<"survey_items">)));
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <>
      <div className="mb-4">
        <NewZoneForm projectId={projectId} onCreated={(zone) => setZones((z) => mergeById(z, [zone]))} />
      </div>
      <ZoneList
        projectId={projectId}
        zones={zones}
        items={items}
        onItemCreated={(item) => setItems((i) => mergeById(i, [item]))}
      />
    </>
  );
}
